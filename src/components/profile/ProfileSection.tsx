// src/components/profile/ProfileSection.tsx
import React from 'react';

interface ProfileSectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({
  title,
  icon,
  children,
  actions,
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      {/* Section header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex-shrink-0">
              {icon}
            </div>
          )}
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        </div>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>

      {/* Section content */}
      <div className="px-6 py-4">
        {children}
      </div>
    </div>
  );
};

export default ProfileSection;
