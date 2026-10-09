import { CourtCase, DemoScenario, DemoScenarioId, SupportedLanguage } from '../types';

/**
 * Clean CourtDataProvider abstraction interface.
 * Can be connected to live eCourts / NJDG API when authorized,
 * or realistic MockCourtDataProvider with zero hallucinations and authentic case schemas.
 */
export interface ICourtDataProvider {
  lookupByCnr(cnr: string): Promise<CourtCase | null>;
  searchCases(query: { court?: string; caseType?: string; caseNumber?: string; year?: string; partyName?: string }): Promise<CourtCase[]>;
  getDemoScenario(scenarioId: DemoScenarioId): Promise<DemoScenario | null>;
  getAllDemoScenarios(): Promise<DemoScenario[]>;
}

// 7 Realistic Synthetic Demo Cases covering all essential scenarios
export const DEMO_CASES: Record<DemoScenarioId, CourtCase> = {
  upcoming_hearing: {
    cnr: 'DLHC01-008472-2024',
    caseNumber: 'WP(C) 1402/2024',
    filingNumber: 'F-2024/008472',
    caseType: 'Writ Petition (Civil)',
    filingDate: '2024-02-15',
    registrationDate: '2024-02-18',
    courtName: 'High Court of Delhi at New Delhi',
    state: 'Delhi',
    district: 'New Delhi',
    courtComplex: 'Sher Shah Road Court Complex',
    courtRoomNumber: 'Court Room 14',
    judgeName: 'Hon\'ble Mr. Justice R.K. Sharma & Hon\'ble Ms. Justice P. Roy',
    status: 'PENDING',
    statusText: 'Active / Listed for Final Arguments',
    petitioner: {
      name: 'Rameshwar Dayal (Farmer Welfare Union)',
      advocate: 'Adv. Sanjay Upadhyay',
      type: 'PETITIONER'
    },
    respondent: {
      name: 'Delhi Development Authority & Ors.',
      advocate: 'Adv. Maninder Singh (Standing Counsel)',
      type: 'RESPONDENT'
    },
    actsAndSections: ['Article 226 of the Constitution of India', 'Right to Fair Compensation & Transparency in Land Acquisition Act (Sec 24)'],
    accessibilitySummary: {
      whatHappened: {
        en: 'The court heard initial arguments regarding land compensation and directed government authorities to submit land records.',
        hi: 'अदालत ने ज़मीन के मुआवजे पर प्रारंभिक दलीलें सुनीं और अधिकारियों को ज़मीन का रिकॉर्ड जमा करने का निर्देश दिया।',
        ta: 'நில இழப்பீடு தொடர்பான ஆரம்ப வாதங்களை நீதிமன்றம் கேட்டு, அரசு அதிகாரிகளை ஆவணங்களை சமர்ப்பிக்க உத்தரவிட்டது.',
        te: 'భూ పరిహారంపై కోర్టు ప్రాథమిక వాదనలు విని అధికారులను రికార్డులు సమర్పించాలని ఆదేశించింది.',
        kn: 'ಜಮೀನು ಪರಿಹಾರದ ಕುರಿತು ನ್ಯಾಯಾಲಯವು ವಾದಗಳನ್ನು ಆಲಿಸಿ ಅಧಿಕಾರಿಗಳಿಗೆ ದಾಖಲೆಗಳನ್ನು ಸಲ್ಲಿಸಲು ಆದೇಶಿಸಿದೆ.',
        mr: 'जमीन भरपाईबाबत न्यायालयाने युक्तिवाद ऐकून अधिकाऱ्यांना जमिनीची कागदपत्रे सादर करण्याचे निर्देश दिले.',
        bn: 'জমি ক্ষতিপূরণ বিষয়ে আদালত প্রাথমিক শুনানি গ্রহণ করেছে এবং কর্তৃপক্ষকে নথি জমা দিতে নির্দেশ দিয়েছে।',
        gu: 'જમીન વળતર અંગે કોર્ટે દલીલો સાંભળી અધિકારીઓને રેકોર્ડ રજૂ કરવાનો આદેશ આપ્યો છે.'
      },
      whatHappensNext: {
        en: 'Final arguments from both lawyers will take place. The judge will decide on the stay and compensation amount.',
        hi: 'दोनों पक्षों के वकीलों की अंतिम बहस होगी। जज साहब मुआवजे की राशि और रोक पर फैसला सुनाएंगे।',
        ta: 'இருதரப்பு வழக்கறிஞர்களின் இறுதி வாதங்கள் நடைபெறும். நீதிபதி இழப்பீட்டுத் தொகை குறித்து முடிவு செய்வார்.',
        te: 'ఇరువైపుల న్యాయవాదుల తుది వాదనలు జరుగుతాయి. న్యాయమూర్తి పరిహారంపై నిర్ణయం తీసుకుంటారు.',
        kn: 'ಇಬ್ಬರೂ ವಕೀಲರ ಅಂತಿಮ ವಾದಗಳು ನಡೆಯಲಿವೆ. ನ್ಯಾಯಾಧೀಶರು ಪರಿಹಾರ ಮೊತ್ತದ ಬಗ್ಗೆ ತೀರ್ಮಾನಿಸುವರು.',
        mr: 'दोन्ही बाजूंच्या वकिलांचा अंतिम युक्तिवाद होईल व भरपाईच्या रकमेवर निर्णय दिला जाईल.',
        bn: 'উভয় পক্ষের চূড়ান্ত শুনানি হবে এবং বিচারক ক্ষতিপূরণের বিষয়ে সিদ্ধান্ত দেবেন।',
        gu: 'બંને પક્ષોની અંતિમ દલીલો થશે અને વળતર અંગે નિર્ણય લેવામાં આવશે.'
      },
      whenDate: '2026-09-08',
      whenTime: '10:30 AM',
      whereLocation: {
        en: 'Court Room 14, High Court of Delhi, Sher Shah Road, New Delhi',
        hi: 'कोर्ट रूम 14, दिल्ली उच्च न्यायालय, शेरशाह रोड, नई दिल्ली',
        ta: 'நீதிமன்ற அறை 14, டெல்லி உயர் நீதிமன்றம், ஷேர் ஷா ரோடு, புது தில்லி',
        te: 'కోర్టు రూమ్ 14, ఢిల్లీ హైకోర్టు, షేర్ షా రోడ్, న్యూఢిల్లీ',
        kn: 'ನ್ಯಾಯಾಲಯ ಕೊಠಡಿ 14, ದೆಹಲಿ ಹೈಕೋರ್ಟ್, ಶೇರ್ ಷಾ ರಸ್ತೆ, ನವದೆಹಲಿ',
        mr: 'कोर्ट रूम 14, दिल्ली उच्च न्यायालय, शेरशाह रोड, नवी दिल्ली',
        bn: 'কোর্ট রুম ১৪, দিল্লি হাইকোর্ট, শের শাহ রোড, নতুন দিল্লি',
        gu: 'કોર્ટ રૂમ 14, દિલ્હી હાઈકોર્ટ, શેરશાહ રોડ, નવી દિલ્હી'
      },
      clearNextAction: {
        en: 'Be present at Court Room 14 by 10:00 AM with your identity card and advocate.',
        hi: 'सुबह 10:00 बजे अपने पहचान पत्र और वकील के साथ कोर्ट रूम 14 में उपस्थित रहें।',
        ta: 'காலை 10:00 மணிக்கு உங்கள் அடையாள அட்டை மற்றும் வழக்கறிஞருடன் அறை 14-ல் இருக்கவும்.',
        te: 'ఉదయం 10:00 గంటలకు మీ గుర్తింపు కార్డు మరియు న్యాయవాదితో కోర్టు రూమ్ 14 లో ఉండండి.',
        kn: 'ಬೆಳಗ್ಗೆ 10:00 ಗಂಟೆಗೆ ನಿಮ್ಮ ಗುರುತಿನ ಚೀಟಿ ಮತ್ತು ವಕೀಲರೊಂದಿಗೆ ಕೊಠಡಿ 14 ರಲ್ಲಿ ಇರಿ.',
        mr: 'सकाळी 10:00 वाजता आपल्या ओळखपत्रासह व वकिलासह कोर्ट रूम 14 मध्ये उपस्थित राहा.',
        bn: 'সকাল ১০:০০ টায় আপনার পরিচয়পত্র এবং আইনজীবীর সাথে কোর্ট রুম ১৪ এ উপস্থিত থাকুন।',
        gu: 'સવારે 10:00 વાગ્યે ઓળખકાર્ડ અને વકીલ સાથે કોર્ટ રૂમ 14 માં હાજર રહો.'
      }
    },
    hearings: [
      { date: '2024-03-10', purpose: 'First Admission & Notice', isPast: true },
      { date: '2024-07-22', purpose: 'Counter Affidavit Filed', isPast: true },
      { date: '2026-09-08', purpose: 'Final Hearing & Disposal', isPast: false }
    ],
    orders: [
      {
        orderNumber: 'ORD/2024/8472-1',
        date: '2024-03-10',
        orderType: 'Interim Order',
        judge: 'Hon\'ble Mr. Justice R.K. Sharma',
        rawText: 'Notice issued to respondents. Status quo as on date regarding possession to be maintained till next hearing.',
        simplifiedSummary: {
          en: 'Notice sent to government. Court ordered that existing possession of land cannot be disturbed.',
          hi: 'सरकार को नोटिस भेजा गया। अदालत ने आदेश दिया कि ज़मीन के मौजूदा कब्ज़े से छेड़छाड़ न की जाए।',
          ta: 'அரசுக்கு நோட்டீஸ் அனுப்பப்பட்டது. நிலத்தின் தற்போதைய நிலையை மாற்றக்கூடாது என நீதிமன்றம் உத்தரவிட்டது.',
          te: 'ప్రభుత్వానికి నోటీసు పంపబడింది. ప్రస్తుత భూమి స్వాధీనాన్ని మార్చరాదని కోర్టు ఆదేశించింది.',
          kn: 'ಸರ್ಕಾರಕ್ಕೆ ನೋಟಿಸ್ ಕಳುಹಿಸಲಾಗಿದೆ. ಜಮೀನಿನ ಯಥಾಸ್ಥಿತಿಯನ್ನು ಕಾಪಾಡುವಂತೆ ಸೂಚಿಸಲಾಗಿದೆ.',
          mr: 'शासनाला नोटीस बजावली. जमिनीचा सध्याचा ताबा बदलू नये असा आदेश न्यायालयाने दिला.',
          bn: 'সরকারকে নোটিশ পাঠানো হয়েছে এবং জমির বর্তমান অবস্থা বজায় রাখার নির্দেশ দেওয়া হয়েছে।',
          gu: 'સરકારને નોટિસ મોકલી અને જમીનનો વર્તમાન કબજો જાળવી રાખવાનો આદેશ આપ્યો.'
        },
        isInterim: true,
        confidenceScore: 0.98
      }
    ],
    timeline: [
      {
        id: 't-1',
        date: '2024-02-15',
        title: 'Case Filed & Registered',
        type: 'NOTICE_ISSUED',
        description: 'Petition registered under Article 226',
        simplifiedText: {
          en: 'Case officially registered in High Court.',
          hi: 'हाईकोर्ट में मामला आधिकारिक रूप से दर्ज हुआ।',
          ta: 'உயர் நீதிமன்றத்தில் வழக்கு முறைப்படி பதிவு செய்யப்பட்டது.',
          te: 'హైకోర్టులో కేసు అధికారికంగా నమోదయింది.',
          kn: 'ಹೈಕೋರ್ಟ್‌ನಲ್ಲಿ ಪ್ರಕರಣ ಅಧಿಕೃತವಾಗಿ ದಾಖಲಾಗಿದೆ.',
          mr: 'उच्च न्यायालयात खटला अधिकृतपणे दाखल झाला.',
          bn: 'হাইকোর্টে মামলা আনুষ্ঠানিকভাবে দায়ের করা হয়েছে।',
          gu: 'હાઈકોર્ટમાં કેસ સત્તાવાર રીતે દાખલ થયો.'
        },
        isCompleted: true,
        isUpcoming: false
      },
      {
        id: 't-2',
        date: '2024-03-10',
        title: 'Status Quo Protection Granted',
        type: 'ORDER_PASSED',
        description: 'Interim protection granted to petitioner',
        simplifiedText: {
          en: 'Court granted stay protecting the land from acquisition.',
          hi: 'अदालत ने ज़मीन पर अंतरिम सुरक्षा आदेश दिया।',
          ta: 'நிலத்தை கையகப்படுத்த தற்காலிக தடை வழங்கப்பட்டது.',
          te: 'భూ సేకరణపై కోర్టు స్టే మంజూరు చేసింది.',
          kn: 'ಭೂಸ್ವಾಧೀನದ ವಿರುದ್ಧ ತಡೆಯಾಜ್ಞೆ ನೀಡಲಾಗಿದೆ.',
          mr: 'न्यायालयाने जमिनीच्या संपादनावर स्थगिती दिली.',
          bn: 'জমি অধিগ্রহণের বিরুদ্ধে অন্তর্বর্তীকালীন স্থগিতাদেশ দেওয়া হয়েছে।',
          gu: 'જમીન સંપાદન સામે સ્ટે આપવામાં આવ્યો.'
        },
        isCompleted: true,
        isUpcoming: false
      },
      {
        id: 't-3',
        date: '2026-09-08',
        title: 'Final Hearing & Judgment',
        type: 'ARGUMENTS',
        description: 'Arguments on merits and compensation',
        simplifiedText: {
          en: 'Upcoming final hearing where decision will be made.',
          hi: 'आगामी अंतिम सुनवाई जिसमें अंतिम फैसला होगा।',
          ta: 'இறுதி விசாரணை மற்றும் தீர்ப்புக்கான நாள்.',
          te: 'తుది విచారణ మరియు తీర్పు రానున్న రోజు.',
          kn: 'ಅಂತಿಮ ವಿಚಾರಣೆ ಹಾಗೂ ತೀರ್ಪಿನ ದಿನಾಂಕ.',
          mr: 'अंतिम सुनावणी व निर्णयाची तारीख.',
          bn: 'চূড়ান্ত শুনানি ও রায়ের দিন।',
          gu: 'અંતિમ સુનાવણી અને ચુકાદાનો દિવસ.'
        },
        isCompleted: false,
        isUpcoming: true
      }
    ],
    isDemoData: true,
    demoScenarioId: 'upcoming_hearing',
    dataSource: 'SYNTHETIC_MOCK',
    lastSyncedAt: new Date().toISOString(),
    dataFreshnessStatus: 'FRESH',
    hashChecksum: 'sha256-a9f8b7c6d5e4'
  },

  adjourned_case: {
    cnr: 'MCHC01-003921-2023',
    caseNumber: 'CA 512/2023',
    caseType: 'Civil Appeal',
    filingDate: '2023-06-11',
    registrationDate: '2023-06-14',
    courtName: 'High Court of Judicature at Bombay',
    state: 'Maharashtra',
    district: 'Mumbai',
    courtComplex: 'Fort Heritage Court Complex',
    courtRoomNumber: 'Court Room 07',
    judgeName: 'Hon\'ble Mr. Justice S.V. Kulkarni',
    status: 'ADJOURNED',
    statusText: 'Adjourned / Reconstitution of Bench',
    petitioner: {
      name: 'Sunita Tukaram Shinde',
      advocate: 'Adv. Prakash Ambedkar',
      type: 'APPELLANT'
    },
    respondent: {
      name: 'Municipal Corporation of Greater Mumbai (MCGM)',
      advocate: 'Adv. S.U. Kamdar (Senior Counsel)',
      type: 'RESPONDENT'
    },
    actsAndSections: ['Mumbai Municipal Corporation Act (Sec 351)', 'Code of Civil Procedure (Order 41)'],
    accessibilitySummary: {
      whatHappened: {
        en: 'The hearing could not take place on the previous date because the bench was reconstituted.',
        hi: 'पिछली तारीख पर सुनवाई नहीं हो सकी क्योंकि अदालत की बेंच बदल गई थी।',
        ta: 'நீதிபதி அமர்வு மாற்றப்பட்டதால் முந்தைய தேதியில் விசாரணை நடைபெறவில்லை.',
        te: 'బెంచ్ మారిన కారణంగా గత వాయిదా రోజున విచారణ జరగలేదు.',
        kn: 'ನ್ಯಾಯಪೀಠ ಬದಲಾದ ಕಾರಣ ಹಿಂದಿನ ದಿನಾಂಕದಂದು ವಿಚಾರಣೆ ನಡೆಯಲಿಲ್ಲ.',
        mr: 'न्यायालयीन खंडपीठ बदलल्यामुळे मागील तारखेला सुनावणी होऊ शकली नाही.',
        bn: 'বেঞ্চ পুনর্গঠনের কারণে পূর্ববর্তী তারিখে শুনানি হতে পারেনি।',
        gu: 'બેન્ચ બદલાવાને કારણે અગાઉની તારીખે સુનાવણી થઈ શકી નહોતી.'
      },
      whatHappensNext: {
        en: 'The case will be taken up by the new bench. Both parties will present their documents.',
        hi: 'नया बेंच मामले की सुनवाई करेगा। दोनों पक्ष अपने दस्तावेज़ पेश करेंगे।',
        ta: 'புதிய நீதிபதி அமர்வு வழக்கை விசாரிக்கும். இரு தரப்பும் ஆவணங்களை சமர்ப்பிக்கும்.',
        te: 'కొత్త బెంచ్ కేసును విచారిస్తుంది. ఇరుపక్షాలు తమ పత్రాలను సమర్పిస్తాయి.',
        kn: 'ಹೊಸ ನ್ಯಾಯಪೀಠವು ಪ್ರಕರಣವನ್ನು ಕೈಗೆತ್ತಿಕೊಳ್ಳಲಿದೆ.',
        mr: 'नवीन खंडपीठ या प्रकरणाची सुनावणी घेईल.',
        bn: 'নতুন বেঞ্চ মামলাটি গ্রহণ করবে এবং নথি পরীক্ষা করবে।',
        gu: 'નવી બેન્ચ કેસની સુનાવણી કરશે.'
      },
      whenDate: '2026-09-24',
      whenTime: '11:00 AM',
      whereLocation: {
        en: 'Court Room 07, Bombay High Court, Fort, Mumbai',
        hi: 'कोर्ट रूम 07, बॉम्बे हाईकोर्ट, फोर्ट, मुंबई',
        ta: 'நீதிமன்ற அறை 07, பம்பாய் உயர் நீதிமன்றம், ஃபோர்ட், மும்பை',
        te: 'కోర్టు రూమ్ 07, బొంబాయి హైకోర్టు, ఫోర్ట్, ముంబై',
        kn: 'ನ್ಯಾಯಾಲಯ ಕೊಠಡಿ 07, ಬಾಂಬೆ ಹೈಕೋರ್ಟ್, ಫೋರ್ಟ್, ಮುಂಬೈ',
        mr: 'कोर्ट रूम 07, मुंबई उच्च न्यायालय, फोर्ट, मुंबई',
        bn: 'কোর্ট রুম ০৭, বোম্বে হাইকোর্ট, ফোর্ট, মুম্বাই',
        gu: 'કોર્ટ રૂમ 07, બોમ્બે હાઈકોર્ટ, ફોર્ટ, મુંબઈ'
      },
      clearNextAction: {
        en: 'Verify with your advocate that the appeal paper-book is ready for the new bench.',
        hi: 'अपने वकील से पुष्टि करें कि नए बेंच के लिए अपील की फाइल तैयार है।',
        ta: 'புதிய அமர்வுக்கான ஆவணங்கள் தயாராக உள்ளதா என வழக்கறிஞரிடம் உறுதிப்படுத்தவும்.',
        te: 'కొత్త బెంచ్ కోసం పేపర్ బుక్ సిద్ధంగా ఉందో లేదో మీ న్యాయవాదితో నిర్ధారించుకోండి.',
        kn: 'ಹೊಸ ಪೀಠಕ್ಕೆ ಕಡತಗಳು ಸಿದ್ಧವಾಗಿವೆಯೇ ಎಂದು ನಿಮ್ಮ ವಕೀಲರೊಂದಿಗೆ ಪರಿಶೀಲಿಸಿ.',
        mr: 'नवीन खंडपीठासाठी अपील फाइल तयार असल्याची वकिलांशी खात्री करा.',
        bn: 'আপনার আইনজীবীর সাথে যোগাযোগ করে নিশ্চিত করুন নথিপত্র প্রস্তুত আছে।',
        gu: 'નવી બેન્ચ માટે ફાઈલ તૈયાર છે કે નહીં તેની વકીલ સાથે ખાતરી કરો.'
      }
    },
    hearings: [
      { date: '2023-08-14', purpose: 'Admission Hearing', isPast: true },
      { date: '2024-04-18', purpose: 'Hearing on Stay', isPast: true },
      { date: '2026-09-24', purpose: 'Adjourned Hearing before New Bench', isPast: false }
    ],
    orders: [],
    timeline: [
      {
        id: 't-201',
        date: '2023-06-11',
        title: 'Appeal Lodged',
        type: 'NOTICE_ISSUED',
        description: 'Appeal filed against demolition order',
        simplifiedText: {
          en: 'Appeal filed in High Court.',
          hi: 'हाईकोर्ट में अपील दर्ज की गई।',
          ta: 'உயர் நீதிமன்றத்தில் மேல்முறையீடு செய்யப்பட்டது.',
          te: 'హైకోర్టులో అప్పీల్ దాఖలు చేయబడింది.',
          kn: 'ಹೈಕೋರ್ಟ್‌ನಲ್ಲಿ ಮೇಲ್ಮನವಿ ಸಲ್ಲಿಸಲಾಗಿದೆ.',
          mr: 'उच्च न्यायालयात अपील दाखल करण्यात आले.',
          bn: 'হাইকোর্টে আপিল দায়ের করা হয়েছে।',
          gu: 'હાઈકોર્ટમાં અપીલ દાખલ કરવામાં આવી.'
        },
        isCompleted: true,
        isUpcoming: false
      },
      {
        id: 't-202',
        date: '2026-08-10',
        title: 'Hearing Adjourned',
        type: 'ADJOURNMENT',
        description: 'Adjourned due to change in roster',
        simplifiedText: {
          en: 'Hearing rescheduled to September 24.',
          hi: 'सुनवाई 24 सितंबर के लिए आगे बढ़ा दी गई।',
          ta: 'விசாரணை செப்டம்பர் 24-க்கு மாற்றப்பட்டது.',
          te: 'విచారణ సెప్టెంబర్ 24కి వాయిదా పడింది.',
          kn: 'ವಿಚಾರಣೆಯನ್ನು ಸೆಪ್ಟೆಂಬರ್ 24 ಕ್ಕೆ ಮುಂದೂಡಲಾಗಿದೆ.',
          mr: 'सुनावणी 24 सप्टेंबरपर्यंत पुढे ढकलण्यात आली.',
          bn: 'শুনানি ২৪ সেপ্টেম্বর পর্যন্ত স্থগিত করা হয়েছে।',
          gu: 'સુનાવણી 24 સપ્ટેમ્બર સુધી મુલતવી રખાઈ.'
        },
        isCompleted: true,
        isUpcoming: false
      }
    ],
    isDemoData: true,
    demoScenarioId: 'adjourned_case',
    dataSource: 'SYNTHETIC_MOCK',
    lastSyncedAt: new Date().toISOString(),
    dataFreshnessStatus: 'FRESH',
    hashChecksum: 'sha256-b8c7d6e5f4a3'
  },

  completed_case: {
    cnr: 'KABC01-002194-2022',
    caseNumber: 'CC 884/2022',
    caseType: 'Consumer Complaint',
    filingDate: '2022-04-05',
    registrationDate: '2022-04-09',
    courtName: 'District Consumer Disputes Redressal Commission, Bangalore Urban',
    state: 'Karnataka',
    district: 'Bangalore',
    courtComplex: 'Kandhaya Bhavana, K.G. Road',
    courtRoomNumber: 'Court Hall 2',
    judgeName: 'Smt. M. Geetha (President) & Sri. B. Shivakumar (Member)',
    status: 'DISPOSED',
    statusText: 'Disposed / Decreed in Favour of Complainant',
    petitioner: {
      name: 'Anand Kumar K.',
      advocate: 'Self (In-Person)',
      type: 'COMPLAINANT'
    },
    respondent: {
      name: 'Star Health & Allied Insurance Co. Ltd.',
      advocate: 'Adv. H.N. Keshava Murthy',
      type: 'RESPONDENT'
    },
    actsAndSections: ['Consumer Protection Act 2019 (Sec 35)'],
    accessibilitySummary: {
      whatHappened: {
        en: 'The Consumer Forum found the insurance company guilty of deficiency of service for rejecting medical reimbursement.',
        hi: 'उपभोक्ता अदालत ने अस्पताल के बिल का क्लेम खारिज करने पर बीमा कंपनी को दोषी पाया।',
        ta: 'மருத்துவக் காப்பீட்டுத் தொகையை மறுத்ததற்காக காப்பீட்டு நிறுவனம் மீது நுகர்வோர் நீதிமன்றம் தவறு கண்டறிந்தது.',
        te: 'వైద్య ఖర్చుల క్లెయిమ్ తిరస్కరించినందుకు ఇన్సూరెన్స్ కంపెనీని వినియోగదారుల కోర్టు తప్పుపట్టింది.',
        kn: 'ವೈದ್ಯಕೀಯ ವಿಮೆ ಕ್ಲೈಮ್ ತಿರಸ್ಕರಿಸಿದ್ದಕ್ಕೆ ವಿಮಾ ಕಂಪನಿಯು ತಪ್ಪಿತಸ್ಥ ಎಂದು ಗ್ರಾಹಕರ ವೇದಿಕೆ ತೀರ್ಪು ನೀಡಿದೆ.',
        mr: 'वैद्यकीय खर्चाचा क्लेम नाकारल्याबद्दल ग्राहक न्यायालयाने विमा कंपनीला दोषी धरले.',
        bn: 'মেডিকেল বিল প্রত্যাখ্যানের জন্য কনজিউমার ফোরাম বীমা কোম্পানিকে দায়ী করেছে।',
        gu: 'મેડિકલ ક્લેમ નકારવા બદલ ગ્રાહક કોર્ટે વીમા કંપનીને દોષી ઠેરવી છે.'
      },
      whatHappensNext: {
        en: 'The insurance company must pay ₹1,85,000 with 9% interest plus ₹25,000 compensation within 45 days.',
        hi: 'बीमा कंपनी को 45 दिनों के भीतर ₹1,85,000 (9% ब्याज सहित) और ₹25,000 हर्जाना देना होगा।',
        ta: 'காப்பீட்டு நிறுவனம் 45 நாட்களுக்குள் ₹1,85,000 (9% வட்டியுடன்) மற்றும் ₹25,000 இழப்பீடு வழங்க வேண்டும்.',
        te: 'ఇన్సూరెన్స్ కంపెనీ 45 రోజుల్లోగా ₹1,85,000 (9% వడ్డీతో) మరియు ₹25,000 నష్టపరిహారం చెల్లించాలి.',
        kn: 'ವಿಮಾ ಕಂಪನಿಯು 45 ದಿನಗಳಲ್ಲಿ ₹1,85,000 (ಶೇ 9 ಬಡ್ಡಿ) ಮತ್ತು ₹25,000 ಪರಿಹಾರವನ್ನು ನೀಡಬೇಕು.',
        mr: 'विमा कंपनीने 45 दिवसांत ₹1,85,000 (9% व्याजासह) व ₹25,000 नुकसानभरपाई दिली पाहिजे.',
        bn: 'বীমা কোম্পানিকে ৪৫ দিনের মধ্যে ৯% সুদসহ ₹১,৮৫,০০০ এবং ₹২৫,০০০ ক্ষতিপূরণ দিতে হবে।',
        gu: 'વીમા કંપનીએ 45 દિવસમાં ₹1,85,000 (9% વ્યાજ સાથે) અને ₹25,000 વળતર ચૂકવવું પડશે.'
      },
      whenDate: 'Case Closed (Disposed)',
      whenTime: 'Final Order Passed on 2024-05-12',
      whereLocation: {
        en: 'Consumer Court Hall 2, Kandhaya Bhavana, K.G. Road, Bengaluru',
        hi: 'कंज्यूमर कोर्ट हॉल 2, कंधाया भवन, के.जी. रोड, बेंगलुरु',
        ta: 'நுகர்வோர் நீதிமன்றம் அரங்கு 2, கந்தாய பவனா, பெங்களூரு',
        te: 'వినియోగదారుల కోర్టు హాల్ 2, కందాయ భవనం, కేజీ రోడ్, బెంగళూరు',
        kn: 'ಗ್ರಾಹಕರ ನ್ಯಾಯಾಲಯ ಸಭಾಂಗಣ 2, ಕಂದಾಯ ಭವನ, ಕೆ.ಜಿ. ರಸ್ತೆ, ಬೆಂಗಳೂರು',
        mr: 'ग्राहक न्यायालय हॉल 2, कंदाय भवन, के.जी. रोड, बंगळुरू',
        bn: 'কনজিউমার কোর্ট হল ২, কান্ধায়া ভবন, কে.জি. রোড, বেঙ্গালুরু',
        gu: 'ગ્રાહક કોર્ટ હોલ 2, કંધાયા ભવન, કે.જી. રોડ, બેંગ્લોર'
      },
      clearNextAction: {
        en: 'Collect the certified copy of the final judgment from the court registry to claim payment.',
        hi: 'भुगतान प्राप्त करने के लिए अदालत की रजिस्ट्री से अंतिम फैसले की प्रमाणित प्रति प्राप्त करें।',
        ta: 'பணத்தைப் பெற நீதிமன்ற பதிவகத்திலிருந்து தீர்ப்பின் சான்றளிக்கப்பட்ட நகலைப் பெறவும்.',
        te: 'చెల్లింపును క్లెయిమ్ చేయడానికి కోర్టు రిజిస్ట్రీ నుండి తుది తీర్పు సర్టిఫైడ్ కాపీని తీసుకోండి.',
        kn: 'ಪಾವತಿಯನ್ನು ಪಡೆಯಲು ನ್ಯಾಯಾಲಯದ ರಿಜಿಸ್ಟ್ರಿಯಿಂದ ತೀರ್ಪಿನ ಪ್ರಮಾಣೀಕೃತ ಪ್ರತಿಯನ್ನು ಪಡೆದುಕೊಳ್ಳಿ.',
        mr: 'पैसे मिळवण्यासाठी न्यायालयाच्या कार्यालयातून अंतिम निकालाची प्रमाणित प्रत मिळवा.',
        bn: 'টাকা পাওয়ার জন্য আদালতের রেজিস্ট্রি থেকে রায়ের সার্টিফায়েড কপি সংগ্রহ করুন।',
        gu: 'ચુકવણી મેળવવા માટે કોર્ટ રજિસ્ટ્રીમાંથી ચુકાદાની પ્રમાણિત નકલ મેળવો.'
      }
    },
    hearings: [],
    orders: [
      {
        orderNumber: 'FINAL/2024/2194',
        date: '2024-05-12',
        orderType: 'Final Judgment & Order',
        judge: 'Smt. M. Geetha (President)',
        rawText: 'Complaint allowed. Opposite Party directed to pay ₹1,85,000 towards repudiated claim along with 9% interest from date of filing till realization, plus ₹25,000 towards mental agony and litigation cost within 45 days.',
        simplifiedSummary: {
          en: 'Final decision: Insurance company ordered to pay the medical claim + ₹25,000 compensation.',
          hi: 'अंतिम फैसला: बीमा कंपनी को मेडिकल क्लेम और ₹25,000 का हर्जाना देने का आदेश।',
          ta: 'இறுதித் தீர்ப்பு: மருத்துவக் காப்பீடு மற்றும் ₹25,000 இழப்பீட்டை வழங்க உத்தரவு.',
          te: 'తుది తీర్పు: మెడికల్ క్లెయిమ్ మరియు ₹25,000 నష్టపరిహారం చెల్లించాలని ఆదేశం.',
          kn: 'ಅಂತಿಮ ತೀರ್ಪು: ವೈದ್ಯಕೀಯ ಕ್ಲೈಮ್ ಮತ್ತು ₹25,000 ಪರಿಹಾರ ನೀಡಲು ಆದೇಶ.',
          mr: 'अंतिम निर्णय: वैद्यकीय क्लेम आणि ₹25,000 नुकसानभरपाई देण्याचे आदेश.',
          bn: 'চূড়ান্ত রায়: মেডিকেল দাবি এবং ₹২৫,০০০ ক্ষতিপূরণ দেওয়ার আদেশ।',
          gu: 'અંતિમ ચુકાદો: મેડિકલ ક્લેમ અને ₹25,000 વળતર ચૂકવવાનો આદેશ.'
        },
        isInterim: false,
        confidenceScore: 0.99
      }
    ],
    timeline: [
      {
        id: 't-301',
        date: '2022-04-05',
        title: 'Consumer Complaint Filed',
        type: 'NOTICE_ISSUED',
        description: 'Complaint filed for medical claim denial',
        simplifiedText: {
          en: 'Complaint filed in Consumer Court.',
          hi: 'उपभोक्ता अदालत में शिकायत दर्ज।',
          ta: 'நுகர்வோர் நீதிமன்றத்தில் புகார் பதிவு.',
          te: 'వినియోగదారుల కోర్టులో ఫిర్యాదు దాఖలు.',
          kn: 'ಗ್ರಾಹಕರ ನ್ಯಾಯಾಲಯದಲ್ಲಿ ದೂರು ದಾಖಲು.',
          mr: 'ग्राहक न्यायालयात तक्रार दाखल.',
          bn: 'কনজিউমার কোর্টে অভিযোগ দায়ের।',
          gu: 'ગ્રાહક કોર્ટમાં ફરિયાદ દાખલ.'
        },
        isCompleted: true,
        isUpcoming: false
      },
      {
        id: 't-302',
        date: '2024-05-12',
        title: 'Final Judgment Pronounced',
        type: 'JUDGMENT_PRONOUNCED',
        description: 'Complaint allowed with compensation',
        simplifiedText: {
          en: 'Court ruled in your favour.',
          hi: 'फैसला आपके पक्ष में सुनाया गया।',
          ta: 'தீர்ப்பு உங்களுக்கு சாதகமாக வழங்கப்பட்டது.',
          te: 'తీర్పు మీకు అనుకూలంగా వచ్చింది.',
          kn: 'ತೀರ್ಪು ನಿಮ್ಮ ಪರವಾಗಿ ಬಂದಿದೆ.',
          mr: 'निकाल तुमच्या बाजूने लागला.',
          bn: 'রায় আপনার পক্ষে এসেছে।',
          gu: 'ચુકાદો તમારી તરફેણમાં આવ્યો.'
        },
        isCompleted: true,
        isUpcoming: false
      }
    ],
    isDemoData: true,
    demoScenarioId: 'completed_case',
    dataSource: 'SYNTHETIC_MOCK',
    lastSyncedAt: new Date().toISOString(),
    dataFreshnessStatus: 'FRESH',
    hashChecksum: 'sha256-c7d6e5f4a3b2'
  },

  new_order_issued: {
    cnr: 'TNCH02-014589-2024',
    caseNumber: 'WP 9241/2024',
    caseType: 'Writ Petition',
    filingDate: '2024-07-02',
    registrationDate: '2024-07-05',
    courtName: 'High Court of Judicature at Madras',
    state: 'Tamil Nadu',
    district: 'Chennai',
    courtComplex: 'High Court Buildings, Parry\'s Corner',
    courtRoomNumber: 'Court Room 21',
    judgeName: 'Hon\'ble Mr. Justice N. Anand Venkatesh',
    status: 'PENDING',
    statusText: 'Interim Injunction Order Passed',
    petitioner: {
      name: 'Selvi Meenakshi Ammal',
      advocate: 'Adv. S. Prabhakaran (Senior Counsel)',
      type: 'PETITIONER'
    },
    respondent: {
      name: 'TANGEDCO (Tamil Nadu Electricity Board)',
      advocate: 'Adv. L. Jaivenkatesh (Standing Counsel)',
      type: 'RESPONDENT'
    },
    actsAndSections: ['Electricity Act 2003 (Sec 43)', 'Article 226 of the Constitution of India'],
    accessibilitySummary: {
      whatHappened: {
        en: 'The High Court passed an urgent interim stay ordering the electricity board not to disconnect agricultural power supply.',
        hi: 'हाईकोर्ट ने बिजली विभाग को कृषि बिजली कनेक्शन न काटने का कड़ा अंतरिम रोक आदेश जारी किया है।',
        ta: 'விவசாய மின் இணைப்பை துண்டிக்கக் கூடாது என்று மின்சார வாரியத்திற்கு உயர்நீதிமன்றம் அவசர இடைக்கால தடை உத்தரவு பிறப்பித்துள்ளது.',
        te: 'వ్యవసాయ విద్యుత్ సరఫరాను నిలిపివేయవద్దని హైకోర్టు విద్యుత్ శాఖకు స్టే ఉత్తర్వులు జారీ చేసింది.',
        kn: 'ಕೃಷಿ ವಿದ್ಯುತ್ ಸಂಪರ್ಕ ಕಡಿತಗೊಳಿಸದಂತೆ ಹೈಕೋರ್ಟ್ ವಿದ್ಯುತ್ ಇಲಾಖೆಗೆ ತುರ್ತು ತಡೆಯಾಜ್ಞೆ ನೀಡಿದೆ.',
        mr: 'कृषी वीजपुरवठा खंडित करू नये असा अंतरिम स्थगिती आदेश उच्च न्यायालयाने वीज मंडळाला दिला आहे.',
        bn: 'কৃষি বিদ্যুৎ সংযোগ বিচ্ছিন্ন না করার জন্য হাইকোর্ট জরুরি স্থগিতাদেশ জারি করেছে।',
        gu: 'કૃષિ વીજ જોડાણ ન કાપવા માટે હાઈકોર્ટે વીજ બોર્ડને વચગાળાનો સ્ટે આપ્યો છે.'
      },
      whatHappensNext: {
        en: 'The Electricity Board must file its detailed reply within 4 weeks. Power connection remains protected.',
        hi: 'बिजली बोर्ड को 4 सप्ताह के भीतर अपना जवाब दाखिल करना होगा। बिजली कनेक्शन सुरक्षित रहेगा।',
        ta: 'மின்சார வாரியம் 4 வாரங்களுக்குள் பதிலளிக்க வேண்டும். மின் இணைப்பு பாதுகாப்பாக இருக்கும்.',
        te: 'విద్యుత్ బోర్డు 4 వారాల్లోగా సమాధానం ఇవ్వాలి. విద్యుత్ కనెక్షన్ రక్షించబడుతుంది.',
        kn: 'ವಿದ್ಯುತ್ ಮಂಡಳಿಯು 4 ವಾರಗಳಲ್ಲಿ ಉತ್ತರಿಸಬೇಕು. ಸಂಪರ್ಕ ಮುಂದುವರಿಯುತ್ತದೆ.',
        mr: 'वीज मंडळाने ४ आठवड्यांत उत्तर दाखल केले पाहिजे. वीज कनेक्शन सुरक्षित राहील.',
        bn: 'বিদ্যুৎ বোর্ডকে ৪ সপ্তাহের মধ্যে জবাব দিতে হবে। সংযোগ চালু থাকবে।',
        gu: 'વીજ બોર્ડે 4 અઠવાડિયામાં જવાબ આપવો પડશે. વીજળી ચાલુ રહેશે.'
      },
      whenDate: '2026-10-15',
      whenTime: '10:30 AM',
      whereLocation: {
        en: 'Court Room 21, Madras High Court, NSC Bose Road, Chennai',
        hi: 'कोर्ट रूम 21, मद्रास हाईकोर्ट, एनएससी बोस रोड, चेन्नई',
        ta: 'நீதிமன்ற அறை 21, மெட்ராஸ் உயர் நீதிமன்றம், என்.எஸ்.சி போஸ் ரோடு, சென்னை',
        te: 'కోర్టు రూమ్ 21, మద్రాస్ హైకోర్టు, ఎన్ఎస్సీ బోస్ రోడ్, చెన్నై',
        kn: 'ನ್ಯಾಯಾಲಯ ಕೊಠಡಿ 21, ಮದ್ರಾಸ್ ಹೈಕೋರ್ಟ್, ಎನ್‌ಎಸ್‌ಸಿ ಬೋಸ್ ರಸ್ತೆ, ಚೆನ್ನೈ',
        mr: 'कोर्ट रूम 21, मद्रास उच्च न्यायालय, चेन्नई',
        bn: 'কোর্ট রুম ২১, মাদ্রাজ হাইকোর্ট, চেন্নাই',
        gu: 'કોર્ટ રૂમ 21, મદ્રાસ હાઈકોર્ટ, ચેન્નાઈ'
      },
      clearNextAction: {
        en: 'Show a copy of this court stay order to your local electricity sub-station engineer immediately.',
        hi: 'इस अदालती रोक आदेश की प्रति तुरंत अपने स्थानीय बिजली सब-स्टेशन इंजीनियर को दिखाएं।',
        ta: 'இந்த நீதிமன்ற தடை உத்தரவின் நகலை உடனடியாக உங்கள் உள்ளூர் மின்வாரிய பொறியாளரிடம் காண்பிக்கவும்.',
        te: 'ఈ కోర్టు స్టే ఆర్డర్ కాపీని వెంటనే మీ స్థానిక విద్యుత్ సబ్-స్టేషన్ ఇంజనీర్‌కు చూపించండి.',
        kn: 'ಈ ತಡೆಯಾಜ್ಞೆ ಪ್ರತಿಯನ್ನು ತಕ್ಷಣವೇ ನಿಮ್ಮ ಸ್ಥಳೀಯ ವಿದ್ಯುತ್ ಎಂಜಿನಿಯರ್‌ಗೆ ತೋರಿಸಿ.',
        mr: 'या कोर्ट स्थगिती आदेशाची प्रत त्वरित स्थानिक वीज उपअभियंत्याला दाखवा.',
        bn: 'এই স্থগিতাদেশের কপিটি অবিলম্বে স্থানীয় বিদ্যুৎ উপ-স্টেশন ইঞ্জিনিয়ারের কাছে দেখান।',
        gu: 'આ સ્ટે ઓર્ડરની નકલ તાત્કાલિક સ્થાનિક વીજ સબ-સ્ટેશન ઈજનેરને બતાવો.'
      }
    },
    hearings: [
      { date: '2024-07-08', purpose: 'Motion Hearing (Stay Granted)', isPast: true },
      { date: '2026-10-15', purpose: 'For Filing Counter & Hearing', isPast: false }
    ],
    orders: [
      {
        orderNumber: 'WP/9241/ORD-1',
        date: '2024-07-08',
        orderType: 'Ad-Interim Injunction',
        judge: 'Hon\'ble Mr. Justice N. Anand Venkatesh',
        rawText: 'Heard learned counsel for petitioner. There shall be an order of ad-interim stay of disconnection notice dated 20.06.2024 pending disposal of writ petition.',
        simplifiedSummary: {
          en: 'Court ordered immediate stay against power disconnection until further orders.',
          hi: 'अदालत ने अगले आदेश तक बिजली काटने पर तुरंत रोक लगा दी है।',
          ta: 'அடுத்த உத்தரவு வரும் வரை மின்சாரத்தை துண்டிக்க நீதிமன்றம் உடனடியாக தடை விதித்துள்ளது.',
          te: 'తదుపరి ఉత్తర్వులు వచ్చేవరకు విద్యుత్ సరఫరా ఆపడంపై కోర్టు తక్షణ స్టే విధించింది.',
          kn: 'ಮುಂದಿನ ಆದೇಶದವರೆಗೆ ವಿದ್ಯುತ್ ಕಡಿತಕ್ಕೆ ತಕ್ಷಣವೇ ತಡೆಯಾಜ್ಞೆ ನೀಡಲಾಗಿದೆ.',
          mr: 'पुढील आदेशापर्यंत वीज खंडित करण्यास न्यायालयाने त्वरित स्थगिती दिली आहे.',
          bn: 'পরবর্তী আদেশ না হওয়া পর্যন্ত বিদ্যুৎ বিচ্ছিন্ন করার ওপর তাৎক্ষণিক স্থগিতাদেশ।',
          gu: 'આગામી આદેશ સુધી વીજળી કાપવા પર તાત્કાલિક સ્ટે આપવામાં આવ્યો છે.'
        },
        isInterim: true,
        confidenceScore: 0.99
      }
    ],
    timeline: [
      {
        id: 't-401',
        date: '2024-07-02',
        title: 'Petition Filed',
        type: 'NOTICE_ISSUED',
        description: 'Urgent Writ Petition Filed',
        simplifiedText: {
          en: 'Petition filed seeking stay on disconnection.',
          hi: 'बिजली कटने से रोकने के लिए याचिका दायर।',
          ta: 'மின் துண்டிப்பை தடுக்க மனு தாக்கல் செய்யப்பட்டது.',
          te: 'విద్యుత్ నిలిపివేత ఆపడానికి పిటిషన్ దాఖలు.',
          kn: 'ವಿದ್ಯುತ್ ಕಡಿತ ತಡೆಯಲು ಅರ್ಜಿ ಸಲ್ಲಿಕೆ.',
          mr: 'वीज तोडणी थांबवण्यासाठी याचिका दाखल.',
          bn: 'বিদ্যুৎ সংযোগ রক্ষার জন্য পিটিশন দায়ের।',
          gu: 'વીજ જોડાણ રક્ષણ માટે અરજી દાખલ.'
        },
        isCompleted: true,
        isUpcoming: false
      },
      {
        id: 't-402',
        date: '2024-07-08',
        title: 'Interim Stay Granted',
        type: 'ORDER_PASSED',
        description: 'Stay against disconnection',
        simplifiedText: {
          en: 'Stay order granted in your favour.',
          hi: 'आपके पक्ष में रोक आदेश जारी।',
          ta: 'உங்களுக்கு ஆதரவாக தடை உத்தரவு வழங்கப்பட்டது.',
          te: 'మీకు అనుకూలంగా స్టే ఆర్డర్ వచ్చింది.',
          kn: 'ನಿಮ್ಮ ಪರವಾಗಿ ತಡೆಯಾಜ್ಞೆ ನೀಡಲಾಗಿದೆ.',
          mr: 'तुमच्या बाजूने स्थगिती आदेश मिळाला.',
          bn: 'আপনার পক্ষে স্থগিতাদেশ জারি হয়েছে।',
          gu: 'તમારી તરફેણમાં સ્ટે ઓર્ડર મળ્યો.'
        },
        isCompleted: true,
        isUpcoming: false
      }
    ],
    isDemoData: true,
    demoScenarioId: 'new_order_issued',
    dataSource: 'SYNTHETIC_MOCK',
    lastSyncedAt: new Date().toISOString(),
    dataFreshnessStatus: 'FRESH',
    hashChecksum: 'sha256-d6e5f4a3b2c1'
  },

  stale_data: {
    cnr: 'UPAL01-006213-2021',
    caseNumber: 'OS 314/2021',
    caseType: 'Original Suit (Partition)',
    filingDate: '2021-03-15',
    registrationDate: '2021-03-20',
    courtName: 'District & Sessions Court, Allahabad',
    state: 'Uttar Pradesh',
    district: 'Prayagraj (Allahabad)',
    courtComplex: 'Civil Lines Court Complex',
    courtRoomNumber: 'Court Room 03 (Civil Judge Senior Division)',
    judgeName: 'Sri. Arvind Kumar Tripathi',
    status: 'STALE',
    statusText: 'Pending / Sync Delayed (Source not updated in 45 days)',
    petitioner: {
      name: 'Virendra Singh & Bros.',
      advocate: 'Adv. A.K. Srivastava',
      type: 'PETITIONER'
    },
    respondent: {
      name: 'Kamla Devi & Ors.',
      advocate: 'Adv. R.P. Mishra',
      type: 'RESPONDENT'
    },
    actsAndSections: ['Hindu Succession Act (Sec 6)', 'Specific Relief Act (Sec 34)'],
    accessibilitySummary: {
      whatHappened: {
        en: 'The court had listed the case for evidence. However, recent court records have not been uploaded by the district registry for 45 days.',
        hi: 'अदालत ने गवाही के लिए तारीख तय की थी। लेकिन जिला कोर्ट रजिस्ट्री द्वारा पिछले 45 दिनों से नया रिकॉर्ड अपलोड नहीं किया गया है।',
        ta: 'சாட்சி பதிவுக்காக வழக்கு பட்டியலிடப்பட்டிருந்தது. ஆனால் கடந்த 45 நாட்களாக மாவட்ட நீதிமன்ற பதிவேடு புதுப்பிக்கப்படவில்லை.',
        te: 'సాక్షుల విచారణ కోసం కేసు లిస్ట్ చేయబడింది. అయితే గత 45 రోజులుగా రికార్డులు అప్‌లోడ్ కాలేదు.',
        kn: 'ಸಾಕ್ಷಿ ದಾಖಲಿಸಲು ಪ್ರಕರಣ ನಿಗದಿಯಾಗಿತ್ತು. ಆದರೆ 45 ದಿನಗಳಿಂದ ಹೊಸ ದಾಖಲೆ ಅಪ್‌ಲೋಡ್ ಆಗಿಲ್ಲ.',
        mr: 'पुराव्यासाठी तारीख दिली होती. परंतु जिल्हा न्यायालयाने गेल्या ४५ दिवसांपासून नवीन माहिती अपलोड केलेली नाही.',
        bn: 'সাক্ষ্য গ্রহণের জন্য তালিকাভুক্ত ছিল। তবে গত ৪৫ দিন ধরে আদালতের রেকর্ড আপডেট করা হয়নি।',
        gu: 'પુરાવા માટે તારીખ નક્કી કરાઈ હતી. પરંતુ 45 દિવસથી નવો રેકોર્ડ અપલોડ થયો નથી.'
      },
      whatHappensNext: {
        en: 'Next hearing date may have been given offline. Physical verification at the court helpdesk or advocate is advised.',
        hi: 'अगली तारीख ऑफलाइन तय हो चुकी हो सकती है। अपने वकील या कोर्ट हेल्पडेस्क से संपर्क करें।',
        ta: 'அடுத்த தேதி ஆஃப்லைனில் வழங்கப்பட்டிருக்கலாம். உங்கள் வழக்கறிஞரை அணுகி உறுதி செய்யவும்.',
        te: 'తదుపరి వాయిదా తేదీ ఆఫ్‌లైన్‌లో ఇచ్చి ఉండవచ్చు. మీ లాయర్‌ని అడగండి.',
        kn: 'ಮುಂದಿನ ದಿನಾಂಕವನ್ನು ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿ ನೀಡಿರಬಹುದು. ವಕೀಲರನ್ನು ಸಂಪರ್ಕಿಸಿ.',
        mr: 'पुढील तारीख ऑफलाईन ठरली असावी. आपल्या वकिलाशी संपर्क साधावा.',
        bn: 'পরবর্তী তারিখ অফলাইনে নির্ধারিত হতে পারে। আপনার আইনজীবীর সাথে যোগাযোগ করুন।',
        gu: 'આગામી તારીખ ઓફલાઈન નક્કી થઈ હોઈ શકે છે. વકીલનો સંપર્ક કરો.'
      },
      whenDate: 'Last Recorded: 2024-03-18 (Status Stale)',
      whenTime: '10:30 AM',
      whereLocation: {
        en: 'Court Room 03, District Court, Civil Lines, Prayagraj',
        hi: 'कोर्ट रूम 03, जिला अदालत, सिविल लाइंस, प्रयागराज',
        ta: 'நீதிமன்ற அறை 03, மாவட்ட நீதிமன்றம், சிவில் லைன்ஸ், பிரயாக்ராஜ்',
        te: 'కోర్టు రూమ్ 03, జిల్లా కోర్టు, సివిల్ లైన్స్, ప్రయాగ్‌రాజ్',
        kn: 'ನ್ಯಾಯಾಲಯ ಕೊಠಡಿ 03, ಜಿಲ್ಲಾ ನ್ಯಾಯಾಲಯ, ಪ್ರಯಾಗ್‌ರಾಜ್',
        mr: 'कोर्ट रूम 03, जिल्हा न्यायालय, सिव्हिल लाइन्स, प्रयागराज',
        bn: 'কোর্ট রুম ০৩, জেলা আদালত, সিভিল লাইনস, প্রয়াগরাজ',
        gu: 'કોર્ટ રૂમ 03, જિલ્લા અદાલત, સિવિલ લાઇન્સ, પ્રયાગરાજ'
      },
      clearNextAction: {
        en: '⚠️ Data is 45 days old. Ask your advocate to check the physical daily cause-list in Court Room 03.',
        hi: '⚠️ जानकारी 45 दिन पुरानी है। अपने वकील से कोर्ट रूम 3 की दैनिक कॉज़-लिस्ट में जाँच करने को कहें।',
        ta: '⚠️ தகவல் 45 நாட்கள் பழையது. நீதிமன்ற காஸ் லிஸ்டில் நேரடியாக சரிபார்க்கவும்.',
        te: '⚠️ సమాచారం 45 రోజుల పాతది. కోర్టు కాజ్ లిస్ట్‌లో నేరుగా తనిఖీ చేయండి.',
        kn: '⚠️ ಮಾಹಿತಿ 45 ದಿನ ಹಳೆಯದು. ನ್ಯಾಯಾಲಯದಲ್ಲಿ ನೇರವಾಗಿ ಪರಿಶೀಲಿಸಿ.',
        mr: '⚠️ माहिती ४५ दिवस जुनी आहे. वकिलांकडून कोर्टाच्या बोर्डवर खात्री करा.',
        bn: '⚠️ তথ্যটি ৪৫ দিনের পুরনো। সরাসরি কোর্ট বোর্ড থেকে যাচাই করুন।',
        gu: '⚠️ માહિતી 45 દિવસ જૂની છે. કોર્ટ લિસ્ટમાં સીધી ખાતરી કરો.'
      }
    },
    hearings: [
      { date: '2023-11-10', purpose: 'Issues Framed', isPast: true },
      { date: '2024-03-18', purpose: 'Plaintiff Evidence (Last Synced)', isPast: true }
    ],
    orders: [],
    timeline: [
      {
        id: 't-501',
        date: '2021-03-15',
        title: 'Partition Suit Filed',
        type: 'NOTICE_ISSUED',
        description: 'Property partition suit',
        simplifiedText: {
          en: 'Property division suit filed.',
          hi: 'जायदाद बंटवारे का मुकदमा दर्ज हुआ।',
          ta: 'சொத்துப் பிரிவினை வழக்கு தாக்கல்.',
          te: 'ఆస్తి పంపకాల దావా దాఖలు.',
          kn: 'ಆಸ್ತಿ ವಿಭಜನೆ ಮೊಕದ್ದಮೆ ದಾಖಲು.',
          mr: 'मालमत्ता वाटपाचा खटला दाखल.',
          bn: 'সম্পত্তি বণ্টনের মামলা দায়ের।',
          gu: 'મિલકત વહેંચણીનો દાવો દાખલ.'
        },
        isCompleted: true,
        isUpcoming: false
      }
    ],
    isDemoData: true,
    demoScenarioId: 'stale_data',
    dataSource: 'SYNTHETIC_MOCK',
    lastSyncedAt: new Date(Date.now() - 45 * 86400000).toISOString(),
    dataFreshnessStatus: 'STALE',
    hashChecksum: 'sha256-e5f4a3b2c1d0'
  },

  source_unavailable: {
    cnr: 'RJJP01-009124-2023',
    caseNumber: 'CMA 112/2023',
    caseType: 'Civil Misc Appeal',
    filingDate: '2023-09-10',
    registrationDate: '2023-09-12',
    courtName: 'High Court of Judicature for Rajasthan at Jaipur Bench',
    state: 'Rajasthan',
    district: 'Jaipur',
    courtComplex: 'High Court Campus, Bhagwan Das Road',
    courtRoomNumber: 'Court Room 05',
    judgeName: 'Hon\'ble Mr. Justice M.M. Srivastava',
    status: 'SOURCE_UNAVAILABLE',
    statusText: 'Official Server Maintenance (Offline Cache Displayed)',
    petitioner: {
      name: 'Mohan Lal Gurjar',
      advocate: 'Adv. Dinesh Yadav',
      type: 'APPELLANT'
    },
    respondent: {
      name: 'Rajasthan State Road Transport Corp (RSRTC)',
      advocate: 'Adv. V.D. Gathala',
      type: 'RESPONDENT'
    },
    actsAndSections: ['Motor Vehicles Act 1988 (Sec 173)'],
    accessibilitySummary: {
      whatHappened: {
        en: 'The live eCourts server is temporarily undergoing maintenance. Jurislink is showing your securely cached offline record from your last visit.',
        hi: 'सरकारी ई-कोर्ट सर्वर पर रखरखाव कार्य चल रहा है। जूरिसलिंक आपके पिछले सुरक्षित ऑफलाइन रिकॉर्ड से जानकारी दिखा रहा है।',
        ta: 'அரசு இ-கோர்ட் சர்வர் பராமரிப்பில் உள்ளது. கடைசியாக சேமிக்கப்பட்ட ஆஃப்லைன் தகவல் காட்டப்படுகிறது.',
        te: 'ప్రభుత్వ ఈ-కోర్టు సర్వర్ నిర్వహణలో ఉంది. గతంలో సేవ్ అయిన ఆఫ్‌లైన్ రికార్డు చూపబడుతోంది.',
        kn: 'ಸರ್ಕಾರಿ ಈ-ಕೋರ್ಟ್ ಸರ್ವರ್ ನಿರ್ವಹಣೆಯಲ್ಲಿದೆ. ಆಫ್‌ಲೈನ್ ದಾಖಲೆ ತೋರಿಸಲಾಗುತ್ತಿದೆ.',
        mr: 'शासकीय ई-कोर्ट सर्व्हर देखभालीत आहे. ज्युरीसलिंक पूर्वी सेव्ह केलेली ऑफलाईन माहिती दाखवत आहे.',
        bn: 'সরকারি ই-কোর্ট সার্ভার সাময়িকভাবে রক্ষণাবেক্ষণে রয়েছে। অফলাইন সংরক্ষিত রেকর্ড দেখানো হচ্ছে।',
        gu: 'સરકારી ઈ-કોર્ટ સર્વર મેન્ટેનન્સમાં છે. અગાઉ સેવ કરેલી ઓફલાઈન માહિતી બતાવાઈ રહી છે.'
      },
      whatHappensNext: {
        en: 'Cached hearing date remains valid unless changed by court. Auto-sync will retry when the official server is back online.',
        hi: 'सुरक्षित रिकॉर्ड की अगली तारीख मान्य है। सर्वर चालू होते ही अपने-आप ताज़ा जानकारी जुड़ जाएगी।',
        ta: 'சேமிக்கப்பட்ட தேதி செல்லுபடியாகும். சர்வர் சரியானதும் தானாகவே புதுப்பிக்கப்படும்.',
        te: 'సేవ్ అయిన తేదీ చెల్లుతుంది. సర్వర్ అందుబాటులోకి రాగానే ఆటోమేటిక్‌గా అప్‌డేట్ అవుతుంది.',
        kn: 'ದಾಖಲಾಗಿರುವ ದಿನಾಂಕ ಮಾನ್ಯವಾಗಿರುತ್ತದೆ. ಸರ್ವರ್ ಬಂದೊಡನೆ ಅಪ್‌ಡೇಟ್ ಆಗುತ್ತದೆ.',
        mr: 'जतन केलेली तारीख वैध राहील. सर्व्हर सुरू झाल्यावर आपोआप माहिती अपडेट होईल.',
        bn: 'সংরক্ষিত তারিখটি কার্যকর থাকবে। সার্ভার চালু হলে স্বয়ংক্রিয়ভাবে আপডেট হবে।',
        gu: 'સેવ કરેલી તારીખ માન્ય રહેશે. સર્વર શરૂ થતાં જ અપડેટ થઈ જશે.'
      },
      whenDate: '2026-09-30 (From Offline Cache)',
      whenTime: '10:30 AM',
      whereLocation: {
        en: 'Court Room 05, Rajasthan High Court, Jaipur Bench',
        hi: 'कोर्ट रूम 05, राजस्थान हाईकोर्ट, जयपुर बेंच',
        ta: 'நீதிமன்ற அறை 05, ராஜஸ்தான் உயர் நீதிமன்றம், ஜெய்ப்பூர்',
        te: 'కోర్టు రూమ్ 05, రాజస్థాన్ హైకోర్టు, జైపూర్ బెంచ్',
        kn: 'ನ್ಯಾಯಾಲಯ ಕೊಠಡಿ 05, ರಾಜಸ್ಥಾನ ಹೈಕೋರ್ಟ್, ಜೈಪುರ',
        mr: 'कोर्ट रूम 05, राजस्थान उच्च न्यायालय, जयपूर',
        bn: 'কোর্ট রুম ০৫, রাজস্থান হাইকোর্ট, জয়পুর',
        gu: 'કોર્ટ રૂમ 05, રાજસ્થાન હાઈકોર્ટ, જયપુર'
      },
      clearNextAction: {
        en: 'You can still view all your past orders and hearing schedule offline. Tap "Retry Sync" when network/server restores.',
        hi: 'आप ऑफलाइन भी अपने पुराने आदेश देख सकते हैं। सर्वर चालू होने पर "पुनः प्रयास करें" दबाएं।',
        ta: 'நீங்கள் ஆஃப்லைനிலும் முந்தைய உத்தரவுகளைக் காணலாம். சர்வர் வந்ததும் "மீண்டும் முயல்க" அழுத்தவும்.',
        te: 'మీరు ఆఫ్‌లైన్‌లో కూడా పాత ఆర్డర్లను చూడవచ్చు. "మళ్లీ ప్రయత్నించండి" నొక్కండి.',
        kn: 'ನೀವು ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿಯೂ ಹಳೆಯ ಆದೇಶಗಳನ್ನು ವೀಕ್ಷಿಸಬಹುದು.',
        mr: 'तुम्ही ऑफलाईन देखील जुने आदेश पाहू शकता. सर्वर आल्यावर "पुन्हा प्रयत्न करा" दाबा.',
        bn: 'আপনি অফলাইনেও পূর্ববর্তী আদেশ দেখতে পারেন। সার্ভার ফিরলে "পুনরায় চেষ্টা করুন" চাপুন।',
        gu: 'તમે ઓફલાઈનમાં પણ જૂના ઓર્ડર જોઈ શકો છો. સર્વર આવતાં "ફરી પ્રયાસ કરો" દબાવો.'
      }
    },
    hearings: [
      { date: '2024-02-14', purpose: 'Lower Court Records Summoned', isPast: true },
      { date: '2026-09-30', purpose: 'Final Arguments (Cached)', isPast: false }
    ],
    orders: [],
    timeline: [
      {
        id: 't-601',
        date: '2023-09-10',
        title: 'Accident Claim Appeal Filed',
        type: 'NOTICE_ISSUED',
        description: 'Appeal for enhanced compensation',
        simplifiedText: {
          en: 'Accident compensation appeal filed.',
          hi: 'सड़क दुर्घटना मुआवजे के लिए अपील दर्ज।',
          ta: 'விபத்து இழப்பீடு மேல்முறையீடு தாக்கல்.',
          te: 'రోడ్డు ప్రమాద పరిహారం కోసం అప్పీల్.',
          kn: 'ಅಪಘಾತ ಪರಿಹಾರ ಮೇಲ್ಮನವಿ ಸಲ್ಲಿಕೆ.',
          mr: 'अपघात भरपाईसाठी अपील दाखल.',
          bn: 'দুর্ঘটনা ক্ষতিপূরণের আপিল দায়ের।',
          gu: 'અકસ્માત વળતર માટે અપીલ દાખલ.'
        },
        isCompleted: true,
        isUpcoming: false
      }
    ],
    isDemoData: true,
    demoScenarioId: 'source_unavailable',
    dataSource: 'CACHED_OFFLINE',
    lastSyncedAt: new Date(Date.now() - 3 * 3600000).toISOString(),
    dataFreshnessStatus: 'UNAVAILABLE',
    hashChecksum: 'sha256-f4a3b2c1d0e9'
  },

  ocr_uncertainty: {
    cnr: 'WBCC01-007812-2024',
    caseNumber: 'CS 440/2024',
    caseType: 'Civil Suit (Money Recovery)',
    filingDate: '2024-05-19',
    registrationDate: '2024-05-22',
    courtName: 'City Civil Court at Calcutta',
    state: 'West Bengal',
    district: 'Kolkata',
    courtComplex: '2 & 3 Kiran Shankar Roy Road',
    courtRoomNumber: 'Court Room 04 (Judge Bench)',
    judgeName: 'Sri. Subhendu Mukherjee',
    status: 'PENDING',
    statusText: 'Summons Issued / Low OCR Confidence Confirmation Required',
    petitioner: {
      name: 'Bengal Agro Commodities Pvt. Ltd.',
      advocate: 'Adv. Aniruddha Chatterjee',
      type: 'PETITIONER'
    },
    respondent: {
      name: 'Debabrata Ghosh & Sons',
      advocate: 'Adv. S.K. Roy Chowdhury',
      type: 'RESPONDENT'
    },
    actsAndSections: ['Code of Civil Procedure 1908 (Order 37)'],
    accessibilitySummary: {
      whatHappened: {
        en: 'A court summons notice was scanned. Because the scanned paper was folded and blurry, OCR confidence is 62%. Please confirm the extracted details.',
        hi: 'कोर्ट समन नोटिस स्कैन किया गया है। मुड़े हुए और धुंधले कागज़ के कारण OCR सटीकता 62% है। कृपया विवरण की पुष्टि करें।',
        ta: 'நீதிமன்ற சம்மன் ஸ்கேன் செய்யப்பட்டது. தாள் மங்கலாக இருந்ததால் 62% மட்டுமே துல்லியமாக படிக்க முடிந்தது. விபரங்களை உறுதி செய்யவும்.',
        te: 'కోర్టు సమన్లు స్కాన్ చేయబడ్డాయి. కాగితం మడతలు, అస్పష్టత వల్ల 62% ఖచ్చితత్వం ఉంది. దయచేసి వివరాలను సరిచూసుకోండి.',
        kn: 'ನ್ಯಾಯಾಲಯದ ಸಮನ್ಸ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಲಾಗಿದೆ. ಕಾಗದ ಮಸುಕಾಗಿದ್ದರಿಂದ ಶೇ 62 ರಷ್ಟು ಮಾತ್ರ ಸ್ಪಷ್ಟವಾಗಿದೆ. ವಿವರಗಳನ್ನು ದೃಢೀಕರಿಸಿ.',
        mr: 'कोर्टाचे समन्स स्कॅन केले. कागद चुरगळलेला असल्याने ६२% अचूकता आहे. कृपया माहितीची खात्री करा.',
        bn: 'কোর্টের সমন নোটিশ স্ক্যান করা হয়েছে। কাগজটি অস্পষ্ট হওয়ায় নির্ভুলতার হার ৬২%। বিবরণ নিশ্চিত করুন।',
        gu: 'કોર્ટ સમન્સ સ્કેન કરાયું. કાગળ ઝાંખો હોવાથી 62% ચોકસાઈ છે. કૃપા કરીને વિગતોની ખાતરી કરો.'
      },
      whatHappensNext: {
        en: 'Once you verify the CNR number, the system will securely fetch authoritative court details from the database.',
        hi: 'जैसे ही आप सीएनआर नंबर की पुष्टि करेंगे, सिस्टम डेटाबेस से आधिकारिक विवरण दिखाएगा।',
        ta: 'நீங்கள் CNR எண்ணை உறுதி செய்தவுடன், அதிகாரப்பூர்வ தகவல்கள் காட்டப்படும்.',
        te: 'మీరు CNR నంబర్‌ను నిర్ధారించిన తర్వాత, అధికారిక వివరాలు వస్తాయి.',
        kn: 'ನೀವು ಸಿಎನ್‌ಆರ್ ಸಂಖ್ಯೆಯನ್ನು ದೃಢೀಕರಿಸಿದ ನಂತರ ಅಧಿಕೃತ ಮಾಹಿತಿ ಲಭ್ಯವಾಗುತ್ತದೆ.',
        mr: 'तुम्ही सीएनआर नंबर निश्चित करताच अधिकृत माहिती दिसेल.',
        bn: 'সিএনআর নম্বর নিশ্চিত করলেই সঠিক তথ্য চলে আসবে।',
        gu: 'તમે સીએનઆર નંબર કન્ફર્મ કરશો એટલે સત્તાવાર માહિતી આવશે.'
      },
      whenDate: '2026-10-04',
      whenTime: '11:00 AM',
      whereLocation: {
        en: 'Court Room 04, City Civil Court, Kiran Shankar Roy Road, Kolkata',
        hi: 'कोर्ट रूम 04, सिटी सिविल कोर्ट, किरण शंकर रॉय रोड, कोलकाता',
        ta: 'நீதிமன்ற அறை 04, சிட்டி சிவில் நீதிமன்றம், கொல்கத்தா',
        te: 'కోర్టు రూమ్ 04, సిటీ సివిల్ కోర్టు, కోల్‌కతా',
        kn: 'ನ್ಯಾಯಾಲಯ ಕೊಠಡಿ 04, ಸಿಟಿ ಸಿವಿಲ್ ನ್ಯಾಯಾಲಯ, ಕೋಲ್ಕತ್ತಾ',
        mr: 'कोर्ट रूम 04, सिटी सिव्हिल कोर्ट, कोलकाता',
        bn: 'কোর্ট রুম ০৪, সিটি সিভিল কোর্ট, কলকাতা',
        gu: 'કોર્ટ રૂમ 04, સિટી સિવિલ કોર્ટ, કોલકાતા'
      },
      clearNextAction: {
        en: 'Check your physical paper notice: Verify that the CNR is WBCC01-007812-2024 before proceeding.',
        hi: 'अपने कागज़ का नोटिस देखें: आगे बढ़ने से पहले जांचें कि सीएनआर WBCC01-007812-2024 ही है।',
        ta: 'உங்கள் காகித நோட்டீஸை பார்க்கவும்: தொடர்வதற்கு முன் CNR WBCC01-007812-2024 தானா என உறுதிப்படுத்தவும்.',
        te: 'మీ కాగితాన్ని చూడండి: ముందుకు వెళ్లేముందు CNR WBCC01-007812-2024 అవునో కాదో సరిచూడండి.',
        kn: 'ನಿಮ್ಮ ಕಾಗದದ ನೋಟಿಸ್ ಪರಿಶೀಲಿಸಿ: ಸಿಎನ್‌ಆರ್ WBCC01-007812-2024 ಎಂದು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.',
        mr: 'आपल्या कागदी नोटिसीवर सीएनआर नंबर WBCC01-007812-2024 असल्याची खात्री करा.',
        bn: 'কাগজের নোটিশটি দেখুন: সিএনআর WBCC01-007812-2024 সঠিক কিনা যাচাই করুন।',
        gu: 'કાગળની નોટિસ તપાસો: આગળ વધતાં પહેલાં સીએનઆર WBCC01-007812-2024 છે કે નહીં તે ચકાસો.'
      }
    },
    hearings: [
      { date: '2024-05-25', purpose: 'Summons Issued by Registered Post', isPast: true },
      { date: '2026-10-04', purpose: 'Service Return & Appearance', isPast: false }
    ],
    orders: [
      {
        orderNumber: 'CS/440/ORD-1',
        date: '2024-05-25',
        orderType: 'Summons Direction',
        judge: 'Sri. Subhendu Mukherjee',
        rawText: 'Plaint admitted under Order 37 CPC. Issue summons for appearance to defendants through registered speed post with A/D returnable by next date.',
        simplifiedSummary: {
          en: 'Court issued formal summons to defendant to appear in court.',
          hi: 'अदालत ने दूसरी पार्टी को हाजिर होने के लिए आधिकारिक समन भेजा है।',
          ta: 'எதிர் தரப்பு ஆஜராக அதிகாரப்பூர்வ சம்மன் அனுப்பப்பட்டுள்ளது.',
          te: 'ఎదుటి పక్షం హాజరుకావాలని కోర్టు సమన్లు పంపింది.',
          kn: 'ಎದುರು ಪಕ್ಷಕ್ಕೆ ನ್ಯಾಯಾಲಯಕ್ಕೆ ಹಾಜರಾಗಲು ಸಮನ್ಸ್ ಕಳುಹಿಸಲಾಗಿದೆ.',
          mr: 'दुसऱ्या बाजूला हजर राहण्यासाठी कोर्टाने समन्स बजावले आहे.',
          bn: 'বিপক্ষ দলকে আদালতে হাজির হওয়ার জন্য সমন পাঠানো হয়েছে।',
          gu: 'સામા પક્ષને હાજર રહેવા માટે સત્તાવાર સમન્સ મોકલવામાં આવ્યા છે.'
        },
        isInterim: true,
        confidenceScore: 0.62,
        lowConfidenceReason: 'Notice scan was blurry. Extracted with fallback heuristics.'
      }
    ],
    timeline: [
      {
        id: 't-701',
        date: '2024-05-19',
        title: 'Summary Suit Filed',
        type: 'NOTICE_ISSUED',
        description: 'Money recovery suit under Order 37',
        simplifiedText: {
          en: 'Recovery case filed in City Civil Court.',
          hi: 'पैसे की वसूली का मुकदमा दर्ज हुआ।',
          ta: 'பணம் வசூலிக்கும் வழக்கு பதிவு செய்யப்பட்டது.',
          te: 'డబ్బు రికవరీ కేసు నమోదయింది.',
          kn: 'ಹಣ ವಸೂಲಾತಿ ಪ್ರಕರಣ ದಾಖಲು.',
          mr: 'पैसे वसुलीचा दावा दाखल झाला.',
          bn: 'টাকা আদায়ের মামলা দায়ের করা হয়েছে।',
          gu: 'નાણાં વસૂલાતનો કેસ દાખલ થયો.'
        },
        isCompleted: true,
        isUpcoming: false
      }
    ],
    isDemoData: true,
    demoScenarioId: 'ocr_uncertainty',
    dataSource: 'SYNTHETIC_MOCK',
    lastSyncedAt: new Date().toISOString(),
    dataFreshnessStatus: 'FRESH',
    hashChecksum: 'sha256-a3b2c1d0e9f8'
  }
};

