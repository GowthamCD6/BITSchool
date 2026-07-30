import React from 'react';
import { Building2, Plus } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Building2,
  title = "No Data Available",
  description = "No records found matching your criteria. Click below to add a new record to your database.",
  actionText,
  onAction
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 2rem',
        background: '#ffffff',
        border: '1.5px dashed #cbd5e1',
        borderRadius: '16px',
        textAlign: 'center',
        margin: '1.5rem 0',
        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.02)'
      }}
    >
      <div
        style={{
          width: '68px',
          height: '68px',
          borderRadius: '50%',
          background: '#eff6ff',
          color: '#2563eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.25rem',
          border: '1px solid #bfdbfe'
        }}
      >
        <Icon size={34} />
      </div>
      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
        {title}
      </h3>
      <p style={{ fontSize: '0.88rem', color: '#64748b', maxWidth: '440px', lineHeight: 1.5, marginBottom: actionText ? '1.5rem' : '0' }}>
        {description}
      </p>
      {actionText && onAction && (
        <button className="btn btn-primary" onClick={onAction} style={{ gap: '0.45rem', padding: '0.6rem 1.25rem' }}>
          <Plus size={18} /> {actionText}
        </button>
      )}
    </div>
  );
}
