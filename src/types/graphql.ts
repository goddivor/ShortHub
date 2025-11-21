// src/types/graphql.ts
// GraphQL Types for Frontend

export enum UserRole {
  ADMIN = 'ADMIN',
  VIDEASTE = 'VIDEASTE',
  ASSISTANT = 'ASSISTANT',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  BLOCKED = 'BLOCKED',
}

export enum ChannelLanguage {
  VF = 'VF',
  VA = 'VA',
  VOSTFR = 'VOSTFR',
  VOSTA = 'VOSTA',
  VO = 'VO',
}

export enum ChannelCountry {
  USA = 'USA',
  FRANCE = 'FRANCE',
  OTHER = 'OTHER',
}

export enum EditType {
  SANS_EDIT = 'SANS_EDIT',
  AVEC_EDIT = 'AVEC_EDIT',
}

// Types de contenu pour les chaînes sources
export enum ContentType {
  VA_SANS_EDIT = 'VA_SANS_EDIT',  // Version Anglaise sans édition
  VA_AVEC_EDIT = 'VA_AVEC_EDIT',  // Version Anglaise avec édition
  VF_SANS_EDIT = 'VF_SANS_EDIT',  // Version Française sans édition
  VF_AVEC_EDIT = 'VF_AVEC_EDIT',  // Version Française avec édition
  VO_SANS_EDIT = 'VO_SANS_EDIT',  // Version Originale sans édition (source uniquement)
  VO_AVEC_EDIT = 'VO_AVEC_EDIT',  // Version Originale avec édition (source uniquement)
}

export enum ChannelPurpose {
  SOURCE = 'SOURCE',
  PUBLICATION = 'PUBLICATION',
}

export enum ChannelType {
  MIX = 'MIX',
  ONLY = 'ONLY',
}

// Statuts pour les shorts
export enum ShortStatus {
  ROLLED = 'ROLLED',           // Short généré aléatoirement
  RETAINED = 'RETAINED',       // Short retenu par l'admin
  REJECTED = 'REJECTED',       // Short rejeté (peut réapparaître)
  ASSIGNED = 'ASSIGNED',       // Assigné à un vidéaste
  IN_PROGRESS = 'IN_PROGRESS', // Vidéaste travaille dessus
  COMPLETED = 'COMPLETED',     // Vidéaste a terminé
  VALIDATED = 'VALIDATED',     // Admin a validé
  PUBLISHED = 'PUBLISHED',     // Publié sur YouTube
}

// Garder VideoStatus pour compatibilité
export enum VideoStatus {
  ROLLED = 'ROLLED',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  VALIDATED = 'VALIDATED',
  PUBLISHED = 'PUBLISHED',
  REJECTED = 'REJECTED',
}

export enum NotificationType {
  // Workflow Shorts - Vidéaste
  SHORT_ASSIGNED = 'SHORT_ASSIGNED',                      // Nouveau short assigné
  SHORT_DEADLINE_REMINDER = 'SHORT_DEADLINE_REMINDER',    // Rappel 24h avant deadline
  SHORT_LATE = 'SHORT_LATE',                              // Short en retard

  // Workflow Shorts - Admin
  SHORT_COMPLETED = 'SHORT_COMPLETED',                    // Vidéaste a terminé
  SHORT_VALIDATED = 'SHORT_VALIDATED',                    // Admin a validé
  SHORT_REJECTED = 'SHORT_REJECTED',                      // Admin a rejeté
  SHORT_PUBLISHED = 'SHORT_PUBLISHED',                    // Short publié

  // Gestion utilisateurs
  ACCOUNT_CREATED = 'ACCOUNT_CREATED',                    // Compte créé
  ACCOUNT_BLOCKED = 'ACCOUNT_BLOCKED',                    // Compte bloqué
  ACCOUNT_UNBLOCKED = 'ACCOUNT_UNBLOCKED',                // Compte débloqué

  // Commentaires
  SHORT_COMMENT_ADDED = 'SHORT_COMMENT_ADDED',            // Nouveau commentaire
}

// ============================================
// NOUVEAUX TYPES - SYSTÈME DE SHORTS
// ============================================

// Chaîne Source - Chaînes dont on récupère les shorts
export interface SourceChannel {
  id: string;
  channelId: string;
  channelName: string;
  profileImageUrl?: string;
  contentType: ContentType;
  totalVideos?: number;
  shortsRolled?: Short[];
  createdAt: string;
  updatedAt: string;
}

// Chaîne Admin - Chaînes YouTube de l'admin
export interface AdminChannel {
  id: string;
  channelId: string;
  channelName: string;
  profileImageUrl: string;
  contentType: ContentType;
  totalVideos?: number;
  subscriberCount?: number;
  shortsAssigned?: Short[];
  stats?: AdminChannelStats;
  createdAt: string;
  updatedAt: string;
}

