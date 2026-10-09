import React from 'react';
import VrDeviceLoader from '@/components/VrDeviceLoader';

export default function AdminLoading() {
  return (
    <VrDeviceLoader
      mode="fullscreen"
      theme="dark"
      className="admin-loading-page"
      title="CONNECTING TO COE CONTROL CORE..."
      subtext="Authenticating secure session and synchronizing telemetry data"
      badge="ADMIN TELEMETRY CORE"
    />
  );
}
