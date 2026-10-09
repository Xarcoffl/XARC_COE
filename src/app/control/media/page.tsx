'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import VrDeviceLoader from '@/components/VrDeviceLoader';
import { MediaAsset } from '@/lib/types';
import {
  Upload,
  Search,
  Trash2,
  Copy,
  Check,
  Image as ImageIcon,
  HardDrive,
  Eye,
  Filter,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All Media' },
  { id: 'general', label: 'General' },
  { id: 'branding', label: 'Branding & Logos' },
  { id: 'projects', label: 'Project Banners' },
  { id: 'events', label: 'Event Posters' },
  { id: 'achievements', label: 'Accolades & Trophies' },
];

export default function MediaLibraryPage() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<'general' | 'branding' | 'projects' | 'events' | 'achievements'>('general');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedPreview, setSelectedPreview] = useState<MediaAsset | null>(null);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/media');
      const data = await res.json();
      if (data.success) {
        setAssets(data.assets || []);
      }
    } catch {
      setMsg({ text: 'Failed to fetch media assets.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setMsg(null);
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) {
        failCount++;
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        failCount++;
        continue;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', uploadCategory);
      formData.append('title', file.name.replace(/\.[^/.]+$/, ''));

      try {
        const res = await fetch('/api/admin/media/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.success) {
          successCount++;
        } else {
          failCount++;
        }
      } catch {
        failCount++;
      }
    }

    setUploading(false);
    if (successCount > 0) {
      setMsg({
        text: `Successfully uploaded ${successCount} asset${successCount > 1 ? 's' : ''}${failCount > 0 ? ` (${failCount} failed)` : ''}.`,
        type: 'success',
      });
      fetchAssets();
      setTimeout(() => setMsg(null), 3000);
    } else if (failCount > 0) {
      setMsg({ text: 'Failed to upload selected file(s). Maximum size is 5MB.', type: 'error' });
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete asset "${title}"? This cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/admin/media?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setAssets((prev) => prev.filter((a) => a.id !== id));
        if (selectedPreview?.id === id) setSelectedPreview(null);
        setMsg({ text: 'Asset deleted permanently.', type: 'success' });
        setTimeout(() => setMsg(null), 2500);
      } else {
        setMsg({ text: data.message || 'Failed to delete asset.', type: 'error' });
      }
    } catch {
      setMsg({ text: 'Network error deleting asset.', type: 'error' });
    }
  };

  const handleCopy = (asset: MediaAsset) => {
    navigator.clipboard.writeText(asset.data_url);
    setCopiedId(asset.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const filteredAssets = assets.filter((a) => {
    const assetTitle = a.name || '';
    const assetFile = a.original_name || '';
    const matchesCat = activeCategory === 'all' || a.category === activeCategory;
    const matchesQuery =
      searchQuery === '' ||
      assetTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assetFile.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const totalBytes = assets.reduce((sum, a) => sum + (a.size_bytes || 0), 0);

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        <AdminHeader
          title="Institutional Media & Asset Vault"
          subtitle="Upload, catalog, and manage high-resolution banners, posters, and institutional branding with cloud persistence"
        />

        <div className="admin-content" style={{ maxWidth: '1440px' }}>
          {msg && (
            <div
              style={{
                background: msg.type === 'success' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                border: `1px solid ${msg.type === 'success' ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                borderRadius: '8px',
                padding: '12px 18px',
                color: msg.type === 'success' ? '#86efac' : '#fca5a5',
                fontSize: '0.9rem',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              }}
            >
              {msg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span>{msg.text}</span>
            </div>
          )}

          {/* TOP METRICS & STATS STRIP */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div className="admin-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)' }}>
                <ImageIcon size={22} />
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{assets.length}</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Cataloged Assets</div>
              </div>
            </div>

            <div className="admin-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc' }}>
                <HardDrive size={22} />
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{formatSize(totalBytes)}</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cloud Storage Payload</div>
              </div>
            </div>

            <div className="admin-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(34, 197, 94, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4ade80' }}>
                <Filter size={22} />
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                  {filteredAssets.length}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active View Matches</div>
              </div>
            </div>
          </div>

          {/* DRAG-AND-DROP UPLOAD SECTION */}
          <div className="admin-card" style={{ marginBottom: '24px' }}>
            <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="admin-card-title">DRAG-AND-DROP ASSET INGESTION DROPZONE</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target Category:</span>
                <select
                  className="admin-select"
                  style={{ width: 'auto', padding: '4px 10px', fontSize: '0.78rem' }}
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value as any)}
                >
                  <option value="general">General</option>
                  <option value="branding">Branding & Logos</option>
                  <option value="projects">Project Banners</option>
                  <option value="events">Event Posters</option>
                  <option value="achievements">Accolades & Trophies</option>
                </select>
              </div>
            </div>

            <div style={{ padding: '24px' }}>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  handleFileUpload(e.dataTransfer.files);
                }}
                style={{
                  border: isDragging ? '2px dashed var(--accent-cyan)' : '2px dashed var(--border-glass)',
                  background: isDragging ? 'rgba(6, 182, 212, 0.08)' : 'var(--surface-input)',
                  borderRadius: '12px',
                  padding: '36px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                }}
              >
                <div
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: uploading ? 'var(--accent-cyan)' : 'var(--text-muted)',
                  }}
                >
                  <Upload size={26} />
                </div>

                <div>
                  <div style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {uploading ? 'Encoding & Ingesting Assets...' : 'Drag and drop high-res visuals here, or browse files'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Images are stored in MongoDB Atlas with instant Base64 data URI serving (Max 5 MB per image)
                  </div>
                </div>

                <label
                  className="admin-btn admin-btn-primary"
                  style={{
                    cursor: uploading ? 'wait' : 'pointer',
                    padding: '8px 20px',
                    marginTop: '6px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Upload size={14} />
                  <span>{uploading ? 'Uploading...' : 'Browse Local Files'}</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    disabled={uploading}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* FILTER TOOLBAR */}
          <div
            style={{
              background: 'var(--surface-card)',
              border: '1px solid var(--border-glass)',
              borderRadius: '12px',
              padding: '14px 18px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  style={{
                    background: activeCategory === cat.id ? 'linear-gradient(135deg, #0284c7, #2563eb)' : 'var(--surface-input)',
                    color: activeCategory === cat.id ? '#ffffff' : 'var(--text-secondary)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: '8px',
                    padding: '6px 14px',
                    fontSize: '0.78rem',
                    fontWeight: activeCategory === cat.id ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search assets by title..."
                className="admin-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '34px', width: '240px', fontSize: '0.82rem' }}
              />
            </div>
          </div>

          {/* ASSET GALLERY GRID */}
          {loading ? (
            <VrDeviceLoader
              mode="card"
              title="SYNCHRONIZING MEDIA CATALOG..."
              subtext="Retrieving high-res spatial assets, video clips, and 3D textures from storage"
              badge="ASSET REPOSITORY"
            />
          ) : filteredAssets.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 20px',
                background: 'var(--surface-card)',
                borderRadius: '12px',
                border: '1px solid var(--border-glass)',
              }}
            >
              <ImageIcon size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px', opacity: 0.5 }} />
              <div style={{ fontSize: '0.92rem', color: 'var(--text-primary)', fontWeight: 600 }}>No media assets found</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {searchQuery ? 'Try adjusting your search criteria.' : 'Drop images into the dropzone above to build your gallery.'}
              </div>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '16px',
              }}
            >
              {filteredAssets.map((asset) => {
                const isCopied = copiedId === asset.id;
                return (
                  <div
                    key={asset.id}
                    className="admin-card"
                    style={{
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s ease, border-color 0.2s ease',
                    }}
                  >
                    {/* Thumbnail preview */}
                    <div
                      style={{
                        position: 'relative',
                        height: '160px',
                        background: '#090d16',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                      }}
                    >
                      <img
                        src={asset.data_url}
                        alt={asset.name || 'asset'}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.3s ease',
                        }}
                      />
                      
                      {/* Top Category Badge */}
                      <div
                        style={{
                          position: 'absolute',
                          top: '8px',
                          left: '8px',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: 'rgba(0,0,0,0.7)',
                          backdropFilter: 'blur(4px)',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          color: '#38bdf8',
                          textTransform: 'uppercase',
                        }}
                      >
                        {asset.category}
                      </div>

                      {/* Hover Overlay Actions */}
                      <button
                        type="button"
                        onClick={() => setSelectedPreview(asset)}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          padding: '6px',
                          borderRadius: '6px',
                          background: 'rgba(0,0,0,0.6)',
                          color: '#fff',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                        title="View Full Size"
                      >
                        <Eye size={14} />
                      </button>
                    </div>

                    {/* Metadata & Actions */}
                    <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, justifyContent: 'space-between' }}>
                      <div>
                        <div
                          style={{
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            color: 'var(--text-primary)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                          title={asset.name}
                        >
                          {asset.name}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          <span>{formatSize(asset.size_bytes)}</span>
                          <span>{new Date(asset.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '6px', borderTop: '1px solid var(--border-glass)', paddingTop: '10px' }}>
                        <button
                          type="button"
                          onClick={() => handleCopy(asset)}
                          className={`admin-btn ${isCopied ? 'admin-btn-primary' : 'admin-btn-secondary'} admin-btn-sm`}
                          style={{ flex: 1, fontSize: '0.74rem', padding: '6px 8px' }}
                        >
                          {isCopied ? <Check size={12} /> : <Copy size={12} />}
                          <span>{isCopied ? 'Copied' : 'Copy URL'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(asset.id, asset.name || 'asset')}
                          className="admin-btn admin-btn-danger admin-btn-sm"
                          style={{ padding: '6px 8px' }}
                          title="Delete asset"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* LIGHTBOX PREVIEW MODAL */}
          {selectedPreview && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 1000,
                background: 'rgba(0, 0, 0, 0.85)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
              }}
              onClick={() => setSelectedPreview(null)}
            >
              <div
                style={{
                  background: 'var(--surface-card)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '16px',
                  maxWidth: '850px',
                  width: '100%',
                  maxHeight: '90vh',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{selectedPreview.name}</h3>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{selectedPreview.original_name} • {formatSize(selectedPreview.size_bytes)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedPreview(null)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    <X size={20} />
                  </button>
                </div>

                <div style={{ padding: '20px', background: '#05070d', display: 'flex', alignItems: 'center', justifyContent: 'center', maxHeight: '550px', overflow: 'hidden' }}>
                  <img
                    src={selectedPreview.data_url}
                    alt={selectedPreview.name || 'preview'}
                    style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain', borderRadius: '8px' }}
                  />
                </div>

                <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                    Category: {selectedPreview.category}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(selectedPreview)}
                    className="admin-btn admin-btn-primary admin-btn-sm"
                  >
                    <Copy size={13} />
                    <span>Copy Image Data URL</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
