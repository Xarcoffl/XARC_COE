'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import { ExperienceLevel, CustomFormField } from '@/lib/types';
import { CheckCircle2, ArrowRight, Home, AlertCircle, Sparkles, Check } from 'lucide-react';
import Link from 'next/link';
import StudentHoloKeycard3D from '@/components/public/StudentHoloKeycard3D';
import { soundFx } from '@/lib/soundFx';

export default function RequestPage() {
  const [content, setContent] = useState<{
    title: string;
    subtitle: string;
    guidelines_heading: string;
    guidelines_description: string;
    eligibility_criteria: string[];
    interest_options: string[];
    keycard_title: string;
    keycard_badge: string;
    success_heading: string;
    success_message: string;
    custom_fields?: CustomFormField[];
  }>({
    title: 'Start Your XR Journey.',
    subtitle: 'Tell us what interests you. The AR/VR Centre of Excellence is a multidisciplinary research and incubation ecosystem open to curious builders across every engineering discipline.',
    guidelines_heading: 'ADMISSION GUIDELINES & SQUAD ALLOCATION',
    guidelines_description: 'Candidates are evaluated continuously based on technical enthusiasm, problem-solving mindset, and commitment. Formal prior XR experience is NOT required — beginner to advanced tracks are supported.',
    eligibility_criteria: [
      'Open to all undergraduate & postgraduate engineering students',
      'Minimum 4 hours/week commitment to lab projects or squad sprints',
      'Access granted to real hardware: Apple Vision Pro, Meta Quest 3, HoloLens 2, HTC Vive',
      'Mentorship by leading faculty researchers and XR industry partners',
    ],
    interest_options: [
      'AR',
      'VR',
      'MR',
      'XR',
      '3D Modelling',
      'Game Development',
      'Simulation',
      'Product Development',
      'UI/UX',
      'Research',
      'Hackathons',
      'Industry Projects',
      'Internships',
      'Certification',
      'Self-Learning',
      'Still Exploring',
    ],
    keycard_title: 'HOLO_KEYCARD // ADMISSION DOSSIER',
    keycard_badge: 'REAL-TIME 3D WAFER',
    success_heading: 'Welcome to the Frontier.',
    success_message: 'Your joining application has been securely transmitted to the AR/VR Centre of Excellence faculty committee. Look for an induction briefing sent to your personal email within 72 hours.',
    custom_fields: [],
  });

  const [customResponses, setCustomResponses] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/public/content?section=request')
      .then((res) => res.json())
      .then((res) => {
        if (res?.success && res.content) {
          setContent(res.content);
        }
      })
      .catch(() => {});
  }, []);
  const [formData, setFormData] = useState({
    full_name: '',
    register_number: '',
    department: 'Computer Science and Engineering',
    year: '2nd Year',
    section: 'A',
    email: '',
    mobile_number: '',
    interests: [] as string[],
    experience_level: 'New to XR' as ExperienceLevel,
    existing_skills: '',
    motivation: '',
    confirmed: false,
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const interestOptions = content.interest_options?.length ? content.interest_options : [
    'AR',
    'VR',
    'MR',
    'XR',
    '3D Modelling',
    'Game Development',
    'Simulation',
    'Product Development',
    'UI/UX',
    'Research',
    'Hackathons',
    'Industry Projects',
    'Internships',
    'Certification',
    'Self-Learning',
    'Still Exploring',
  ];

  const experienceOptions: ExperienceLevel[] = [
    'New to XR',
    'Beginner',
    'Intermediate',
    'Experienced',
  ];

  const departmentOptions = [
    'Computer Science and Engineering',
    'Information Technology',
    'Electronics and Communication Engineering',
    'Electrical and Electronics Engineering',
    'Mechanical Engineering',
    'Artificial Intelligence and Data Science',
    'Cyber Security',
    'Mechatronics Engineering',
    'Civil Engineering',
  ];

  const yearOptions = ['1st Year', '2nd Year', '3rd Year', 'Final Year'];

  const handleInterestToggle = (interest: string) => {
    soundFx.playSpatialClick();
    setFormData((prev) => {
      const exists = prev.interests.includes(interest);
      if (exists) {
        return { ...prev, interests: prev.interests.filter((i) => i !== interest) };
      } else {
        return { ...prev, interests: [...prev.interests, interest] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (!formData.full_name.trim()) return setErrorMsg('Full Name is required.');
    if (!formData.register_number.trim()) return setErrorMsg('Register Number is required.');
    if (!formData.email.trim() || !formData.email.includes('@')) {
      return setErrorMsg('A valid personal email address is required.');
    }
    if (!formData.mobile_number.trim()) return setErrorMsg('Mobile Number is required.');
    if (formData.interests.length === 0) return setErrorMsg('Please select at least one area of interest.');
    if (!formData.motivation.trim()) return setErrorMsg('Please explain why you want to join the AR/VR CoE.');

    // Validate required custom fields
    if (content.custom_fields && content.custom_fields.length > 0) {
      for (const cf of content.custom_fields) {
        if (cf.required && !customResponses[cf.id]?.trim()) {
          return setErrorMsg(`Please fill out the required field: "${cf.label}"`);
        }
      }
    }

    if (!formData.confirmed) return setErrorMsg('Please confirm that your submitted information is accurate.');

    setLoading(true);

    try {
      const res = await fetch('/api/public/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.full_name.trim(),
          register_number: formData.register_number.trim(),
          department: formData.department,
          year: formData.year,
          section: formData.section.trim(),
          email: formData.email.trim(),
          college_email: formData.email.trim(),
          mobile_number: formData.mobile_number.trim(),
          interests: formData.interests,
          experience_level: formData.experience_level,
          existing_skills: formData.existing_skills.trim(),
          motivation: formData.motivation.trim(),
          custom_field_responses: customResponses,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setErrorMsg(json.message || 'We could not submit your request. Please check your information and try again.');
        setLoading(false);
        return;
      }

      soundFx.playSuccessChime();
      setSubmitted(true);
    } catch {
      setErrorMsg('A network error occurred while submitting your request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="public-layout-root" style={{ position: 'relative', overflowX: 'hidden' }}>
      <Navbar />

      <section className="section-spacing" style={{ paddingTop: 'calc(var(--header-height) + 40px)', minHeight: '85vh' }}>
        <div className="container">
          {/* Successful Request Submission State (Spec #47) */}
          {submitted ? (
            <div
              className="glass-card hud-corner"
              style={{
                maxWidth: '680px',
                margin: '40px auto',
                padding: '56px 40px',
                textAlign: 'center',
                boxShadow: 'var(--shadow-glow)',
                position: 'relative',
              }}
            >
              <div className="tech-coord">SYS_TRANSMISSION: RECEIVED // HASH: 0x9F41E</div>

              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  background: 'rgba(0, 255, 255, 0.12)',
                  border: '2px solid var(--accent-cyan)',
                  color: 'var(--accent-cyan)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px auto',
                  boxShadow: '0 0 32px rgba(0, 255, 255, 0.35)',
                }}
              >
                <CheckCircle2 size={36} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                <span className="beacon-dot" />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent-cyan)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  ADMISSION DOSSIER LOGGED
                </span>
              </div>

              <h2 style={{ fontSize: '2.2rem', marginBottom: '16px', color: 'var(--text-primary)' }}>
                {content.success_heading || 'Welcome to the Frontier.'}
              </h2>

              <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.65', maxWidth: '520px', margin: '0 auto 24px auto' }}>
                {content.success_message || 'Your joining application has been securely transmitted to the AR/VR Centre of Excellence faculty committee.'}
              </p>

              {/* 3D Holographic Candidate Keycard (Locked / Submitted) */}
              <div style={{ maxWidth: '420px', margin: '0 auto 28px auto' }}>
                <StudentHoloKeycard3D
                  fullName={formData.full_name}
                  registerNumber={formData.register_number}
                  department={formData.department}
                  experienceLevel={formData.experience_level}
                  isSubmitted={true}
                />
              </div>

              <div>
                <Link href="/" className="btn-primary" style={{ padding: '12px 32px' }}>
                  <Home size={16} />
                  <span>Return to Command Console</span>
                </Link>
              </div>
            </div>
          ) : (
            /* Primary Form Layout: Left Column Branding / Right Column Form (Spec #40) */
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1.6fr',
                gap: '48px',
                alignItems: 'start',
              }}
              className="request-grid"
            >
              {/* Left Column: Context & Guidelines */}
              <div style={{ position: 'sticky', top: '100px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <span className="beacon-dot" />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-cyan)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    ADMISSIONS CONSOLE // 2025–2026 CYCLE
                  </span>
                </div>
                <h1 style={{ fontSize: 'clamp(2.2rem, 3.8vw, 3rem)', lineHeight: '1.15', marginBottom: '18px' }} className="text-gradient">
                  {content.title}
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.02rem', lineHeight: '1.6', marginBottom: '24px' }}>
                  {content.subtitle}
                </p>

                {/* Telemetry Strip */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
                  <div className="glass-card" style={{ padding: '14px 12px', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>5</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Verticals</div>
                  </div>
                  <div className="glass-card" style={{ padding: '14px 12px', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-blue)' }}>6-DoF</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hardware Lab</div>
                  </div>
                  <div className="glass-card" style={{ padding: '14px 12px', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-violet)' }}>1:1</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mentorship</div>
                  </div>
                </div>

                {/* Live 3D Holographic Candidate Keycard (Synchronized with input fields) */}
                <StudentHoloKeycard3D
                  fullName={formData.full_name}
                  registerNumber={formData.register_number}
                  department={formData.department}
                  experienceLevel={formData.experience_level}
                  isSubmitted={false}
                />

                <div className="glass-card hud-corner" style={{ padding: '24px', marginBottom: '24px' }}>
                  <div className="tech-coord">PROTOCOL: INDUCTION_WORKFLOW</div>
                  <h4 style={{ fontSize: '1rem', color: 'var(--accent-cyan)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={16} />
                    <span>{content.guidelines_heading}</span>
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '14px' }}>
                    {content.guidelines_description}
                  </p>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.86rem', color: 'var(--text-primary)' }}>
                    {content.eligibility_criteria?.map((item, idx) => (
                      <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-cyan)', marginTop: '7px', flexShrink: 0, boxShadow: '0 0 8px var(--accent-cyan)' }} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="glass-card" style={{ padding: '16px 20px', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.6', borderLeft: '3px solid var(--accent-cyan)' }}>
                  <strong style={{ color: 'var(--text-secondary)' }}>Data Privacy Guarantee:</strong> Student submission data is strictly restricted to authenticated CoE committee administrators and is never published or shared externally.
                </div>
              </div>

              {/* Right Column: Form (Spec #41-46) */}
              <div
                className="glass-card hud-corner"
                style={{
                  padding: '40px',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <span className="badge badge-cyan" style={{ marginBottom: '6px' }}>OFFICIAL CANDIDATE APPLICATION</span>
                    <h2 style={{ fontSize: '1.6rem', marginTop: '4px' }}>Student Joining Request</h2>
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>* REQUIRED FIELDS</span>
                </div>

                {errorMsg && (
                  <div
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      borderRadius: 'var(--radius-md)',
                      padding: '14px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      color: '#fca5a5',
                      fontSize: '0.9rem',
                      marginBottom: '24px',
                    }}
                  >
                    <AlertCircle size={20} style={{ flexShrink: 0 }} />
                    <div>{errorMsg}</div>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* SECTION 1: ABOUT YOU (Spec #41) */}
                  <div style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                      <span style={{ width: '4px', height: '16px', background: 'var(--accent-cyan)', borderRadius: '2px', display: 'inline-block' }} />
                      <h3 style={{ fontSize: '0.92rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
                        01 // CANDIDATE IDENTITY
                      </h3>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="form-row">
                      <div className="form-group">
                        <label className="form-label">
                          Full Name <span className="req">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          className="form-input"
                          placeholder="e.g. Ananya Krishnan"
                          value={formData.full_name}
                          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          Register Number <span className="req">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          className="form-input"
                          placeholder="e.g. 111422104012"
                          value={formData.register_number}
                          onChange={(e) => setFormData({ ...formData, register_number: e.target.value })}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px' }} className="form-row">
                      <div className="form-group">
                        <label className="form-label">
                          Department <span className="req">*</span>
                        </label>
                        <select
                          className="form-select"
                          value={formData.department}
                          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        >
                          {departmentOptions.map((dept) => (
                            <option key={dept} value={dept}>
                              {dept}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          Year <span className="req">*</span>
                        </label>
                        <select
                          className="form-select"
                          value={formData.year}
                          onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                        >
                          {yearOptions.map((yr) => (
                            <option key={yr} value={yr}>
                              {yr}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Section</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="A / B / C"
                          value={formData.section}
                          onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="form-row">
                      <div className="form-group">
                        <label className="form-label">
                          Personal Email Address <span className="req">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          className="form-input"
                          placeholder="e.g. yourname@gmail.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          Mobile Number <span className="req">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          className="form-input"
                          placeholder="+91 98401 23456"
                          value={formData.mobile_number}
                          onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: AREAS OF INTEREST (Spec #42) */}
                  <div style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ width: '4px', height: '16px', background: 'var(--accent-blue)', borderRadius: '2px', display: 'inline-block' }} />
                      <h3 style={{ fontSize: '0.92rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
                        02 // IMMERSIVE SPECIALIZATIONS <span className="req">*</span>
                      </h3>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '14px' }}>
                      Select all tracks that appeal to you (multi-select interest matrix):
                    </p>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                        gap: '10px',
                      }}
                    >
                      {interestOptions.map((opt) => {
                        const checked = formData.interests.includes(opt);
                        return (
                          <button
                            type="button"
                            key={opt}
                            onClick={() => handleInterestToggle(opt)}
                            style={{
                              background: checked ? 'var(--accent-cyan-glow)' : 'var(--surface-card)',
                              border: checked ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                              color: checked ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                              borderRadius: 'var(--radius-sm)',
                              padding: '10px 12px',
                              fontSize: '0.84rem',
                              fontFamily: 'var(--font-heading)',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              textAlign: 'center',
                              transition: 'all var(--transition-fast)',
                              boxShadow: checked ? '0 0 14px rgba(0, 255, 255, 0.25)' : 'none',
                            }}
                          >
                            {checked && (
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-cyan)', boxShadow: '0 0 6px var(--accent-cyan)' }} />
                            )}
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* SECTION 3: EXPERIENCE LEVEL & EXISTING SKILLS (Spec #43, #44) */}
                  <div style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                      <span style={{ width: '4px', height: '16px', background: 'var(--accent-violet)', borderRadius: '2px', display: 'inline-block' }} />
                      <h3 style={{ fontSize: '0.92rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
                        03 // EXPERIENCE & REPOSITORIES
                      </h3>
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        Experience Level in Spatial Tech / 3D <span className="req">*</span>
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                        {experienceOptions.map((lvl) => {
                          const isSel = formData.experience_level === lvl;
                          return (
                            <button
                              type="button"
                              key={lvl}
                              onClick={() => setFormData({ ...formData, experience_level: lvl })}
                              style={{
                                background: isSel ? 'var(--accent-blue-glow)' : 'var(--surface-card)',
                                border: isSel ? '1px solid var(--accent-blue)' : '1px solid var(--border-subtle)',
                                color: isSel ? 'var(--accent-blue)' : 'var(--text-secondary)',
                                padding: '10px 14px',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all var(--transition-fast)',
                                boxShadow: isSel ? '0 0 16px rgba(76, 125, 255, 0.3)' : 'none',
                              }}
                            >
                              {lvl}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        Existing Skills & Tools (Optional)
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. C#, Python, Blender, Unity basics, Three.js, UI design..."
                        value={formData.existing_skills}
                        onChange={(e) => setFormData({ ...formData, existing_skills: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* SECTION 4: DYNAMIC CUSTOM APPLICATION QUESTIONS */}
                  {content.custom_fields && content.custom_fields.length > 0 && (
                    <div style={{ marginBottom: '32px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                        <span style={{ width: '4px', height: '16px', background: 'var(--accent-cyan)', borderRadius: '2px', display: 'inline-block' }} />
                        <h3 style={{ fontSize: '0.92rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
                          04 // ADDITIONAL APPLICATION QUESTIONS
                        </h3>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                        {content.custom_fields.map((field) => (
                          <div key={field.id} className="form-group">
                            <label className="form-label">
                              {field.label} {field.required && <span className="req">*</span>}
                            </label>

                            {field.type === 'textarea' ? (
                              <textarea
                                required={field.required}
                                className="form-textarea"
                                placeholder={field.placeholder || 'Enter your response...'}
                                value={customResponses[field.id] || ''}
                                onChange={(e) => setCustomResponses({ ...customResponses, [field.id]: e.target.value })}
                                rows={3}
                              />
                            ) : field.type === 'select' ? (
                              <select
                                required={field.required}
                                className="form-input"
                                value={customResponses[field.id] || ''}
                                onChange={(e) => setCustomResponses({ ...customResponses, [field.id]: e.target.value })}
                              >
                                <option value="">{field.placeholder || '-- Select an option --'}</option>
                                {(field.options || []).map((opt) => (
                                  <option key={opt} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type={field.type === 'number' ? 'number' : 'text'}
                                required={field.required}
                                className="form-input"
                                placeholder={field.placeholder || ''}
                                value={customResponses[field.id] || ''}
                                onChange={(e) => setCustomResponses({ ...customResponses, [field.id]: e.target.value })}
                              />
                            )}

                            {field.help_text && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                {field.help_text}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SECTION 5: MOTIVATION (Spec #45) */}
                  <div style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <span style={{ width: '4px', height: '16px', background: 'var(--accent-magenta)', borderRadius: '2px', display: 'inline-block' }} />
                      <h3 style={{ fontSize: '0.92rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
                        {content.custom_fields && content.custom_fields.length > 0 ? '05' : '04'} // INTENT & OBJECTIVES <span className="req">*</span>
                      </h3>
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        Why do you want to join the AR/VR CoE? What problems or projects do you aspire to work on? <span className="req">*</span>
                      </label>
                      <textarea
                        required
                        className="form-textarea"
                        placeholder="Explain your goals, ideas, curiosity, and what you hope to learn or build..."
                        value={formData.motivation}
                        onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                        maxLength={1500}
                      />
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                        {formData.motivation.length} / 1500 CHARACTERS
                      </div>
                    </div>
                  </div>

                  {/* SECTION 5: CONFIRMATION (Spec #46) */}
                  <div style={{ marginBottom: '32px', padding: '18px 20px', background: 'var(--surface-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-subtle)' }}>
                    <label className="checkbox-group" style={{ cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={formData.confirmed}
                        onChange={(e) => setFormData({ ...formData, confirmed: e.target.checked })}
                      />
                      <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                        I confirm that the submitted information is accurate and that I am a bonafide student of this institution.
                      </span>
                    </label>
                  </div>

                  {/* Submission CTA (Spec #46) */}
                  <div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary"
                      style={{ width: '100%', padding: '14px 28px', fontSize: '1.05rem' }}
                    >
                      {loading ? (
                        <span>Processing Request...</span>
                      ) : (
                        <>
                          <span>Submit Request</span>
                          <ArrowRight size={18} />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