export interface AdminChannelStats {
  totalShortsPublished: number;
  totalShortsInProgress: number;
  totalShortsCompleted: number;
  videosPublishedLast7Days: DailyVideoCount[];
  videosPublishedLast30Days: DailyVideoCount[];
}

// Short - Vidéo courte récupérée depuis une chaîne source
export interface Short {
  id: string;
  videoId: string;
  videoUrl: string;
  sourceChannel: SourceChannel;
  status: ShortStatus;
  rolledAt: string;
  retainedAt?: string;
  rejectedAt?: string;
  assignedTo?: User;
  assignedBy?: User;
  assignedAt?: string;
  deadline?: string;
  targetChannel?: AdminChannel;
  completedAt?: string;
  validatedAt?: string;
  publishedAt?: string;
  title?: string;
  description?: string;
  tags: string[];
  notes?: string;
  adminFeedback?: string;
  comments?: ShortComment[];
  isLate: boolean;
  daysUntilDeadline?: number;
  timeToComplete?: number;
  // Google Drive fields
  driveFileId?: string;
  driveFileUrl?: string;
  driveFolderId?: string;
  uploadedAt?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShortComment {
  id: string;
  short: Short;
  author: User;
  comment: string;
  createdAt: string;
}

// User Types
export interface User {
  id: string;
  username: string;
  email?: string;  // Optional - connected by user themselves
  role: UserRole;
  status: UserStatus;
  phone?: string;
  whatsappLinked: boolean;
  emailNotifications: boolean;
  whatsappNotifications: boolean;
  createdBy?: User;
  assignedTo?: User;
  stats?: UserStats;
  profileImage?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  totalVideosAssigned: number;
  totalVideosCompleted: number;
  totalVideosInProgress: number;
  completionRate: number;
  averageCompletionTime?: number;
  videosCompletedThisMonth: number;
  videosLate: number;
  videosOnTime: number;
}

// Channel Types
export interface Channel {
  id: string;
  youtubeUrl: string;
  channelId: string;
  username: string;
  subscriberCount: number;
  language: ChannelLanguage;
  country?: ChannelCountry;
  editType?: EditType;
  channelPurpose: ChannelPurpose;
  type: ChannelType;
  domain?: string;
  ownedBy?: User;
  subscriberHistory: SubscriberHistoryEntry[];
  stats?: ChannelStats;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriberHistoryEntry {
  count: number;
  date: string;
}

export interface ChannelStats {
  totalVideosRolled: number;
  totalVideosPublished: number;
  subscriberGrowthLast30Days: number;
  subscriberGrowthRate?: number;
}

// Video Types
export interface Video {
  id: string;
  sourceChannel: Channel;
  sourceVideoUrl: string;
  rolledAt: string;
  assignedTo?: User;
  assignedBy?: User;
  assignedAt?: string;
  publicationChannel?: Channel;
  scheduledDate?: string;
  status: VideoStatus;
  completedAt?: string;
  validatedAt?: string;
  publishedAt?: string;
  title?: string;
  description?: string;
  tags: string[];
  notes?: string;
  adminFeedback?: string;
  comments?: VideoComment[];
  isLate: boolean;
  daysUntilDeadline?: number;
  timeToComplete?: number;
  createdAt: string;
  updatedAt: string;
}

export interface VideoComment {
  id: string;
  video: Video;
  author: User;
  comment: string;
  createdAt: string;
}

// Notification Types
export interface Notification {
  id: string;
  recipient: User;
  type: NotificationType;
  short?: Short;                // Référence au short concerné
  message: string;
  sentViaEmail: boolean;
  sentViaWhatsApp: boolean;
  sentViaPlatform: boolean;     // Notification sur la plateforme
  emailSentAt?: string;
  whatsappSentAt?: string;
  platformSentAt?: string;
  read: boolean;
  readAt?: string;
  createdAt: string;
}

// Analytics Types
export interface DashboardAnalytics {
  totalChannels: number;
  totalSourceChannels: number;
  totalPublicationChannels: number;
  totalVideos: number;
  totalUsers: number;
  videosRolled: number;
  videosAssigned: number;
  videosInProgress: number;
  videosCompleted: number;
  videosValidated: number;
  videosPublished: number;
  videosRejected: number;
  videosLate: number;
  videosCompletedLast7Days: DailyVideoCount[];
  videosCompletedLast30Days: DailyVideoCount[];
  averageCompletionTime: number;
  completionRate: number;
  topVideastes: VideoastePerformance[];
  totalSubscribers: number;
  subscriberGrowthLast30Days: number;
  channelsGrowth: ChannelGrowth[];
}

export interface DailyVideoCount {
  date: string;
  count: number;
}

export interface VideoastePerformance {
  user: User;
  videosCompleted: number;
  completionRate: number;
  averageTime: number;
}

export interface ChannelGrowth {
  channel: Channel;
  subscriberCount: number;
  growth30Days: number;
  growthRate: number;
}

// Input Types
export interface CreateUserInput {
  username: string;
  password: string;
  role: UserRole;
  // Email and phone are not provided at creation - user connects them later
}

export interface UpdateUserInput {
  email?: string;
  phone?: string;
  whatsappLinked?: boolean;
  emailNotifications?: boolean;
  whatsappNotifications?: boolean;
  profileImage?: string;
}

export interface CreateChannelInput {
  youtubeUrl: string;
  username?: string;
  subscriberCount?: number;
  language: ChannelLanguage;
  country?: ChannelCountry;
  editType?: EditType;
  channelPurpose: ChannelPurpose;
  type: ChannelType;
  domain?: string;
  ownedBy?: string;
}

export interface UpdateChannelInput {
  username?: string;
  subscriberCount?: number;
  language?: ChannelLanguage;
  country?: ChannelCountry;
  editType?: EditType;
  type?: ChannelType;
  domain?: string;
}

export interface RollVideosInput {
  sourceChannelIds: string[];
  count: number;
}

export interface AssignVideoInput {
  videoId: string;
  videasteId: string;
  publicationChannelId: string;
  scheduledDate: string;
  notes?: string;
}

export interface UpdateVideoStatusInput {
  videoId: string;
  status: VideoStatus;
  adminFeedback?: string;
}

export interface VideoFilterInput {
  status?: VideoStatus;
  assignedToId?: string;
  sourceChannelId?: string;
  publicationChannelId?: string;
  startDate?: string;
  endDate?: string;
  isLate?: boolean;
}

// ============================================
// INPUT TYPES - NOUVEAUX
// ============================================

export interface CreateSourceChannelInput {
  youtubeUrl: string;
  contentType: ContentType;
}

export interface UpdateSourceChannelInput {
  contentType?: ContentType;
  profileImageUrl?: string;
}

export interface CreateAdminChannelInput {
  youtubeUrl: string;
  contentType: ContentType;
}

export interface UpdateAdminChannelInput {
  contentType?: ContentType;
  profileImageUrl?: string;
}

export interface RollShortInput {
  sourceChannelId: string;
}

export interface AssignShortInput {
  shortId: string;
  videasteId: string;
  targetChannelId: string;
  deadline: string;
  notes?: string;
}

export interface UpdateShortStatusInput {
  shortId: string;
  status: ShortStatus;
  adminFeedback?: string;
}

export interface CreateShortCommentInput {
  shortId: string;
  comment: string;
}

export interface ShortFilterInput {
  status?: ShortStatus;
  assignedToId?: string;
  sourceChannelId?: string;
  targetChannelId?: string;
  contentType?: ContentType;
  startDate?: string;
  endDate?: string;
}

// Connection Types (for pagination)
export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
  endCursor?: string;
}

export interface Edge<T> {
  cursor: string;
  node: T;
}

export interface Connection<T> {
  edges: Edge<T>[];
  pageInfo: PageInfo;
  totalCount: number;
}

export type VideosConnection = Connection<Video>;
export type ChannelsConnection = Connection<Channel>;
export type UsersConnection = Connection<User>;
export type NotificationsConnection = Connection<Notification>;

// Auth Types
export interface AuthPayload {
  token: string;
  refreshToken: string;
  user: User;
}

// Shorts Stats
export interface ShortsStats {
  totalRolled: number;
  totalRetained: number;
  totalRejected: number;
  totalAssigned: number;
  totalInProgress: number;
  totalCompleted: number;
  totalValidated: number;
  totalPublished: number;
}

// Notification Settings (Global Admin Settings)
export interface NotificationSettings {
  id: string;
  platformNotificationsEnabled: boolean;  // Kill switch pour notifications plateforme
  emailNotificationsEnabled: boolean;     // Kill switch pour notifications email
  whatsappNotificationsEnabled: boolean;  // Kill switch pour notifications WhatsApp
  updatedAt: string;
}

export interface UpdateNotificationSettingsInput {
  platformNotificationsEnabled?: boolean;
  emailNotificationsEnabled?: boolean;
  whatsappNotificationsEnabled?: boolean;
}

// Google Drive Connection Info
export interface GoogleDriveConnectionInfo {
  isConnected: boolean;
  rootFolderId?: string;
  rootFolderName?: string;
  lastSync?: string;
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
