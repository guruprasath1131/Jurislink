import { IvrCallState, SupportedLanguage, CourtCase } from '../types';
import { courtDataProvider } from './courtDataProvider';
import { TtsService } from './ttsService';

/**
 * Jurislink 2G Feature-Phone IVR (Interactive Voice Response) Telephony Engine
 * Toll-Free access line: 1800-587-4754 (1800-JURIS-LINK)
 * Compatible with Exotel, Twilio, and Asterisk PBX webhooks.
 */

export interface IvrPrompt {
  speechText: string;
  displayMenu: string;
  expectedInputType: 'DIGIT' | 'CNR' | 'NONE';
  allowedKeys: string[];
}

export class IvrService {
  /**
   * Initialize a new IVR Call Session
   */
  static createInitialCallState(callerNumber: string = '9876543210'): IvrCallState {
    return {
      callId: `CALL-${Date.now().toString(36).toUpperCase()}`,
      callerNumber,
      currentStep: 'WELCOME',
      selectedLanguage: 'hi', // Default to Hindi
      history: ['WELCOME'],
      audioLog: []
    };
  }

  /**
   * Process DTMF Keypress or Voice Input in IVR State Machine
   */
  static async processInput(
    state: IvrCallState,
    inputKey: string,
    onSpeak?: (text: string, lang: SupportedLanguage) => void
  ): Promise<{ nextState: IvrCallState; prompt: IvrPrompt; caseData?: CourtCase }> {
    const nextState: IvrCallState = { ...state, audioLog: [...state.audioLog] };
    
    // Log user DTMF keypress
    nextState.audioLog.push({
      timestamp: new Date().toLocaleTimeString(),
      speaker: 'USER',
      text: `Pressed Key: [${inputKey}]`,
      dtmf: inputKey
    });

    let prompt: IvrPrompt;
    let fetchedCase: CourtCase | undefined = undefined;

    switch (state.currentStep) {
      case 'WELCOME':
      case 'LANGUAGE_SELECT':
        // Language Selection Menu
        if (inputKey === '1') nextState.selectedLanguage = 'hi';
        else if (inputKey === '2') nextState.selectedLanguage = 'en';
        else if (inputKey === '3') nextState.selectedLanguage = 'ta';
        else if (inputKey === '4') nextState.selectedLanguage = 'te';
        else if (inputKey === '5') nextState.selectedLanguage = 'kn';
        else if (inputKey === '6') nextState.selectedLanguage = 'mr';
        else if (inputKey === '7') nextState.selectedLanguage = 'bn';
        else if (inputKey === '8') nextState.selectedLanguage = 'gu';
        else {
          // Default to Hindi
          nextState.selectedLanguage = 'hi';
        }

        nextState.currentStep = 'MAIN_MENU';
        prompt = this.getMainMenuPrompt(nextState.selectedLanguage);
        break;

      case 'MAIN_MENU':
        if (inputKey === '1') {
          // Option 1: Hear Latest Saved Case (Upcoming Hearing Demo Case)
          nextState.currentStep = 'READ_CASE';
          nextState.activeCnr = 'DLHC01-008472-2024';
          const caseObj = await courtDataProvider.lookupByCnr(nextState.activeCnr);
          if (caseObj) {
            fetchedCase = caseObj;
            prompt = this.getCaseReadoutPrompt(caseObj, nextState.selectedLanguage);
          } else {
            prompt = this.getNotFoundPrompt(nextState.selectedLanguage);
          }
        } else if (inputKey === '2') {
          // Option 2: Enter Case CNR or Case Number
          nextState.currentStep = 'CNR_INPUT';
          prompt = this.getCnrInputPrompt(nextState.selectedLanguage);
        } else if (inputKey === '3') {
          // Option 3: Next Hearing SMS reminder request
          nextState.currentStep = 'REMINDER_MENU';
          prompt = this.getReminderMenuPrompt(nextState.selectedLanguage, nextState.callerNumber);
        } else if (inputKey === '4') {
          // Option 4: Free Legal Aid Helpdesk (NALSA / Tele-Law)
          nextState.currentStep = 'LEGAL_AID';
          prompt = this.getLegalAidPrompt(nextState.selectedLanguage);
        } else if (inputKey === '9') {
          // Change Language
          nextState.currentStep = 'LANGUAGE_SELECT';
          prompt = this.getLanguagePrompt();
        } else {
          prompt = this.getMainMenuPrompt(nextState.selectedLanguage);
        }
        break;

      case 'CNR_INPUT':
        // If user entered CNR or demo key
        const cnrToFetch = inputKey.length >= 10 ? inputKey : 'DLHC01-008472-2024';
        nextState.activeCnr = cnrToFetch;
        const resultCase = await courtDataProvider.lookupByCnr(cnrToFetch);
        if (resultCase) {
          fetchedCase = resultCase;
          nextState.currentStep = 'READ_CASE';
          prompt = this.getCaseReadoutPrompt(resultCase, nextState.selectedLanguage);
        } else {
          prompt = this.getNotFoundPrompt(nextState.selectedLanguage);
        }
        break;

      case 'READ_CASE':
        if (inputKey === '1') {
          // Repeat Case Information
          if (nextState.activeCnr) {
            const caseObj = await courtDataProvider.lookupByCnr(nextState.activeCnr);
            if (caseObj) {
              fetchedCase = caseObj;
              prompt = this.getCaseReadoutPrompt(caseObj, nextState.selectedLanguage);
            } else {
              prompt = this.getMainMenuPrompt(nextState.selectedLanguage);
            }
          } else {
            prompt = this.getMainMenuPrompt(nextState.selectedLanguage);
          }
        } else if (inputKey === '2') {
          // Send SMS Summary
          prompt = this.getSmsSentPrompt(nextState.selectedLanguage, nextState.callerNumber);
          nextState.currentStep = 'MAIN_MENU';
        } else if (inputKey === '9' || inputKey === '*') {
          // Return to Main Menu
          nextState.currentStep = 'MAIN_MENU';
          prompt = this.getMainMenuPrompt(nextState.selectedLanguage);
        } else {
          nextState.currentStep = 'MAIN_MENU';
          prompt = this.getMainMenuPrompt(nextState.selectedLanguage);
        }
        break;

      case 'REMINDER_MENU':
      case 'LEGAL_AID':
        // Return to Main Menu
        nextState.currentStep = 'MAIN_MENU';
        prompt = this.getMainMenuPrompt(nextState.selectedLanguage);
        break;

      default:
        nextState.currentStep = 'WELCOME';
        prompt = this.getLanguagePrompt();
        break;
    }

    // Log IVR spoken prompt
    nextState.audioLog.push({
      timestamp: new Date().toLocaleTimeString(),
      speaker: 'IVR',
      text: prompt.speechText
    });

    if (onSpeak) {
      onSpeak(prompt.speechText, nextState.selectedLanguage);
    }

    return { nextState, prompt, caseData: fetchedCase };
  }

