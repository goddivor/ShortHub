// src/components/videaste/VideoUploadModal.tsx
import React, { useState, useRef } from 'react';
import { Short } from '@/types/graphql';
import { useToast } from '@/context/toast-context';
import { getAuthToken } from '@/lib/apollo-client';
import SpinLoader from '@/components/SpinLoader';
import {
  DocumentUpload,
  TickCircle,
  Danger,
  CloseCircle,
  VideoPlay,
} from 'iconsax-react';

interface VideoUploadModalProps {
  short: Short;
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

const VideoUploadModal: React.FC<VideoUploadModalProps> = ({
  short,
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const { success, error: showError } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      const allowedTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'];
      if (!allowedTypes.includes(file.type)) {
        showError('Type de fichier invalide', 'Seuls les fichiers vidéo sont acceptés (MP4, MOV, AVI, MKV)');
        return;
      }

      // Check file size (500MB max)
      const maxSize = 500 * 1024 * 1024;
      if (file.size > maxSize) {
        showError('Fichier trop volumineux', 'La taille maximale est de 500MB');
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      showError('Aucun fichier sélectionné', 'Veuillez sélectionner un fichier vidéo');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('video', selectedFile);

      // Get token from auth system
      const token = getAuthToken();
      if (!token) {
        showError('Non authentifié', 'Veuillez vous reconnecter');
        setUploading(false);
        return;
      }

      // Upload with progress tracking
      const xhr = new XMLHttpRequest();

      // Progression réelle de l'upload
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(progress);
        }
      });

      // Gestion de la réponse
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          success('Upload réussi', 'La vidéo a été uploadée avec succès');
          setSelectedFile(null);
          setUploadProgress(0);
          setUploading(false);
          onUploadSuccess();
          onClose();
        } else {
          try {
            const response = JSON.parse(xhr.responseText);
            showError('Erreur d\'upload', response.error || 'Une erreur est survenue');
          } catch {
            showError('Erreur d\'upload', 'Une erreur est survenue lors de l\'upload');
          }
          setUploading(false);
        }
      });

      // Gestion des erreurs réseau
      xhr.addEventListener('error', () => {
        showError('Erreur réseau', 'Impossible d\'uploader la vidéo');
        setUploading(false);
      });

      // Gestion de l'annulation
      xhr.addEventListener('abort', () => {
        showError('Upload annulé', 'L\'upload a été annulé');
        setUploading(false);
      });

      xhr.open('POST', `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/drive/upload/${short.id}`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);
    } catch {
      showError('Erreur', 'Une erreur est survenue lors de l\'upload');
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <DocumentUpload size={24} color="white" variant="Bold" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Upload de la vidéo</h2>
              <p className="text-sm text-blue-100">Envoyez votre vidéo terminée</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={uploading}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
          >
            <CloseCircle size={24} color="white" variant="Bold" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Short Info */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex gap-3">
              <img
                src={`https://img.youtube.com/vi/${short.videoId}/mqdefault.jpg`}
                alt={short.title || 'Short thumbnail'}
                className="w-24 h-24 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                  {short.title || 'Titre non disponible'}
                </h3>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <VideoPlay size={14} color="#6B7280" variant="Bold" />
                  <span>{short.sourceChannel.channelName}</span>
                </div>
              </div>
            </div>
          </div>

          {/* File Upload Area */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Fichier vidéo
            </label>

            {!selectedFile ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-all"
              >
                <DocumentUpload size={48} color="#3B82F6" variant="Bold" className="mx-auto mb-3" />
                <p className="text-sm font-semibold text-gray-900 mb-1">
                  Cliquez pour sélectionner un fichier
                </p>
                <p className="text-xs text-gray-500">
                  MP4, MOV, AVI, MKV • Maximum 500MB
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/mp4,video/mpeg,video/quicktime,video/x-msvideo,video/x-matroska"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                      <VideoPlay size={20} color="#3B82F6" variant="Bold" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                  </div>
                  {!uploading && (
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="p-1 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                    >
                      <Danger size={20} color="#EF4444" variant="Bold" />
                    </button>
                  )}
                </div>

                {uploading && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                      <span>Upload en cours...</span>
                      <span className="font-semibold">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Info Message */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <TickCircle size={20} color="#3B82F6" variant="Bold" className="flex-shrink-0 mt-0.5" />
              <div className="text-xs text-blue-800">
                <p className="font-semibold mb-1">Une fois la vidéo uploadée :</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>Le statut du short passera automatiquement à "Terminé"</li>
                  <li>L'admin sera notifié et pourra valider votre travail</li>
                  <li>La vidéo sera stockée dans Google Drive</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              disabled={uploading}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold text-gray-700 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              {uploading ? (
                <>
                  <SpinLoader />
                  <span>Upload en cours...</span>
                </>
              ) : (
                <>
                  <DocumentUpload size={18} color="white" variant="Bold" />
                  <span>Uploader la vidéo</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoUploadModal;
