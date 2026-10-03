'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { StudentRequest } from '@/lib/types';

interface ConfirmDeleteModalProps {
  request: StudentRequest;
  onCancel: () => void;
  onConfirm: (id: string) => Promise<void>;
  loading?: boolean;
}

export default function ConfirmDeleteModal({
  request,
  onCancel,
  onConfirm,
  loading = false,
}: ConfirmDeleteModalProps) {
  return (
    <div className="modal-overlay" style={{ zIndex: 120 }}>
      <div className="modal-content" style={{ maxWidth: '480px' }}>
        <div className="modal-header" style={{ borderBottomColor: '#374151' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={20} style={{ color: '#ef4444' }} />
            <h3 className="modal-title" style={{ color: '#ef4444' }}>
              Permanent Rejection & Deletion
            </h3>
          </div>
        </div>

        <div className="modal-body">
          <p style={{ color: '#f3f4f6', fontWeight: 600, marginBottom: '12px', fontSize: '1rem' }}>
            Permanently reject request from {request.full_name}?
          </p>

          <p style={{ color: '#9ca3af', fontSize: '0.88rem', lineHeight: '1.5', marginBottom: '16px' }}>
            The student&apos;s submitted information will be deleted and will no longer be available in the system.
          </p>

          <div
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '6px',
              padding: '12px 14px',
              color: '#fca5a5',
              fontSize: '0.82rem',
              fontWeight: 600,
            }}
          >
            This action cannot be undone. No archival or recycle records will be retained.
          </div>
        </div>

        <div className="modal-footer" style={{ borderTopColor: '#374151' }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="admin-btn admin-btn-secondary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(request.id)}
            disabled={loading}
            className="admin-btn admin-btn-danger"
          >
            {loading ? 'Deleting...' : 'Reject & Permanently Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
