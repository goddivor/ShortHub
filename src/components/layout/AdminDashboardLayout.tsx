// src/components/layout/AdminDashboardLayout.tsx
import React from 'react';
import BaseDashboardLayout from './BaseDashboardLayout';
import { themes } from '@/config/theme';
import { adminMenuGroups, panelTitles } from '@/config/menu';

const AdminDashboardLayout: React.FC = () => {
  return (
    <BaseDashboardLayout
      role="admin"
      panelTitle={panelTitles.admin}
      menuGroups={adminMenuGroups}
      theme={themes.admin}
    />
  );
};

export default AdminDashboardLayout;
