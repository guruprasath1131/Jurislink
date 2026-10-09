import React from 'react';
import { Sparkles, RefreshCw, AlertTriangle, CheckCircle2, Clock, CloudOff } from 'lucide-react';
import { useCase } from '../../context/CaseContext';
import { useLanguage } from '../../context/LanguageContext';
import { DemoScenarioId } from '../../types';

export const DemoBanner: React.FC = () => {
  const { activeDemoScenarioId, switchDemoScenario, demoScenarios, isLoading } = useCase();
  const { language, t } = useLanguage();

  return (
    <div style={{
      background: '#fffbeb',
      border: '2px dashed #f59e0b',
      borderRadius: 'var(--radius-md)',
      padding: '12px 16px',
      marginBottom: '20px',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            background: '#f59e0b',
            color: '#0f172a',
            padding: '3px 10px',
            borderRadius: '6px',
            fontWeight: 800,
            fontSize: '0.8rem',
            letterSpacing: '0.05em'
          }}>
            {t.demoModeBadge}
          </span>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#92400e' }}>
            {t.switchScenario}:
          </span>
        </div>

        {isLoading && (
          <span style={{ fontSize: '0.8rem', color: '#92400e', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <RefreshCw size={14} className="anim-pulse" /> Loading scenario...
          </span>
        )}
      </div>

      {/* Scenario Pill Buttons */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {demoScenarios.map((scenario) => {
          const isSelected = activeDemoScenarioId === scenario.id;
          const title = scenario.title[language] || scenario.title.en;
          const badge = scenario.badgeText[language] || scenario.badgeText.en;

          return (
            <button
              key={scenario.id}
              onClick={() => switchDemoScenario(scenario.id)}
              style={{
                background: isSelected ? '#0f172a' : '#ffffff',
                color: isSelected ? '#ffffff' : '#334155',
                border: isSelected ? '2px solid #0f172a' : '1px solid #cbd5e1',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '0.82rem',
                fontWeight: isSelected ? 700 : 500,
                minHeight: '34px',
                whiteSpace: 'nowrap',
                gap: '6px',
                boxShadow: isSelected ? '0 2px 8px rgba(15, 23, 42, 0.2)' : 'none'
              }}
            >
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: scenario.badgeColor,
                display: 'inline-block'
              }} />
              <span>{title.split(' ')[0]} {title.split(' ')[1]}</span>
              <span style={{
                background: isSelected ? 'rgba(255, 255, 255, 0.2)' : '#f1f5f9',
                color: isSelected ? '#facc15' : '#64748b',
                padding: '1px 6px',
                borderRadius: '10px',
                fontSize: '0.72rem'
              }}>
                {badge}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
