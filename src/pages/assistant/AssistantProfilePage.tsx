// src/pages/assistant/AssistantProfilePage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMutation } from '@apollo/client/react';
import { type FetchResult } from '@apollo/client';
import {
  UPLOAD_PROFILE_IMAGE_MUTATION,
  REMOVE_PROFILE_IMAGE_MUTATION,
  UPDATE_USER_MUTATION,
  CHANGE_PASSWORD_MUTATION
} from '@/lib/graphql';
import { useToast } from '@/context/toast-context';
import SpinLoader from '@/components/SpinLoader';
import {
  User,
  Call,
  Sms,
  Shield,
  Calendar,
  Lock,
  Eye,
  EyeSlash,
  TickCircle,
  Edit2,
  Notification,
  Whatsapp,
  Mobile,
  Camera,
  Trash,
  Verify,
  CloseCircle,
  People,
  UserOctagon
} from 'iconsax-react';

type TabType = 'overview' | 'security' | 'notifications';

const AssistantProfilePage: React.FC = () => {
  const { user, refetchUser } = useAuth();
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Username editing state
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState(user?.username || '');

  // Password editing state
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Notification settings state
  const [isEditingNotifications, setIsEditingNotifications] = useState(false);
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [emailNotifications, setEmailNotifications] = useState(user?.emailNotifications || false);
  const [whatsappNotifications, setWhatsappNotifications] = useState(user?.whatsappNotifications || false);

  // Mutations
  const [uploadProfileImage, { loading: uploadingImage }] = useMutation(UPLOAD_PROFILE_IMAGE_MUTATION, {
    onCompleted: async () => {
      await refetchUser();
      success('Image uploadée', 'Votre image de profil a été mise à jour');
    },
    onError: (err) => {
      error('Erreur', err.message || 'Impossible d\'uploader l\'image');
    }
  });

  const [removeProfileImage, { loading: removingImage }] = useMutation(REMOVE_PROFILE_IMAGE_MUTATION, {
    onCompleted: async () => {
      await refetchUser();
      success('Image supprimée', 'Votre image de profil a été supprimée');
    },
    onError: (err) => {
      error('Erreur', err.message || 'Impossible de supprimer l\'image');
    }
  });

  const [updateUser, { loading: updatingUser }] = useMutation(UPDATE_USER_MUTATION, {
    onCompleted: async () => {
      await refetchUser();
    },
    onError: (err) => {
      error('Erreur', err.message || 'Impossible de mettre à jour les paramètres');
    }
  });

  const [changePassword] = useMutation<{ changePassword: boolean }>(CHANGE_PASSWORD_MUTATION);

  // Handlers
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      uploadProfileImage({ variables: { base64Image: base64 } });
    };
    reader.readAsDataURL(file);
  };

  const handleImageRemove = async () => {
    await removeProfileImage();
  };

  const handleUsernameChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newUsername.length < 3) {
      error('Erreur', 'Le nom d\'utilisateur doit contenir au moins 3 caractères');
      return;
    }
    if (newUsername === user?.username) {
      setIsEditingUsername(false);
      return;
    }

    setIsSubmitting(true);
    try {
      await updateUser({
        variables: { id: user?.id, input: { username: newUsername } }
      });
      success('Nom d\'utilisateur modifié', 'Votre nom d\'utilisateur a été mis à jour');
      setIsEditingUsername(false);
    } catch {
      // Error handled in mutation
    } finally {
      setIsSubmitting(false);
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
      const result: FetchResult<{ changePassword: boolean }> = await changePassword({
        variables: { oldPassword, newPassword }
      });

      if (result.errors?.length) {
        error('Erreur', result.errors[0].message);
        return;
      }

      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsEditingPassword(false);
      success('Mot de passe modifié', 'Votre mot de passe a été modifié avec succès');
    } catch (err) {
      error('Erreur', err instanceof Error ? err.message : 'Erreur lors de la modification');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNotificationsSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      error('Erreur', 'Veuillez entrer une adresse email valide');
      return;
    }
    if (phone && !/^[+]?[\d\s()-]+$/.test(phone)) {
      error('Erreur', 'Veuillez entrer un numéro de téléphone valide');
      return;
    }

    try {
      await updateUser({
        variables: {
          id: user?.id,
          input: {
            email: email || null,
            phone: phone || null,
            whatsappLinked: !!phone,
            emailNotifications,
            whatsappNotifications,
          }
        }
      });
      success('Paramètres mis à jour', 'Vos paramètres de notifications ont été mis à jour');
      setIsEditingNotifications(false);
    } catch {
      // Error handled in mutation
    }
  };

  // Sync state with user
  useEffect(() => {
    if (user) {
      setNewUsername(user.username || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setEmailNotifications(user.emailNotifications || false);
      setWhatsappNotifications(user.whatsappNotifications || false);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <SpinLoader />
      </div>
    );
  }

  const tabs = [
    { id: 'overview' as const, label: 'Aperçu' },
    { id: 'security' as const, label: 'Sécurité' },
    { id: 'notifications' as const, label: 'Notifications' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Profil</h1>
        </div>
        {/* Tabs */}
        <div className="px-6 flex gap-6 border-t border-gray-100">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-cyan-600 text-cyan-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left Column - User Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Card */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="relative group">
                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={user.username}
                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center border-2 border-gray-200">
                        <span className="text-2xl font-bold text-white">
                          {user.username?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    {/* Upload overlay */}
                    <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                      <label className="cursor-pointer p-1.5 hover:bg-white/20 rounded-full transition-colors">
                        <Camera size={16} color="white" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={uploadingImage}
                        />
                      </label>
                      {user.profileImage && (
                        <button
                          onClick={handleImageRemove}
                          disabled={removingImage}
                          className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                        >
                          <Trash size={16} color="white" />
                        </button>
                      )}
                    </div>
                    {(uploadingImage || removingImage) && (
                      <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                        <SpinLoader />
                      </div>
                    )}
                  </div>
                  {/* Name & ID */}
                  <div className="flex-1">
                    {isEditingUsername ? (
                      <form onSubmit={handleUsernameChange} className="space-y-2">
                        <input
                          type="text"
                          value={newUsername}
                          onChange={(e) => setNewUsername(e.target.value)}
                          className="w-full px-3 py-1.5 text-lg font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => { setIsEditingUsername(false); setNewUsername(user.username || ''); }}
                            className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                          >
                            Annuler
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmitting || updatingUser}
                            className="px-3 py-1 text-xs bg-cyan-600 text-white rounded hover:bg-cyan-700 disabled:opacity-50"
                          >
                            Sauvegarder
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-semibold text-gray-900">{user.username}</h2>
                          <button
                            onClick={() => setIsEditingUsername(true)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                          >
                            <Edit2 size={14} color="#6B7280" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-500">#{user.id.slice(-8).toUpperCase()}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Assigned Videaste */}
              {user.assignedTo && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Vidéaste assigné</h3>
                  <div className="flex items-center gap-3 p-3 bg-cyan-50 rounded-lg border border-cyan-200">
                    <div className="relative">
                      {user.assignedTo.profileImage ? (
                        <img
                          src={user.assignedTo.profileImage}
                          alt={user.assignedTo.username}
                          className="w-12 h-12 rounded-full object-cover border-2 border-cyan-200"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center border-2 border-cyan-200">
                          <span className="text-lg font-bold text-white">
                            {user.assignedTo.username?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{user.assignedTo.username}</p>
                      <p className="text-xs text-cyan-600">Vidéaste</p>
                    </div>
                    <UserOctagon size={20} color="#0891B2" />
                  </div>
                </div>
              )}

              {/* About Section */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">À propos</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Call size={18} color="#6B7280" />
                    <div>
                      <span className="text-sm text-gray-500">Téléphone:</span>
                      <span className="text-sm text-gray-900 ml-2">{user.phone || 'Non renseigné'}</span>
                    </div>
                    {user.phone ? <Verify size={16} color="#10B981" /> : null}
                  </div>
                  <div className="flex items-center gap-3">
                    <Sms size={18} color="#6B7280" />
                    <div>
                      <span className="text-sm text-gray-500">Email:</span>
                      <span className="text-sm text-gray-900 ml-2">{user.email || 'Non renseigné'}</span>
                    </div>
                    {user.email ? <Verify size={16} color="#10B981" /> : null}
                  </div>
                </div>
              </div>

              {/* Account Details */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Détails du compte</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Shield size={18} color="#6B7280" />
                    <div>
                      <span className="text-sm text-gray-500">Rôle:</span>
                      <span className="text-sm font-medium ml-2 inline-flex items-center gap-1">
                        <People size={14} color="#0891B2" />
                        <span className="text-cyan-600">Assistant</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar size={18} color="#6B7280" />
                    <div>
                      <span className="text-sm text-gray-500">Membre depuis:</span>
                      <span className="text-sm text-gray-900 ml-2">
                        {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <User size={18} color="#6B7280" />
                    <div>
                      <span className="text-sm text-gray-500">Statut:</span>
                      <span className={`text-sm font-medium ml-2 ${user.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'}`}>
                        {user.status === 'ACTIVE' ? 'Actif' : 'Bloqué'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Activity & Stats */}
            <div className="lg:col-span-3 space-y-6">
              {/* Notifications Summary */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-900">Paramètres de notification</h3>
                  <button
                    onClick={() => setActiveTab('notifications')}
                    className="text-sm text-cyan-600 hover:text-cyan-700 font-medium"
                  >
                    Modifier
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`p-2 rounded-lg ${emailNotifications ? 'bg-blue-100' : 'bg-gray-200'}`}>
                      <Sms size={20} color={emailNotifications ? '#3B82F6' : '#9CA3AF'} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Notifications Email</p>
                      <p className="text-xs text-gray-500">{emailNotifications ? 'Activées' : 'Désactivées'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`p-2 rounded-lg ${whatsappNotifications ? 'bg-green-100' : 'bg-gray-200'}`}>
                      <Whatsapp size={20} color={whatsappNotifications ? '#10B981' : '#9CA3AF'} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Notifications WhatsApp</p>
                      <p className="text-xs text-gray-500">{whatsappNotifications ? 'Activées' : 'Désactivées'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Summary */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-900">Sécurité du compte</h3>
                  <button
                    onClick={() => setActiveTab('security')}
                    className="text-sm text-cyan-600 hover:text-cyan-700 font-medium"
                  >
                    Gérer
                  </button>
                </div>
                <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Lock size={20} color="#D97706" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Mot de passe</p>
                    <p className="text-xs text-gray-500">Dernière modification inconnue</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('security')}
                    className="px-3 py-1.5 text-xs font-medium bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    Modifier
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Actions rapides</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setActiveTab('security')}
                    className="flex items-center gap-2 p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Lock size={18} color="#374151" />
                    <span className="text-sm text-gray-700">Changer mot de passe</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('notifications')}
                    className="flex items-center gap-2 p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Notification size={18} color="#374151" />
                    <span className="text-sm text-gray-700">Gérer notifications</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="max-w-2xl">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Lock size={24} color="#D97706" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Modifier le mot de passe</h3>
                  <p className="text-sm text-gray-500">Assurez-vous d'utiliser un mot de passe fort</p>
                </div>
              </div>

              {!isEditingPassword ? (
                <button
                  onClick={() => setIsEditingPassword(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors"
                >
                  <Edit2 size={18} color="white" />
                  Modifier mon mot de passe
                </button>
              ) : (
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mot de passe actuel
                    </label>
                    <div className="relative">
                      <input
                        type={showOldPassword ? 'text' : 'password'}
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showOldPassword ? <EyeSlash size={20} color="#6B7280" /> : <Eye size={20} color="#6B7280" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nouveau mot de passe
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showNewPassword ? <EyeSlash size={20} color="#6B7280" /> : <Eye size={20} color="#6B7280" />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Minimum 6 caractères</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirmer le mot de passe
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showConfirmPassword ? <EyeSlash size={20} color="#6B7280" /> : <Eye size={20} color="#6B7280" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => { setIsEditingPassword(false); setOldPassword(''); setNewPassword(''); setConfirmPassword(''); }}
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? <SpinLoader /> : <TickCircle size={18} color="white" />}
                      Modifier
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="max-w-2xl">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Notification size={24} color="#7C3AED" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Paramètres de notifications</h3>
                  <p className="text-sm text-gray-500">Gérez vos préférences de notification</p>
                </div>
              </div>

              {!isEditingNotifications ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Email</span>
                        {email ? <Verify size={16} color="#10B981" /> : <CloseCircle size={16} color="#EF4444" />}
                      </div>
                      <p className="text-sm text-gray-900">{email || 'Non configuré'}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Notifications: {emailNotifications ? 'Activées' : 'Désactivées'}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">WhatsApp</span>
                        {phone ? <Verify size={16} color="#10B981" /> : <CloseCircle size={16} color="#EF4444" />}
                      </div>
                      <p className="text-sm text-gray-900">{phone || 'Non configuré'}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Notifications: {whatsappNotifications ? 'Activées' : 'Désactivées'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsEditingNotifications(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <Edit2 size={18} color="white" />
                    Modifier mes paramètres
                  </button>
                </div>
              ) : (
                <form onSubmit={handleNotificationsSave} className="space-y-6">
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Adresse Email
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="votre@email.com"
                        className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <Sms size={18} color="#6B7280" className="absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                    <label className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Sms size={20} color="#3B82F6" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Notifications par email</p>
                          <p className="text-xs text-gray-500">Recevez les notifications importantes</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={emailNotifications}
                        onChange={(e) => setEmailNotifications(e.target.checked)}
                        disabled={!email}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 disabled:opacity-50"
                      />
                    </label>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Numéro WhatsApp
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+33 6 12 34 56 78"
                        className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <Mobile size={18} color="#6B7280" className="absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                    <label className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Whatsapp size={20} color="#10B981" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Notifications WhatsApp</p>
                          <p className="text-xs text-gray-500">Recevez les notifications sur WhatsApp</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={whatsappNotifications}
                        onChange={(e) => setWhatsappNotifications(e.target.checked)}
                        disabled={!phone}
                        className="w-5 h-5 text-green-600 rounded focus:ring-green-500 disabled:opacity-50"
                      />
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingNotifications(false);
                        setEmail(user?.email || '');
                        setPhone(user?.phone || '');
                        setEmailNotifications(user?.emailNotifications || false);
                        setWhatsappNotifications(user?.whatsappNotifications || false);
                      }}
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={updatingUser}
                      className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {updatingUser ? <SpinLoader /> : <TickCircle size={18} color="white" />}
                      Enregistrer
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssistantProfilePage;