  /**
   * Language prompt (Multilingual welcome)
   */
  static getLanguagePrompt(): IvrPrompt {
    return {
      speechText: 'Welcome to Jurislink, your voice legal assistant. हिन्दी के लिए 1 दबाएं। For English, press 2. தமிழுக்கு 3 அழுத்தவும். తెలుగు కోసం 4 నొక్కండి. ಕನ್ನಡಕ್ಕಾಗಿ 5 ಒತ್ತಿರಿ. मराठीसाठी 6 दाबा. বাংলার জন্য 7 টিপুন. ગુજરાતી માટે 8 દબાવો.',
      displayMenu: '1: हिन्दी | 2: English | 3: தமிழ் | 4: తెలుగు | 5: ಕನ್ನಡ | 6: मराठी | 7: বাংলা | 8: ગુજરાતી',
      expectedInputType: 'DIGIT',
      allowedKeys: ['1', '2', '3', '4', '5', '6', '7', '8']
    };
  }

  /**
   * Main Menu prompt in selected regional language
   */
  static getMainMenuPrompt(lang: SupportedLanguage): IvrPrompt {
    const menus: Record<SupportedLanguage, { speech: string; display: string }> = {
      hi: {
        speech: 'न्याय सेतु में आपका स्वागत है। अपने ताज़ा केस की स्थिति सुनने के लिए 1 दबाएं। नया सीएनआर नंबर दर्ज करने के लिए 2 दबाएं। सुनवाई का एसएमएस रिमाइंडर पाने के लिए 3 दबाएं। मुफ्त कानूनी सहायता हेल्पलाइन के लिए 4 दबाएं। भाषा बदलने के लिए 9 दबाएं।',
        display: '1: केस स्थिति सुनें | 2: CNR दर्ज करें | 3: SMS रिमाइंडर | 4: कानूनी सहायता | 9: भाषा बदलें'
      },
      en: {
        speech: 'Welcome to Jurislink. To hear your latest case status, press 1. To enter a CNR or case number, press 2. To receive an SMS reminder for your next hearing, press 3. For free legal aid helpline, press 4. To change language, press 9.',
        display: '1: Hear Case Status | 2: Enter CNR Number | 3: SMS Reminder | 4: Free Legal Aid | 9: Change Language'
      },
      ta: {
        speech: 'ஜூரிஸ்லிங்க்-ற்கு நல்வரவு. உங்கள் வழக்கின் நிலையை அறிய 1 அழுத்தவும். புதிய சிஎன்ஆர் எண்ணை உள்ளிட 2 அழுத்தவும். எஸ்எம்எஸ் நினைவூட்டல் பெற 3 அழுத்தவும். இலவச சட்ட உதவிக்கு 4 அழுத்தவும். மொழி மாற்ற 9 அழுத்தவும்.',
        display: '1: வழக்கு நிலை | 2: CNR எண் | 3: SMS நினைவூட்டல் | 4: இலவச சட்ட உதவி | 9: மொழி மாற்றம்'
      },
      te: {
        speech: 'జ్యూరిస్‌లింక్‌కు స్వాగతం. మీ కేసు స్థితిని వినడానికి 1 నొక్కండి. కొత్త CNR నంబర్‌ను నమోదు చేయడానికి 2 నొక్కండి. SMS రిమైండర్ కోసం 3 నొక్కండి. ఉచిత న్యాయ సహాయం కోసం 4 నొక్కండి. భాష మార్చడానికి 9 నొక్కండి.',
        display: '1: కేసు స్థితి | 2: CNR నమోదు | 3: SMS రిమైండర్ | 4: న్యాయ సహాయం | 9: భాష మార్చండి'
      },
      kn: {
        speech: 'ಜ್ಯೂರಿಸ್‌ಲಿಂಕ್‌ಗೆ ಸುಸ್ವಾಗತ. ಪ್ರಕರಣದ ಸ್ಥಿತಿ ಕೇಳಲು 1 ಒತ್ತಿರಿ. ಹೊಸ ಸಿಎನ್‌ಆರ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಲು 2 ಒತ್ತಿರಿ. ಉಚಿತ ಕಾನೂನು ನೆರವಿಗೆ 4 ಒತ್ತಿರಿ. ಭಾಷೆ ಬದಲಾಯಿಸಲು 9 ಒತ್ತಿರಿ.',
        display: '1: ಪ್ರಕರಣದ ಸ್ಥಿತಿ | 2: CNR ಸಂಖ್ಯೆ | 3: SMS ನೆನಪೋಲೆ | 4: ಕಾನೂನು ನೆರವು | 9: ಭಾಷೆ ಬದಲಾಯಿಸಿ'
      },
      mr: {
        speech: 'ज्युरीसलिंकमध्ये आपले स्वागत आहे. केसची सद्यस्थिती ऐकण्यासाठी 1 दाबा. सीएनआर नंबर टाकण्यासाठी 2 दाबा. मोफत कायदेशीर मदतीसाठी 4 दाबा. भाषा बदलण्यासाठी 9 दाबा.',
        display: '1: केस स्थिती | 2: CNR नंबर | 3: SMS रिमाइंडर | 4: कायदेशीर मदत | 9: भाषा बदला'
      },
      bn: {
        speech: 'জুরিসলিঙ্কে স্বাগতম। আপনার মামলার স্থিতি শুনতে 1 টিপুন। সিএনআর নম্বর প্রবেশ করতে 2 টিপুন। আইনি সহায়তার জন্য 4 টিপুন। ভাষা পরিবর্তনের জন্য 9 টিপুন।',
        display: '1: মামলার স্থিতি | 2: CNR নম্বর | 3: SMS রিমাইন্ডার | 4: আইনি সহায়তা | 9: ভাষা পরিবর্তন'
      },
      gu: {
        speech: 'જ્યુરિસલિંકમાં આપનું સ્વાગત છે. કેસની સ્થિતિ સાંભળવા 1 દબાવો. સીએનઆર નંબર દાખલ કરવા 2 દબાવો. મફત કાનૂની સહાય માટે 4 દબાવો. ભાષા બદલવા 9 દબાવો.',
        display: '1: કેસ સ્થિતિ | 2: CNR નંબર | 3: SMS રિમાઇન્ડર | 4: કાનૂની સહાય | 9: ભાષા બદલો'
      }
    };

    const item = menus[lang] || menus.en;
    return {
      speechText: item.speech,
      displayMenu: item.display,
      expectedInputType: 'DIGIT',
      allowedKeys: ['1', '2', '3', '4', '9']
    };
  }

