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

export const ME_QUERY = gql`
  query Me {
    me {
      id
      username
      email
      role
      status
      phone
      emailNotifications
      whatsappNotifications
      createdAt
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
          video {
            id
            title
          }
          read
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

// ============================================
// SUBSCRIPTIONS
// ============================================

export const NOTIFICATION_RECEIVED_SUBSCRIPTION = gql`
  subscription NotificationReceived($userId: ID!) {
    notificationReceived(userId: $userId) {
      id
      type
      message
      video {
        id
        title
      }
      read
      createdAt
    }
  }
`;

export const VIDEO_STATUS_CHANGED_SUBSCRIPTION = gql`
  subscription VideoStatusChanged($videoId: ID) {
    videoStatusChanged(videoId: $videoId) {
      id
      status
      completedAt
      validatedAt
      publishedAt
    }
  }
`;

export const VIDEO_ASSIGNED_SUBSCRIPTION = gql`
  subscription VideoAssigned($userId: ID!) {
    videoAssigned(userId: $userId) {
      id
      title
      assignedTo {
        id
        username
      }
      scheduledDate
      status
    }
  }
`;
