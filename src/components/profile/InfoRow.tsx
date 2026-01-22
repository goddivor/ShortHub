// src/components/profile/InfoRow.tsx
import React from 'react';

interface InfoRowProps {
  label: string;
  value: string | React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

const InfoRow: React.FC<InfoRowProps> = ({
  label,
  value,
  icon,
  className = '',
}) => {
  return (
    <div className={`flex items-start gap-3 py-3 ${className}`}>
      {icon && (
        <div className="flex-shrink-0 mt-0.5">
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
          {label}
        </p>
        <div className="text-sm text-gray-900">
          {value || <span className="text-gray-400 italic">Non renseigné</span>}
        </div>
      </div>
    </div>
  );
};

export default InfoRow;