  /**
   * Format Spoken Case Narration strictly following Jurislink Accessibility Principle:
   * WHAT HAPPENED -> WHAT HAPPENS NEXT -> WHEN -> WHERE -> ACTION
   */
  static getCaseReadoutPrompt(caseData: CourtCase, lang: SupportedLanguage): IvrPrompt {
    const acc = caseData.accessibilitySummary;
    const whatHappened = acc.whatHappened[lang] || acc.whatHappened.en;
    const whatNext = acc.whatHappensNext[lang] || acc.whatHappensNext.en;
    const whereLoc = acc.whereLocation[lang] || acc.whereLocation.en;
    const nextAction = acc.clearNextAction[lang] || acc.clearNextAction.en;
    const whenDate = acc.whenDate;

    let speechText = '';
    let display = '';

    if (lang === 'hi') {
      speechText = `केस संख्या ${caseData.caseNumber}। कोर्ट: ${caseData.courtName}। क्या हुआ था? ${whatHappened}। आगे क्या होगा? ${whatNext}। अगली तारीख है: ${whenDate}। स्थान: ${whereLoc}। आवश्यक कदम: ${nextAction}। दोबारा सुनने के लिए 1 दबाएं। अपने फोन पर मुफ्त एसएमएस पाने के लिए 2 दबाएं। मुख्य मेनू के लिए 9 दबाएं।`;
      display = `केस: ${caseData.caseNumber} | अगली तारीख: ${whenDate} | 1: दोबारा सुनें | 2: SMS पाएं | 9: मेनू`;
    } else if (lang === 'ta') {
      speechText = `வழக்கு எண் ${caseData.caseNumber}। நீதிமன்றம்: ${caseData.courtName}। என்ன நடந்தது? ${whatHappened}। அடுத்து என்ன நடக்கும்? ${whatNext}। அடுத்த விசாரணை தேதி: ${whenDate}। இடம்: ${whereLoc}। அடுத்த நடவடிக்கை: ${nextAction}। மீண்டும் கேட்க 1 அழுத்தவும். SMS பெற 2 அழுத்தவும். முதன்மை மெனுவிற்கு 9 அழுத்தவும்.`;
      display = `வழக்கு: ${caseData.caseNumber} | அடுத்த தேதி: ${whenDate} | 1: மீண்டும் கேள் | 2: SMS பெறு | 9: மெனு`;
    } else {
      speechText = `Case Number ${caseData.caseNumber}. Court: ${caseData.courtName}. What happened: ${whatHappened}. What happens next: ${whatNext}. When: Next hearing date is ${whenDate}. Where: ${whereLoc}. Action needed: ${nextAction}. To repeat, press 1. To receive an SMS summary on your phone, press 2. To return to main menu, press 9.`;
      display = `Case: ${caseData.caseNumber} | Next Date: ${whenDate} | 1: Repeat | 2: SMS | 9: Menu`;
    }

    return {
      speechText,
      displayMenu: display,
      expectedInputType: 'DIGIT',
      allowedKeys: ['1', '2', '9', '*']
    };
  }

