/* eslint-disable @typescript-eslint/no-unused-vars */
// src/components/modal/DeleteModal.tsx
import React, { useState } from 'react';
import { BaseModal } from './BaseModal';
import Button from '@/components/Button';
import SpinLoader from '@/components/SpinLoader';
import { useToast } from '@/context/toast-context';
import { ChannelService, type Channel } from '@/lib/supabase';
import { Trash, Warning2, Youtube } from 'iconsax-react';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  channel: Channel | null;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  onDelete,
  channel
}) => {
  const { success, error } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!channel) return;

    setIsDeleting(true);

    try {
      await ChannelService.deleteChannel(channel.id);
      success('Chaîne supprimée', 'La chaîne a été supprimée avec succès');
      onDelete();
      onClose();
    } catch (err) {
      error('Erreur de suppression', 'Impossible de supprimer la chaîne');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!channel) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Supprimer la chaîne"
      size="sm"
    >
      <div className="p-6 space-y-6">
        {/* Warning Header */}
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-red-100 rounded-xl">
            <Warning2 color="#EF4444" size={24} className="text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Confirmation de suppression
            </h3>
            <p className="text-sm text-gray-500">
              Cette action est irréversible
            </p>
          </div>
        </div>

        {/* Warning Message */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-medium text-red-900 mb-2">
            Êtes-vous absolument sûr ?
          </h4>
          <p className="text-sm text-red-700 mb-3">
            Cette action supprimera définitivement la chaîne <strong>"{channel.username}"</strong> 
            et toutes ses données associées, y compris :
          </p>
          <ul className="text-sm text-red-700 space-y-1 ml-4">
            <li>• Tous les shorts générés pour cette chaîne</li>
            <li>• L'historique de validation</li>
            <li>• Les statistiques de performance</li>
          </ul>
        </div>

        {/* Channel Info */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 rounded-full p-2">
              <Youtube color="#FF0000" size={20} className="text-red-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-gray-900 truncate">{channel.username}</h4>
              <p className="text-sm text-gray-600 truncate">{channel.youtube_url}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800`}>
                  {channel.tag}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800`}>
                  {channel.type}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Input */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800 mb-2">
            <strong>Important:</strong> Cette suppression ne peut pas être annulée.
            Assurez-vous d'avoir sauvegardé toutes les données importantes.
          </p>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-end space-x-3 p-6 bg-gray-50 border-t border-gray-200">
        <Button
          onClick={onClose}
          className="px-6 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          disabled={isDeleting}
        >
          Annuler
        </Button>
        
        <Button
          onClick={handleDelete}
          disabled={isDeleting}
          className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          {isDeleting ? (
            <>
              <SpinLoader />
              <span>Suppression...</span>
            </>
          ) : (
            <>
              <Trash color="white" size={16} className="text-white" />
              <span>Supprimer</span>
            </>
          )}
        </Button>
      </div>
    </BaseModal>
  );
};