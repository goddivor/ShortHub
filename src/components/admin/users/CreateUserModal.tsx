// src/components/admin/users/CreateUserModal.tsx
import React, { useState } from 'react';
import { UserRole } from '@/types/graphql';
import SpinLoader from '@/components/SpinLoader';
import { CloseCircle, User, Sms, Lock, Profile2User } from 'iconsax-react';

interface CreateUserFormData {
  username: string;
  email: string;
  password: string;
  role: UserRole;
}

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserFormData) => Promise<boolean>;
  isSubmitting?: boolean;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false
}) => {
  const [formData, setFormData] = useState<CreateUserFormData>({
    username: '',
    email: '',
    password: '',
    role: UserRole.VIDEASTE,
  });
  const [localSubmitting, setLocalSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalSubmitting(true);
    try {
      const success = await onSubmit(formData);
      if (success) {
        setFormData({ username: '', email: '', password: '', role: UserRole.VIDEASTE });
        onClose();
      }
    } finally {
      setLocalSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!localSubmitting && !isSubmitting) {
      setFormData({ username: '', email: '', password: '', role: UserRole.VIDEASTE });
      onClose();
    }
  };

  if (!isOpen) return null;

  const submitting = localSubmitting || isSubmitting;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-lg p-2">
                <User size={24} color="white" variant="Bold" />
              </div>
              <h2 className="text-2xl font-bold">Nouvel Utilisateur</h2>
            </div>
            <button
              onClick={handleClose}
              disabled={submitting}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
            >
              <CloseCircle size={24} color="white" variant="Bold" />
            </button>
          </div>
          <p className="text-red-100 text-sm mt-2">
            Créer un nouveau compte utilisateur dans le système
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Username Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nom d'utilisateur *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={18} color="#9CA3AF" variant="Bold" />
              </div>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                placeholder="Ex: john_doe"
                required
                disabled={submitting}
              />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Adresse email *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Sms size={18} color="#9CA3AF" variant="Bold" />
              </div>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                placeholder="Ex: john@example.com"
                required
                disabled={submitting}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mot de passe *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} color="#9CA3AF" variant="Bold" />
              </div>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                placeholder="Minimum 8 caractères"
                required
                minLength={8}
                disabled={submitting}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Le mot de passe doit contenir au moins 8 caractères
            </p>
          </div>

          {/* Role Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Rôle *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Profile2User size={18} color="#9CA3AF" variant="Bold" />
              </div>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all appearance-none bg-white"
                disabled={submitting}
              >
                <option value={UserRole.VIDEASTE}>Vidéaste</option>
                <option value={UserRole.ASSISTANT}>Assistant</option>
              </select>
            </div>
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
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg font-semibold disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <SpinLoader />
                  <span>Création...</span>
                </>
              ) : (
                <>
                  <User size={18} color="white" variant="Bold" />
                  <span>Créer</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal;
