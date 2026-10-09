'use client';

import React, { useState, useEffect } from 'react';
import { MediaAsset } from '@/lib/types';
import VrDeviceLoader from '@/components/VrDeviceLoader';
import { X, Search, Upload, Trash2, Check, Image as ImageIcon, Sparkles, Filter } from 'lucide-react';

interface AssetPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  category?: string;
}

export default function AssetPickerModal({
  isOpen,
  onClose,
  onSelect,
  category = 'general',
}: AssetPickerModalProps) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/media');
      const data = await res.json();
      if (data.success && data.assets) {
        setAssets(data.assets);
      }
    } catch (err) {
      console.error('Error fetching assets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAssets();
    }
  }, [isOpen]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5 MB. Please select a smaller or compressed image.');
      return;
    }

    setUploading(true);
    setUploadMsg(null);

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
        setAssets((prev) => [data.asset, ...prev]);
        setUploadMsg('Asset uploaded successfully!');
        setTimeout(() => setUploadMsg(null), 3000);
      } else {
        alert(data.message || 'Failed to upload image.');
      }
    } catch {
      alert('Error uploading image.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this asset from the library?')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/media?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setAssets((prev) => prev.filter((a) => a.id !== id));
      } else {
        alert(data.message || 'Failed to delete asset.');
      }
    } catch {
      alert('Error deleting asset.');
    }
  };

  if (!isOpen) return null;

  const categories = ['ALL', 'projects', 'events', 'achievements', 'branding', 'general'];

  const filteredAssets = assets.filter((a) => {
    const matchesCategory = selectedCategory === 'ALL' || a.category === selectedCategory;
    const matchesSearch = !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.original_name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1050 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '880px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--surface-card)',
          border: '1px solid var(--border-glass)',
          borderRadius: '14px',
          boxShadow: 'var(--shadow-card)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div className="modal-header" style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)' }}>
              <ImageIcon size={18} />
            </div>
            <div>
              <h3 className="modal-title" style={{ fontSize: '1.05rem', margin: 0 }}>Institutional Asset Library</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                Select an existing uploaded media asset or upload a new high-resolution visual
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Quick Upload Button */}
            <label
              className="admin-btn admin-btn-primary admin-btn-sm"
              style={{ cursor: uploading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Upload size={13} />
              <span>{uploading ? 'Uploading...' : 'Upload New'}</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                onChange={handleFileUpload}
                disabled={uploading}
                style={{ display: 'none' }}
              />
            </label>

            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {uploadMsg && (
          <div style={{ padding: '8px 24px', background: 'rgba(34, 197, 94, 0.15)', color: '#86efac', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Check size={14} />
            <span>{uploadMsg}</span>
          </div>
        )}

        {/* Filters & Search Toolbar */}
        <div style={{ padding: '12px 24px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', borderBottom: '1px solid var(--border-subtle)', background: 'var(--surface-card-alt)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--surface-input)', padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-subtle)', flex: 1, minWidth: '220px' }}>
            <Search size={14} style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search assets by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '0.82rem', width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                style={{
                  fontSize: '0.72rem',
                  fontWeight: selectedCategory === cat ? 700 : 500,
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: selectedCategory === cat ? '1px solid var(--accent-cyan)' : '1px solid transparent',
                  background: selectedCategory === cat ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                  color: selectedCategory === cat ? 'var(--accent-cyan)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, maxHeight: '550px' }}>
          {loading ? (
            <VrDeviceLoader
              mode="compact"
              title="RETRIEVING MEDIA ASSETS..."
              subtext="Loading high-res texture and media catalog..."
              badge="ASSET CLOUD"
            />
          ) : filteredAssets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <ImageIcon size={36} style={{ margin: '0 auto 12px auto', opacity: 0.4 }} />
              <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>No assets found</div>
              <div style={{ fontSize: '0.78rem', marginTop: '4px' }}>
                Upload an image or clear your search filters.
              </div>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '14px',
              }}
            >
              {filteredAssets.map((asset) => (
                <div
                  key={asset.id}
                  onClick={() => {
                    onSelect(asset.data_url);
                    onClose();
                  }}
                  style={{
                    borderRadius: '8px',
                    border: '1px solid var(--border-glass)',
                    background: 'var(--surface-input)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                  }}
                  className="asset-card-hover"
                  title={`Click to select: ${asset.name}`}
                >
                  {/* Thumbnail */}
                  <div style={{ width: '100%', height: '120px', position: 'relative', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    <img
                      src={asset.data_url}
                      alt={asset.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      loading="lazy"
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: '6px',
                        left: '6px',
                        background: 'rgba(0,0,0,0.6)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '0.62rem',
                        color: 'var(--accent-cyan)',
                        fontFamily: 'var(--font-mono)',
                        textTransform: 'uppercase',
                      }}
                    >
                      {asset.category || 'general'}
                    </div>

                    {/* Delete action button */}
                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, asset.id)}
                      title="Delete asset"
                      style={{
                        position: 'absolute',
                        top: '6px',
                        right: '6px',
                        background: 'rgba(239, 68, 68, 0.8)',
                        border: 'none',
                        color: '#fff',
                        width: '24px',
                        height: '24px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  {/* Metadata bar */}
                  <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {asset.name}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      <span>{formatSize(asset.size_bytes)}</span>
                      <span>{new Date(asset.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 24px', borderTop: '1px solid var(--border-subtle)', background: 'var(--surface-card-alt)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Showing {filteredAssets.length} of {assets.length} stored assets
          </div>
          <button
            type="button"
            onClick={onClose}
            className="admin-btn admin-btn-secondary admin-btn-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
