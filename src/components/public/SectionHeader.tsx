import React from 'react';

interface SectionHeaderProps {
  tag?: string;
  title: string;
  titleGradient?: string;
  description?: string;
  centered?: boolean;
}

export default function SectionHeader({
  tag,
  title,
  titleGradient,
  description,
  centered = true,
}: SectionHeaderProps) {
  return (
    <div className="section-header" style={{ textAlign: centered ? 'center' : 'left', margin: centered ? '0 auto 52px auto' : '0 0 40px 0' }}>
      {tag && <div className="section-tag">{tag}</div>}
      <h2 className="section-title">
        {title}{' '}
        {titleGradient && <span className="text-gradient">{titleGradient}</span>}
      </h2>
      {description && <p className="section-description">{description}</p>}
    </div>
  );
}
