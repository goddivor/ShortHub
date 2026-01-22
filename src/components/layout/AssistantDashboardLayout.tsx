// src/components/layout/AssistantDashboardLayout.tsx
import React from 'react';
import BaseDashboardLayout from './BaseDashboardLayout';
import { themes } from '@/config/theme';
import { assistantMenuGroups, panelTitles } from '@/config/menu';

const AssistantDashboardLayout: React.FC = () => {
  return (
    <BaseDashboardLayout
      role="assistant"
      panelTitle={panelTitles.assistant}
      menuGroups={assistantMenuGroups}
      theme={themes.assistant}
      showAssignedTo={true}
    />
  );
};

export default AssistantDashboardLayout;
