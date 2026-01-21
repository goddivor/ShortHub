// src/components/admin/users/AssignAssistantModal.tsx
import React, { useState, useEffect } from 'react';
import SpinLoader from '@/components/SpinLoader';
import { CloseCircle, People, UserTick, User as UserIcon } from 'iconsax-react';
import type { User } from '@/types/graphql';

interface AssignAssistantModalProps {
  isOpen: boolean;
  assistant: User | null;
  videastes: User[];
  onClose: () => void;
  onConfirm: (videasteId: string, assistantId: string) => Promise<boolean>;
  isAssigning?: boolean;
}

const AssignAssistantModal: React.FC<AssignAssistantModalProps> = ({
  isOpen,
  assistant,
  videastes,
  onClose,
  onConfirm,
  isAssigning = false
}) => {
  const [selectedVideasteId, setSelectedVideasteId] = useState<string>('');
  const [localAssigning, setLocalAssigning] = useState(false);

  // Pré-sélectionner le vidéaste actuel si l'assistant est déjà assigné
  useEffect(() => {
    if (isOpen && assistant?.assignedTo) {
      setSelectedVideasteId(assistant.assignedTo.id);
    } else if (!isOpen) {
      setSelectedVideasteId('');
    }
  }, [isOpen, assistant]);

  const handleConfirm = async () => {
    if (!assistant || !selectedVideasteId) return;

    setLocalAssigning(true);
    try {
      const success = await onConfirm(selectedVideasteId, assistant.id);
      if (success) {
        setSelectedVideasteId('');
        onClose();
      }
    } finally {
      setLocalAssigning(false);
    }
  };

  const handleClose = () => {
    if (!localAssigning && !isAssigning) {
      setSelectedVideasteId('');
      onClose();
    }
  };

  if (!isOpen || !assistant) return null;

  const assigning = localAssigning || isAssigning;
  const selectedVideaste = videastes.find(v => v.id === selectedVideasteId);
  const currentVideasteId = assistant?.assignedTo?.id;
  const isAlreadyAssigned = selectedVideasteId === currentVideasteId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600 to-teal-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-lg p-2">
                <People size={24} color="white" variant="Bold" />
              </div>
              <h2 className="text-2xl font-bold">Assigner à un Vidéaste</h2>
            </div>
            <button
              onClick={handleClose}
              disabled={assigning}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
            >
              <CloseCircle size={24} color="white" variant="Bold" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Assistant Info */}
          <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-cyan-200 rounded-full flex items-center justify-center overflow-hidden">
                {assistant.profileImage ? (
                  <img
                    src={assistant.profileImage}
                    alt={assistant.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon size={24} color="#0891B2" variant="Bold" />
                )}
              </div>
              <div>
                <p className="text-sm text-cyan-600 font-medium">Assistant</p>
                <p className="text-lg font-bold text-cyan-900">{assistant.username}</p>
                {assistant.assignedTo && (
                  <p className="text-xs text-cyan-700">
                    Actuellement assigné à: <span className="font-semibold">{assistant.assignedTo.username}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Videaste Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Sélectionner un vidéaste
            </label>

            {videastes.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
                <UserIcon size={32} color="#9CA3AF" className="mx-auto mb-2" variant="Bulk" />
                <p className="text-gray-500">Aucun vidéaste disponible</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {videastes.map((videaste) => (
                  <button
                    key={videaste.id}
                    type="button"
                    onClick={() => setSelectedVideasteId(videaste.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                      selectedVideasteId === videaste.id
                        ? 'border-cyan-500 bg-cyan-50'
                        : 'border-gray-200 hover:border-cyan-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                      {videaste.profileImage ? (
                        <img
                          src={videaste.profileImage}
                          alt={videaste.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserIcon size={20} color="#3B82F6" variant="Bold" />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-gray-900">{videaste.username}</p>
                      <p className="text-xs text-gray-500">
                        {videaste.email || 'Email non connecté'}
                      </p>
                    </div>
                    {selectedVideasteId === videaste.id && (
                      <div className="bg-cyan-500 rounded-full p-1">
                        <UserTick size={16} color="white" variant="Bold" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Summary */}
          {selectedVideaste && (
            <div className={`rounded-xl p-4 ${isAlreadyAssigned ? 'bg-amber-50 border border-amber-200' : 'bg-green-50 border border-green-200'}`}>
              <p className={`text-sm ${isAlreadyAssigned ? 'text-amber-800' : 'text-green-800'}`}>
                {isAlreadyAssigned ? (
                  <>
                    <span className="font-bold">{assistant.username}</span> est déjà assigné à{' '}
                    <span className="font-bold">{selectedVideaste.username}</span>
                  </>
                ) : (
                  <>
                    <span className="font-bold">{assistant.username}</span> sera assigné à{' '}
                    <span className="font-bold">{selectedVideaste.username}</span>
                  </>
                )}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold text-gray-700 transition-colors disabled:opacity-50"
              disabled={assigning}
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-teal-700 hover:from-cyan-700 hover:to-teal-800 text-white rounded-lg font-semibold disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg"
              disabled={assigning || !selectedVideasteId || isAlreadyAssigned}
            >
              {assigning ? (
                <>
                  <SpinLoader />
                  <span>Assignation...</span>
                </>
              ) : (
                <>
                  <UserTick size={18} color="white" variant="Bold" />
                  <span>Assigner</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignAssistantModal;