  static getCnrInputPrompt(lang: SupportedLanguage): IvrPrompt {
    const text = lang === 'hi'
      ? 'कृपया अपने 16 अंकों के सीएनआर नंबर के अंतिम 6 अंक दर्ज करें और हैश दबाएं।'
      : 'Please enter the 6 digits of your case CNR number followed by hash.';
    return {
      speechText: text,
      displayMenu: 'Enter 6 digits followed by #',
      expectedInputType: 'CNR',
      allowedKeys: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '#']
    };
  }

  static getReminderMenuPrompt(lang: SupportedLanguage, phone: string): IvrPrompt {
    const text = lang === 'hi'
      ? `आपके पंजीकृत मोबाइल नंबर ${phone} पर सुनवाई से 3 दिन पहले और 1 दिन पहले मुफ्त एसएमएस रिमाइंडर सक्रिय कर दिया गया है। मुख्य मेनू के लिए 9 दबाएं।`
      : `Free SMS reminders have been enabled for mobile number ${phone} 3 days and 1 day before hearing. Press 9 for main menu.`;
    return {
      speechText: text,
      displayMenu: `SMS Reminders Active for ${phone} | Press 9 to return`,
      expectedInputType: 'DIGIT',
      allowedKeys: ['9', '*']
    };
  }

  static getLegalAidPrompt(lang: SupportedLanguage): IvrPrompt {
    const text = lang === 'hi'
      ? 'राष्ट्रीय विधिक सेवा प्राधिकरण (NALSA) की निशुल्क कानूनी सहायता हेल्पलाइन 15100 पर संपर्क किया जा सकता है। आप अपने नजदीकी जिला विधिक सेवा प्राधिकरण (DLSA) में मुफ्त वकील के लिए आवेदन कर सकते हैं। मुख्य मेनू के लिए 9 दबाएं।'
      : 'For free legal aid, call National Legal Services Authority (NALSA) toll-free helpline 15100 or visit your local District Legal Services Authority (DLSA). Press 9 for main menu.';
    return {
      speechText: text,
      displayMenu: 'NALSA Toll-Free Helpline: 15100 | Press 9 to return',
      expectedInputType: 'DIGIT',
      allowedKeys: ['9', '*']
    };
  }

  static getSmsSentPrompt(lang: SupportedLanguage, phone: string): IvrPrompt {
    const text = lang === 'hi'
      ? `केस की संक्षिप्त जानकारी आपके मोबाइल नंबर ${phone} पर एसएमएस द्वारा भेज दी गई है। न्याय सेतु का उपयोग करने के लिए धन्यवाद।`
      : `Case summary SMS has been dispatched to ${phone}. Thank you for using Jurislink.`;
    return {
      speechText: text,
      displayMenu: `SMS Sent to ${phone}`,
      expectedInputType: 'NONE',
      allowedKeys: ['9', '*']
    };
  }

  static getNotFoundPrompt(lang: SupportedLanguage): IvrPrompt {
    const text = lang === 'hi'
      ? 'माफ़ कीजिए, यह सीएनआर नंबर रिकॉर्ड में नहीं मिला। कृपया नंबर जांचें। मुख्य मेनू के लिए 9 दबाएं।'
      : 'Sorry, this case could not be found. Please check your number. Press 9 for main menu.';
    return {
      speechText: text,
      displayMenu: 'Case not found | Press 9 for main menu',
      expectedInputType: 'DIGIT',
      allowedKeys: ['9', '*']
    };
  }

  /**
   * Generate Twilio TwiML XML response for external telephony PBX integration
   */
  static generateTwilioTwiML(prompt: IvrPrompt, lang: SupportedLanguage): string {
    const bcp47 = lang === 'hi' ? 'hi-IN' : (lang === 'ta' ? 'ta-IN' : 'en-IN');
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather numDigits="1" action="/api/ivr/webhook" method="POST" timeout="10">
    <Say language="${bcp47}">${prompt.speechText}</Say>
  </Gather>
  <Say language="${bcp47}">We did not receive any input. Goodbye.</Say>
  <Hangup/>
</Response>`;
  }

  /**
   * Generate Exotel JSON response for Indian telecom cloud PBX integration
   */
  static generateExotelResponse(prompt: IvrPrompt): object {
    return {
      action: 'gather',
      text: prompt.speechText,
      max_digits: 1,
      timeout: 10,
      callback_url: '/api/ivr/webhook'
    };
  }
}
