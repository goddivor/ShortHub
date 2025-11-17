// src/utils/contentTypeCompatibility.ts
import { ContentType } from '@/types/graphql';

/**
 * Retourne les types de chaînes de publication compatibles avec un type de chaîne source
 *
 * Règles de compatibilité:
 * - Types VA/VF: correspondance exacte uniquement
 * - VO_SANS_EDIT: peut être publié sur VA_SANS_EDIT ou VF_SANS_EDIT
 * - VO_AVEC_EDIT: peut être publié sur VA_AVEC_EDIT ou VF_AVEC_EDIT
 *
 * Principe: Le critère d'édition (SANS_EDIT / AVEC_EDIT) est conservé,
 * seule la langue peut changer pour les chaînes VO.
 */
export function getCompatiblePublicationTypes(sourceType: ContentType): ContentType[] {
  const compatibilityMap: Record<ContentType, ContentType[]> = {
    // Types VA/VF: correspondance exacte
    [ContentType.VA_SANS_EDIT]: [ContentType.VA_SANS_EDIT],
    [ContentType.VA_AVEC_EDIT]: [ContentType.VA_AVEC_EDIT],
    [ContentType.VF_SANS_EDIT]: [ContentType.VF_SANS_EDIT],
    [ContentType.VF_AVEC_EDIT]: [ContentType.VF_AVEC_EDIT],

    // VO: conserve le critère d'édition, change la langue
    [ContentType.VO_SANS_EDIT]: [
      ContentType.VA_SANS_EDIT,
      ContentType.VF_SANS_EDIT,
    ],
    [ContentType.VO_AVEC_EDIT]: [
      ContentType.VA_AVEC_EDIT,
      ContentType.VF_AVEC_EDIT,
    ],
  };

  return compatibilityMap[sourceType] || [];
}

/**
 * Retourne uniquement les types disponibles pour les chaînes de publication
 * (exclut VO_SANS_EDIT et VO_AVEC_EDIT qui sont uniquement pour les chaînes sources)
 */
export function getPublicationContentTypes(): ContentType[] {
  return [
    ContentType.VA_SANS_EDIT,
    ContentType.VA_AVEC_EDIT,
    ContentType.VF_SANS_EDIT,
    ContentType.VF_AVEC_EDIT,
  ];
}

/**
 * Retourne tous les types disponibles pour les chaînes sources
 * (inclut tous les types y compris VO)
 */
export function getSourceContentTypes(): ContentType[] {
  return Object.values(ContentType);
}

/**
 * Vérifie si un type est disponible pour les chaînes de publication
 */
export function isPublicationType(type: ContentType): boolean {
  return getPublicationContentTypes().includes(type);
}

/**
 * Vérifie si deux types sont compatibles pour l'assignation
 */
export function areTypesCompatible(sourceType: ContentType, targetType: ContentType): boolean {
  return getCompatiblePublicationTypes(sourceType).includes(targetType);
}
