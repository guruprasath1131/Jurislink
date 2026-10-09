import React from 'react';
import { HelpCircle, PhoneCall, ShieldCheck, Scale, AlertCircle, BookOpen } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { AudioButton } from '../ui/AudioButton';

export const LegalGlossary: React.FC = () => {
  const { language, t } = useLanguage();

  const GLOSSARY_ITEMS = [
    {
      term: 'CNR (Case Number Record)',
      meaning: {
        en: 'A unique 16-character alphanumeric identity assigned to every court case in India (e.g. DLHC01-008472-2024). It allows searching across any district or high court.',
        hi: 'भारत के हर अदालती मामले को दिया गया 16 अंकों का एक अनूठा पहचान नंबर (उदा. DLHC01-008472-2024)। इससे देश की किसी भी अदालत में केस खोजा जा सकता है।'
      }
    },
    {
      term: 'Adjournment (स्थगन / तारीख बढ़ना)',
      meaning: {
        en: 'When a court hearing is postponed to a future date to allow parties to file replies, bring witnesses, or due to bench changes.',
        hi: 'जब किसी सुनवाई को आगे की तारीख के लिए टाल दिया जाता है ताकि दस्तावेज़ जमा किए जा सकें या गवाह पेश किए जा सकें।'
      }
    },
    {
      term: 'Interim Stay / Injunction (अंतरिम रोक)',
      meaning: {
        en: 'A temporary protective court order preventing demolition, arrest, disconnection, or auction until final judgment is decided.',
        hi: 'अदालत का एक अस्थायी सुरक्षा आदेश जो अंतिम फैसले तक तोड़फोड़, गिरफ्तारी, बिजली कटने या नीलामी को रोकता है।'
      }
    },
    {
      term: 'Free Legal Aid (मुफ्त कानूनी सहायता - NALSA)',
      meaning: {
        en: 'Under Article 39A of the Indian Constitution, citizens with low income, farmers, women, and SC/ST citizens are entitled to free government lawyers via DLSA/NALSA (Helpline: 15100).',
        hi: 'भारतीय संविधान के अनुच्छेद 39A के तहत कम आय वाले नागरिकों, किसानों, महिलाओं और SC/ST नागरिकों को DLSA द्वारा मुफ्त सरकारी वकील पाने का अधिकार है (हेल्पलाइन: 15100)।'
      }
    },
    {
      term: 'Cause List (दैनिक कॉज़-लिस्ट)',
      meaning: {
        en: 'The official daily schedule published by the court clerk listing the order in which cases will be taken up by the judge today.',
        hi: 'अदालत द्वारा रोज़ाना जारी की जाने वाली सूची जिसमें लिखा होता है कि आज जज साहब किस क्रम में मामलों की सुनवाई करेंगे।'
      }
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Help Banner */}
      <div className="card-elevated" style={{ borderLeft: '6px solid #0284c7' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: '#e0f2fe',
            color: '#0369a1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <HelpCircle size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Citizen Legal Rights & Court Guide
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Simplified legal terms, court decorum rules & government legal aid helplines
            </p>
          </div>
        </div>
      </div>

      {/* Free Legal Aid Callout */}
      <div style={{
        background: 'linear-gradient(135deg, #065f46 0%, #064e3b 100%)',
        color: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={24} color="#34d399" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
              National Legal Services Authority (NALSA)
            </h3>
          </div>
          <p style={{ fontSize: '0.9rem', color: '#d1fae5', marginTop: '6px', lineHeight: 1.5 }}>
            Need a free advocate? Call the official national toll-free legal aid helpline <strong>15100</strong>.
          </p>
        </div>

        <a
          href="tel:15100"
          style={{
            background: '#34d399',
            color: '#064e3b',
            textDecoration: 'none',
            padding: '12px 20px',
            borderRadius: 'var(--radius-md)',
            fontWeight: 800,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <PhoneCall size={18} />
          <span>Call 15100 (Toll-Free)</span>
        </a>
      </div>

      {/* Simplified Legal Glossary Cards */}
      <div className="card-elevated">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BookOpen size={20} color="#0284c7" />
          <span>Simplified Indian Legal Terms</span>
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {GLOSSARY_ITEMS.map((item, idx) => {
            const explanation = (item.meaning as any)[language] || item.meaning.en;
            return (
              <div
                key={idx}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    {item.term}
                  </h4>
                  <AudioButton textToSpeak={`${item.term}. ${explanation}`} size="sm" variant="subtle" />
                </div>
                <p style={{ marginTop: '8px', fontSize: '0.92rem', color: '#334155', lineHeight: 1.5 }}>
                  {explanation}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
