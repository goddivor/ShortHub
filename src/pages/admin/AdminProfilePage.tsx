// src/pages/admin/AdminProfilePage.tsx
import React, { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMutation } from '@apollo/client/react';
import { UPLOAD_PROFILE_IMAGE_MUTATION, REMOVE_PROFILE_IMAGE_MUTATION } from '@/lib/graphql';
import { useToast } from '@/context/toast-context';
import SpinLoader from '@/components/SpinLoader';
import {
  UserTag,
  Lock,
  Eye,
  EyeSlash,
  TickCircle,
  Edit2,
  Sms,
  Whatsapp,
  Shield,
  Camera,
  Trash
} from 'iconsax-react';

const AdminProfilePage: React.FC = () => {
  const { user, refetchUser } = useAuth();
  const { success, error } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [uploadProfileImage, { loading: uploadingImage }] = useMutation(UPLOAD_PROFILE_IMAGE_MUTATION, {
    onCompleted: async () => {
      await refetchUser();
    }
  });
  const [removeProfileImage, { loading: removingImage }] = useMutation(REMOVE_PROFILE_IMAGE_MUTATION, {
    onCompleted: async () => {
      await refetchUser();
    }
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      error('Erreur', 'Veuillez sélectionner une image valide');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      error('Erreur', 'L\'image ne doit pas dépasser 5 MB');
      return;
    }

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;

        try {
          await uploadProfileImage({
            variables: { base64Image: base64String }
          });

          success('Image uploadée', 'Votre image de profil a été mise à jour avec succès');
        } catch (err) {
          error('Erreur', err instanceof Error ? err.message : 'Impossible d\'uploader l\'image');
        }
      };

      reader.readAsDataURL(file);
    } catch (err) {
      error('Erreur', 'Erreur lors de la lecture du fichier');
    }
  };

  const handleRemoveImage = async () => {
    try {
      await removeProfileImage();
      success('Image supprimée', 'Votre image de profil a été supprimée');
    } catch (err) {
      error('Erreur', err instanceof Error ? err.message : 'Impossible de supprimer l\'image');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      error('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    if (newPassword.length < 6) {
      error('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Implement password change logic
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Reset form
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsEditingPassword(false);
      success('Mot de passe modifié', 'Votre mot de passe a été modifié avec succès');
    } catch (err) {
      error('Erreur', 'Erreur lors de la modification du mot de passe');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <SpinLoader />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-6">
          {/* Profile Image */}
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-white/20 backdrop-blur-sm border-4 border-white/30">
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <UserTag size={48} color="white" variant="Bold" />
                </div>
              )}
            </div>

            {/* Upload/Remove overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage || removingImage}
                  className="p-2 bg-blue-500 hover:bg-blue-600 rounded-full transition-colors disabled:opacity-50"
                  title="Changer la photo"
                >
                  {uploadingImage ? (
                    <SpinLoader />
                  ) : (
                    <Camera size={20} color="white" variant="Bold" />
                  )}
                </button>

                {user.profileImage && (
                  <button
                    onClick={handleRemoveImage}
                    disabled={uploadingImage || removingImage}
                    className="p-2 bg-red-500 hover:bg-red-600 rounded-full transition-colors disabled:opacity-50"
                    title="Supprimer la photo"
                  >
                    {removingImage ? (
                      <SpinLoader />
                    ) : (
                      <Trash size={20} color="white" variant="Bold" />
                    )}
                  </button>
                )}
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          <div>
            <h1 className="text-3xl font-bold mb-1">Mon Profil</h1>
            <p className="text-blue-100">Gérez vos informations personnelles</p>
          </div>
        </div>
      </div>

      {/* User Information Card */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <UserTag size={20} color="#111827" variant="Bold" />
            Informations personnelles
          </h2>
        </div>

        <div className="p-6 space-y-4">
          {/* Username */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700">Nom d'utilisateur</label>
              <p className="text-base text-gray-900 mt-1">{user.username}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserTag size={20} color="#2563EB" variant="Bold" />
            </div>
          </div>

          {/* Role */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700">Rôle</label>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                  {user.role}
                </span>
              </div>
            </div>
            <div className="p-2 bg-red-100 rounded-lg">
              <Shield size={20} color="#DC2626" variant="Bold" />
            </div>
          </div>

          {/* Email */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700">
                Email {user.email ? '(Connecté)' : '(Non connecté)'}
              </label>
              <p className="text-base text-gray-900 mt-1">
                {user.email || 'Non renseigné'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Géré depuis vos paramètres de compte
              </p>
            </div>
            <div className={`p-2 rounded-lg ${user.email ? 'bg-green-100' : 'bg-gray-200'}`}>
              <Sms size={20} color={user.email ? '#059669' : '#6B7280'} variant="Bold" />
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700">
                Téléphone {user.phone ? '(Connecté)' : '(Non connecté)'}
              </label>
              <p className="text-base text-gray-900 mt-1">
                {user.phone || 'Non renseigné'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Géré depuis vos paramètres de compte
              </p>
            </div>
            <div className={`p-2 rounded-lg ${user.phone ? 'bg-green-100' : 'bg-gray-200'}`}>
              <Whatsapp size={20} color={user.phone ? '#059669' : '#6B7280'} variant="Bold" />
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Card */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-amber-50 to-amber-100 px-6 py-4 border-b border-amber-200">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Lock size={20} color="#111827" variant="Bold" />
            Sécurité du compte
          </h2>
        </div>

        <div className="p-6">
          {!isEditingPassword ? (
            <button
              onClick={() => setIsEditingPassword(true)}
              className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
            >
              <Edit2 size={18} color="white" variant="Bold" />
              <span>Modifier mon mot de passe</span>
            </button>
          ) : (
            <form onSubmit={handlePasswordChange} className="space-y-4">
              {/* Old Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mot de passe actuel
                </label>
                <div className="relative">
                  <input
                    type={showOldPassword ? 'text' : 'password'}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="Entrez votre mot de passe actuel"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showOldPassword ? (
                      <EyeSlash size={20} color="#6B7280" />
                    ) : (
                      <Eye size={20} color="#6B7280" />
                    )}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="Entrez votre nouveau mot de passe"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showNewPassword ? (
                      <EyeSlash size={20} color="#6B7280" />
                    ) : (
                      <Eye size={20} color="#6B7280" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Le mot de passe doit contenir au moins 6 caractères
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirmer le nouveau mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="Confirmez votre nouveau mot de passe"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? (
                      <EyeSlash size={20} color="#6B7280" />
                    ) : (
                      <Eye size={20} color="#6B7280" />
                    )}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingPassword(false);
                    setOldPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold text-gray-700 transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-lg font-semibold disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  {isSubmitting ? (
                    <>
                      <SpinLoader />
                      <span>Modification...</span>
                    </>
                  ) : (
                    <>
                      <TickCircle size={18} color="white" variant="Bold" />
                      <span>Modifier le mot de passe</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProfilePage;
