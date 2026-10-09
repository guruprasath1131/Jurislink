import React, { createContext, useContext, useState, useEffect } from 'react';
import { SupportedLanguage, LanguageInfo } from '../types';

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', voiceLangCode: 'hi-IN' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🌐', voiceLangCode: 'en-IN' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳', voiceLangCode: 'ta-IN' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳', voiceLangCode: 'te-IN' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳', voiceLangCode: 'kn-IN' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳', voiceLangCode: 'mr-IN' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳', voiceLangCode: 'bn-IN' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳', voiceLangCode: 'gu-IN' }
];

export interface TranslationDictionary {
  appName: string;
  tagline: string;
  tollFree: string;
  disclaimerShort: string;
  disclaimerFull: string;
  
  // Navigation Tabs
  navHome: string;
  navMyCases: string;
  navCheckCase: string;
  navScanNotice: string;
  navVoiceAssist: string;
  navReminders: string;
  navIvrPhone: string;
  navHelp: string;

  // 4 Core Accessibility Headers
  whatHappened: string;
  whatHappensNext: string;
  when: string;
  where: string;
  actionNeeded: string;
  
  // Actions
  hearAudio: string;
  stopAudio: string;
  saveCase: string;
  saved: string;
  scanQr: string;
  takePhoto: string;
  uploadNotice: string;
  confirmDetails: string;
  viewOfficialData: string;
  demoModeBadge: string;
  switchScenario: string;
  lastSynced: string;
  retrySync: string;
  statusFresh: string;
  statusStale: string;
  statusCached: string;
  
  // Search
  searchPlaceholder: string;
  searchByCnr: string;
  searchByDetails: string;
  partyName: string;
  caseType: string;
  searchBtn: string;
  or: string;

  // IVR Simulator
  ivrTitle: string;
  ivrSubtitle: string;
  callButton: string;
  endCallButton: string;
  dialpad: string;

  // Reminders
  reminderSettings: string;
  enableSms: string;
  enterMobile: string;
  saveReminders: string;
}

