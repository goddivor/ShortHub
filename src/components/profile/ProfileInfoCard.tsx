// src/components/profile/ProfileInfoCard.tsx
import React, { useState } from 'react';
import { Edit2, TickCircle, CloseCircle, User, Sms, Mobile } from 'iconsax-react';
import type { RoleTheme } from '@/config/theme';
import ProfileSection from './ProfileSection';
import InfoRow from './InfoRow';

interface ProfileInfoCardProps {
  user: {
    username?: string;
    email?: string;
    phone?: string;
    role?: string;
  } | null;
  theme: RoleTheme;
  isUpdating?: boolean;
  onUpdateUsername?: (username: string) => Promise<void>;
  onUpdateContact?: (data: { email?: string; phone?: string }) => Promise<void>;
}

const ProfileInfoCard: React.FC<ProfileInfoCardProps> = ({
  user,
  theme,
  isUpdating = false,
  onUpdateUsername,
  onUpdateContact,
}) => {
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [newUsername, setNewUsername] = useState(user?.username || '');
  const [newEmail, setNewEmail] = useState(user?.email || '');
  const [newPhone, setNewPhone] = useState(user?.phone || '');

  const roleLabels: Record<string, string> = {
    ADMIN: 'Administrateur',
    VIDEASTE: 'Vidéaste',
    ASSISTANT: 'Assistant',
  };

  const handleUsernameSubmit = async () => {
    if (!onUpdateUsername || !newUsername.trim()) return;
    try {
      await onUpdateUsername(newUsername.trim());
      setIsEditingUsername(false);
    } catch {
      // Error handled by parent
    }
  };

  const handleContactSubmit = async () => {
    if (!onUpdateContact) return;
    try {
      await onUpdateContact({ email: newEmail.trim(), phone: newPhone.trim() });
      setIsEditingContact(false);
    } catch {
      // Error handled by parent
    }
  };

  const cancelUsernameEdit = () => {
    setNewUsername(user?.username || '');
    setIsEditingUsername(false);
  };

  const cancelContactEdit = () => {
    setNewEmail(user?.email || '');
    setNewPhone(user?.phone || '');
    setIsEditingContact(false);
  };

  return (
    <div className="space-y-4">
      {/* User Identity Section */}
      <ProfileSection
        title="Informations personnelles"
        icon={<User size={20} color="#374151" />}
        actions={
          onUpdateUsername && !isEditingUsername && (
            <button
              onClick={() => setIsEditingUsername(true)}
              className={`p-2 ${theme.bgPrimaryLight} hover:${theme.bgPrimaryLighter} rounded-lg transition-colors`}
              title="Modifier"
            >
              <Edit2 size={16} color={theme.primary} />
            </button>
          )
        }
      >
        {isEditingUsername ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Nom d'utilisateur
              </label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className={`w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 ${theme.ringPrimary} focus:border-transparent`}
                placeholder="Votre nom d'utilisateur"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleUsernameSubmit}
                disabled={isUpdating || !newUsername.trim()}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 ${theme.bgPrimary} hover:opacity-90 text-white rounded-lg font-medium disabled:opacity-50 transition-all`}
              >
                <TickCircle size={18} color="white" />
                Enregistrer
              </button>
              <button
                onClick={cancelUsernameEdit}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            <InfoRow
              label="Nom d'utilisateur"
              value={user?.username}
              icon={<User size={18} color="#6B7280" />}
            />
            <InfoRow
              label="Rôle"
              value={
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${theme.bgPrimaryLight} ${theme.textPrimary}`}>
                  {user?.role ? roleLabels[user.role] || user.role : ''}
                </span>
              }
            />
          </div>
        )}
      </ProfileSection>

      {/* Contact Section */}
      <ProfileSection
        title="Coordonnées"
        icon={<Sms size={20} color="#374151" />}
        actions={
          onUpdateContact && !isEditingContact && (
            <button
              onClick={() => setIsEditingContact(true)}
              className={`p-2 ${theme.bgPrimaryLight} hover:${theme.bgPrimaryLighter} rounded-lg transition-colors`}
              title="Modifier"
            >
              <Edit2 size={16} color={theme.primary} />
            </button>
          )
        }
      >
        {isEditingContact ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className={`w-full px-3 py-2.5 pl-10 border border-gray-300 rounded-lg focus:ring-2 ${theme.ringPrimary} focus:border-transparent`}
                  placeholder="votre@email.com"
                />
                <Sms size={18} color="#6B7280" className="absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Téléphone
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className={`w-full px-3 py-2.5 pl-10 border border-gray-300 rounded-lg focus:ring-2 ${theme.ringPrimary} focus:border-transparent`}
                  placeholder="+33 6 12 34 56 78"
                />
                <Mobile size={18} color="#6B7280" className="absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleContactSubmit}
                disabled={isUpdating}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 ${theme.bgPrimary} hover:opacity-90 text-white rounded-lg font-medium disabled:opacity-50 transition-all`}
              >
                <TickCircle size={18} color="white" />
                Enregistrer
              </button>
              <button
                onClick={cancelContactEdit}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            <InfoRow
              label="Email"
              value={
                user?.email ? (
                  <div className="flex items-center gap-2">
                    <span>{user.email}</span>
                    <TickCircle size={16} color="#10B981" />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-400">
                    <span>Non renseigné</span>
                    <CloseCircle size={16} color="#9CA3AF" />
                  </div>
                )
              }
              icon={<Sms size={18} color="#6B7280" />}
            />
            <InfoRow
              label="Téléphone"
              value={
                user?.phone ? (
                  <div className="flex items-center gap-2">
                    <span>{user.phone}</span>
                    <TickCircle size={16} color="#10B981" />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-400">
                    <span>Non renseigné</span>
                    <CloseCircle size={16} color="#9CA3AF" />
                  </div>
                )
              }
              icon={<Mobile size={18} color="#6B7280" />}
            />
          </div>
        )}
      </ProfileSection>
    </div>
  );
};

export default ProfileInfoCard;