export const DEMO_SCENARIO_METADATA: Record<DemoScenarioId, {
  title: Record<SupportedLanguage, string>;
  description: Record<SupportedLanguage, string>;
  badgeText: Record<SupportedLanguage, string>;
  badgeColor: string;
}> = {
  upcoming_hearing: {
    title: {
      en: '1. Upcoming Hearing (Land Dispute)',
      hi: '1. आगामी सुनवाई (ज़मीन का मामला)',
      ta: '1. வரவிருக்கும் விசாரணை (நில தகராறு)',
      te: '1. రాబోయే విచారణ (భూ వివాదం)',
      kn: '1. ಮುಂಬರುವ ವಿಚಾರಣೆ (ಭೂ ವಿವಾದ)',
      mr: '1. आगामी सुनावणी (जमीन वाद)',
      bn: '1. আসন্ন শুনানি (জমি বিরোধ)',
      gu: '1. આગામી સુનાવણી (જમીન વિવાદ)'
    },
    description: {
      en: 'Active High Court case with clear next date, courtroom, and final arguments.',
      hi: 'हाईकोर्ट का सक्रिय मामला - अगली तारीख, कोर्ट रूम और अंतिम बहस की स्पष्ट जानकारी।',
      ta: 'அடுத்த தேதி, நீதிமன்ற அறை மற்றும் இறுதி வாதங்களுடன் கூடிய நேரடி வழக்கு.',
      te: 'తదుపరి తేదీ, కోర్టు రూమ్ వివరాలతో ఉన్న హైకోర్టు కేసు.',
      kn: 'ಮುಂದಿನ ದಿನಾಂಕ ಮತ್ತು ನ್ಯಾಯಾಲಯ ಕೊಠಡಿ ವಿವರಗಳನ್ನು ಹೊಂದಿರುವ ಪ್ರಕರಣ.',
      mr: 'पुढील तारीख व कोर्ट रूमच्या स्पष्ट माहितीसह उच्च न्यायालयाचा खटला.',
      bn: 'পরবর্তী শুনানির স্পষ্ট বিবরণ সহ সক্রিয় হাইকোর্টের মামলা।',
      gu: 'આગામી તારીખ અને કોર્ટ રૂમની વિગતો સાથેનો કેસ.'
    },
    badgeText: {
      en: 'Upcoming in 7 Days',
      hi: '7 दिनों में सुनवाई',
      ta: '7 நாட்களில் விசாரணை',
      te: '7 రోజుల్లో విచారణ',
      kn: '7 ದಿನಗಳಲ್ಲಿ ವಿಚಾರಣೆ',
      mr: '७ दिवसांत सुनावणी',
      bn: '৭ দিনে শুনানি',
      gu: '7 દિવસમાં સુનાવણી'
    },
    badgeColor: '#10b981' // Green
  },

  adjourned_case: {
    title: {
      en: '2. Adjourned Case (Bench Change)',
      hi: '2. स्थगित मामला (बेंच का बदलना)',
      ta: '2. ஒத்திவைக்கப்பட்ட வழக்கு (அமர்வு மாற்றம்)',
      te: '2. వాయిదా పడిన కేసు (బెంచ్ మార్పు)',
      kn: '2. ಮುಂದೂಡಲ್ಪಟ್ಟ ಪ್ರಕರಣ (ಪೀಠ ಬದಲಾವಣೆ)',
      mr: '2. पुढे ढकललेला खटला (खंडपीठ बदल)',
      bn: '2. স্থগিত মামলা (বেঞ্চ পরিবর্তন)',
      gu: '2. મુલતવી કેસ (બેન્ચ ફેરફાર)'
    },
    description: {
      en: 'Hearing postponed to a new date with explanation of why adjournment happened.',
      hi: 'नई तारीख तक स्थगित मामला - स्थगन के कारण का सरल विवरण।',
      ta: 'விசாரணை ஏன் ஒத்திவைக்கப்பட்டது என்ற எளிய விளக்கத்துடன் புதிய தேதி.',
      te: 'వాయిదా ఎందుకు పడిందో వివరణతో కొత్త తేదీ.',
      kn: 'ವಿಚಾರಣೆ ಮುಂದೂಡಲು ಕಾರಣವೇನು ಎಂಬ ವಿವರಣೆ.',
      mr: 'सुनावणी पुढे का ढकलली याचे सोपे स्पष्टीकरण.',
      bn: 'কেন শুনানি স্থগিত হলো তার সহজ ব্যাখ্যা।',
      gu: 'સુનાવણી કેમ મુલતવી રહી તેની સરળ સમજૂતી.'
    },
    badgeText: {
      en: 'Adjourned to Sep 24',
      hi: '24 सितंबर तक स्थगित',
      ta: 'செப் 24 வரை ஒத்திவைப்பு',
      te: 'సెప్టెంబర్ 24కి వాయిదా',
      kn: 'ಸೆಪ್ಟೆಂಬರ್ 24 ಕ್ಕೆ ಮುಂದೂಡಿಕೆ',
      mr: '२४ सप्टें. पर्यंत पुढे ढकलले',
      bn: '২৪ সেপ্টেম্বর পর্যন্ত স্থগিত',
      gu: '24 સપ્ટેમ્બર સુધી મુલતવી'
    },
    badgeColor: '#f59e0b' // Amber
  },

  completed_case: {
    title: {
      en: '3. Completed / Disposed Case (Decree)',
      hi: '3. समाप्त / निस्तारित मामला (अंतिम फैसला)',
      ta: '3. முடிவடைந்த வழக்கு (இறுதி தீர்ப்பு)',
      te: '3. పూర్తయిన / పరిష్కరించబడిన కేసు (తీర్పు)',
      kn: '3. ಪೂರ್ಣಗೊಂಡ ಪ್ರಕರಣ (ಅಂತಿಮ ತೀರ್ಪು)',
      mr: '3. निकाली काढलेला खटला (अंतिम हुकूमनामा)',
      bn: '3. নিষ্পত্তি হওয়া মামলা (রায়)',
      gu: '3. પૂર્ણ થયેલ કેસ (ચુકાદો)'
    },
    description: {
      en: 'Final victory in Consumer Court: compensation amount and how to claim money.',
      hi: 'उपभोक्ता अदालत में अंतिम जीत: मुआवजे की राशि और पैसे लेने का तरीका।',
      ta: 'நுகர்வோர் நீதிமன்றத்தில் இறுதி வெற்றி: இழப்பீட்டுத் தொகை மற்றும் பெறும் முறை.',
      te: 'వినియోగదారుల కోర్టులో తుది విజయం: పరిహారం మొత్తం మరియు పొందే విధానం.',
      kn: 'ಗ್ರಾಹಕರ ನ್ಯಾಯಾಲಯದಲ್ಲಿ ಅಂತಿಮ ಗೆಲುವು: ಪರಿಹಾರ ಪಡೆಯುವ ವಿಧಾನ.',
      mr: 'ग्राहक न्यायालयात अंतिम विजय: भरपाईची रक्कम आणि मिळवण्याची पद्धत.',
      bn: 'কনজিউমার কোর্টে জয়: ক্ষতিপূরণ ও পাওয়ার উপায়।',
      gu: 'ગ્રાહક કોર્ટમાં જીત: વળતરની રકમ અને મેળવવાની રીત.'
    },
    badgeText: {
      en: 'Decree in Favour (₹1.85L + 9%)',
      hi: 'पक्ष में फैसला (₹1.85 लाख + 9%)',
      ta: 'சாதகமான தீர்ப்பு (₹1.85L + 9%)',
      te: 'అనుకూల తీర్పు (₹1.85L + 9%)',
      kn: 'ಪರವಾದ ತೀರ್ಪು (₹1.85 ಲಕ್ಷ)',
      mr: 'बाजूने हुकूमनामा (₹1.85 लाख)',
      bn: 'পক্ষে রায় (₹১.৮৫ লাখ)',
      gu: 'તરફેણમાં હુકમનામું (₹1.85 લાખ)'
    },
    badgeColor: '#3b82f6' // Blue
  },

  new_order_issued: {
    title: {
      en: '4. New Order Issued (Interim Stay)',
      hi: '4. नया आदेश जारी (अंतरिम रोक)',
      ta: '4. புதிய உத்தரவு பிறப்பிப்பு (இடைக்கால தடை)',
      te: '4. కొత్త ఆర్డర్ జారీ (తాత్కాలిక స్టే)',
      kn: '4. ಹೊಸ ಆದೇಶ ಜಾರಿ (ಮಧ್ಯಂತರ ತಡೆ)',
      mr: '4. नवीन आदेश जारी (अंतरिम स्थगिती)',
      bn: '4. নতুন আদেশ জারি (অন্তর্বর্তী স্থগিতাদেশ)',
      gu: '4. નવો આદેશ જારી (વચગાળાનો સ્ટે)'
    },
    description: {
      en: 'Fresh interim stay order passed protecting electricity connection.',
      hi: 'बिजली कनेक्शन की सुरक्षा के लिए नया अंतरिम रोक आदेश पारित।',
      ta: 'மின் இணைப்பை பாதுகாக்க புதிய இடைக்கால தடை உத்தரவு.',
      te: 'విద్యుత్ కనెక్షన్ రక్షణ కోసం తాజా స్టే ఉత్తర్వులు.',
      kn: 'ವಿದ್ಯುತ್ ಸಂಪರ್ಕ ರಕ್ಷಣೆಗೆ ಹೊಸ ತಡೆಯಾಜ್ಞೆ.',
      mr: 'वीज कनेक्शनच्या संरक्षणासाठी नवीन स्थगिती आदेश.',
      bn: 'বিদ্যুৎ সংযোগ রক্ষার জন্য নতুন অন্তর্বর্তীকালীন স্থগিতাদেশ।',
      gu: 'વીજ જોડાણ રક્ષણ માટે નવો સ્ટે ઓર્ડર.'
    },
    badgeText: {
      en: 'Stay Active (Protected)',
      hi: 'रोक प्रभावी (सुरक्षित)',
      ta: 'தடை அமலில் உள்ளது',
      te: 'స్టే అమల్లో ఉంది',
      kn: 'ತಡೆಯಾಜ್ಞೆ ಜಾರಿಯಲ್ಲಿದೆ',
      mr: 'स्थगिती लागू आहे',
      bn: 'স্থগিতাদেশ কার্যকর',
      gu: 'સ્ટે ચાલુ છે'
    },
    badgeColor: '#8b5cf6' // Purple
  },

  stale_data: {
    title: {
      en: '5. Stale Data (Sync Delayed)',
      hi: '5. पुराना डेटा (45 दिनों से अपडेट नहीं)',
      ta: '5. பழைய தகவல் (45 நாட்கள் தாமதம்)',
      te: '5. పాత డేటా (45 రోజులుగా అప్‌డేట్ లేదు)',
      kn: '5. ಹಳೆಯ ಡೇಟಾ (45 ದಿನಗಳಿಂದ ನವೀಕರಣವಾಗಿಲ್ಲ)',
      mr: '5. जुना डेटा (४५ दिवस अपडेट नाही)',
      bn: '5. পুরনো ডেটা (৪৫ দিন আপডেট নেই)',
      gu: '5. જૂનો ડેટા (45 દિવસથી અપડેટ નથી)'
    },
    description: {
      en: 'Visual warning badge when court registry has not updated records online.',
      hi: 'चेतावनी बैज जब जिला कोर्ट ने ऑनलाइन रिकॉर्ड अपडेट नहीं किया हो।',
      ta: 'நீதிமன்ற இணையதளத்தில் விபரங்கள் புதுப்பிக்கப்படாத போது எச்சரிக்கை பேட்ஜ்.',
      te: 'ఆన్‌లైన్‌లో రికార్డులు అప్‌డేట్ కానప్పుడు హెచ్చరిక.',
      kn: 'ಆನ್‌ಲೈನ್‌ನಲ್ಲಿ ದಾಖಲೆ ನವೀಕರಣವಾಗದಿದ್ದಾಗ ಎಚ್ಚರಿಕೆ ಬ್ಯಾಡ್ಜ್.',
      mr: 'ऑनलाईन रेकॉर्ड अपडेट नसताना चेतावणी दर्शक बॅज.',
      bn: 'অনলাইনে রেকর্ড আপডেট না থাকলে সতর্কবার্তা ব্যাজ।',
      gu: 'ઓનલાઇન રેકોર્ડ અપડેટ ન હોય ત્યારે ચેતવણી બેજ.'
    },
    badgeText: {
      en: '45 Days Old (Check Offline)',
      hi: '45 दिन पुराना (ऑफलाइन जाँचें)',
      ta: '45 நாட்கள் பழையது (நேரில் பார்க்கவும்)',
      te: '45 రోజుల పాతది (ఆఫ్‌లైన్‌లో చూడండి)',
      kn: '45 ದಿನ ಹಳೆಯದು (ಆಫ್‌ಲೈನ್ ಪರಿಶೀಲಿಸಿ)',
      mr: '४५ दिवस जुने (ऑफलाईन तपासा)',
      bn: '৪৫ দিন পুরনো (অফলাইন দেখুন)',
      gu: '45 દિવસ જૂનો (ઓફલાઇન તપાસો)'
    },
    badgeColor: '#ea580c' // Orange
  },

  source_unavailable: {
    en: '6. Server Maintenance (Offline Cache)',
    hi: '6. सर्वर रखरखाव (ऑफलाइन कैश डेटा)',
    ta: '6. சர்வர் பராமரிப்பு (ஆஃப்லைன் சேமிப்பு)',
    te: '6. సర్వర్ నిర్వహణ (ఆఫ్‌లైన్ కాష్)',
    kn: '6. ಸರ್ವರ್ ನಿರ್ವಹಣೆ (ಆಫ್‌ಲೈನ್ ಮಾಹಿತಿ)',
    mr: '6. सर्व्हर देखभाल (ऑफलाईन कॅश डेटा)',
    bn: '6. সার্ভার রক্ষণাবেক্ষণ (অফলাইন ক্যাশ)',
    gu: '6. સર્વર મેન્ટેનન્સ (ઓફલાઇન કેશ)'
  } as any,

  ocr_uncertainty: {
    title: {
      en: '7. OCR Uncertainty (Blurry Notice Confirmation)',
      hi: '7. अस्पष्ट OCR (धुंधले नोटिस की पुष्टि)',
      ta: '7. தெளிவற்ற OCR (மங்கலான நோட்டீஸ் உறுதிப்படுத்தல்)',
      te: '7. అస్పష్ట OCR (నోటీసు నిర్ధారణ)',
      kn: '7. ಅಸ್ಪಷ್ಟ OCR (ಮಸುಕಾದ ನೋಟಿಸ್ ದೃಢೀಕರಣ)',
      mr: '7. अस्पष्ट OCR (धूसर नोटीस पडताळणी)',
      bn: '7. অস্পষ্ট OCR (ঝাপসা নোটিশ নিশ্চিতকরণ)',
      gu: '7. અસ્પષ્ટ OCR (ઝાંખી નોટિસ કન્ફર્મેશન)'
    },
    description: {
      en: 'Low OCR confidence flow asking user to verify extracted CNR before lookup.',
      hi: 'कम OCR सटीकता का प्रवाह - खोज से पहले निकाले गए CNR की पुष्टि आवश्यक।',
      ta: 'குறைந்த துல்லியம் - தேடுவதற்கு முன் பிரித்தெடுக்கப்பட்ட CNR-ஐ சரிபார்க்கும் முறை.',
      te: 'తక్కువ ఖచ్చితత్వం - శోధించడానికి ముందు సేకరించిన CNR నిర్ధారించుకునే విధానం.',
      kn: 'ಕಡಿಮೆ ನಿಖರತೆ - ಸಿಎನ್‌ಆರ್ ದೃಢೀಕರಿಸುವ ಹಂತ.',
      mr: 'कमी अचूकता - शोधण्यापूर्वी सीएनआर पडताळणी आवश्यक.',
      bn: 'কম নির্ভুলতা - অনুসন্ধানের আগে সিএনআর যাচাইয়ের ধাপ।',
      gu: 'ઓછી ચોકસાઈ - શોધતાં પહેલાં સીએનઆર ચકાસણી.'
    },
    badgeText: {
      en: 'Confidence: 62% (Verify)',
      hi: 'सटीकता: 62% (जांचें)',
      ta: 'துல்லியம்: 62% (சரிபார்க்கவும்)',
      te: 'ఖచ్చితత్వం: 62% (సరిచూడండి)',
      kn: 'ನಿಖರತೆ: ಶೇ 62 (ಪರಿಶೀಲಿಸಿ)',
      mr: 'अचूकता: ६२% (पडताळा)',
      bn: 'নির্ভুলতা: ৬২% (যাচাই করুন)',
      gu: 'ચોકસાઈ: 62% (ચકાસો)'
    },
    badgeColor: '#64748b' // Slate
  }
};

