/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { useMutation } from "@apollo/client/react";
import { BaseModal } from "./BaseModal";
import { Input } from "@/components/forms/Input";
import { CustomSelect } from "@/components/forms/custom-select";
import Button from "@/components/Button";
import SpinLoader from "@/components/SpinLoader";
import { useToast } from "@/context/toast-context";
import {
  CREATE_CHANNEL_MUTATION,
  UPDATE_CHANNEL_MUTATION,
  GET_CHANNELS_QUERY,
} from "@/lib/graphql";
import type {
  Channel,
  ChannelLanguage,
  ChannelType,
  CreateChannelInput,
  UpdateChannelInput,
} from "@/types/graphql";
import { ChannelPurpose } from "@/types/graphql";
import { extractChannelData } from "@/lib/youtube-api";
import { Youtube, TrendUp, Save2, Add, Edit } from "iconsax-react";

// Language options mapping
const LANGUAGE_OPTIONS = [
  { label: "VF", value: "VF" },
  { label: "VA", value: "VA" },
  { label: "VOSTFR", value: "VOSTFR" },
  { label: "VOSTA", value: "VOSTA" },
  { label: "VO", value: "VO" },
];

// Channel Type options
const TYPE_OPTIONS = [
  { label: "Mix (Contenu varié)", value: "MIX" },
  { label: "Only (Spécialisé)", value: "ONLY" },
];

// Channel Purpose - default to PUBLICATION
const DEFAULT_PURPOSE = ChannelPurpose.PUBLICATION;

// Utility function to format subscriber count
const formatSubscriberCount = (count: number): string => {
  if (count >= 1000000) return (count / 1000000).toFixed(1) + "M";
  if (count >= 1000) return (count / 1000).toFixed(1) + "K";
  return count.toString();
};

interface ChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editingChannel?: Channel | null;
}

interface FormData {
  youtubeUrl: string;
  username: string;
  subscriberCount: number;
  language?: ChannelLanguage;
  type?: ChannelType;
  domain?: string;
}

