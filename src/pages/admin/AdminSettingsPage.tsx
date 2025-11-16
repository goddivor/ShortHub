// src/pages/admin/AdminSettingsPage.tsx
import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import {
  GET_NOTIFICATION_SETTINGS_QUERY,
  UPDATE_NOTIFICATION_SETTINGS_MUTATION,
} from '@/lib/graphql';
import { useToast } from '@/context/toast-context';
import SpinLoader from '@/components/SpinLoader';
import {
  Setting,
  Notification,
  Sms,
  Whatsapp,
  TickCircle,
  InfoCircle,
  Danger,
} from 'iconsax-react';

const AdminSettingsPage: React.FC = () => {
  const { success, error } = useToast();
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch notification settings
  const { data, loading, refetch } = useQuery(GET_NOTIFICATION_SETTINGS_QUERY);

  // Local state for settings
  const [platformNotificationsEnabled, setPlatformNotificationsEnabled] = useState(
    data?.notificationSettings?.platformNotificationsEnabled ?? true
  );
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(
    data?.notificationSettings?.emailNotificationsEnabled ?? true
  );
  const [whatsappNotificationsEnabled, setWhatsappNotificationsEnabled] = useState(
    data?.notificationSettings?.whatsappNotificationsEnabled ?? true
  );

  // Update mutation
  const [updateSettings, { loading: updating }] = useMutation(
    UPDATE_NOTIFICATION_SETTINGS_MUTATION,
    {
      onCompleted: () => {
        success('Paramètres sauvegardés', 'Les paramètres de notifications ont été mis à jour');
        setHasChanges(false);
        refetch();
      },
      onError: (err) => {
        error('Erreur', err.message || 'Impossible de sauvegarder les paramètres');
      },
    }
  );

  // Update local state when data is loaded
  React.useEffect(() => {
    if (data?.notificationSettings) {
      setPlatformNotificationsEnabled(
        data.notificationSettings.platformNotificationsEnabled
      );
      setEmailNotificationsEnabled(data.notificationSettings.emailNotificationsEnabled);
      setWhatsappNotificationsEnabled(
        data.notificationSettings.whatsappNotificationsEnabled
      );
    }
  }, [data]);

  const handleToggle = (
    type: 'platform' | 'email' | 'whatsapp',
    value: boolean
  ) => {
    setHasChanges(true);
    switch (type) {
      case 'platform':
        setPlatformNotificationsEnabled(value);
        break;
      case 'email':
        setEmailNotificationsEnabled(value);
        break;
      case 'whatsapp':
        setWhatsappNotificationsEnabled(value);
        break;
    }
  };

  const handleSave = async () => {
    try {
      await updateSettings({
        variables: {
          input: {
            platformNotificationsEnabled,
            emailNotificationsEnabled,
            whatsappNotificationsEnabled,
          },
        },
      });
    } catch {
      // Error handled in mutation
    }
  };

  const handleReset = () => {
    if (data?.notificationSettings) {
      setPlatformNotificationsEnabled(
        data.notificationSettings.platformNotificationsEnabled
      );
      setEmailNotificationsEnabled(data.notificationSettings.emailNotificationsEnabled);
      setWhatsappNotificationsEnabled(
        data.notificationSettings.whatsappNotificationsEnabled
      );
      setHasChanges(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <SpinLoader />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-700 to-gray-800 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm">
            <Setting size={32} color="white" variant="Bold" />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-1">Paramètres</h1>
            <p className="text-gray-200">Configuration globale de la plateforme</p>
          </div>
        </div>
      </div>

      {/* Notification Settings Card */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Notification size={20} color="#111827" variant="Bold" />
            Paramètres de Notifications Globaux
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Contrôlez les canaux de notifications pour tous les utilisateurs
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Warning Banner */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
            <InfoCircle size={24} color="#F59E0B" variant="Bold" className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-900">
                Ces paramètres affectent tous les utilisateurs
              </p>
              <p className="text-xs text-amber-700 mt-1">
                Si vous désactivez un canal de notification, aucun utilisateur ne pourra
                recevoir de notifications via ce canal, même s'ils l'ont activé dans leurs
                paramètres personnels.
              </p>
            </div>
          </div>

          {/* Platform Notifications */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${platformNotificationsEnabled ? 'bg-blue-100' : 'bg-gray-200'}`}>
                    <Notification
                      size={20}
                      color={platformNotificationsEnabled ? '#3B82F6' : '#6B7280'}
                      variant="Bold"
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      Notifications sur la plateforme
                    </h3>
                    <p className="text-xs text-gray-600">
                      Centre de notifications dans l'application
                    </p>
                  </div>
                </div>

                {/* Toggle Switch */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={platformNotificationsEnabled}
                    onChange={(e) => handleToggle('platform', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            <div className="px-4 py-3">
              <p className="text-xs text-gray-500">
                {platformNotificationsEnabled ? (
                  <span className="flex items-center gap-1 text-green-600">
                    <TickCircle size={14} color="#059669" variant="Bold" />
                    Les utilisateurs reçoivent les notifications dans l'application
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-red-600">
                    <Danger size={14} color="#DC2626" variant="Bold" />
                    Aucune notification ne sera envoyée sur la plateforme
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Email Notifications */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${emailNotificationsEnabled ? 'bg-blue-100' : 'bg-gray-200'}`}>
                    <Sms
                      size={20}
                      color={emailNotificationsEnabled ? '#3B82F6' : '#6B7280'}
                      variant="Bold"
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      Notifications par Email
                    </h3>
                    <p className="text-xs text-gray-600">
                      Envoi de notifications par email
                    </p>
                  </div>
                </div>

                {/* Toggle Switch */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailNotificationsEnabled}
                    onChange={(e) => handleToggle('email', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            <div className="px-4 py-3">
              <p className="text-xs text-gray-500">
                {emailNotificationsEnabled ? (
                  <span className="flex items-center gap-1 text-green-600">
                    <TickCircle size={14} color="#059669" variant="Bold" />
                    Les utilisateurs avec email configuré reçoivent les notifications
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-red-600">
                    <Danger size={14} color="#DC2626" variant="Bold" />
                    Aucun email ne sera envoyé, même si l'utilisateur l'a activé
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* WhatsApp Notifications */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${whatsappNotificationsEnabled ? 'bg-green-100' : 'bg-gray-200'}`}>
                    <Whatsapp
                      size={20}
                      color={whatsappNotificationsEnabled ? '#10B981' : '#6B7280'}
                      variant="Bold"
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      Notifications par WhatsApp
                    </h3>
                    <p className="text-xs text-gray-600">
                      Envoi de messages WhatsApp
                    </p>
                  </div>
                </div>

                {/* Toggle Switch */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={whatsappNotificationsEnabled}
                    onChange={(e) => handleToggle('whatsapp', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
            </div>

            <div className="px-4 py-3">
              <p className="text-xs text-gray-500">
                {whatsappNotificationsEnabled ? (
                  <span className="flex items-center gap-1 text-green-600">
                    <TickCircle size={14} color="#059669" variant="Bold" />
                    Les utilisateurs avec WhatsApp configuré reçoivent les notifications
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-red-600">
                    <Danger size={14} color="#DC2626" variant="Bold" />
                    Aucun message WhatsApp ne sera envoyé, même si l'utilisateur l'a activé
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          {hasChanges && (
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={handleReset}
                disabled={updating}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold text-gray-700 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={updating}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-semibold disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                {updating ? (
                  <>
                    <SpinLoader />
                    <span>Sauvegarde...</span>
                  </>
                ) : (
                  <>
                    <TickCircle size={18} color="white" variant="Bold" />
                    <span>Sauvegarder les modifications</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
