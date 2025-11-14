// src/components/admin/users/EditUserModal.tsx
import React, { useState, useEffect } from 'react';
import SpinLoader from '@/components/SpinLoader';
import { CloseCircle, User as UserIcon, TickCircle, Lock } from 'iconsax-react';
import type { User } from '@/types/graphql';

interface EditUserFormData {
  email?: string;
  phone?: string;
  emailNotifications: boolean;
  whatsappNotifications: boolean;
}

interface EditUserModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onSubmit: (userId: string, data: EditUserFormData) => Promise<boolean>;
  isSubmitting?: boolean;
}

const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  user,
  onClose,
  onSubmit,
  isSubmitting = false
}) => {
  const [formData, setFormData] = useState<EditUserFormData>({
    email: '',
    phone: '',
    emailNotifications: true,
    whatsappNotifications: false,
  });
  const [localSubmitting, setLocalSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        phone: user.phone || '',
        emailNotifications: user.emailNotifications,
        whatsappNotifications: user.whatsappNotifications,
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLocalSubmitting(true);
    try {
      const success = await onSubmit(user.id, formData);
      if (success) {
        onClose();
      }
    } finally {
      setLocalSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!localSubmitting && !isSubmitting) {
      onClose();
    }
  };

  if (!isOpen || !user) return null;

  const submitting = localSubmitting || isSubmitting;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-lg p-2">
                <UserIcon size={24} color="white" variant="Bold" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Modifier l'utilisateur</h2>
                <p className="text-blue-100 text-sm mt-1">{user.username}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={submitting}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
            >
              <CloseCircle size={24} color="white" variant="Bold" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Info Badge */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Lock size={16} color="#2563EB" variant="Bold" className="mt-0.5" />
              <p className="text-xs text-blue-800">
                Seul l'utilisateur peut connecter/déconnecter ses comptes Google et WhatsApp depuis ses paramètres.
              </p>
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email {user.email ? '(Connecté)' : '(Non connecté)'}
            </label>
            <input
              type="email"
              value={formData.email}
              disabled
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
              placeholder="Non renseigné"
            />
          </div>

          {/* Phone Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Téléphone {user.phone ? '(Connecté)' : '(Non connecté)'}
            </label>
            <input
              type="tel"
              value={formData.phone}
              disabled
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
              placeholder="Non renseigné"
            />
          </div>

          {/* Email Notifications Toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-900">
                Notifications Email
              </label>
              <p className="text-xs text-gray-600 mt-0.5">
                {user.email ? 'Activer les notifications par email' : 'Email non connecté'}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.emailNotifications}
                onChange={(e) => setFormData({ ...formData, emailNotifications: e.target.checked })}
                disabled={submitting || !user.email}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
            </label>
          </div>

          {/* WhatsApp Notifications Toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-900">
                Notifications WhatsApp
              </label>
              <p className="text-xs text-gray-600 mt-0.5">
                {user.phone ? 'Activer les notifications par WhatsApp' : 'WhatsApp non connecté'}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.whatsappNotifications}
                onChange={(e) => setFormData({ ...formData, whatsappNotifications: e.target.checked })}
                disabled={submitting || !user.phone}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold text-gray-700 transition-colors disabled:opacity-50"
              disabled={submitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <SpinLoader />
                  <span>Mise à jour...</span>
                </>
              ) : (
                <>
                  <TickCircle size={18} color="white" variant="Bold" />
                  <span>Mettre à jour</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;
