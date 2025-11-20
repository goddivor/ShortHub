import { SourceChannel } from '@/types/graphql';

export interface FilterState {
  language: 'ALL' | 'VF' | 'VA' | 'VO';
  edit: 'ALL' | 'AVEC' | 'SANS';
}

// Fonction helper pour filtrer les chaînes selon les filtres
export function filterChannelsByContentType(
  channels: SourceChannel[],
  filters: FilterState
): SourceChannel[] {
  return channels.filter((channel) => {
    const contentType = channel.contentType;

    // Filtrage par langue
    if (filters.language !== 'ALL') {
      const matchLanguage = contentType.startsWith(filters.language);
      if (!matchLanguage) return false;
    }

    // Filtrage par édition
    if (filters.edit !== 'ALL') {
      const hasEdit = contentType.includes('AVEC_EDIT');
      const noEdit = contentType.includes('SANS_EDIT');

      if (filters.edit === 'AVEC' && !hasEdit) return false;
      if (filters.edit === 'SANS' && !noEdit) return false;
    }

    return true;
  });
}
