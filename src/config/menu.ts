// src/config/menu.ts
// Menu configuration for each user role

import React from 'react';
import {
  Home,
  User,
  VideoPlay,
  Youtube,
  TrendUp,
  TaskSquare,
  Calendar,
  Setting,
  UserTag,
} from 'iconsax-react';
import type { UserRole } from './theme';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface MenuItemConfig {
  path: string;
  label: string;
  icon: React.ComponentType<any>;
  description?: string;
}

export interface MenuGroupConfig {
  id: string;
  title: string;
  items: MenuItemConfig[];
  collapsible?: boolean;
  defaultOpen?: boolean;
}

// Admin menu configuration
export const adminMenuGroups: MenuGroupConfig[] = [
  {
    id: 'general',
    title: 'GENERAL',
    collapsible: false,
    defaultOpen: true,
    items: [
      {
        path: '/admin/dashboard',
        label: 'Dashboard',
        icon: Home,
        description: 'Vue d\'ensemble',
      },
      {
        path: '/admin/calendar',
        label: 'Calendrier',
        icon: Calendar,
        description: 'Planning & deadlines',
      },
    ],
  },
  {
    id: 'manage',
    title: 'GESTION',
    collapsible: true,
    defaultOpen: true,
    items: [
      {
        path: '/admin/users',
        label: 'Utilisateurs',
        icon: User,
        description: 'Gestion des utilisateurs',
      },
      {
        path: '/admin/source-channels',
        label: 'Chaînes Sources',
        icon: VideoPlay,
        description: 'Chaînes à surveiller',
      },
      {
        path: '/admin/publication-channels',
        label: 'Chaînes Publication',
        icon: Youtube,
        description: 'Chaînes de publication',
      },
    ],
  },
  {
    id: 'production',
    title: 'PRODUCTION',
    collapsible: true,
    defaultOpen: true,
    items: [
      {
        path: '/admin/rolling',
        label: 'Rolling',
        icon: TrendUp,
        description: 'Génération de shorts',
      },
      {
        path: '/admin/shorts-tracking',
        label: 'Suivi des Shorts',
        icon: TaskSquare,
        description: 'Tracking et analytics',
      },
    ],
  },
  {
    id: 'settings',
    title: 'PARAMETRES',
    collapsible: true,
    defaultOpen: false,
    items: [
      {
        path: '/admin/profile',
        label: 'Mon Profil',
        icon: UserTag,
        description: 'Informations personnelles',
      },
      {
        path: '/admin/settings',
        label: 'Paramètres',
        icon: Setting,
        description: 'Configuration',
      },
    ],
  },
];

// Videaste menu configuration
export const videasteMenuGroups: MenuGroupConfig[] = [
  {
    id: 'general',
    title: 'GENERAL',
    collapsible: false,
    defaultOpen: true,
    items: [
      {
        path: '/videaste/dashboard',
        label: 'Dashboard',
        icon: Home,
        description: 'Vue d\'ensemble',
      },
      {
        path: '/videaste/calendar',
        label: 'Calendrier',
        icon: Calendar,
        description: 'Planning & deadlines',
      },
    ],
  },
  {
    id: 'content',
    title: 'CONTENU',
    collapsible: true,
    defaultOpen: true,
    items: [
      {
        path: '/videaste/shorts',
        label: 'Mes Shorts',
        icon: VideoPlay,
        description: 'Gérer mes vidéos',
      },
    ],
  },
  {
    id: 'account',
    title: 'MON COMPTE',
    collapsible: true,
    defaultOpen: false,
    items: [
      {
        path: '/videaste/profile',
        label: 'Mon Profil',
        icon: UserTag,
        description: 'Informations personnelles',
      },
    ],
  },
];

// Assistant menu configuration
export const assistantMenuGroups: MenuGroupConfig[] = [
  {
    id: 'general',
    title: 'GENERAL',
    collapsible: false,
    defaultOpen: true,
    items: [
      {
        path: '/assistant/dashboard',
        label: 'Dashboard',
        icon: Home,
        description: 'Vue d\'ensemble',
      },
      {
        path: '/assistant/calendar',
        label: 'Calendrier',
        icon: Calendar,
        description: 'Planning & deadlines',
      },
    ],
  },
  {
    id: 'work',
    title: 'TRAVAIL',
    collapsible: true,
    defaultOpen: true,
    items: [
      {
        path: '/assistant/videos',
        label: 'Vidéos',
        icon: VideoPlay,
        description: 'Vidéos du vidéaste',
      },
    ],
  },
  {
    id: 'account',
    title: 'MON COMPTE',
    collapsible: true,
    defaultOpen: false,
    items: [
      {
        path: '/assistant/profile',
        label: 'Mon Profil',
        icon: UserTag,
        description: 'Informations personnelles',
      },
    ],
  },
];

// Get menu groups by role
export function getMenuGroups(role: UserRole): MenuGroupConfig[] {
  switch (role) {
    case 'admin':
      return adminMenuGroups;
    case 'videaste':
      return videasteMenuGroups;
    case 'assistant':
      return assistantMenuGroups;
    default:
      return [];
  }
}

// Panel titles by role
export const panelTitles: Record<UserRole, string> = {
  admin: 'Admin Panel',
  videaste: 'Vidéaste Panel',
  assistant: 'Assistant Panel',
};