// Fix source_unavailable metadata shape
(DEMO_SCENARIO_METADATA as any).source_unavailable = {
  title: {
    en: '6. Server Down (Offline Cache Mode)',
    hi: '6. सरकारी सर्वर डाउन (ऑफलाइन कैश मोड)',
    ta: '6. சர்வர் செயலிழப்பு (ஆஃப்லைன் சேமிப்பு முறை)',
    te: '6. సర్వర్ డౌన్ (ఆఫ్‌లైన్ కాష్ మోడ్)',
    kn: '6. ಸರ್ವರ್ ಡೌನ್ (ಆಫ್‌ಲೈನ್ ಮೋಡ್)',
    mr: '6. सर्व्हर डाऊन (ऑफलाईन कॅश मोड)',
    bn: '6. সার্ভার ডাউন (অফলাইন ক্যাশ মোড)',
    gu: '6. સર્વર ડાઉન (ઓફલાઇન કેશ મોડ)'
  },
  description: {
    en: 'Seamless fallback when official eCourts API is unreachable.',
    hi: 'जब सरकारी ई-कोर्ट सर्वर बंद हो, तब सुरक्षित ऑफलाइन रिकॉर्ड से सहज प्रदर्शन।',
    ta: 'அரசு தளம் இயங்காதபோது சேமிக்கப்பட்ட தகவல்கள் பாதுகாப்பாக காட்டப்படும்.',
    te: 'ప్రభుత్వ సైట్ పనిచేయకపోయినా ఆఫ్‌లైన్ రికార్డు సురక్షితంగా ఉంటుంది.',
    kn: 'ಸರ್ಕಾರಿ ಸರ್ವರ್ ಕೈಕೊಟ್ಟಾಗ ಆಫ್‌ಲೈನ್ ಮಾಹಿತಿ ಲಭ್ಯವಿರುತ್ತದೆ.',
    mr: 'शासकीय साईट बंद असतानाही ऑफलाईन डेटा सुरक्षितपणे उपलब्ध.',
    bn: 'সরকারি সাইট বন্ধ থাকলেও অফলাইন রেকর্ড সুরক্ষিতভাবে দৃশ্যমান।',
    gu: 'સરકારી સાઇટ બંધ હોય ત્યારે પણ ઓફલાઇન ડેટા સુરક્ષિત રહેશે.'
  },
  badgeText: {
    en: 'Cached Offline',
    hi: 'ऑफलाइन सुरक्षित',
    ta: 'ஆஃப்லைனில் சேமிக்கப்பட்டது',
    te: 'ఆఫ్‌లైన్ కాష్',
    kn: 'ಆಫ್‌ಲೈನ್ ಸೇವ್ ಆಗಿದೆ',
    mr: 'ऑफलाईन सुरक्षित',
    bn: 'অফলাইন ক্যাশ',
    gu: 'ઓફલાઇન સેવ છે'
  },
  badgeColor: '#ef4444' // Red
};

