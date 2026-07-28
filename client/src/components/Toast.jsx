import React from 'react';
import { useSchool } from '../context/SchoolContext';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function Toast() {
  const { toast } = useSchool();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 size={18} color="var(--accent-emerald)" />,
    warning: <AlertCircle size={18} color="var(--accent-amber)" />,
    danger: <AlertCircle size={18} color="var(--accent-rose)" />,
    info: <Info size={18} color="var(--primary)" />
  };

  return (
    <div className="toast-container">
      <div className={`toast toast-${toast.type}`}>
        {icons[toast.type] || icons.success}
        <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>{toast.message}</span>
      </div>
    </div>
  );
}
