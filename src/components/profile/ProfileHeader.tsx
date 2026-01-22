// src/components/profile/ProfileHeader.tsx
import React, { useRef } from 'react';
import { User, Camera, Trash } from 'iconsax-react';
import type { RoleTheme } from '@/config/theme';
import SpinLoader from '@/components/SpinLoader';

interface ProfileHeaderProps {
  user: {
    username?: string;
    profileImage?: string;
    role?: string;
    assignedTo?: {
      username: string;
    };
  } | null;
  theme: RoleTheme;
  isUploading?: boolean;
  isRemoving?: boolean;
  onImageUpload?: (base64: string) => void;
  onImageRemove?: () => void;
  showAssignedTo?: boolean;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  theme,
  isUploading = false,
  isRemoving = false,
  onImageUpload,
  onImageRemove,
  showAssignedTo = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const roleLabels: Record<string, string> = {
    ADMIN: 'Administrateur',
    VIDEASTE: 'Vidéaste',
    ASSISTANT: 'Assistant',
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !onImageUpload) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      onImageUpload(base64);
    };
    reader.readAsDataURL(file);

    // Reset input
    event.target.value = '';
  };

  const isLoading = isUploading || isRemoving;

  return (
    <div className={`relative rounded-2xl overflow-hidden bg-gradient-to-r ${theme.headerGradient} shadow-lg`}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />
      </div>

      <div className="relative px-6 py-8 flex flex-col sm:flex-row items-center gap-6">
        {/* Avatar */}
        <div className="relative group">
          <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 overflow-hidden flex items-center justify-center">
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={48} color="white" />
            )}
          </div>

          {/* Upload/remove overlay */}
          {(onImageUpload || onImageRemove) && (
            <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              {isLoading ? (
                <SpinLoader />
              ) : (
                <>
                  {onImageUpload && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className={`p-2 ${theme.bgPrimary} hover:opacity-90 rounded-full transition-colors`}
                      title="Changer la photo"
                    >
                      <Camera size={16} color="white" variant="Bold" />
                    </button>
                  )}
                  {onImageRemove && user?.profileImage && (
                    <button
                      onClick={onImageRemove}
                      className="p-2 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
                      title="Supprimer la photo"
                    >
                      <Trash size={16} color="white" variant="Bold" />
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* User info */}
        <div className="text-center sm:text-left text-white">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">
            {user?.username || 'Utilisateur'}
          </h1>
          <p className="text-white/80 text-sm mb-2">
            {user?.role ? roleLabels[user.role] || user.role : ''}
          </p>

          {/* Assigned to badge (for assistants) */}
          {showAssignedTo && user?.assignedTo && (
            <div className="inline-flex items-center gap-2 mt-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5">
              <span className="text-sm text-white/90">
                Assigné à: <span className="font-semibold">{user.assignedTo.username}</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