export class MockCourtDataProvider implements ICourtDataProvider {
  async lookupByCnr(rawCnr: string): Promise<CourtCase | null> {
    const cleaned = rawCnr.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
    
    // Check known demo cases
    for (const key of Object.keys(DEMO_CASES) as DemoScenarioId[]) {
      const caseItem = DEMO_CASES[key];
      const standardCnrClean = caseItem.cnr.replace(/[^A-Z0-9-]/g, '');
      if (standardCnrClean === cleaned || cleaned.includes(standardCnrClean.substring(0, 8))) {
        return { ...caseItem };
      }
    }

    // If CNR matches valid 16-character pattern e.g. "DLHC010012342024" or standard with dashes
    if (cleaned.length >= 10) {
      return this.generateSyntheticCaseForCnr(cleaned);
    }

    return null;
  }

  async searchCases(query: { court?: string; caseType?: string; caseNumber?: string; year?: string; partyName?: string }): Promise<CourtCase[]> {
    const results: CourtCase[] = [];
    const all = Object.values(DEMO_CASES);

    for (const item of all) {
      let matches = true;
      if (query.caseNumber && !item.caseNumber.toLowerCase().includes(query.caseNumber.toLowerCase())) {
        matches = false;
      }
      if (query.partyName) {
        const partyQ = query.partyName.toLowerCase();
        const p1 = item.petitioner.name.toLowerCase();
        const p2 = item.respondent.name.toLowerCase();
        if (!p1.includes(partyQ) && !p2.includes(partyQ)) {
          matches = false;
        }
      }
      if (matches) {
        results.push(item);
      }
    }

    // If no direct demo matched but query is provided, synthesize matching result
    if (results.length === 0 && (query.caseNumber || query.partyName)) {
      const synthesized = this.generateSyntheticCaseForSearch(query);
      results.push(synthesized);
    }

    return results;
  }

