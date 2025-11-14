// src/components/admin/users/DeleteUserModal.tsx
import React, { useState } from 'react';
import SpinLoader from '@/components/SpinLoader';
import { CloseCircle, Trash, Warning2 } from 'iconsax-react';
import type { User } from '@/types/graphql';

interface DeleteUserModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onConfirm: (userId: string) => Promise<boolean>;
  isDeleting?: boolean;
}

const DeleteUserModal: React.FC<DeleteUserModalProps> = ({
  isOpen,
  user,
  onClose,
  onConfirm,
  isDeleting = false
}) => {
  const [localDeleting, setLocalDeleting] = useState(false);

  const handleConfirm = async () => {
    if (!user) return;

    setLocalDeleting(true);
    try {
      const success = await onConfirm(user.id);
      if (success) {
        onClose();
      }
    } finally {
      setLocalDeleting(false);
    }
  };

  const handleClose = () => {
    if (!localDeleting && !isDeleting) {
      onClose();
    }
  };

  if (!isOpen || !user) return null;

  const deleting = localDeleting || isDeleting;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-lg p-2">
                <Trash size={24} color="white" variant="Bold" />
              </div>
              <h2 className="text-2xl font-bold">Supprimer l'utilisateur</h2>
            </div>
            <button
              onClick={handleClose}
              disabled={deleting}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
            >
              <CloseCircle size={24} color="white" variant="Bold" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Warning */}
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="bg-red-100 rounded-full p-2">
                <Warning2 size={24} color="#DC2626" variant="Bold" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-900 mb-1">
                  Action irréversible
                </h3>
                <p className="text-sm text-red-800">
                  Cette action ne peut pas être annulée. Toutes les données associées à cet utilisateur seront définitivement supprimées.
                </p>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-600">Nom d'utilisateur:</span>
                <span className="text-sm font-bold text-gray-900">{user.username}</span>
              </div>
              {user.email && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-600">Email:</span>
                  <span className="text-sm text-gray-900">{user.email}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-600">Rôle:</span>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                  user.role === 'VIDEASTE' ? 'bg-blue-100 text-blue-800' :
                  'bg-cyan-100 text-cyan-800'
                }`}>
                  {user.role === 'ADMIN' ? 'Administrateur' :
                   user.role === 'VIDEASTE' ? 'Vidéaste' : 'Assistant'}
                </span>
              </div>
            </div>
          </div>

          {/* Confirmation Question */}
          <div className="text-center py-2">
            <p className="text-gray-700 font-medium">
              Êtes-vous sûr de vouloir supprimer cet utilisateur ?
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold text-gray-700 transition-colors disabled:opacity-50"
              disabled={deleting}
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg font-semibold disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg"
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <SpinLoader />
                  <span>Suppression...</span>
                </>
              ) : (
                <>
                  <Trash size={18} color="white" variant="Bold" />
                  <span>Supprimer</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteUserModal;
