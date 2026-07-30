import React from 'react';
import Modal from './Modal';
import { AlertTriangle, Trash2 } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to delete this item? This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel"
}) {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#dc2626' }}>
          <AlertTriangle size={20} />
          <span>{title}</span>
        </div>
      }
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', width: '100%' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            {cancelText}
          </button>
          <button
            type="button"
            className="btn"
            style={{ background: '#dc2626', color: '#ffffff', border: 'none' }}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            <Trash2 size={16} />
            <span>{confirmText}</span>
          </button>
        </div>
      }
    >
      <div style={{ padding: '0.5rem 0', color: 'var(--text-sub)', fontSize: '0.95rem', lineHeight: '1.5' }}>
        {message}
      </div>
    </Modal>
  );
}