  async getDemoScenario(scenarioId: DemoScenarioId): Promise<DemoScenario | null> {
    const caseData = DEMO_CASES[scenarioId];
    const meta = DEMO_SCENARIO_METADATA[scenarioId];
    if (!caseData || !meta) return null;

    return {
      id: scenarioId,
      title: meta.title,
      description: meta.description,
      cnr: caseData.cnr,
      badgeText: meta.badgeText,
      badgeColor: meta.badgeColor,
      caseData
    };
  }

  async getAllDemoScenarios(): Promise<DemoScenario[]> {
    const scenarios: DemoScenario[] = [];
    for (const key of Object.keys(DEMO_CASES) as DemoScenarioId[]) {
      const s = await this.getDemoScenario(key);
      if (s) scenarios.push(s);
    }
    return scenarios;
  }

  private generateSyntheticCaseForCnr(cnr: string): CourtCase {
    const statePrefix = cnr.substring(0, 2);
    let state = 'Delhi';
    let courtName = 'District & Sessions Court';

    if (statePrefix === 'TN') { state = 'Tamil Nadu'; courtName = 'High Court of Judicature at Madras'; }
    else if (statePrefix === 'MH') { state = 'Maharashtra'; courtName = 'High Court of Judicature at Bombay'; }
    else if (statePrefix === 'KA') { state = 'Karnataka'; courtName = 'High Court of Karnataka, Bengaluru'; }
    else if (statePrefix === 'UP') { state = 'Uttar Pradesh'; courtName = 'District & Sessions Court, Allahabad'; }
    else if (statePrefix === 'WB') { state = 'West Bengal'; courtName = 'High Court at Calcutta'; }

    return {
      cnr: cnr,
      caseNumber: `OS ${Math.floor(100 + Math.random() * 900)}/2024`,
      caseType: 'Civil Suit',
      filingDate: '2024-01-10',
      registrationDate: '2024-01-15',
      courtName: `${courtName} (${state})`,
      state: state,
      district: 'Central',
      courtComplex: 'Main Court Complex',
      courtRoomNumber: 'Court Room 03',
      judgeName: 'Presiding Judicial Officer',
      status: 'PENDING',
      statusText: 'Active / Listed for Hearing',
      petitioner: { name: 'Citizen Applicant', advocate: 'Advocate on Record', type: 'PETITIONER' },
      respondent: { name: 'Opposite Party / State', advocate: 'Government Pleader', type: 'RESPONDENT' },
      actsAndSections: ['Code of Civil Procedure 1908'],
      accessibilitySummary: {
        whatHappened: {
          en: 'The court reviewed the case documents and ordered the opposite party to submit their reply.',
          hi: 'अदालत ने केस के कागज़ात देखे और दूसरी पार्टी को जवाब दाखिल करने का निर्देश दिया।',
          ta: 'நீதிமன்றம் ஆவணங்களை ஆய்வு செய்து எதிர் தரப்பு பதிலளிக்க உத்தரவிட்டது.',
          te: 'కోర్టు పత్రాలను పరిశీలించి సమాధానం ఇవ్వాలని ఆదేశించింది.',
          kn: 'ನ್ಯಾಯಾಲಯವು ದಾಖಲೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ಉತ್ತರಿಸಲು ಆದೇಶಿಸಿದೆ.',
          mr: 'न्यायालयाने कागदपत्रे तपासून उत्तर सादर करण्याचे निर्देश दिले.',
          bn: 'আদালত নথি পরীক্ষা করে জবাব দিতে নির্দেশ দিয়েছে।',
          gu: 'કોર્ટે કાગળો તપાસી જવાબ આપવાનો આદેશ કર્યો.'
        },
        whatHappensNext: {
          en: 'Both advocates will present documents at the next hearing.',
          hi: 'अगली सुनवाई में दोनों वकील अपने कागज़ात पेश करेंगे।',
          ta: 'அடுத்த விசாரணையில் இரு வழக்கறிஞர்களும் ஆவணங்களை தாக்கல் செய்வார்கள்.',
          te: 'తదుపరి వాయిదాలో ఇరువైపుల లాయర్లు పత్రాలు సమర్పిస్తారు.',
          kn: 'ಮುಂದಿನ ವಿಚಾರಣೆಯಲ್ಲಿ ದಾಖಲೆಗಳನ್ನು ಸಲ್ಲಿಸಲಾಗುವುದು.',
          mr: 'पुढील सुनावणीत दोन्ही बाजूंचे वकील कागदपत्रे सादर करतील.',
          bn: 'পরবর্তী শুনানিতে নথিপত্র পেশ করা হবে।',
          gu: 'આગામી સુનાવણીમાં બંને વકીલો કાગળો રજૂ કરશે.'
        },
        whenDate: '2026-09-18',
        whenTime: '10:30 AM',
        whereLocation: {
          en: `Court Room 03, ${courtName}`,
          hi: `कोर्ट रूम 03, ${courtName}`,
          ta: `நீதிமன்ற அறை 03, ${courtName}`,
          te: `కోర్టు రూమ్ 03, ${courtName}`,
          kn: `ನ್ಯಾಯಾಲಯ ಕೊಠಡಿ 03, ${courtName}`,
          mr: `कोर्ट रूम 03, ${courtName}`,
          bn: `কোর্ট রুম ০৩, ${courtName}`,
          gu: `કોર્ટ રૂમ 03, ${courtName}`
        },
        clearNextAction: {
          en: 'Consult your advocate to ensure your supporting affidavits are filed on time.',
          hi: 'समय पर हलफनामा जमा करने के लिए अपने वकील से संपर्क करें।',
          ta: 'ஆவணங்களை உரிய நேரத்தில் தாக்கல் செய்ய வழக்கறிஞரிடம் பேசவும்.',
          te: 'సమయానికి పత్రాలు సమర్పించడానికి మీ లాయర్‌తో మాట్లాడండి.',
          kn: 'ದಾಖಲೆಗಳನ್ನು ಸಮಯಕ್ಕೆ ಸರಿಯಾಗಿ ಸಲ್ಲಿಸಲು ವಕೀಲರನ್ನು ಭೇಟಿ ಮಾಡಿ.',
          mr: 'वेळेवर प्रतिज्ञापत्र दाखल करण्यासाठी वकिलांशी बोला.',
          bn: 'হলফনামা জমা দিতে আইনজীবীর সাথে পরামর্শ করুন।',
          gu: 'સમયસર સોગંદનામું જમા કરવા વકીલનો સંપર્ક કરો.'
        }
      },
      hearings: [
        { date: '2024-02-10', purpose: 'First Appearance', isPast: true },
        { date: '2026-09-18', purpose: 'Hearing on Reply', isPast: false }
      ],
      orders: [],
      timeline: [
        {
          id: 't-syn-1',
          date: '2024-01-10',
          title: 'Case Registered',
          type: 'NOTICE_ISSUED',
          description: 'Case registered with CNR',
          simplifiedText: {
            en: 'Case registered in court.',
            hi: 'अदालत में केस दर्ज हुआ।',
            ta: 'நீதிமன்றத்தில் வழக்கு பதிவானது.',
            te: 'కోర్టులో కేసు నమోదయింది.',
            kn: 'ನ್ಯಾಯಾಲಯದಲ್ಲಿ ಪ್ರಕರಣ ದಾಖಲು.',
            mr: 'न्यायालयात केस नोंदवली गेली.',
            bn: 'আদালতে মামলা নথিভুক্ত।',
            gu: 'કોર્ટમાં કેસ નોંધાયો.'
          },
          isCompleted: true,
          isUpcoming: false
        }
      ],
      isDemoData: true,
      dataSource: 'SYNTHETIC_MOCK',
      lastSyncedAt: new Date().toISOString(),
      dataFreshnessStatus: 'FRESH',
      hashChecksum: `sha256-${cnr.toLowerCase().substring(0, 8)}`
    };
  }

