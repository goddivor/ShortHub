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

export enum ChannelPurpose {
  SOURCE = 'SOURCE',
  PUBLICATION = 'PUBLICATION',
}

export enum ChannelType {
  MIX = 'MIX',
  ONLY = 'ONLY',
}

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
  VIDEO_ASSIGNED = 'VIDEO_ASSIGNED',
  DEADLINE_REMINDER = 'DEADLINE_REMINDER',
  VIDEO_COMPLETED = 'VIDEO_COMPLETED',
  VIDEO_VALIDATED = 'VIDEO_VALIDATED',
  VIDEO_REJECTED = 'VIDEO_REJECTED',
  ACCOUNT_BLOCKED = 'ACCOUNT_BLOCKED',
  ACCOUNT_UNBLOCKED = 'ACCOUNT_UNBLOCKED',
}

// User Types
export interface User {
  id: string;
  username: string;
  email: string;
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
  video?: Video;
  message: string;
  sentViaEmail: boolean;
  sentViaWhatsApp: boolean;
  emailSentAt?: string;
  whatsappSentAt?: string;
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
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  whatsappLinked?: boolean;
  emailNotifications?: boolean;
  whatsappNotifications?: boolean;
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

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
