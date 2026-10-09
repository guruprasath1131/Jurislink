import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, CloudOff, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface FreshnessBadgeProps {
  status: 'FRESH' | 'STALE' | 'CACHED' | 'UNAVAILABLE';
  lastSyncedAt: string;
  source: string;
  onRefresh?: () => void;
}

export const FreshnessBadge: React.FC<FreshnessBadgeProps> = ({
  status,
  lastSyncedAt,
  source,
  onRefresh
}) => {
  const { t } = useLanguage();

  const formattedDate = new Date(lastSyncedAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const config = {
    FRESH: {
      icon: <CheckCircle2 size={16} />,
      label: t.statusFresh,
      bg: '#ecfdf5',
      color: '#047857',
      border: '#a7f3d0'
    },
    STALE: {
      icon: <Clock size={16} />,
      label: t.statusStale,
      bg: '#fff7ed',
      color: '#c2410c',
      border: '#fed7aa'
    },
    CACHED: {
      icon: <CloudOff size={16} />,
      label: t.statusCached,
      bg: '#eff6ff',
      color: '#1d4ed8',
      border: '#bfdbfe'
    },
    UNAVAILABLE: {
      icon: <AlertTriangle size={16} />,
      label: 'Server Maintenance (Cached Record)',
      bg: '#fef2f2',
      color: '#b91c1c',
      border: '#fecaca'
    }
  }[status] || {
    icon: <CheckCircle2 size={16} />,
    label: t.statusFresh,
    bg: '#ecfdf5',
    color: '#047857',
    border: '#a7f3d0'
  };

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      background: config.bg,
      color: config.color,
      border: `1px solid ${config.border}`,
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '0.8rem',
      fontWeight: 700
    }}>
      {config.icon}
      <span>{config.label}</span>
      <span style={{ opacity: 0.6, fontSize: '0.75rem' }}>• {formattedDate}</span>
      {onRefresh && (
        <button
          onClick={onRefresh}
          style={{
            minHeight: '24px',
            padding: '2px 6px',
            fontSize: '0.7rem',
            background: 'rgba(0,0,0,0.06)',
            borderRadius: '4px',
            color: 'inherit'
          }}
          title={t.retrySync}
        >
          <RefreshCw size={12} />
        </button>
      )}
    </div>
  );
};
