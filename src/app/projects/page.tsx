import React from 'react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import SectionHeader from '@/components/public/SectionHeader';
import ProjectsFilterView from '@/components/public/ProjectsFilterView';
import ProjectHolodeck3D from '@/components/public/ProjectHolodeck3D';
import { getPublicProjects } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProjectsPage() {
  const allProjects = await getPublicProjects();

  return (
    <div className="public-layout-root" style={{ position: 'relative', overflowX: 'hidden' }}>
      <Navbar />

      {/* Hero */}
      <section className="hero-wrapper" style={{ minHeight: '50vh', paddingBottom: '20px' }}>
        <div className="container">
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <div className="section-tag">ENGINEERING PORTFOLIO</div>
            <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.8rem)', marginBottom: '16px', lineHeight: '1.1' }}>
              Projects & <span className="text-gradient">Innovation</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.15rem', lineHeight: '1.6', maxWidth: '640px', margin: '0 auto' }}>
              Explore immersive technology solutions developed through the AR/VR Centre of Excellence, spanning industrial simulations, medical holograms, and spatial digital twins.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Projects Grid with Category Filters (Spec #31, #99) */}
      <section className="section-spacing" style={{ paddingTop: '20px' }}>
        <div className="container">
          {/* Interactive 3D Spatial Holodeck Previewer */}
          <ProjectHolodeck3D />

          <ProjectsFilterView initialProjects={allProjects} />
        </div>
      </section>

      <Footer />
    </div>
  );
}
