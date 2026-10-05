'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Home,
  Info,
  FileText,
  Layers,
  FolderGit2,
  Calendar,
  Trophy,
  Building2,
  UserCheck,
  Settings,
  LogOut,
  ExternalLink,
  PanelBottom,
} from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/control/auth');
    } catch {
      router.push('/control/auth');
    }
  };

  const navGroups = [
    {
      title: 'OVERVIEW',
      items: [
        { label: 'Dashboard', href: '/control/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'WEBSITE CONTENT',
      items: [
        { label: 'Home Page', href: '/control/content/home', icon: Home },
        { label: 'About Page', href: '/control/content/about', icon: Info },
        { label: 'Request Form', href: '/control/content/request', icon: FileText },
        { label: 'Footer Content', href: '/control/content/footer', icon: PanelBottom },
        { label: 'Verticals', href: '/control/verticals', icon: Layers },
        { label: 'Projects', href: '/control/projects', icon: FolderGit2 },
        { label: 'Events', href: '/control/events', icon: Calendar },
        { label: 'Achievements', href: '/control/achievements', icon: Trophy },
        { label: 'Industry', href: '/control/industry', icon: Building2 },
      ],
    },
    {
      title: 'STUDENT PIPELINE',
      items: [
        { label: 'Student Requests', href: '/control/requests', icon: UserCheck },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        { label: 'Settings & Profile', href: '/control/settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside className="admin-sidebar">
      {/* Brand Header */}
      <div className="admin-sidebar-header">
        <div className="admin-brand-icon">
          XR
        </div>
        <div>
          <div className="admin-brand-title">AR/VR COE ADMIN</div>
          <div className="admin-brand-sub">Management Portal</div>
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className="admin-nav">
        {navGroups.map((group) => (
          <div key={group.title}>
            <div className="admin-nav-group-title">{group.title}</div>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/control/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`admin-nav-item ${isActive ? 'active' : ''}`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Sidebar Footer */}
      <div className="admin-sidebar-footer">
        <Link
          href="/"
          target="_blank"
          className="admin-btn admin-btn-secondary admin-btn-sm"
          title="Open Public Site"
        >
          <ExternalLink size={14} />
          <span>View Site</span>
        </Link>

        <button
          onClick={handleLogout}
          className="admin-btn admin-btn-danger admin-btn-sm"
          title="Sign Out"
        >
          <LogOut size={14} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