export const TRANSLATIONS: Record<SupportedLanguage, TranslationDictionary> = {
  hi: {
    appName: 'जूरिसलिंक (Jurislink)',
    tagline: 'आसान कानूनी जानकारी - आपकी भाषा, आपकी आवाज़ में',
    tollFree: 'मुफ्त हेल्पलाइन: 1800-JURIS-LINK (1800-587-4754)',
    disclaimerShort: 'जूरिसलिंक केवल आधिकारिक ई-कोर्ट जानकारी को सरल बनाता है। यह कानूनी सलाह नहीं है।',
    disclaimerFull: 'जूरिसलिंक राष्ट्रीय न्यायिक डेटा ग्रिड (NJDG) और ई-कोर्ट्स के आधिकारिक डेटा पर एक सुलभता परत है। आधिकारिक अदालती रिकॉर्ड ही अंतिम एवं मान्य हैं।',
    
    navHome: 'होम',
    navMyCases: 'मेरे केस',
    navCheckCase: 'केस खोजें',
    navScanNotice: 'नोटिस स्कैन',
    navVoiceAssist: 'आवाज़ से पूछें',
    navReminders: 'रिमाइंडर',
    navIvrPhone: 'फ़ोन पर सुनें (IVR)',
    navHelp: 'कानूनी मदद',

    whatHappened: '⚡ क्या हुआ था?',
    whatHappensNext: '🔮 आगे क्या होगा?',
    when: '📅 कब होगी सुनवाई?',
    where: '📍 कहाँ जाना है?',
    actionNeeded: '👉 आपको क्या करना है?',

    hearAudio: 'आवाज़ में सुनें',
    stopAudio: 'आवाज़ रोकें',
    saveCase: 'केस सेव करें',
    saved: 'सुरक्षित है',
    scanQr: 'QR कोड स्कैन करें',
    takePhoto: 'नोटिस की फोटो लें',
    uploadNotice: 'कागज़ अपलोड करें',
    confirmDetails: 'विवरण की पुष्टि करें',
    viewOfficialData: 'आधिकारिक अदालती रिकॉर्ड देखें',
    demoModeBadge: 'डेमो डेटा (DEMO DATA)',
    switchScenario: 'डेमो परिस्थिति बदलें',
    lastSynced: 'अंतिम अपडेट',
    retrySync: 'पुनः प्रयास करें',
    statusFresh: 'ताज़ा डेटा',
    statusStale: 'पुराना डेटा (45 दिन)',
    statusCached: 'ऑफलाइन सुरक्षित',

    searchPlaceholder: '16 अंकों का CNR नंबर दर्ज करें (उदा. DLHC01-008472-2024)',
    searchByCnr: 'सीएनआर (CNR) से खोजें',
    searchByDetails: 'केस नंबर या नाम से खोजें',
    partyName: 'वादी या प्रतिवादी का नाम',
    caseType: 'केस का प्रकार',
    searchBtn: 'केस खोजें',
    or: 'या',

    ivrTitle: '2G फ़ीचर फ़ोन आईवीआर सिमुलेटर',
    ivrSubtitle: 'बिना इंटरनेट वाले सामान्य कीपैड फ़ोन पर टोल-फ़्री 1800-JURIS-LINK डायल करें',
    callButton: 'कॉल लगाएं (1800-587-4754)',
    endCallButton: 'कॉल काटें',
    dialpad: 'डायलपैड',

    reminderSettings: 'एसएमएस (SMS) रिमाइंडर सेटिंग्स',
    enableSms: 'सुनवाई से 3 दिन और 1 दिन पहले मुफ्त एसएमएस पाएं',
    enterMobile: '10 अंकों का मोबाइल नंबर',
    saveReminders: 'रिमाइंडर सक्रिय करें'
  },

  en: {
    appName: 'Jurislink',
    tagline: 'Accessible Legal Case Information in Your Language & Voice',
    tollFree: 'Toll-Free Helpline: 1800-JURIS-LINK (1800-587-4754)',
    disclaimerShort: 'Jurislink is an accessibility layer over official eCourts data. Not legal advice.',
    disclaimerFull: 'Jurislink provides plain-language explanations of official eCourts/NJDG public records. Official court documents remain the authoritative source.',
    
    navHome: 'Home',
    navMyCases: 'My Cases',
    navCheckCase: 'Check Case',
    navScanNotice: 'Scan Notice',
    navVoiceAssist: 'Voice Assist',
    navReminders: 'Reminders',
    navIvrPhone: 'Feature Phone (IVR)',
    navHelp: 'Help & Rights',

    whatHappened: '⚡ WHAT HAPPENED?',
    whatHappensNext: '🔮 WHAT HAPPENS NEXT?',
    when: '📅 WHEN IS THE HEARING?',
    where: '📍 WHERE TO GO?',
    actionNeeded: '👉 WHAT YOU NEED TO DO',

    hearAudio: 'Listen to Voice',
    stopAudio: 'Stop Voice',
    saveCase: 'Save Case',
    saved: 'Saved',
    scanQr: 'Scan Notice QR',
    takePhoto: 'Take Photo of Notice',
    uploadNotice: 'Upload Notice Photo',
    confirmDetails: 'Confirm Extracted Details',
    viewOfficialData: 'View Official eCourts Record',
    demoModeBadge: 'DEMO DATA',
    switchScenario: 'Switch Demo Scenario',
    lastSynced: 'Last Synced',
    retrySync: 'Retry Sync',
    statusFresh: 'Fresh Synced',
    statusStale: 'Stale Data (45 Days)',
    statusCached: 'Offline Cached',

    searchPlaceholder: 'Enter 16-digit CNR number (e.g. DLHC01-008472-2024)',
    searchByCnr: 'Search by CNR Number',
    searchByDetails: 'Search by Case Number or Party',
    partyName: 'Petitioner or Respondent Name',
    caseType: 'Case Type (e.g. WP, OS, CC)',
    searchBtn: 'Lookup Case',
    or: 'OR',

    ivrTitle: '2G Feature-Phone IVR Telephony Simulator',
    ivrSubtitle: 'Accessible over standard toll-free dial-in 1800-JURIS-LINK for basic keypad phones',
    callButton: 'Dial Toll-Free (1800-587-4754)',
    endCallButton: 'End Call',
    dialpad: 'Keypad Dialpad',

    reminderSettings: 'Proactive SMS Hearing Reminders',
    enableSms: 'Receive free regional SMS alerts 7d, 3d, 1d before hearing',
    enterMobile: '10-Digit Mobile Number',
    saveReminders: 'Activate SMS Alerts'
  },

  ta: {
    appName: 'ஜூரிஸ்லிங்க் (Jurislink)',
    tagline: 'எளிய சட்ட விபரங்கள் - உங்கள் தாய்மொழியில், குரல் வழியே',
    tollFree: 'இலவச உதவி எண்: 1800-JURIS-LINK (1800-587-4754)',
    disclaimerShort: 'ஜூரிஸ்லிங்க் அரசு இ-கோர்ட் தகவல்களை எளிமைப்படுத்துகிறது. இது சட்ட ஆலோசனை அல்ல.',
    disclaimerFull: 'ஜூரிஸ்லிங்க் அதிகாரப்பூர்வ இ-கோர்ட்ஸ் (eCourts/NJDG) தரவுகளின் அணுகல் அடுக்கு மட்டுமே. அசல் நீதிமன்ற ஆவணங்களே இறுதியானது.',
    
    navHome: 'முகப்பு',
    navMyCases: 'என் வழக்குகள்',
    navCheckCase: 'வழக்கு தேடல்',
    navScanNotice: 'நோட்டீஸ் ஸ்கேன்',
    navVoiceAssist: 'குரல் உதவி',
    navReminders: 'நினைவூட்டல்',
    navIvrPhone: 'போனில் கேட்க (IVR)',
    navHelp: 'உதவி & வழிகாட்டி',

    whatHappened: '⚡ என்ன நடந்தது?',
    whatHappensNext: '🔮 அடுத்து என்ன நடக்கும்?',
    when: '📅 விசாரணை எப்போது?',
    where: '📍 எங்கே செல்ல வேண்டும்?',
    actionNeeded: '👉 நீங்கள் செய்ய வேண்டியவை',

    hearAudio: 'குரலில் கேட்க',
    stopAudio: 'நிறுத்து',
    saveCase: 'வழக்கை சேமி',
    saved: 'சேமிக்கப்பட்டது',
    scanQr: 'QR குறியீட்டை ஸ்கேன் செய்',
    takePhoto: 'நோட்டீஸ் புகைப்படம் எடு',
    uploadNotice: 'ஆவணத்தை பதிவேற்று',
    confirmDetails: 'விபரங்களை உறுதிசெய்',
    viewOfficialData: 'அதிகாரப்பூர்வ நீதிமன்ற ஆவணம்',
    demoModeBadge: 'மாதிரி தகவல் (DEMO DATA)',
    switchScenario: 'மாதிரி காட்சியை மாற்று',
    lastSynced: 'கடைசி புதுப்பிப்பு',
    retrySync: 'மீண்டும் முயல்க',
    statusFresh: 'புதிய தகவல்',
    statusStale: 'பழைய தகவல்',
    statusCached: 'ஆஃப்லைனில் சேமிக்கப்பட்டது',

    searchPlaceholder: '16 இலக்க CNR எண்ணை உள்ளிடவும் (எ.கா. TNCH02-014589-2024)',
    searchByCnr: 'CNR எண் மூலம் தேடு',
    searchByDetails: 'வழக்கு எண் / பெயர் மூலம் தேடு',
    partyName: 'மனுதாரர் அல்லது எதிர் தரப்பு பெயர்',
    caseType: 'வழக்கு வகை',
    searchBtn: 'வழக்கை தேடு',
    or: 'அல்லது',

    ivrTitle: '2G ஃபீச்சர் போன் IVR சிமுலேட்டர்',
    ivrSubtitle: 'சாதாரண கீபேட் போனில் இலவச 1800-JURIS-LINK டயல் செய்து வழக்கின் நிலையை அறியலாம்',
    callButton: 'இலவச அழைப்பு (1800-587-4754)',
    endCallButton: 'அழைப்பை துண்டி',
    dialpad: 'டயல்பேட்',

    reminderSettings: 'SMS நினைவூட்டல் அமைப்புகள்',
    enableSms: 'விசாரணைக்கு 3 நாட்கள் மற்றும் 1 நாள் முன் இலவச SMS பெறவும்',
    enterMobile: '10 இலக்க மொபைல் எண்',
    saveReminders: 'நினைவூட்டலை இயக்கு'
  },

  te: {
    appName: 'జ్యూరిస్‌లింక్ (Jurislink)',
    tagline: 'సులభమైన చట్టపరమైన సమాచారం - మీ భాషలో, మీ గొంతులో',
    tollFree: 'టోల్-ఫ్రీ హెల్ప్‌లైన్: 1800-JURIS-LINK',
    disclaimerShort: 'జ్యూరిస్‌లింక్ అధికారిక ఈ-కోర్టుల సమాచారాన్ని సులభతరం చేస్తుంది. ఇది న్యాయ సలహా కాదు.',
    disclaimerFull: 'జ్యూరిస్‌లింక్ అధికారిక eCourts/NJDG డేటాపై యాక్సెసిబిలిటీ లేయర్ మాత్రమే.',
    
    navHome: 'హోమ్',
    navMyCases: 'నా కేసులు',
    navCheckCase: 'కేసు శోధన',
    navScanNotice: 'నోటీస్ స్కాన్',
    navVoiceAssist: 'వాయిస్ అసిస్ట్',
    navReminders: 'రిమైండర్లు',
    navIvrPhone: 'ఫోన్‌లో వినండి (IVR)',
    navHelp: 'సహాయం',

    whatHappened: '⚡ ఏం జరిగింది?',
    whatHappensNext: '🔮 తర్వాత ఏం జరుగుతుంది?',
    when: '📅 విచారణ ఎప్పుడు?',
    where: '📍 ఎక్కడికి వెళ్లాలి?',
    actionNeeded: '👉 మీరు చేయాల్సింది ఏమిటి?',

    hearAudio: 'వాయిస్‌లో వినండి',
    stopAudio: 'ఆపండి',
    saveCase: 'సేవ్ చేయండి',
    saved: 'సేవ్ అయింది',
    scanQr: 'QR కోడ్ స్కాన్',
    takePhoto: 'నోటీస్ ఫోటో తీయండి',
    uploadNotice: 'ఫోటో అప్‌లోడ్',
    confirmDetails: 'వివరాలు నిర్ధారించండి',
    viewOfficialData: 'అధికారిక రికార్డు చూడండి',
    demoModeBadge: 'డెమో డేటా (DEMO DATA)',
    switchScenario: 'డెమో మార్చండి',
    lastSynced: 'చివరి అప్‌డేట్',
    retrySync: 'మళ్లీ ప్రయత్నించండి',
    statusFresh: 'తాజా సమాచారం',
    statusStale: 'పాత సమాచారం',
    statusCached: 'ఆఫ్‌లైన్ రికార్డు',

    searchPlaceholder: '16 అంకెల CNR నంబర్ నమోదు చేయండి',
    searchByCnr: 'CNR తో శోధించండి',
    searchByDetails: 'కేసు నంబర్ లేదా పేరుతో శోధించండి',
    partyName: 'పేరు',
    caseType: 'రకం',
    searchBtn: 'కేసు శోధించండి',
    or: 'లేదా',

    ivrTitle: '2G ఫీచర్ ఫోన్ IVR సిమ్యులేటర్',
    ivrSubtitle: 'సాధారణ ఫోన్‌లో ఉచిత 1800-JURIS-LINK డయల్ చేసి సమాచారం వినండి',
    callButton: 'కాల్ చేయండి (1800-587-4754)',
    endCallButton: 'కాల్ ముగించండి',
    dialpad: 'డయల్‌ప్యాడ్',

    reminderSettings: 'SMS రిమైండర్ సెట్టింగ్‌లు',
    enableSms: 'విచారణకు ముందు ఉచిత SMS అలర్ట్‌లు పొందండి',
    enterMobile: 'మొబైల్ నంబర్',
    saveReminders: 'యాక్టివేట్ చేయండి'
  },

  kn: {
    appName: 'ಜ್ಯೂರಿಸ್‌ಲಿಂಕ್ (Jurislink)',
    tagline: 'ಸರಳ ಕಾನೂನು ಮಾಹಿತಿ - ನಿಮ್ಮದೇ ಭಾಷೆಯಲ್ಲಿ, ನಿಮ್ಮದೇ ಧ್ವನಿಯಲ್ಲಿ',
    tollFree: 'ಉಚಿತ ಸಹಾಯವಾಣಿ: 1800-JURIS-LINK',
    disclaimerShort: 'ಜ್ಯೂರಿಸ್‌ಲಿಂಕ್ ಅಧಿಕೃತ ಈ-ಕೋರ್ಟ್ ಮಾಹಿತಿಯನ್ನು ಸರಳಗೊಳಿಸುತ್ತದೆ.',
    disclaimerFull: 'ಜ್ಯೂರಿಸ್‌ಲಿಂಕ್ ಅಧಿಕೃತ eCourts/NJDG ದಾಖಲೆಗಳ ಸುಲಭ ವಿವರಣೆಯಾಗಿದೆ.',
    
    navHome: 'ಮುಖಪುಟ',
    navMyCases: 'ನನ್ನ ಪ್ರಕರಣಗಳು',
    navCheckCase: 'ಪ್ರಕರಣ ಹುಡುಕಿ',
    navScanNotice: 'ನೋಟಿಸ್ ಸ್ಕ್ಯಾನ್',
    navVoiceAssist: 'ಧ್ವನಿ ಸಹಾಯ',
    navReminders: 'ನೆನಪೋಲೆಗಳು',
    navIvrPhone: 'ಫೋನ್‌ನಲ್ಲಿ ಕೇಳಿ (IVR)',
    navHelp: 'ಸಹಾಯ',

    whatHappened: '⚡ ಏನಾಯಿತು?',
    whatHappensNext: '🔮 ಮುಂದೆ ಏನಾಗುತ್ತದೆ?',
    when: '📅 ವಿಚಾರಣೆ ಯಾವಾಗ?',
    where: '📍 ಎಲ್ಲಿಗೆ ಹೋಗಬೇಕು?',
    actionNeeded: '👉 ನೀವು ಮಾಡಬೇಕಾದದ್ದು',

    hearAudio: 'ಧ್ವನಿಯಲ್ಲಿ ಕೇಳಿ',
    stopAudio: 'ನಿಲ್ಲಿಸಿ',
    saveCase: 'ಉಳಿಸಿ',
    saved: 'ಉಳಿಸಲಾಗಿದೆ',
    scanQr: 'QR ಕೋಡ್ ಸ್ಕ್ಯಾನ್',
    takePhoto: 'ಫೋಟೋ ತೆಗೆಯಿರಿ',
    uploadNotice: 'ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
    confirmDetails: 'ವಿವರ ದೃಢೀಕರಿಸಿ',
    viewOfficialData: 'ಅಧಿಕೃತ ದಾಖಲೆ ವೀಕ್ಷಿಸಿ',
    demoModeBadge: 'ಡೆಮೊ ಮಾಹಿತಿ (DEMO DATA)',
    switchScenario: 'ಡೆಮೊ ಬದಲಾಯಿಸಿ',
    lastSynced: 'ಕೊನೆಯ ನವೀಕರಣ',
    retrySync: 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ',
    statusFresh: 'ತಾಜಾ ಮಾಹಿತಿ',
    statusStale: 'ಹಳೆಯ ಮಾಹಿತಿ',
    statusCached: 'ಆಫ್‌ಲೈನ್ ಮಾಹಿತಿ',

    searchPlaceholder: '16 ಅಂಕಿಗಳ CNR ಸಂಖ್ಯೆ ನಮೂದಿಸಿ',
    searchByCnr: 'CNR ಮೂಲಕ ಹುಡುಕಿ',
    searchByDetails: 'ಪ್ರಕರಣ ಸಂಖ್ಯೆ ಅಥವಾ ಹೆಸರಿನಿಂದ ಹುಡುಕಿ',
    partyName: 'ಹೆಸರು',
    caseType: 'ಪ್ರಕಾರ',
    searchBtn: 'ಹುಡುಕಿ',
    or: 'ಅಥವಾ',

    ivrTitle: '2G ಫೀಚರ್ ಫೋನ್ IVR ಸಿಮ್ಯುಲೇಟರ್',
    ivrSubtitle: 'ಕೀಪ್ಯಾಡ್ ಫೋನ್‌ನಲ್ಲಿ 1800-JURIS-LINK ಡಯಲ್ ಮಾಡಿ ಮಾಹಿತಿ ಪಡೆಯಿರಿ',
    callButton: 'ಕರೆ ಮಾಡಿ (1800-587-4754)',
    endCallButton: 'ಕರೆ ಕಡಿತಗೊಳಿಸಿ',
    dialpad: 'ಡಯಲ್‌ಪ್ಯಾಡ್',

    reminderSettings: 'SMS ನೆನಪೋಲೆಗಳು',
    enableSms: 'ವಿಚಾರಣೆಗೆ ಮುಂಚಿತವಾಗಿ SMS ಪಡೆಯಿರಿ',
    enterMobile: 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ',
    saveReminders: 'ಸಕ್ರಿಯಗೊಳಿಸಿ'
  },

  mr: {
    appName: 'ज्युरीसलिंक (Jurislink)',
    tagline: 'सोपी कायदेशीर माहिती - तुमच्या भाषेत, तुमच्या आवाजात',
    tollFree: 'मोफत हेल्पलाइन: 1800-JURIS-LINK',
    disclaimerShort: 'ज्युरीसलिंक अधिकृत ई-कोर्ट माहिती सुलभ करते. हा कायदेशीर सल्ला नाही.',
    disclaimerFull: 'ज्युरीसलिंक ही अधिकृत eCourts/NJDG डेटावरील सुलभता प्रणाली आहे.',
    
    navHome: 'मुख्यपृष्ठ',
    navMyCases: 'माझे खटले',
    navCheckCase: 'खटला शोधा',
    navScanNotice: 'नोटीस स्कॅन',
    navVoiceAssist: 'आवाज सहाय्यक',
    navReminders: 'स्मरणपत्रे',
    navIvrPhone: 'फोनवर ऐका (IVR)',
    navHelp: 'मदत व हक्क',

    whatHappened: '⚡ काय घडले?',
    whatHappensNext: '🔮 पुढे काय होणार?',
    when: '📅 सुनावणी कधी?',
    where: '📍 कुठे जायचे?',
    actionNeeded: '👉 काय करावे लागेल?',

    hearAudio: 'आवाजात ऐका',
    stopAudio: 'आवाज थांबवा',
    saveCase: 'केस सेव्ह करा',
    saved: 'सेव्ह केले',
    scanQr: 'QR कोड स्कॅन',
    takePhoto: 'फोटो घ्या',
    uploadNotice: 'नोटीस अपलोड करा',
    confirmDetails: 'माहिती पडताळा',
    viewOfficialData: 'अधिकृत रेकॉर्ड पहा',
    demoModeBadge: 'डेमो डेटा (DEMO DATA)',
    switchScenario: 'डेमो बदला',
    lastSynced: 'शेवटचे अपडेट',
    retrySync: 'पुन्हा प्रयत्न करा',
    statusFresh: 'ताजी माहिती',
    statusStale: 'जुनी माहिती',
    statusCached: 'ऑफलाईन सेव्ह',

    searchPlaceholder: '१६ अंकी CNR नंबर प्रविष्ट करा',
    searchByCnr: 'CNR नंबरने शोधा',
    searchByDetails: 'केस नंबर किंवा नावाने शोधा',
    partyName: 'पक्षाचे नाव',
    caseType: 'प्रकार',
    searchBtn: 'शोधा',
    or: 'किंवा',

    ivrTitle: '२जी फीचर फोन IVR सिम्युलेटर',
    ivrSubtitle: 'साध्या फोनवरून मोफत 1800-JURIS-LINK डायल करून केसची माहिती ऐका',
    callButton: 'कॉल करा (1800-587-4754)',
    endCallButton: 'कॉल कट करा',
    dialpad: 'डायलपॅड',

    reminderSettings: 'SMS स्मरणपत्र सेटिंग्ज',
    enableSms: 'सुनावणीपूर्वी मोफत SMS सूचना मिळवा',
    enterMobile: 'मोबाईल नंबर',
    saveReminders: 'सुरू करा'
  },

  bn: {
    appName: 'জুরিসলিঙ্ক (Jurislink)',
    tagline: 'সহজ আইনি তথ্য - আপনার ভাষায় ও আপনার কণ্ঠে',
    tollFree: 'টোল-ফ্রি হেল্পলাইন: 1800-JURIS-LINK',
    disclaimerShort: 'জুরিসলিঙ্ক অফিসিয়াল ই-কোর্ট ডেটাকে সহজ ভাষায় রূপান্তর করে।',
    disclaimerFull: 'জুরিসলিঙ্ক অফিসিয়াল eCourts/NJDG তথ্যের একটি অ্যাক্সেসিবিলিটি লেয়ার।',
    
    navHome: 'হোম',
    navMyCases: 'আমার মামলা',
    navCheckCase: 'মামলা খুঁজুন',
    navScanNotice: 'নোটিশ স্ক্যান',
    navVoiceAssist: 'ভয়েস সহায়তা',
    navReminders: 'রিমাইন্ডার',
    navIvrPhone: 'ফোনে শুনুন (IVR)',
    navHelp: 'সাহায্য',

    whatHappened: '⚡ কি হয়েছিল?',
    whatHappensNext: '🔮 এরপর কি হবে?',
    when: '📅 শুনানি কখন?',
    where: '📍 কোথায় যেতে হবে?',
    actionNeeded: '👉 আপনাকে কি করতে হবে?',

    hearAudio: 'কণ্ঠে শুনুন',
    stopAudio: 'থামান',
    saveCase: 'সংরক্ষণ করুন',
    saved: 'সংরক্ষিত',
    scanQr: 'QR স্ক্যান',
    takePhoto: 'ছবি তুলুন',
    uploadNotice: 'আপলোড করুন',
    confirmDetails: 'বিবরণ নিশ্চিত করুন',
    viewOfficialData: 'অফিসিয়াল রেকর্ড দেখুন',
    demoModeBadge: 'ডেমো ডেটা (DEMO DATA)',
    switchScenario: 'ডেমো পরিবর্তন',
    lastSynced: 'সর্বশেষ আপডেট',
    retrySync: 'আবার চেষ্টা করুন',
    statusFresh: 'তাজা তথ্য',
    statusStale: 'পুরনো তথ্য',
    statusCached: 'অফলাইন ক্যাশ',

    searchPlaceholder: '১৬ সংখ্যার CNR নম্বর লিখুন',
    searchByCnr: 'CNR দিয়ে অনুসন্ধান',
    searchByDetails: 'মামলা নম্বর বা নামে খুঁজুন',
    partyName: 'নাম',
    caseType: 'ধরন',
    searchBtn: 'খুঁজুন',
    or: 'অথবা',

    ivrTitle: '২জি ফিচার ফোন IVR সিমুলেটর',
    ivrSubtitle: 'সাধারণ ফোনে 1800-JURIS-LINK ডায়াল করে মামলার স্থিতি শুনুন',
    callButton: 'কল করুন (1800-587-4754)',
    endCallButton: 'কল কাটুন',
    dialpad: 'ডায়ালপ্যাড',

    reminderSettings: 'SMS রিমাইন্ডার সেটিংস',
    enableSms: 'শুনানির আগে বিনামূল্যে SMS পান',
    enterMobile: 'মোবাইল নম্বর',
    saveReminders: 'সক্রিয় করুন'
  },

  gu: {
    appName: 'જ્યુરિસલિન્ક (Jurislink)',
    tagline: 'સરળ કાનૂની માહિતી - તમારી ભાષામાં, તમારા અવાજમાં',
    tollFree: 'ટોલ-ફ્રી હેલ્પલાઇન: 1800-JURIS-LINK',
    disclaimerShort: 'જ્યુરિસલિન્ક સત્તાવાર ઈ-કોર્ટ ડેટાને સરળ ભાષામાં રજૂ કરે છે.',
    disclaimerFull: 'જ્યુરિસલિન્ક સત્તાવાર eCourts/NJDG ડેટા પર ઍક્સેસિબિલિટી લેયર છે.',
    
    navHome: 'હોમ',
    navMyCases: 'મારા કેસ',
    navCheckCase: 'કેસ શોધો',
    navScanNotice: 'નોટિસ સ્કેન',
    navVoiceAssist: 'વોઇસ સહાય',
    navReminders: 'રિમાઇન્ડર',
    navIvrPhone: 'ફોન પર સાંભળો (IVR)',
    navHelp: 'મદદ અને અધિકારો',

    whatHappened: '⚡ શું થયું હતું?',
    whatHappensNext: '🔮 આગળ શું થશે?',
    when: '📅 સુનાવણી ક્યારે?',
    where: '📍 ક્યાં જવું?',
    actionNeeded: '👉 તમારે શું કરવાનું છે?',

    hearAudio: 'અવાજમાં સાંભળો',
    stopAudio: 'અવાજ બંધ કરો',
    saveCase: 'કેસ સેવ કરો',
    saved: 'સેવ થઈ ગયું',
    scanQr: 'QR કોડ સ્કેન',
    takePhoto: 'ફોટો લો',
    uploadNotice: 'નોટિસ અપલોડ કરો',
    confirmDetails: 'વિગતો કન્ફર્મ કરો',
    viewOfficialData: 'સત્તાવાર રેકોર્ડ જુઓ',
    demoModeBadge: 'ડેમો ડેટા (DEMO DATA)',
    switchScenario: 'ડેમો બદલો',
    lastSynced: 'છેલ્લું અપડેટ',
    retrySync: 'ફરી પ્રયાસ કરો',
    statusFresh: 'તાજી વિગત',
    statusStale: 'જૂની વિગત',
    statusCached: 'ઓફલાઇન સેવ',

    searchPlaceholder: '16 અંકનો CNR નંબર લખો',
    searchByCnr: 'CNR થી શોધો',
    searchByDetails: 'કેસ નંબર કે નામથી શોધો',
    partyName: 'પક્ષકારનું નામ',
    caseType: 'કેસનો પ્રકાર',
    searchBtn: 'કેસ શોધો',
    or: 'અથવા',

    ivrTitle: '2G ફીચર ફોન IVR સિમ્યુલેટર',
    ivrSubtitle: 'સાદા કીપેડ ફોન પર 1800-JURIS-LINK ડાયલ કરી કેસની માહિતી સાંભળો',
    callButton: 'કૉલ કરો (1800-587-4754)',
    endCallButton: 'કૉલ કટ કરો',
    dialpad: 'ડાયલપેડ',

    reminderSettings: 'SMS રિમાઇન્ડર',
    enableSms: 'સુનાવણી પહેલાં મફત SMS મેળવો',
    enterMobile: 'મોબાઇલ નંબર',
    saveReminders: 'સેવ કરો'
  }
};

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: TranslationDictionary;
  languages: LanguageInfo[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>('hi'); // Default Hindi

  useEffect(() => {
    const saved = localStorage.getItem('jurislink_lang') as SupportedLanguage;
    if (saved && TRANSLATIONS[saved]) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    localStorage.setItem('jurislink_lang', lang);
  };

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages: SUPPORTED_LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
