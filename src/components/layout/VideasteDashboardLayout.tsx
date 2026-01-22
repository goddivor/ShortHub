// src/components/layout/VideasteDashboardLayout.tsx
import React from 'react';
import BaseDashboardLayout from './BaseDashboardLayout';
import { themes } from '@/config/theme';
import { videasteMenuGroups, panelTitles } from '@/config/menu';

const VideasteDashboardLayout: React.FC = () => {
  return (
    <BaseDashboardLayout
      role="videaste"
      panelTitle={panelTitles.videaste}
      menuGroups={videasteMenuGroups}
      theme={themes.videaste}
    />
  );
};

export default VideasteDashboardLayout;