export const ChannelModal: React.FC<ChannelModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingChannel,
}) => {
  const { success, error, info } = useToast();

  // Mutations
  const [createChannelMutation] = useMutation(CREATE_CHANNEL_MUTATION, {
    refetchQueries: [{ query: GET_CHANNELS_QUERY }],
    awaitRefetchQueries: true,
  });

  const [updateChannelMutation] = useMutation(UPDATE_CHANNEL_MUTATION, {
    refetchQueries: [{ query: GET_CHANNELS_QUERY }],
    awaitRefetchQueries: true,
  });

  // Form state
  const [formData, setFormData] = useState<FormData>({
    youtubeUrl: "",
    username: "",
    subscriberCount: 0,
    language: undefined,
    type: undefined,
    domain: "",
  });

  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [initialUrl, setInitialUrl] = useState(""); // Track initial URL to prevent auto-extraction on edit

  const isEditMode = !!editingChannel;

  // Initialize form data when modal opens or editing channel changes
  useEffect(() => {
    if (isOpen) {
      if (editingChannel) {
        const initialData: FormData = {
          youtubeUrl: editingChannel.youtubeUrl,
          username: editingChannel.username,
          subscriberCount: editingChannel.subscriberCount,
          language: editingChannel.language,
          type: editingChannel.type,
          domain: editingChannel.domain || "",
        };
        setFormData(initialData);
        setInitialUrl(editingChannel.youtubeUrl); // Store initial URL to prevent auto-extraction
      } else {
        setFormData({
          youtubeUrl: "",
          username: "",
          subscriberCount: 0,
          language: undefined,
          type: undefined,
          domain: "",
        });
        setInitialUrl(""); // Reset for new channel
      }
    }
  }, [editingChannel, isOpen]);

  // Extract channel data from YouTube URL (only when URL actually changes from user input)
  const handleUrlExtraction = async (url: string) => {
    if (!url || url.length < 10) return;

    setIsExtracting(true);

    try {
      info(
        "Extraction des données...",
        "Récupération des informations de la chaîne"
      );

      const data = await extractChannelData(url);

      setFormData((prev) => ({
        ...prev,
        username: data.username,
        subscriberCount: data.subscriber_count,
      }));

      success(
        "Données extraites !",
        `${data.username} • ${formatSubscriberCount(
          data.subscriber_count
        )} abonnés`
      );
    } catch (err) {
      error(
        "Erreur d'extraction",
        err instanceof Error
          ? err.message
          : "Impossible de récupérer les données"
      );
    } finally {
      setIsExtracting(false);
    }
  };

  // Handle URL change with debounce (only extract if URL actually changed from initial)
  useEffect(() => {
    if (!formData.youtubeUrl || formData.youtubeUrl.length < 10) return;

    // Don't auto-extract if this is the initial URL from editing mode
    if (isEditMode && formData.youtubeUrl === initialUrl) return;

    const timer = setTimeout(() => {
      handleUrlExtraction(formData.youtubeUrl);
    }, 1000);

    return () => clearTimeout(timer);
  }, [formData.youtubeUrl, initialUrl, isEditMode]);

  // Save channel
  const handleSave = async () => {
    // Validation
    if (
      !formData.youtubeUrl ||
      !formData.username ||
      !formData.language ||
      !formData.type
    ) {
      error(
        "Données incomplètes",
        "Veuillez remplir tous les champs obligatoires"
      );
      return;
    }

    if (formData.type === "ONLY" && !formData.domain) {
      error(
        "Domaine requis",
        'Veuillez spécifier un domaine pour le type "Only"'
      );
      return;
    }

    setIsSaving(true);

    try {
      if (editingChannel) {
        // Update existing channel
        const updateInput: UpdateChannelInput = {
          username: formData.username,
          subscriberCount: formData.subscriberCount,
          language: formData.language,
          type: formData.type,
          domain: formData.domain || undefined,
        };

        await updateChannelMutation({
          variables: {
            id: editingChannel.id,
            input: updateInput,
          },
        });

        success(
          "Chaîne mise à jour !",
          "Les modifications ont été sauvegardées"
        );
      } else {
        // Create new channel
        const createInput: CreateChannelInput = {
          youtubeUrl: formData.youtubeUrl,
          username: formData.username,
          subscriberCount: formData.subscriberCount,
          language: formData.language,
          channelPurpose: DEFAULT_PURPOSE,
          type: formData.type,
          domain: formData.domain || undefined,
        };

        await createChannelMutation({
          variables: { input: createInput },
        });

        success("Chaîne ajoutée !", "La nouvelle chaîne a été enregistrée");
      }

      onSave();
      onClose();
    } catch (err) {
      error("Erreur de sauvegarde", "Impossible d'enregistrer la chaîne");
      console.error("Save error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "Modifier la chaîne" : "Ajouter une chaîne"}
      size="lg"
    >
      <div className="p-6 space-y-6">
        {/* Header Icon */}
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-red-100 rounded-xl">
            {isEditMode ? (
              <Edit color="#FF0000" size={24} className="text-red-600" />
            ) : (
              <Add color="#FF0000" size={24} className="text-red-600" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {isEditMode
                ? "Modification d'une chaîne"
                : "Nouvelle chaîne YouTube"}
            </h3>
            <p className="text-sm text-gray-500">
              {isEditMode
                ? "Modifiez les informations de la chaîne existante"
                : "Ajoutez une nouvelle chaîne YouTube à votre collection"}
            </p>
          </div>
        </div>

        {/* URL Field */}
        <div>
          <Input
            label="URL YouTube *"
            placeholder="https://youtube.com/@channel"
            value={formData.youtubeUrl || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, youtubeUrl: e.target.value }))
            }
          />
          <p className="text-xs text-gray-500 mt-1">
            Formats acceptés: @username, /channel/ID, /c/channel, /user/username
          </p>
        </div>

        {/* Username Field */}
        <div className="relative">
          <Input
            label="Nom d'utilisateur *"
            placeholder="@username"
            value={formData.username || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, username: e.target.value }))
            }
            disabled={isExtracting}
          />
          {isExtracting && (
            <div className="absolute right-3 top-9">
              <SpinLoader />
            </div>
          )}
          {isExtracting && (
            <p className="text-xs text-blue-600 mt-1">
              Extraction automatique en cours...
            </p>
          )}
        </div>

        {/* Subscriber Count Display */}
        {(formData.subscriberCount ?? 0) > 0 && (
          <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 rounded-full p-2">
                <TrendUp color="#FF0000" size={20} className="text-red-600" />
              </div>
              <div>
                <h4 className="font-medium text-red-900">
                  Informations extraites
                </h4>
                <p className="text-sm text-red-700">
                  <strong>
                    {formatSubscriberCount(formData.subscriberCount ?? 0)}
                  </strong>{" "}
                  abonnés
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tag and Type Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <CustomSelect
              label="Langue *"
              options={LANGUAGE_OPTIONS}
              value={formData.language || null}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, language: value as ChannelLanguage }))
              }
              placeholder="Sélectionner une langue"
            />
            <p className="text-xs text-gray-500 mt-1">
              VF, VOSTFR, VA, VOSTA, VO
            </p>
          </div>

          <div>
            <CustomSelect
              label="Type de contenu *"
              options={TYPE_OPTIONS}
              value={formData.type || null}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, type: value as ChannelType }))
              }
              placeholder="Sélectionner un type"
            />
            <p className="text-xs text-gray-500 mt-1">
              Mix (varié) ou Only (spécialisé)
            </p>
          </div>
        </div>

        {/* Domain Field (if Only type) */}
        {formData.type === "ONLY" && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <Input
              label="Domaine spécialisé *"
              placeholder="Gaming, Tech, Music, Art, Sport, Cuisine..."
              value={formData.domain || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, domain: e.target.value }))
              }
            />
            <p className="text-xs text-purple-600 mt-1">
              Spécifiez le domaine principal de cette chaîne spécialisée
            </p>
          </div>
        )}

        {/* Preview Section */}
        {formData.username && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <Youtube color="#FF0000" size={16} className="text-red-600" />
              Aperçu de la chaîne
            </h4>
            <div className="text-sm text-gray-700 space-y-1">
              <p>
                <strong>Nom:</strong> {formData.username}
              </p>
              {(formData.subscriberCount ?? 0) > 0 && (
                <p>
                  <strong>Abonnés:</strong>{" "}
                  {formatSubscriberCount(formData.subscriberCount ?? 0)}
                </p>
              )}
              {formData.language && (
                <p>
                  <strong>Langue:</strong> {formData.language}
                </p>
              )}
              {formData.type && (
                <p>
                  <strong>Type:</strong> {formData.type}
                </p>
              )}
              {formData.domain && (
                <p>
                  <strong>Domaine:</strong> {formData.domain}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-end space-x-3 p-6 bg-gray-50 border-t border-gray-200">
        <Button
          onClick={onClose}
          className="px-6 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          disabled={isSaving || isExtracting}
        >
          Annuler
        </Button>

        <Button
          onClick={handleSave}
          disabled={isSaving || isExtracting}
          className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <SpinLoader />
              <span>Sauvegarde...</span>
            </>
          ) : (
            <>
              <Save2 color="white" size={16} className="text-white" />
              <span>{isEditMode ? "Mettre à jour" : "Ajouter la chaîne"}</span>
            </>
          )}
        </Button>
      </div>
    </BaseModal>
  );
};
