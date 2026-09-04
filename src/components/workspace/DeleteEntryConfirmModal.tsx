import React from 'react';

interface DeleteEntryConfirmModalProps {
  isOpen: boolean;
  entryDate: string;
  weightKg: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteEntryConfirmModal: React.FC<DeleteEntryConfirmModalProps> = ({
  isOpen,
  entryDate,
  weightKg,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(7, 10, 18, 0.82)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100,
        padding: '24px'
      }}
      onClick={onCancel}
    >
      <div
        className="glass-panel"
        style={{
          padding: '32px',
          maxWidth: '420px',
          width: '100%',
          textAlign: 'center',
          background: 'var(--bg-surface)',
          border: '1px solid rgba(244, 63, 94, 0.3)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '12px' }}>🗑️</span>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>
          Delete Weigh-in Entry?
        </h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.5 }}>
          Are you sure you want to delete the weigh-in of <strong>{weightKg} kg</strong> recorded on <strong>{entryDate}</strong>? This action cannot be undone.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            style={{ flex: 1 }}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn"
            onClick={onConfirm}
            style={{
              flex: 1,
              background: 'var(--accent-rose)',
              color: '#fff',
              border: 'none',
              fontWeight: 700
            }}
          >
            Delete Entry
          </button>
        </div>
      </div>
    </div>
  );
};