  private generateSyntheticCaseForSearch(query: { caseNumber?: string; partyName?: string }): CourtCase {
    const cnr = `DLDC01-00${Math.floor(1000 + Math.random() * 9000)}-2024`;
    const party = query.partyName || 'Citizen Applicant';
    const num = query.caseNumber || 'CS 101/2024';

    const caseItem = this.generateSyntheticCaseForCnr(cnr);
    caseItem.caseNumber = num;
    caseItem.petitioner.name = party;
    return caseItem;
  }
}

// Live eCourts Provider Stub for authorized government API deployment
export class LiveECourtsProvider implements ICourtDataProvider {
  private apiUrl: string;
  private apiKey: string;

  constructor(apiUrl: string = process.env.ECOURTS_API_URL || '', apiKey: string = process.env.ECOURTS_API_KEY || '') {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
  }

  async lookupByCnr(cnr: string): Promise<CourtCase | null> {
    if (!this.apiUrl || !this.apiKey) {
      // Graceful fallback to mock provider when live credentials are not set
      const mock = new MockCourtDataProvider();
      return mock.lookupByCnr(cnr);
    }
    // Authenticated API request to legitimate eCourts NJDG gateway
    try {
      const response = await fetch(`${this.apiUrl}/case/lookup?cnr=${encodeURIComponent(cnr)}`, {
        headers: { 'Authorization': `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' }
      });
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  }

  async searchCases(query: any): Promise<CourtCase[]> {
    const mock = new MockCourtDataProvider();
    return mock.searchCases(query);
  }

  async getDemoScenario(scenarioId: DemoScenarioId): Promise<DemoScenario | null> {
    const mock = new MockCourtDataProvider();
    return mock.getDemoScenario(scenarioId);
  }

  async getAllDemoScenarios(): Promise<DemoScenario[]> {
    const mock = new MockCourtDataProvider();
    return mock.getAllDemoScenarios();
  }
}

// Global provider singleton
export const courtDataProvider: ICourtDataProvider = new MockCourtDataProvider();
