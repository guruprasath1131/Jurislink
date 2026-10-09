import React from 'react';
import { Home, FolderOpen, Search, Camera, Mic, Bell, PhoneCall, HelpCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export type NavTab = 'home' | 'my_cases' | 'check_case' | 'scan_notice' | 'voice_assist' | 'reminders' | 'ivr_phone' | 'help';

interface NavigationProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onSelectTab }) => {
  const { t } = useLanguage();

  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: t.navHome, icon: <Home size={22} /> },
    { id: 'my_cases', label: t.navMyCases, icon: <FolderOpen size={22} /> },
    { id: 'check_case', label: t.navCheckCase, icon: <Search size={22} /> },
    { id: 'scan_notice', label: t.navScanNotice, icon: <Camera size={22} /> },
    { id: 'voice_assist', label: t.navVoiceAssist, icon: <Mic size={22} /> },
    { id: 'reminders', label: t.navReminders, icon: <Bell size={22} /> },
    { id: 'ivr_phone', label: t.navIvrPhone, icon: <PhoneCall size={22} /> },
    { id: 'help', label: t.navHelp, icon: <HelpCircle size={22} /> }
  ];

  return (
    <>
      {/* Desktop Navigation Top Bar */}
      <nav style={{
        background: '#ffffff',
        borderBottom: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)',
        display: 'none'
      }} className="desktop-nav">
        <div className="app-container" style={{ padding: '0 20px', display: 'flex', gap: '8px', overflowX: 'auto' }}>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                style={{
                  padding: '14px 16px',
                  borderRadius: 0,
                  borderBottom: isActive ? '3px solid #f59e0b' : '3px solid transparent',
                  background: isActive ? 'rgba(245, 158, 11, 0.08)' : 'transparent',
                  color: isActive ? '#0f172a' : '#64748b',
                  fontWeight: isActive ? 800 : 600,
                  fontSize: '0.95rem',
                  whiteSpace: 'nowrap',
                  gap: '8px'
                }}
              >
                <span style={{ color: isActive ? '#f59e0b' : 'inherit' }}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Accessible Bottom Navigation Bar */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#ffffff',
        borderTop: '2px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '6px 4px 8px 4px',
        zIndex: 50,
        boxShadow: '0 -4px 15px rgba(0, 0, 0, 0.08)'
      }} className="mobile-nav">
        {navItems.slice(0, 5).map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              style={{
                flexDirection: 'column',
                gap: '2px',
                minHeight: '52px',
                flex: 1,
                padding: '4px 2px',
                borderRadius: '8px',
                background: isActive ? 'rgba(245, 158, 11, 0.12)' : 'transparent',
                color: isActive ? '#d97706' : '#64748b',
                fontWeight: isActive ? 800 : 500,
                fontSize: '0.72rem'
              }}
            >
              <div style={{ color: isActive ? '#d97706' : 'currentColor' }}>{item.icon}</div>
              <span style={{ maxWidth: '64px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.label}
              </span>
            </button>
          );
        })}

        {/* More Tabs button for Mobile */}
        <button
          onClick={() => onSelectTab('ivr_phone')}
          style={{
            flexDirection: 'column',
            gap: '2px',
            minHeight: '52px',
            flex: 1,
            padding: '4px 2px',
            borderRadius: '8px',
            background: activeTab === 'ivr_phone' ? 'rgba(245, 158, 11, 0.12)' : 'transparent',
            color: activeTab === 'ivr_phone' ? '#d97706' : '#64748b',
            fontSize: '0.72rem'
          }}
        >
          <PhoneCall size={22} />
          <span>IVR</span>
        </button>
      </nav>

      {/* Media query helper styles */}
      <style>{`
        @media (min-width: 768px) {
          .desktop-nav { display: block !important; }
          .mobile-nav { display: none !important; }
        }
      `}</style>
    </>
  );
};
