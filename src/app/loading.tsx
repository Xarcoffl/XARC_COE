import React from 'react';
import VrDeviceLoader from '@/components/VrDeviceLoader';

export default function Loading() {
  return (
    <VrDeviceLoader
      mode="fullscreen"
      theme="auto"
      className="public-loading-page"
      title="INITIALIZING SPATIAL LAB ENVIRONMENT..."
      subtext="Calibrating stereoscopic viewpoint and loading AR/VR assets"
      badge="SPATIAL SUBSYSTEM INITIALIZING"
    />
  );
}
