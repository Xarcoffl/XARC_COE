'use client';

import React, { useState } from 'react';
import AssetPickerModal from './AssetPickerModal';
import VrDeviceLoader from '@/components/VrDeviceLoader';
import { Upload, Image as ImageIcon, Link as LinkIcon, Trash2, CheckCircle2, Eye, RefreshCw } from 'lucide-react';

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  category?: 'projects' | 'events' | 'achievements' | 'branding' | 'general';
  helpText?: string;
}

export default function ImageUploadField({
  label,
  value,
  onChange,
  category = 'general',
  helpText,
}: ImageUploadFieldProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('File exceeds 5 MB limit. Please compress image.');
      return;
    }

    setUploading(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);

    try {
      const res = await fetch('/api/admin/media/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.asset) {
        onChange(data.asset.data_url);
      } else {
        setErrorMsg(data.message || 'Upload failed.');
      }
    } catch {
      setErrorMsg('Failed to upload image.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleFileUpload(file);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label className="admin-field-label" style={{ marginBottom: 0 }}>
          {label}
        </label>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            type="button"
            onClick={() => setMode('upload')}
            style={{
              background: mode === 'upload' ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
              color: mode === 'upload' ? 'var(--accent-cyan)' : 'var(--text-muted)',
              border: mode === 'upload' ? '1px solid var(--accent-cyan)' : '1px solid transparent',
              borderRadius: '4px',
              padding: '2px 8px',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Upload / Library
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            style={{
              background: mode === 'url' ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
              color: mode === 'url' ? 'var(--accent-cyan)' : 'var(--text-muted)',
              border: mode === 'url' ? '1px solid var(--accent-cyan)' : '1px solid transparent',
              borderRadius: '4px',
              padding: '2px 8px',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Direct URL
          </button>
        </div>
      </div>

      {mode === 'url' ? (
        <div>
          <div style={{ position: 'relative' }}>
            <LinkIcon size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="url"
              className="admin-input"
              style={{ paddingLeft: '34px' }}
              placeholder="https://images.unsplash.com/... or paste image URL"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
            />
          </div>
        </div>
      ) : (
        /* Upload & Asset Library Interface */
        <div>
          {value ? (
            /* Current Image Preview Pill */
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '10px 14px',
                background: 'var(--surface-input)',
                border: '1px solid var(--border-glass)',
                borderRadius: '8px',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '48px',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  background: '#000',
                  flexShrink: 0,
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <img
                  src={value}
                  alt="preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-primary)', fontWeight: 600, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {value.startsWith('data:') ? 'Stored Institutional Asset (Base64)' : value}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                  Active Visual Linked
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => setIsPickerOpen(true)}
                  className="admin-btn admin-btn-secondary admin-btn-sm"
                  style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                  title="Choose replacement from library"
                >
                  <RefreshCw size={12} />
                  <span>Replace</span>
                </button>
                <button
                  type="button"
                  onClick={() => onChange('')}
                  className="admin-btn admin-btn-danger admin-btn-sm"
                  style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                  title="Remove image"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ) : (
            /* Drag and Drop Dropzone */
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              style={{
                border: isDragging ? '2px dashed var(--accent-cyan)' : '1px dashed var(--border-glass)',
                background: isDragging ? 'rgba(6, 182, 212, 0.08)' : 'var(--surface-input)',
                borderRadius: '8px',
                padding: '20px 16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s ease',
              }}
            >
              {uploading ? (
                <VrDeviceLoader
                  mode="compact"
                  title="UPLOADING SPATIAL ASSET..."
                  subtext="Streaming media bytes to secure storage..."
                  badge="MEDIA UPLOAD"
                />
              ) : (
                <>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <Upload size={18} />
                  </div>

                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Drag & drop image here or upload
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Supports PNG, JPG, WebP, SVG (max 5 MB)
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <label
                      className="admin-btn admin-btn-primary admin-btn-sm"
                      style={{ cursor: 'pointer', fontSize: '0.75rem' }}
                    >
                      <span>Browse Device</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file);
                        }}
                        style={{ display: 'none' }}
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => setIsPickerOpen(true)}
                      className="admin-btn admin-btn-secondary admin-btn-sm"
                      style={{ fontSize: '0.75rem' }}
                    >
                      <ImageIcon size={12} />
                      <span>Media Library</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {errorMsg && (
        <div style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '2px' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {helpText && (
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          {helpText}
        </div>
      )}

      {/* Asset Picker Modal */}
      <AssetPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={(url) => onChange(url)}
        category={category}
      />
    </div>
  );
}
