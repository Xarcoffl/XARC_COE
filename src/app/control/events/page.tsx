'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { EventItem, EventStatus } from '@/lib/types';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Star,
  Save,
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  Eye,
  Sun,
  Moon,
  Search,
  Sparkles,
  Image as ImageIcon,
  Check,
  Tag,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

const POSTER_PRESETS = [
  { label: 'VisionOS Masterclass', url: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=1200&auto=format&fit=crop' },
  { label: 'VR Hackathon Arena', url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200&auto=format&fit=crop' },
  { label: 'Spatial AI & Twins', url: 'https://images.unsplash.com/photo-1535223289827-42f1e9919769?q=80&w=1200&auto=format&fit=crop' },
  { label: 'Unreal Engine 5 Rig', url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1200&auto=format&fit=crop' },
  { label: 'Medical XR Lab', url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1200&auto=format&fit=crop' },
  { label: 'WebXR Metaverse Demo', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop' },
];

export default function AdminEventsStudioPage() {
  const [events, setEvents] = useState<Array<EventItem & { status?: EventStatus }>>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Partial<EventItem> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'split' | 'editor' | 'preview'>('split');
  const [previewTheme, setPreviewTheme] = useState<'dark' | 'light'>('dark');
  const [newHighlight, setNewHighlight] = useState('');
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const router = useRouter();

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/admin/events');
      if (res.status === 401) {
        router.push('/control/auth');
        return;
      }
      const data = await res.json();
      if (data.success && data.events?.length > 0) {
        setEvents(data.events);
        if (!selectedEvent && !isNew) {
          setSelectedEvent(data.events[0]);
        } else if (selectedEvent && !isNew) {
          const updated = data.events.find((e: EventItem) => e.id === selectedEvent.id);
          if (updated) setSelectedEvent(updated);
        }
      }
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleOpenNew = () => {
    setIsNew(true);
    setSelectedEvent({
      id: `event-${Date.now()}`,
      title: '',
      category: 'Workshop',
      poster: POSTER_PRESETS[0].url,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0],
      time: '09:30 AM – 04:30 PM',
      venue: 'AR/VR CoE Lab, Main Tech Tower, 2nd Floor',
      registration_url: '',
      short_desc: '',
      full_desc: '',
      highlights: ['Hands-on hardware rig provisioning', '1-on-1 industry mentor evaluations', 'Verified completion certification'],
      gallery: [],
      is_featured: false,
      is_published: true,
    });
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedEvent || !selectedEvent.title?.trim()) {
      setMsg({ text: 'Event title is required.', type: 'error' });
      return;
    }
    setSaving(true);
    setMsg(null);

    try {
      const method = isNew ? 'POST' : 'PUT';
      const res = await fetch('/api/admin/events', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedEvent),
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ text: isNew ? 'Event created successfully.' : 'Event updated successfully.', type: 'success' });
        setIsNew(false);
        fetchEvents();
        setTimeout(() => setMsg(null), 3000);
      } else {
        setMsg({ text: 'Failed to save event.', type: 'error' });
      }
    } catch {
      setMsg({ text: 'A network error occurred.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete event: "${title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/events?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMsg({ text: 'Event deleted.', type: 'success' });
        const remaining = events.filter((e) => e.id !== id);
        setEvents(remaining);
        setSelectedEvent(remaining[0] || null);
        setTimeout(() => setMsg(null), 3000);
      }
    } catch (err) {
      console.error('Error deleting event:', err);
    }
  };

  const handleToggleFeatured = async (event: EventItem) => {
    try {
      await fetch('/api/admin/events', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: event.id, is_featured: !event.is_featured }),
      });
      fetchEvents();
    } catch (err) {
      console.error('Error toggling featured:', err);
    }
  };

  const handleAddHighlight = () => {
    if (!selectedEvent || !newHighlight.trim()) return;
    const current = selectedEvent.highlights || [];
    setSelectedEvent({ ...selectedEvent, highlights: [...current, newHighlight.trim()] });
    setNewHighlight('');
  };

  const handleRemoveHighlight = (idx: number) => {
    if (!selectedEvent) return;
    const current = (selectedEvent.highlights || []).filter((_, i) => i !== idx);
    setSelectedEvent({ ...selectedEvent, highlights: current });
  };

  const handleAddGalleryImage = () => {
    if (!selectedEvent || !newGalleryUrl.trim()) return;
    const current = selectedEvent.gallery || [];
    setSelectedEvent({ ...selectedEvent, gallery: [...current, newGalleryUrl.trim()] });
    setNewGalleryUrl('');
  };

  const handleRemoveGalleryImage = (idx: number) => {
    if (!selectedEvent) return;
    const current = (selectedEvent.gallery || []).filter((_, i) => i !== idx);
    setSelectedEvent({ ...selectedEvent, gallery: current });
  };

  // Filtered Events
  const filteredEvents = events.filter((e) => {
    const matchCat = filterCategory === 'All' || e.category === filterCategory;
    const matchQuery =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.venue.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  const categories = ['All', 'Workshop', 'Hackathon', 'Guest Lecture', 'Symposium', 'Certification', 'Bootcamp'];

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        <AdminHeader
          title="Events & Activity Studio"
          subtitle="Interactive dual-pane studio with poster visualizer, highlight managers, live simulated preview, and zero 3D overhead"
        />

        <div className="admin-content" style={{ maxWidth: '1440px' }}>
          {/* Top Control Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            {/* View Mode Switchers */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setActiveTab('split')}
                className={`admin-btn admin-btn-sm ${activeTab === 'split' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
              >
                Split View (Live Preview)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('editor')}
                className={`admin-btn admin-btn-sm ${activeTab === 'editor' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
              >
                Editor Only
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`admin-btn admin-btn-sm ${activeTab === 'preview' ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
              >
                Preview Only
              </button>
            </div>

            {/* Quick Actions & Live Link */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={handleOpenNew}
                className="admin-btn admin-btn-primary admin-btn-sm"
              >
                <Plus size={14} />
                <span>Create New Event</span>
              </button>
              <Link
                href="/events"
                target="_blank"
                className="admin-btn admin-btn-secondary admin-btn-sm"
              >
                <ExternalLink size={13} />
                <span>Test Live /events</span>
              </Link>
            </div>
          </div>

          {msg && (
            <div
              style={{
                background: msg.type === 'success' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                border: `1px solid ${msg.type === 'success' ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                borderRadius: '6px',
                padding: '12px 16px',
                color: msg.type === 'success' ? '#86efac' : '#fca5a5',
                fontSize: '0.88rem',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              {msg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span>{msg.text}</span>
            </div>
          )}

          {/* Dual-Pane Studio Layout */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                activeTab === 'split' ? '1.25fr 1fr' : activeTab === 'editor' ? '1fr' : '0fr 1fr',
              gap: '24px',
              alignItems: 'start',
            }}
          >
            {/* LEFT COLUMN: EVENTS BROWSER & EDITOR */}
            {activeTab !== 'preview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* 1. Category Filter & Search Bar */}
                <div className="admin-card" style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setFilterCategory(cat)}
                          className={`admin-btn admin-btn-sm ${filterCategory === cat ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
                          style={{ fontSize: '0.78rem', padding: '4px 10px' }}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    <div style={{ position: 'relative', minWidth: '200px' }}>
                      <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        className="admin-input"
                        placeholder="Search events..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ paddingLeft: '32px', fontSize: '0.82rem', height: '34px' }}
                      />
                    </div>
                  </div>

                  {/* Horizontal Event Selector Chips */}
                  <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '6px' }}>
                    {loading ? (
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Loading events...</span>
                    ) : filteredEvents.length === 0 ? (
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>No matching events found.</span>
                    ) : (
                      filteredEvents.map((evt) => {
                        const isSelected = selectedEvent?.id === evt.id && !isNew;
                        return (
                          <button
                            key={evt.id}
                            type="button"
                            onClick={() => {
                              setSelectedEvent(evt);
                              setIsNew(false);
                            }}
                            style={{
                              background: isSelected ? 'rgba(2, 132, 199, 0.18)' : 'var(--surface-card-alt)',
                              border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                              borderRadius: '8px',
                              padding: '8px 12px',
                              textAlign: 'left',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              minWidth: '220px',
                              flexShrink: 0,
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <img
                              src={evt.poster}
                              alt=""
                              style={{ width: '38px', height: '38px', borderRadius: '6px', objectFit: 'cover' }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {evt.title}
                              </div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span>{evt.start_date}</span>
                                <span>•</span>
                                <span>{evt.category}</span>
                              </div>
                            </div>
                            {evt.is_featured && <Star size={12} fill="#eab308" color="#eab308" />}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* 2. Event Editor Form */}
                {selectedEvent ? (
                  <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Section: Core Event Information */}
                    <div className="admin-card">
                      <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 className="admin-card-title">
                          {isNew ? 'CREATE NEW EVENT' : `EDIT: ${selectedEvent.title || 'Untitled'}`}
                        </h3>
                        <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
                          {selectedEvent.category}
                        </span>
                      </div>
                      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div>
                          <label className="admin-field-label">Event Title</label>
                          <input
                            type="text"
                            className="admin-input"
                            placeholder="e.g. VisionOS & Spatial Computing Hackathon 2026"
                            value={selectedEvent.title || ''}
                            onChange={(e) => setSelectedEvent({ ...selectedEvent, title: e.target.value })}
                            required
                          />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <div>
                            <label className="admin-field-label">Category</label>
                            <select
                              className="admin-select"
                              value={selectedEvent.category || 'Workshop'}
                              onChange={(e) => setSelectedEvent({ ...selectedEvent, category: e.target.value })}
                            >
                              <option value="Workshop">Workshop</option>
                              <option value="Hackathon">Hackathon</option>
                              <option value="Guest Lecture">Guest Lecture</option>
                              <option value="Symposium">Symposium</option>
                              <option value="Certification">Certification</option>
                              <option value="Bootcamp">Bootcamp</option>
                            </select>
                          </div>
                          <div>
                            <label className="admin-field-label">Registration / External URL</label>
                            <input
                              type="url"
                              className="admin-input"
                              placeholder="https://..."
                              value={selectedEvent.registration_url || ''}
                              onChange={(e) => setSelectedEvent({ ...selectedEvent, registration_url: e.target.value })}
                            />
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                          <div>
                            <label className="admin-field-label">Start Date</label>
                            <input
                              type="date"
                              className="admin-input"
                              value={selectedEvent.start_date || ''}
                              onChange={(e) => setSelectedEvent({ ...selectedEvent, start_date: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <label className="admin-field-label">End Date</label>
                            <input
                              type="date"
                              className="admin-input"
                              value={selectedEvent.end_date || ''}
                              onChange={(e) => setSelectedEvent({ ...selectedEvent, end_date: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="admin-field-label">Daily Timing</label>
                            <input
                              type="text"
                              className="admin-input"
                              placeholder="09:30 AM – 04:30 PM"
                              value={selectedEvent.time || ''}
                              onChange={(e) => setSelectedEvent({ ...selectedEvent, time: e.target.value })}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="admin-field-label">Venue / Room Number</label>
                          <input
                            type="text"
                            className="admin-input"
                            placeholder="AR/VR Centre of Excellence, Room COE-204"
                            value={selectedEvent.venue || ''}
                            onChange={(e) => setSelectedEvent({ ...selectedEvent, venue: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section: Poster Visual & Presets */}
                    <div className="admin-card">
                      <div className="admin-card-header">
                        <h3 className="admin-card-title">EVENT POSTER & VISUAL PRESETS</h3>
                      </div>
                      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div>
                          <label className="admin-field-label">Poster Image URL</label>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                              type="url"
                              className="admin-input"
                              value={selectedEvent.poster || ''}
                              onChange={(e) => setSelectedEvent({ ...selectedEvent, poster: e.target.value })}
                            />
                            {selectedEvent.poster && (
                              <img
                                src={selectedEvent.poster}
                                alt="Preview"
                                style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }}
                              />
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="admin-field-label">Curated XR Poster Presets (Click to apply)</label>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                            {POSTER_PRESETS.map((preset) => (
                              <button
                                key={preset.label}
                                type="button"
                                onClick={() => setSelectedEvent({ ...selectedEvent, poster: preset.url })}
                                style={{
                                  background: 'var(--surface-card-alt)',
                                  border: selectedEvent.poster === preset.url ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                                  borderRadius: '6px',
                                  padding: '6px',
                                  cursor: 'pointer',
                                  textAlign: 'left',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                }}
                              >
                                <img
                                  src={preset.url}
                                  alt=""
                                  style={{ width: '30px', height: '30px', borderRadius: '4px', objectFit: 'cover' }}
                                />
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                                  {preset.label}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section: Narrative Descriptions */}
                    <div className="admin-card">
                      <div className="admin-card-header">
                        <h3 className="admin-card-title">DESCRIPTIONS & AGENDA</h3>
                      </div>
                      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div>
                          <label className="admin-field-label">Short Summary (Shown on Cards)</label>
                          <textarea
                            className="admin-textarea"
                            rows={2}
                            placeholder="Brief 1-2 sentence overview of the event..."
                            value={selectedEvent.short_desc || ''}
                            onChange={(e) => setSelectedEvent({ ...selectedEvent, short_desc: e.target.value })}
                          />
                        </div>

                        <div>
                          <label className="admin-field-label">Full Event Agenda & Syllabus</label>
                          <textarea
                            className="admin-textarea"
                            rows={4}
                            placeholder="Detailed schedule, prerequisites, toolchain instructions..."
                            value={selectedEvent.full_desc || ''}
                            onChange={(e) => setSelectedEvent({ ...selectedEvent, full_desc: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section: Highlights Manager */}
                    <div className="admin-card">
                      <div className="admin-card-header">
                        <h3 className="admin-card-title">EVENT HIGHLIGHTS & KEY TAKEAWAYS</h3>
                      </div>
                      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            type="text"
                            className="admin-input"
                            placeholder="Add takeaway bullet (e.g. Hands-on Apple Vision Pro rigs)..."
                            value={newHighlight}
                            onChange={(e) => setNewHighlight(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddHighlight();
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={handleAddHighlight}
                            className="admin-btn admin-btn-primary admin-btn-sm"
                          >
                            <Plus size={14} />
                            <span>Add</span>
                          </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {(selectedEvent.highlights || []).map((hl, idx) => (
                            <div
                              key={idx}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                background: 'var(--surface-card-alt)',
                                border: '1px solid var(--border-subtle)',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                fontSize: '0.84rem',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Check size={14} style={{ color: 'var(--accent-cyan)' }} />
                                <span>{hl}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveHighlight(idx)}
                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Section: Visibility & Actions Bar */}
                    <div
                      style={{
                        background: 'var(--surface-card)',
                        border: '1px solid var(--border-glass)',
                        borderRadius: '12px',
                        padding: '16px 20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                        position: 'sticky',
                        bottom: '20px',
                        zIndex: 20,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.84rem' }}>
                          <input
                            type="checkbox"
                            checked={Boolean(selectedEvent.is_featured)}
                            onChange={(e) => setSelectedEvent({ ...selectedEvent, is_featured: e.target.checked })}
                          />
                          <span>Feature on Homepage</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.84rem' }}>
                          <input
                            type="checkbox"
                            checked={selectedEvent.is_published !== false}
                            onChange={(e) => setSelectedEvent({ ...selectedEvent, is_published: e.target.checked })}
                          />
                          <span>Publicly Published</span>
                        </label>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {!isNew && selectedEvent.id && (
                          <button
                            type="button"
                            onClick={() => handleDelete(selectedEvent.id!, selectedEvent.title || '')}
                            className="admin-btn admin-btn-danger admin-btn-sm"
                          >
                            <Trash2 size={14} />
                            <span>Delete</span>
                          </button>
                        )}
                        <button
                          type="submit"
                          disabled={saving}
                          className="admin-btn admin-btn-primary"
                          style={{ padding: '8px 20px' }}
                        >
                          <Save size={15} />
                          <span>{saving ? 'Saving...' : isNew ? 'Publish Event' : 'Save Changes'}</span>
                        </button>
                      </div>
                    </div>
                  </form>
                ) : null}
              </div>
            )}

            {/* RIGHT COLUMN: SCROLLABLE LIVE SYNCED PREVIEW */}
            {activeTab !== 'editor' && selectedEvent && (
              <div
                style={{
                  position: 'sticky',
                  top: '90px',
                  background: 'var(--surface-card)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '16px',
                  padding: '20px',
                  boxShadow: 'var(--shadow-card)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  maxHeight: 'calc(100vh - 120px)',
                  overflowY: 'auto',
                }}
              >
                {/* PREVIEW HEADER */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Eye size={16} style={{ color: 'var(--accent-cyan)' }} />
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, letterSpacing: '0.05em' }}>LIVE EVENT PREVIEW</span>
                  </div>

                  {/* LIGHT / DARK SIMULATOR */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Simulate:</span>
                    <button
                      type="button"
                      onClick={() => setPreviewTheme(previewTheme === 'dark' ? 'light' : 'dark')}
                      style={{
                        background: previewTheme === 'dark' ? '#1f2937' : '#e0e7ff',
                        border: '1px solid var(--border-glass)',
                        borderRadius: '20px',
                        padding: '4px 10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: previewTheme === 'dark' ? '#f3f4f6' : '#1e1b4b',
                      }}
                    >
                      {previewTheme === 'dark' ? <Moon size={12} /> : <Sun size={12} />}
                      <span>{previewTheme.toUpperCase()}</span>
                    </button>
                  </div>
                </div>

                {/* SIMULATED BROWSER CHROME */}
                <div
                  style={{
                    background: previewTheme === 'dark' ? '#090d16' : '#ffffff',
                    color: previewTheme === 'dark' ? '#f3f4f6' : '#0f172a',
                    borderRadius: '12px',
                    border: previewTheme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.1)',
                    overflow: 'hidden',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {/* Browser Address Bar */}
                  <div
                    style={{
                      background: previewTheme === 'dark' ? '#111827' : '#f1f5f9',
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      borderBottom: previewTheme === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                    </div>
                    <div
                      style={{
                        flex: 1,
                        background: previewTheme === 'dark' ? 'rgba(255,255,255,0.05)' : '#ffffff',
                        borderRadius: '4px',
                        padding: '3px 8px',
                        fontSize: '0.72rem',
                        color: previewTheme === 'dark' ? '#9ca3af' : '#64748b',
                        textAlign: 'center',
                        fontFamily: 'monospace',
                      }}
                    >
                      https://coe.arvr.edu/events/{selectedEvent.slug || 'preview'}
                    </div>
                  </div>

                  {/* PREVIEW CONTAINER BODY */}
                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Event Card Simulation */}
                    <div
                      style={{
                        borderRadius: '12px',
                        background: previewTheme === 'dark' ? '#0f172a' : '#ffffff',
                        border: previewTheme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(2, 132, 199, 0.25)',
                        overflow: 'hidden',
                        boxShadow: previewTheme === 'dark' ? '0 10px 25px rgba(0,0,0,0.5)' : '0 10px 25px rgba(2, 132, 199, 0.1)',
                      }}
                    >
                      {/* Poster */}
                      <div style={{ height: '170px', position: 'relative', overflow: 'hidden' }}>
                        <img
                          src={selectedEvent.poster || POSTER_PRESETS[0].url}
                          alt=""
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div
                          style={{
                            position: 'absolute',
                            top: '12px',
                            left: '12px',
                            background: 'rgba(15, 23, 42, 0.85)',
                            backdropFilter: 'blur(8px)',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            color: '#38bdf8',
                            border: '1px solid rgba(56, 189, 248, 0.3)',
                          }}
                        >
                          {selectedEvent.category}
                        </div>
                        {selectedEvent.is_featured && (
                          <div
                            style={{
                              position: 'absolute',
                              top: '12px',
                              right: '12px',
                              background: '#eab308',
                              color: '#000000',
                              padding: '3px 8px',
                              borderRadius: '12px',
                              fontSize: '0.65rem',
                              fontWeight: 800,
                            }}
                          >
                            FEATURED
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem', color: previewTheme === 'dark' ? '#94a3b8' : '#64748b', marginBottom: '8px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={13} style={{ color: '#0284c7' }} />
                            {selectedEvent.start_date || 'Date TBD'}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={13} style={{ color: '#7c3aed' }} />
                            {selectedEvent.time || 'Timing TBD'}
                          </span>
                        </div>

                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: previewTheme === 'dark' ? '#f8fafc' : '#0f172a', marginBottom: '8px', lineHeight: 1.3 }}>
                          {selectedEvent.title || 'Untitled Event'}
                        </h3>

                        <p style={{ fontSize: '0.82rem', color: previewTheme === 'dark' ? '#cbd5e1' : '#475569', lineHeight: '1.5', marginBottom: '14px' }}>
                          {selectedEvent.short_desc || 'Brief event synopsis will appear here...'}
                        </p>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: previewTheme === 'dark' ? '#94a3b8' : '#64748b', marginBottom: '16px' }}>
                          <MapPin size={13} style={{ color: '#ec4899' }} />
                          <span>{selectedEvent.venue || 'CoE Lab, Main Block'}</span>
                        </div>

                        {/* Highlights */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                          {(selectedEvent.highlights || []).slice(0, 3).map((hl, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: previewTheme === 'dark' ? '#e2e8f0' : '#334155' }}>
                              <Check size={12} style={{ color: '#0284c7', flexShrink: 0 }} />
                              <span>{hl}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Detailed Syllabus Preview */}
                    <div
                      style={{
                        padding: '16px',
                        borderRadius: '10px',
                        background: previewTheme === 'dark' ? 'rgba(255,255,255,0.02)' : '#f8fafc',
                        border: previewTheme === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0',
                      }}
                    >
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.08em' }}>
                        AGENDA & DELIVERABLES
                      </span>
                      <p style={{ fontSize: '0.78rem', color: previewTheme === 'dark' ? '#cbd5e1' : '#475569', marginTop: '6px', lineHeight: 1.5 }}>
                        {selectedEvent.full_desc || 'Detailed agenda narrative will be displayed to students here.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
