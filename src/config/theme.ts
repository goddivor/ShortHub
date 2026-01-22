// src/config/theme.ts
// Design system configuration for ShortHub dashboard

export type UserRole = 'admin' | 'videaste' | 'assistant';

export interface RoleTheme {
  // Primary colors
  primary: string;           // Main accent color (hex)
  primaryLight: string;      // Light variant for backgrounds
  primaryDark: string;       // Dark variant for hover states

  // Tailwind class mappings
  bgPrimary: string;         // bg-{color}-600
  bgPrimaryLight: string;    // bg-{color}-50
  bgPrimaryLighter: string;  // bg-{color}-100
  textPrimary: string;       // text-{color}-600
  textPrimaryDark: string;   // text-{color}-700
  borderPrimary: string;     // border-{color}-600
  borderPrimaryLight: string;// border-{color}-200
  ringPrimary: string;       // ring-{color}-500

  // Gradient for profile headers
  headerGradient: string;
}

export const themes: Record<UserRole, RoleTheme> = {
  admin: {
    primary: '#DC2626',
    primaryLight: '#FEF2F2',
    primaryDark: '#B91C1C',
    bgPrimary: 'bg-red-600',
    bgPrimaryLight: 'bg-red-50',
    bgPrimaryLighter: 'bg-red-100',
    textPrimary: 'text-red-600',
    textPrimaryDark: 'text-red-700',
    borderPrimary: 'border-red-600',
    borderPrimaryLight: 'border-red-200',
    ringPrimary: 'ring-red-500',
    headerGradient: 'from-red-600 to-red-700',
  },
  videaste: {
    primary: '#2563EB',
    primaryLight: '#EFF6FF',
    primaryDark: '#1D4ED8',
    bgPrimary: 'bg-blue-600',
    bgPrimaryLight: 'bg-blue-50',
    bgPrimaryLighter: 'bg-blue-100',
    textPrimary: 'text-blue-600',
    textPrimaryDark: 'text-blue-700',
    borderPrimary: 'border-blue-600',
    borderPrimaryLight: 'border-blue-200',
    ringPrimary: 'ring-blue-500',
    headerGradient: 'from-blue-600 to-blue-700',
  },
  assistant: {
    primary: '#0891B2',
    primaryLight: '#ECFEFF',
    primaryDark: '#0E7490',
    bgPrimary: 'bg-cyan-600',
    bgPrimaryLight: 'bg-cyan-50',
    bgPrimaryLighter: 'bg-cyan-100',
    textPrimary: 'text-cyan-600',
    textPrimaryDark: 'text-cyan-700',
    borderPrimary: 'border-cyan-600',
    borderPrimaryLight: 'border-cyan-200',
    ringPrimary: 'ring-cyan-500',
    headerGradient: 'from-cyan-600 to-teal-700',
  },
};

// Design tokens
export const spacing = {
  xs: '4px',   // 1
  sm: '8px',   // 2
  md: '12px',  // 3
  lg: '16px',  // 4
  xl: '24px',  // 6
  '2xl': '32px', // 8
} as const;

export const borderRadius = {
  sm: '4px',   // rounded
  md: '8px',   // rounded-lg
  lg: '12px',  // rounded-xl
  full: '9999px', // rounded-full
} as const;

export const shadows = {
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
} as const;

// Common colors (role-agnostic)
export const colors = {
  // Text
  textPrimary: '#374151',    // gray-700
  textSecondary: '#6B7280',  // gray-500
  textMuted: '#9CA3AF',      // gray-400

  // Backgrounds
  bgPage: '#F9FAFB',         // gray-50
  bgCard: '#FFFFFF',         // white
  bgHover: '#F3F4F6',        // gray-100

  // Borders
  borderLight: '#E5E7EB',    // gray-200
  borderMedium: '#D1D5DB',   // gray-300

  // Status
  success: '#10B981',        // emerald-500
  warning: '#F59E0B',        // amber-500
  error: '#EF4444',          // red-500
  info: '#3B82F6',           // blue-500
} as const;

// Sidebar specific styles
export const sidebarStyles = {
  width: '256px',            // w-64
  widthCollapsed: '72px',    // w-18
  headerBg: '#1F2937',       // gray-800
  itemPadding: 'px-3 py-2.5',
  itemGap: 'gap-3',
  iconSize: 18,
  activeIndicatorWidth: '3px',
} as const;

// Helper function to get theme by role
export function getTheme(role: UserRole): RoleTheme {
  return themes[role];
}
