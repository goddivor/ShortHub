// src/lib/graphql.ts
import { gql } from '@apollo/client';

// ============================================
// AUTHENTICATION
// ============================================

export const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
      refreshToken
      user {
        id
        username
        email
        role
        status
        emailNotifications
        whatsappNotifications
      }
    }
  }
`;

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;

export const CHANGE_PASSWORD_MUTATION = gql`
  mutation ChangePassword($oldPassword: String!, $newPassword: String!) {
    changePassword(oldPassword: $oldPassword, newPassword: $newPassword)
  }
`;

export const ME_QUERY = gql`
  query Me {
    me {
      id
      username
      email
      role
      status
      phone
      whatsappLinked
      profileImage
      emailNotifications
      whatsappNotifications
      createdAt
      assignedTo {
        id
        username
      }
      stats {
        totalVideosAssigned
        totalVideosCompleted
        totalVideosInProgress
        completionRate
        averageCompletionTime
        videosCompletedThisMonth
        videosLate
        videosOnTime
      }
    }
  }
`;

// ============================================
// CHANNELS
// ============================================

export const GET_CHANNELS_QUERY = gql`
  query GetChannels($first: Int, $after: String, $purpose: ChannelPurpose, $language: ChannelLanguage) {
    channels(first: $first, after: $after, purpose: $purpose, language: $language) {
      edges {
        cursor
        node {
          id
          youtubeUrl
          channelId
          username
          subscriberCount
          language
          country
          editType
          channelPurpose
          type
          domain
          createdAt
          stats {
            totalVideosRolled
            totalVideosPublished
            subscriberGrowthLast30Days
            subscriberGrowthRate
          }
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;

export const GET_CHANNEL_QUERY = gql`
  query GetChannel($id: ID!) {
    channel(id: $id) {
      id
      youtubeUrl
      channelId
      username
      subscriberCount
      language
      country
      editType
      channelPurpose
      type
      domain
      subscriberHistory {
        count
        date
      }
      stats {
        totalVideosRolled
        totalVideosPublished
        subscriberGrowthLast30Days
        subscriberGrowthRate
      }
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_CHANNEL_MUTATION = gql`
  mutation CreateChannel($input: CreateChannelInput!) {
    createChannel(input: $input) {
      id
      youtubeUrl
      username
      subscriberCount
      language
      channelPurpose
      type
    }
  }
`;

export const UPDATE_CHANNEL_MUTATION = gql`
  mutation UpdateChannel($id: ID!, $input: UpdateChannelInput!) {
    updateChannel(id: $id, input: $input) {
      id
      username
      subscriberCount
      language
      type
    }
  }
`;

export const DELETE_CHANNEL_MUTATION = gql`
  mutation DeleteChannel($id: ID!) {
    deleteChannel(id: $id)
  }
`;

export const REFRESH_CHANNEL_SUBSCRIBERS_MUTATION = gql`
  mutation RefreshChannelSubscribers($id: ID!) {
    refreshChannelSubscribers(id: $id) {
      id
      subscriberCount
      subscriberHistory {
        count
        date
      }
    }
  }
`;

// ============================================
// VIDEOS
// ============================================

export const GET_VIDEOS_QUERY = gql`
  query GetVideos($first: Int, $after: String, $filter: VideoFilterInput) {
    videos(first: $first, after: $after, filter: $filter) {
      edges {
        cursor
        node {
          id
          sourceChannel {
            id
            username
            language
          }
          sourceVideoUrl
          rolledAt
          assignedTo {
            id
            username
          }
          assignedBy {
            id
            username
          }
          assignedAt
          publicationChannel {
            id
            username
          }
          scheduledDate
          status
          completedAt
          validatedAt
          publishedAt
          title
          tags
          notes
          adminFeedback
          isLate
          daysUntilDeadline
          timeToComplete
          createdAt
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;

export const GET_VIDEO_QUERY = gql`
  query GetVideo($id: ID!) {
    video(id: $id) {
      id
      sourceChannel {
        id
        username
        language
      }
      sourceVideoUrl
      rolledAt
      assignedTo {
        id
        username
        email
      }
      assignedBy {
        id
        username
      }
      assignedAt
      publicationChannel {
        id
        username
      }
      scheduledDate
      status
      completedAt
      validatedAt
      publishedAt
      title
      description
      tags
      notes
      adminFeedback
      isLate
      daysUntilDeadline
      timeToComplete
      comments {
        id
        author {
          id
          username
        }
        comment
        createdAt
      }
      createdAt
      updatedAt
    }
  }
`;

export const ROLL_VIDEOS_MUTATION = gql`
  mutation RollVideos($input: RollVideosInput!) {
    rollVideos(input: $input) {
      id
      title
      sourceVideoUrl
      sourceChannel {
        id
        username
      }
      tags
      rolledAt
      status
    }
  }
`;

export const ASSIGN_VIDEO_MUTATION = gql`
  mutation AssignVideo($input: AssignVideoInput!) {
    assignVideo(input: $input) {
      id
      status
      assignedTo {
        id
        username
      }
      publicationChannel {
        id
        username
      }
      scheduledDate
      notes
    }
  }
`;

export const UPDATE_VIDEO_STATUS_MUTATION = gql`
  mutation UpdateVideoStatus($input: UpdateVideoStatusInput!) {
    updateVideoStatus(input: $input) {
      id
      status
      completedAt
      validatedAt
      publishedAt
      adminFeedback
    }
  }
`;

export const DELETE_VIDEO_MUTATION = gql`
  mutation DeleteVideo($id: ID!) {
    deleteVideo(id: $id)
  }
`;

export const ADD_VIDEO_COMMENT_MUTATION = gql`
  mutation AddVideoComment($videoId: ID!, $comment: String!) {
    addVideoComment(videoId: $videoId, comment: $comment) {
      id
      author {
        id
        username
      }
      comment
      createdAt
    }
  }
`;

export const DELETE_VIDEO_COMMENT_MUTATION = gql`
  mutation DeleteVideoComment($id: ID!) {
    deleteVideoComment(id: $id)
  }
`;

// ============================================
// CALENDAR
// ============================================

export const GET_CALENDAR_VIDEOS_QUERY = gql`
  query GetCalendarVideos($startDate: DateTime!, $endDate: DateTime!, $userId: ID) {
    calendarVideos(startDate: $startDate, endDate: $endDate, userId: $userId) {
      id
      title
      scheduledDate
      status
      isLate
      assignedTo {
        id
        username
      }
      sourceChannel {
        id
        username
      }
      publicationChannel {
        id
        username
      }
    }
  }
`;

// ============================================
// ANALYTICS
// ============================================

export const GET_DASHBOARD_ANALYTICS_QUERY = gql`
  query GetDashboardAnalytics {
    dashboardAnalytics {
      totalChannels
      totalSourceChannels
      totalPublicationChannels
      totalVideos
      totalUsers
      videosRolled
      videosAssigned
      videosInProgress
      videosCompleted
      videosValidated
      videosPublished
      videosRejected
      videosLate
      videosCompletedLast7Days {
        date
        count
      }
      videosCompletedLast30Days {
        date
        count
      }
      averageCompletionTime
      completionRate
      topVideastes {
        user {
          id
          username
        }
        videosCompleted
        completionRate
        averageTime
      }
      totalSubscribers
      subscriberGrowthLast30Days
      channelsGrowth {
        channel {
          id
          username
        }
        subscriberCount
        growth30Days
        growthRate
      }
    }
  }
`;

export const GET_CHANNEL_ANALYTICS_QUERY = gql`
  query GetChannelAnalytics($channelId: ID!) {
    channelAnalytics(channelId: $channelId) {
      totalVideosRolled
      totalVideosPublished
      subscriberGrowthLast30Days
      subscriberGrowthRate
    }
  }
`;

export const GET_USER_ANALYTICS_QUERY = gql`
  query GetUserAnalytics($userId: ID!) {
    userAnalytics(userId: $userId) {
      totalVideosAssigned
      totalVideosCompleted
      totalVideosInProgress
      completionRate
      averageCompletionTime
      videosCompletedThisMonth
      videosLate
      videosOnTime
    }
  }
`;

// ============================================
// USERS
// ============================================

export const GET_USERS_QUERY = gql`
  query GetUsers($first: Int, $after: String, $role: UserRole, $status: UserStatus) {
    users(first: $first, after: $after, role: $role, status: $status) {
      edges {
        cursor
        node {
          id
          username
          email
          role
          status
          phone
          profileImage
          emailNotifications
          whatsappNotifications
          createdAt
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;

export const CREATE_USER_MUTATION = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      username
      email
      role
      status
    }
  }
`;

export const UPDATE_USER_STATUS_MUTATION = gql`
  mutation UpdateUserStatus($id: ID!, $status: UserStatus!) {
    updateUserStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

export const UPDATE_USER_MUTATION = gql`
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
      username
      email
      phone
      whatsappLinked
      emailNotifications
      whatsappNotifications
    }
  }
`;

export const DELETE_USER_MUTATION = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
  }
`;

export const CHANGE_USER_PASSWORD_MUTATION = gql`
  mutation AdminChangeUserPassword($userId: ID!, $newPassword: String!) {
    adminChangeUserPassword(userId: $userId, newPassword: $newPassword)
  }
`;

export const UPLOAD_PROFILE_IMAGE_MUTATION = gql`
  mutation UploadProfileImage($base64Image: String!) {
    uploadProfileImage(base64Image: $base64Image) {
      id
      username
      profileImage
    }
  }
`;

export const REMOVE_PROFILE_IMAGE_MUTATION = gql`
  mutation RemoveProfileImage {
    removeProfileImage {
      id
      username
      profileImage
    }
  }
`;

// ============================================
// NOTIFICATIONS
// ============================================

export const GET_NOTIFICATIONS_QUERY = gql`
  query GetNotifications($first: Int, $after: String, $unreadOnly: Boolean) {
    notifications(first: $first, after: $after, unreadOnly: $unreadOnly) {
      edges {
        cursor
        node {
          id
          type
          message
          short {
            id
            videoId
            title
            sourceChannel {
              id
              channelName
            }
          }
          sentViaEmail
          sentViaWhatsApp
          sentViaPlatform
          emailSentAt
          whatsappSentAt
          platformSentAt
          read
          readAt
          createdAt
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;

export const GET_UNREAD_NOTIFICATIONS_COUNT_QUERY = gql`
  query GetUnreadNotificationsCount {
    unreadNotificationsCount
  }
`;

export const MARK_NOTIFICATION_AS_READ_MUTATION = gql`
  mutation MarkNotificationAsRead($id: ID!) {
    markNotificationAsRead(id: $id) {
      id
      read
      readAt
    }
  }
`;

export const MARK_ALL_NOTIFICATIONS_AS_READ_MUTATION = gql`
  mutation MarkAllNotificationsAsRead {
    markAllNotificationsAsRead
  }
`;

export const DELETE_NOTIFICATION_MUTATION = gql`
  mutation DeleteNotification($id: ID!) {
    deleteNotification(id: $id)
  }
`;

// ============================================
// NOTIFICATION SETTINGS (Global Admin)
// ============================================

export const GET_NOTIFICATION_SETTINGS_QUERY = gql`
  query GetNotificationSettings {
    notificationSettings {
      id
      platformNotificationsEnabled
      emailNotificationsEnabled
      whatsappNotificationsEnabled
      updatedAt
    }
  }
`;

export const UPDATE_NOTIFICATION_SETTINGS_MUTATION = gql`
  mutation UpdateNotificationSettings($input: UpdateNotificationSettingsInput!) {
    updateNotificationSettings(input: $input) {
      id
      platformNotificationsEnabled
      emailNotificationsEnabled
      whatsappNotificationsEnabled
      updatedAt
    }
  }
`;

// ============================================
// SOURCE CHANNELS
// ============================================

export const GET_SOURCE_CHANNELS_QUERY = gql`
  query GetSourceChannels($contentType: ContentType) {
    sourceChannels(contentType: $contentType) {
      id
      channelId
      channelName
      profileImageUrl
      contentType
      totalVideos
      shortsRolled {
        id
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_SOURCE_CHANNEL_QUERY = gql`
  query GetSourceChannel($id: ID!) {
    sourceChannel(id: $id) {
      id
      channelId
      channelName
      profileImageUrl
      contentType
      totalVideos
      shortsRolled {
        id
        videoId
        videoUrl
        status
        title
        rolledAt
      }
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_SOURCE_CHANNEL_MUTATION = gql`
  mutation CreateSourceChannel($input: CreateSourceChannelInput!) {
    createSourceChannel(input: $input) {
      id
      channelId
      channelName
      profileImageUrl
      contentType
      totalVideos
      createdAt
    }
  }
`;

export const UPDATE_SOURCE_CHANNEL_MUTATION = gql`
  mutation UpdateSourceChannel($id: ID!, $input: UpdateSourceChannelInput!) {
    updateSourceChannel(id: $id, input: $input) {
      id
      channelName
      profileImageUrl
      contentType
      updatedAt
    }
  }
`;

export const DELETE_SOURCE_CHANNEL_MUTATION = gql`
  mutation DeleteSourceChannel($id: ID!) {
    deleteSourceChannel(id: $id)
  }
`;

// ============================================
// ADMIN CHANNELS
// ============================================

export const GET_ADMIN_CHANNELS_QUERY = gql`
  query GetAdminChannels {
    adminChannels {
      id
      channelId
      channelName
      profileImageUrl
      contentType
      totalVideos
      subscriberCount
      createdAt
      updatedAt
      stats {
        totalShortsPublished
        totalShortsInProgress
        totalShortsCompleted
        videosPublishedLast7Days {
          date
          count
        }
        videosPublishedLast30Days {
          date
          count
        }
      }
    }
  }
`;

// ============================================
// ADMIN DASHBOARD - Requête optimisée combinée
// ============================================

export const GET_ADMIN_DASHBOARD_STATS_QUERY = gql`
  query GetAdminDashboardStats {
    sourceChannels {
      id
      channelId
      channelName
      profileImageUrl
      contentType
      totalVideos
      createdAt
    }
    adminChannels {
      id
      channelId
      channelName
      profileImageUrl
      contentType
      totalVideos
      subscriberCount
      shortsAssigned {
        id
      }
      createdAt
    }
    users {
      totalCount
      edges {
        node {
          id
          username
          role
          status
        }
      }
    }
  }
`;

export const GET_ADMIN_CHANNEL_QUERY = gql`
  query GetAdminChannel($id: ID!) {
    adminChannel(id: $id) {
      id
      channelId
      channelName
      profileImageUrl
      contentType
      totalVideos
      subscriberCount
      createdAt
      updatedAt
      shortsAssigned {
        id
        videoId
        videoUrl
        status
        title
        assignedAt
        deadline
        assignedTo {
          id
          username
        }
      }
      stats {
        totalShortsPublished
        totalShortsInProgress
        totalShortsCompleted
        videosPublishedLast7Days {
          date
          count
        }
        videosPublishedLast30Days {
          date
          count
        }
      }
    }
  }
`;

export const GET_ADMIN_CHANNEL_STATS_QUERY = gql`
  query GetAdminChannelStats($channelId: ID!) {
    adminChannelStats(channelId: $channelId) {
      totalShortsPublished
      totalShortsInProgress
      totalShortsCompleted
      videosPublishedLast7Days {
        date
        count
      }
      videosPublishedLast30Days {
        date
        count
      }
    }
  }
`;

export const CREATE_ADMIN_CHANNEL_MUTATION = gql`
  mutation CreateAdminChannel($input: CreateAdminChannelInput!) {
    createAdminChannel(input: $input) {
      id
      channelId
      channelName
      profileImageUrl
      contentType
      totalVideos
      subscriberCount
      createdAt
    }
  }
`;

export const UPDATE_ADMIN_CHANNEL_MUTATION = gql`
  mutation UpdateAdminChannel($id: ID!, $input: UpdateAdminChannelInput!) {
    updateAdminChannel(id: $id, input: $input) {
      id
      channelName
      profileImageUrl
      contentType
      updatedAt
    }
  }
`;

export const DELETE_ADMIN_CHANNEL_MUTATION = gql`
  mutation DeleteAdminChannel($id: ID!) {
    deleteAdminChannel(id: $id)
  }
`;

// ============================================
// SHORTS
// ============================================

export const GET_SHORTS_QUERY = gql`
  query GetShorts($filter: ShortFilterInput) {
    shorts(filter: $filter) {
      id
      videoId
      videoUrl
      status
      title
      description
      tags
      rolledAt
      retainedAt
      rejectedAt
      assignedAt
      deadline
      completedAt
      validatedAt
      publishedAt
      notes
      adminFeedback
      sourceChannel {
        id
        channelName
        profileImageUrl
        contentType
      }
      assignedTo {
        id
        username
      }
      assignedBy {
        id
        username
      }
      targetChannel {
        id
        channelName
        profileImageUrl
      }
      driveFileId
      driveFileUrl
      driveFolderId
      fileName
      fileSize
      mimeType
      uploadedAt
      isLate
      daysUntilDeadline
      timeToComplete
      createdAt
      updatedAt
    }
  }
`;

export const GET_SHORT_QUERY = gql`
  query GetShort($id: ID!) {
    short(id: $id) {
      id
      videoId
      videoUrl
      status
      title
      description
      tags
      rolledAt
      retainedAt
      rejectedAt
      assignedAt
      deadline
      completedAt
      validatedAt
      publishedAt
      notes
      adminFeedback
      sourceChannel {
        id
        channelName
        profileImageUrl
        contentType
      }
      assignedTo {
        id
        username
        email
      }
      assignedBy {
        id
        username
      }
      targetChannel {
        id
        channelName
        profileImageUrl
      }
      comments {
        id
        author {
          id
          username
        }
        comment
        createdAt
      }
      isLate
      daysUntilDeadline
      timeToComplete
      createdAt
      updatedAt
    }
  }
`;

export const ROLL_SHORT_MUTATION = gql`
  mutation RollShort($input: RollShortInput!) {
    rollShort(input: $input) {
      id
      videoId
      videoUrl
      status
      title
      tags
      rolledAt
      sourceChannel {
        id
        channelName
        contentType
      }
    }
  }
`;

export const RETAIN_SHORT_MUTATION = gql`
  mutation RetainShort($shortId: ID!) {
    retainShort(shortId: $shortId) {
      id
      videoId
      videoUrl
      status
      title
      retainedAt
      rolledAt
      sourceChannel {
        id
        channelName
        profileImageUrl
        contentType
      }
    }
  }
`;

export const REJECT_SHORT_MUTATION = gql`
  mutation RejectShort($shortId: ID!) {
    rejectShort(shortId: $shortId) {
      id
      status
      rejectedAt
    }
  }
`;

export const ASSIGN_SHORT_MUTATION = gql`
  mutation AssignShort($input: AssignShortInput!) {
    assignShort(input: $input) {
      id
      status
      assignedAt
      deadline
      notes
      assignedTo {
        id
        username
      }
      assignedBy {
        id
        username
      }
      targetChannel {
        id
        channelName
      }
    }
  }
`;

export const REASSIGN_SHORT_MUTATION = gql`
  mutation ReassignShort($shortId: ID!, $newVideasteId: ID!) {
    reassignShort(shortId: $shortId, newVideasteId: $newVideasteId) {
      id
      assignedTo {
        id
        username
      }
    }
  }
`;

export const UPDATE_SHORT_STATUS_MUTATION = gql`
  mutation UpdateShortStatus($input: UpdateShortStatusInput!) {
    updateShortStatus(input: $input) {
      id
      status
      completedAt
      validatedAt
      publishedAt
      adminFeedback
    }
  }
`;

export const DELETE_SHORT_MUTATION = gql`
  mutation DeleteShort($id: ID!) {
    deleteShort(id: $id)
  }
`;

export const CREATE_SHORT_COMMENT_MUTATION = gql`
  mutation CreateShortComment($input: CreateShortCommentInput!) {
    createShortComment(input: $input) {
      id
      author {
        id
        username
      }
      comment
      createdAt
    }
  }
`;

export const DELETE_SHORT_COMMENT_MUTATION = gql`
  mutation DeleteShortComment($id: ID!) {
    deleteShortComment(id: $id)
  }
`;

// ============================================
// SHORTS STATS
// ============================================

export const GET_SHORTS_STATS_QUERY = gql`
  query GetShortsStats {
    shortsStats {
      totalRolled
      totalRetained
      totalRejected
      totalAssigned
      totalInProgress
      totalCompleted
      totalValidated
      totalPublished
    }
  }
`;

// ============================================
// VIDEASTE QUERIES
// ============================================

export const GET_MY_SHORTS_QUERY = gql`
  query GetMyShorts($filter: ShortFilterInput) {
    shorts(filter: $filter) {
      id
      videoId
      videoUrl
      status
      title
      description
      tags
      rolledAt
      assignedAt
      deadline
      completedAt
      notes
      adminFeedback
      sourceChannel {
        id
        channelName
        profileImageUrl
        contentType
      }
      targetChannel {
        id
        channelName
        profileImageUrl
        contentType
      }
      assignedBy {
        id
        username
      }
      isLate
      daysUntilDeadline
      timeToComplete
      createdAt
      updatedAt
    }
  }
`;

export const START_SHORT_MUTATION = gql`
  mutation StartShort($shortId: ID!) {
    updateShortStatus(input: { shortId: $shortId, status: IN_PROGRESS }) {
      id
      status
      updatedAt
    }
  }
`;

export const COMPLETE_SHORT_MUTATION = gql`
  mutation CompleteShort($shortId: ID!) {
    updateShortStatus(input: { shortId: $shortId, status: COMPLETED }) {
      id
      status
      completedAt
      updatedAt
    }
  }
`;

// ============================================
// GOOGLE DRIVE
// ============================================

export const GET_GOOGLE_DRIVE_CONNECTION_INFO_QUERY = gql`
  query GetGoogleDriveConnectionInfo {
    googleDriveConnectionInfo {
      isConnected
      rootFolderId
      rootFolderName
      lastSync
    }
  }
`;

export const GET_GOOGLE_DRIVE_AUTH_URL_MUTATION = gql`
  mutation GetGoogleDriveAuthUrl {
    getGoogleDriveAuthUrl
  }
`;

export const DISCONNECT_GOOGLE_DRIVE_MUTATION = gql`
  mutation DisconnectGoogleDrive {
    disconnectGoogleDrive
  }
`;
