# ShortHub - YouTube Shorts Manager

<div align="center">
  <img src="public/logo.svg" alt="ShortHub Logo" width="120" height="120">

  <h3>Collaborative Platform for YouTube Shorts Management</h3>
  <p>A comprehensive web application for managing YouTube Shorts production with team collaboration, scheduling, and real-time tracking</p>

  ![ShortHub Screenshot](public/screenshot.png)
</div>

## 🎯 Overview

ShortHub is a modern collaborative platform designed for YouTube Shorts content production teams. It enables administrators, video editors (videastes), and assistants to efficiently manage the entire Shorts workflow from discovery to publication, with advanced scheduling, assignment tracking, and real-time notifications.

### Key Features

#### 👥 Multi-Role Collaboration
- **Admin Dashboard**: Full control over teams, channels, and assignments
- **Videaste Workspace**: Dedicated interface for video editors to manage their assignments
- **Assistant Support**: Specialized view for assistants working with videastes

#### 📺 Advanced Channel Management
- **Dual Channel Types**: Separate SOURCE channels (for content discovery) and PUBLICATION channels (for publishing)
- **Smart Organization**: Tag channels by language, country, content type, and edit style
- **YouTube Integration**: Automatic data extraction via YouTube Data API v3

#### 🎲 Intelligent Shorts Rolling & Assignment
- **Smart Rolling**: Generate random YouTube Shorts from source channels with filtering
- **Assignment System**: Assign shorts to team members with scheduled publication dates
- **Status Tracking**: Follow shorts through their lifecycle (ROLLED → ASSIGNED → IN_PROGRESS → COMPLETED → VALIDATED → PUBLISHED)

#### 📅 Calendar & Scheduling
- **Publication Calendar**: Visual timeline of scheduled shorts with color-coded status
- **Deadline Tracking**: Automatic detection and highlighting of late assignments
- **Date Management**: Flexible scheduling with drag-and-drop support

#### 🔔 Real-Time Notifications
- **Live Updates**: WebSocket-based notifications for assignments, completions, and reminders
- **Multi-Channel**: Email and WhatsApp notifications (configurable per user)
- **In-App Alerts**: Dropdown notification center with read/unread tracking

#### 📊 Analytics & Reporting
- **Team Performance**: Track completion rates, productivity metrics, and workload
- **Channel Statistics**: Monitor subscriber growth and content performance
- **Custom Reports**: Filter and export data for analysis

## 🚀 Tech Stack

### Frontend
- **React 19** with TypeScript for type-safe component development
- **Vite 6** for lightning-fast build tooling and HMR
- **TailwindCSS v4** for utility-first styling
- **React Router v7** for client-side routing
- **Apollo Client 4** for GraphQL state management
  - HTTP Link for queries and mutations
  - WebSocket Link for real-time subscriptions
  - InMemoryCache with pagination support
  - Optimistic UI updates
- **Iconsax React** & **Phosphor Icons** for comprehensive icon library
- **Recharts** for interactive data visualizations
- **date-fns** for date formatting and manipulation
- **Class Variance Authority** for variant-based component styling
- **Tailwind Merge** for intelligent class merging

### Backend Architecture
The client connects to a **GraphQL API** powered by:
- **Apollo Server 4** - GraphQL server with subscriptions
- **MongoDB + Mongoose** - NoSQL database with ODM
- **JWT Authentication** - Token-based auth with refresh tokens
- **GraphQL Subscriptions** - Real-time updates via WebSockets
- **DataLoader** - Batch and cache database queries (N+1 problem prevention)
- **Bull** - Background job processing and task queues
- **Node-cron** - Scheduled tasks (reminders, notifications)
- **Winston** - Structured logging

### External Services
- **YouTube Data API v3** - Channel and video metadata extraction
- **NodeMailer** - Email notifications
- **Twilio** - WhatsApp notifications
- **ImageKit** - Image optimization and CDN

### UI Components
- Custom form components with real-time validation
- Modal system for CRUD operations
- Toast notifications with auto-dismiss
- Dropdown menus and context actions
- Responsive design optimized for desktop and mobile
- Interactive calendars with drag-and-drop
- Data tables with sorting, filtering, and pagination
- Real-time notification center

## 📋 Prerequisites

Before getting started, ensure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** instance (local or cloud via Railway/MongoDB Atlas)
- **ShortHub GraphQL API** running (see [server documentation](../server/README.md))
- **YouTube Data API** key (optional, for automatic channel data extraction)

## 🛠️ Installation

### 1. Clone the repository
```bash
git clone https://github.com/your-username/shorthub.git
cd shorthub/client
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment setup

Create a `.env` file in the client directory:

```bash
touch .env
```

### 4. Configure environment variables

```env
# GraphQL API Endpoints
VITE_GRAPHQL_ENDPOINT=http://localhost:4000/graphql
VITE_WS_ENDPOINT=ws://localhost:4000/graphql

# YouTube API Configuration (optional - backend handles this)
VITE_YOUTUBE_API_KEY=your-youtube-api-key-here

# App Configuration
VITE_APP_NAME=ShortHub
```

**Important Notes:**
- The GraphQL endpoints should match your backend server configuration
- For production, update these URLs to your deployed API endpoints
- YouTube API key is optional and mainly used for client-side previews

### 5. Start the backend server

The client requires the GraphQL API to be running. Follow the [server setup instructions](../server/README.md):

```bash
# In a separate terminal, navigate to the server directory
cd ../server

# Install dependencies
npm install

# Configure server .env file (see server README)
# Start the server
npm run dev
```

The backend will run on `http://localhost:4000` by default.

### 6. Start the development server

Back in the client directory:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 7. First login

Use the default admin credentials (change immediately after first login):
- **Username:** `admin`
- **Password:** `admin123`

## 📱 Usage

### For Administrators

#### 1. Team Management
- **Create Users**: Add videastes and assistants with role-based permissions
- **Assign Teams**: Link assistants to their respective videastes
- **Monitor Activity**: Track team performance and productivity metrics
- **Block/Unblock**: Manage user access and permissions

#### 2. Channel Management
- **Source Channels**: Add YouTube channels for content discovery
  - Automatic metadata extraction via YouTube API
  - Categorize by language, country, content type, and edit style
  - Track subscriber history and growth
- **Publication Channels**: Register channels where content will be published
  - Link to responsible videastes
  - Set publishing preferences and schedules

#### 3. Shorts Rolling & Assignment
- **Smart Rolling**: Generate random shorts from source channels with advanced filters
  - Filter by language, country, content type
  - Avoid previously rolled or assigned content
- **Bulk Assignment**: Assign shorts to videastes with scheduled dates
- **Calendar View**: Visualize all assignments in a timeline
- **Track Status**: Monitor shorts through all production stages

#### 4. Analytics & Reports
- **Team Performance Dashboard**: Completion rates, productivity, workload distribution
- **Channel Statistics**: Growth trends, content performance
- **Custom Filters**: Generate reports by date range, team member, or channel

### For Videastes

#### 1. Assignment Dashboard
- View all assigned shorts with status indicators
- See upcoming deadlines and late assignments
- Access publication calendar
- Track personal statistics and completion rate

#### 2. Video Management
- **Review Assignments**: View source video details and requirements
- **Mark Progress**: Update status (In Progress → Completed)
- **Reassign to Assistant**: Delegate tasks to linked assistants
- **Add Comments**: Collaborate with team via video comments
- **Upload Finals**: Submit completed videos for validation

#### 3. Publication Channel Management
- Manage your publication channels
- View publishing schedule
- Track published content

### For Assistants

#### 1. Task List
- View shorts assigned by your videaste
- See deadlines and priorities
- Track your completion progress

#### 2. Video Processing
- Mark tasks as completed when done
- Add comments for communication
- Upload processed videos

### Common Features

#### Real-Time Notifications
- 🔔 **In-App Notifications**: Dropdown center with live updates
- 📧 **Email Alerts**: Configurable email notifications for key events
- 💬 **WhatsApp Messages**: Optional WhatsApp notifications via Twilio

#### Profile Management
- Update personal information
- Configure notification preferences
- View your statistics and activity history
- Change password

## 🏗️ Project Architecture

```
src/
├── components/           # Reusable UI components
│   ├── forms/           # Form input components
│   ├── modal/           # Modal system
│   ├── layout/          # Layout components
│   └── ui/              # Basic UI elements
├── context/             # React context providers
├── hooks/               # Custom React hooks
├── lib/                 # Utility libraries
│   ├── supabase.ts      # Database client and services
│   ├── youtube-api.ts   # YouTube API integration
│   └── utils.ts         # General utilities
├── pages/               # Application pages
├── types/               # TypeScript type definitions
├── utils/               # Helper functions and utilities
└── assets/              # Static assets
```

### Domain Models

#### User
- **Fields**: username, email, password (hashed with bcrypt), role, status
- **Roles**: ADMIN (full control), VIDEASTE (video editor), ASSISTANT (helper)
- **Status**: ACTIVE or BLOCKED
- **Relations**: createdBy (admin who created the user), assignedTo (for assistants → videaste)
- **Preferences**: emailNotifications, whatsappNotifications, whatsappNumber

#### Channel
- **Fields**: youtubeUrl, channelId, username, subscriberCount, language, country
- **Classification**:
  - `channelPurpose`: SOURCE (for content discovery) or PUBLICATION (for publishing)
  - `contentType`: GAMING, EDUCATION, ENTERTAINMENT, etc.
  - `editType`: NO_EDIT, VOICEOVER, SUBTITLES, FULL_EDIT
- **Tracking**: subscriberHistory (array of {date, count})
- **Relations**: managedBy (videaste managing the publication channel)

#### Video (Short)
- **Fields**: videoId, url, title, description, thumbnailUrl, duration, viewCount
- **Channels**:
  - `sourceChannel`: Where the short was discovered
  - `publicationChannel`: Where it will be published
- **Assignment**:
  - `assignedTo`: Videaste responsible for the short
  - `scheduledDate`: Planned publication date
  - `notes`: Admin notes for the assignment
- **Status Flow**: ROLLED → ASSIGNED → IN_PROGRESS → COMPLETED → VALIDATED → PUBLISHED
- **Timestamps**: rolledAt, assignedAt, startedAt, completedAt, validatedAt, publishedAt
- **Collaboration**: comments array for team communication

#### Notification
- **Fields**: type, message, read status
- **Types**: VIDEO_ASSIGNED, DEADLINE_REMINDER, VIDEO_COMPLETED, VIDEO_VALIDATED, etc.
- **Relations**: userId (recipient), videoId (related video)
- **Real-time**: Delivered via GraphQL subscriptions

### Role-Based Access Control

The application implements granular permissions based on user roles:

| Feature | Admin | Videaste | Assistant |
|---------|-------|----------|-----------|
| Create/manage users | ✅ | ❌ | ❌ |
| Manage all channels | ✅ | ❌ | ❌ |
| Manage own publication channels | ✅ | ✅ | ❌ |
| Roll shorts | ✅ | ❌ | ❌ |
| Assign shorts to team | ✅ | ✅ (to assistant only) | ❌ |
| View all assignments | ✅ | ❌ | ❌ |
| View own assignments | ✅ | ✅ | ✅ |
| Update video status | ✅ | ✅ | ✅ |
| Mark as completed | ✅ | ✅ | ✅ |
| Validate videos | ✅ | ❌ | ❌ |
| View analytics (all) | ✅ | ❌ | ❌ |
| View analytics (own) | ✅ | ✅ | ✅ |
| Comment on videos | ✅ | ✅ | ✅ |
| Receive notifications | ✅ | ✅ | ✅ |

## 🔧 Development

### Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint
```

### Code Standards

- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **Conventional Commits**: Standardized commit messages

### GraphQL Best Practices

The application follows GraphQL best practices:

- **Apollo Client Cache**: InMemoryCache with custom merge policies for pagination
- **DataLoader Pattern**: Backend uses DataLoader to batch and cache database queries (N+1 prevention)
- **Optimistic Updates**: Immediate UI feedback before server confirmation
- **Error Handling**: Centralized error handling with automatic auth token refresh
- **Subscriptions**: Real-time updates via WebSocket for notifications and live data
- **Pagination**: Relay-style cursor-based pagination for large datasets

### State Management

- **Apollo Client** serves as the primary state management solution
- **Local Storage** for auth tokens and user preferences
- **React Context** for theme and UI state
- **URL State** for filters, sorting, and navigation

## 🚢 Deployment

### Prerequisites

1. **Deploy the Backend First**: Follow the [server deployment guide](../server/README.md)
   - Deploy to Railway, Render, or any Node.js hosting platform
   - Ensure MongoDB is accessible from the backend
   - Note the GraphQL API URL (e.g., `https://your-api.railway.app/graphql`)

### Frontend Deployment

#### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Configure environment variables** in Vercel dashboard or via CLI:
   ```env
   VITE_GRAPHQL_ENDPOINT=https://your-api.railway.app/graphql
   VITE_WS_ENDPOINT=wss://your-api.railway.app/graphql
   VITE_YOUTUBE_API_KEY=your-youtube-api-key
   VITE_APP_NAME=ShortHub
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

#### Option 2: Netlify

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Deploy** via Netlify CLI or drag-and-drop:
   ```bash
   netlify deploy --prod --dir=dist
   ```

3. **Set environment variables** in Netlify dashboard (Site settings → Environment variables)

#### Option 3: Manual Deployment

1. **Build**:
   ```bash
   npm run build
   ```

2. Upload the `dist` folder to any static hosting service (Cloudflare Pages, GitHub Pages, AWS S3 + CloudFront)

### Important: CORS Configuration

Update the backend `.env` to allow requests from your frontend domain:

```env
CORS_ORIGIN=https://your-frontend-domain.com
```

For multiple domains (staging + production):
```env
CORS_ORIGIN=https://app.shorthub.com,https://staging.shorthub.com
```

## 🔐 Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `VITE_GRAPHQL_ENDPOINT` | GraphQL API HTTP endpoint | ✅ | `http://localhost:4000/graphql` |
| `VITE_WS_ENDPOINT` | GraphQL WebSocket endpoint for subscriptions | ✅ | `ws://localhost:4000/graphql` |
| `VITE_YOUTUBE_API_KEY` | YouTube Data API key for client-side previews | ⚠️ Optional | `AIza...` |
| `VITE_APP_NAME` | Application display name | ⚠️ Optional | `ShortHub` |

**Production Notes:**
- Use `https://` for VITE_GRAPHQL_ENDPOINT in production
- Use `wss://` for VITE_WS_ENDPOINT in production (secure WebSocket)
- Keep YouTube API key for client-side features (video thumbnails, previews)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Apollo GraphQL** for the excellent GraphQL client and server ecosystem
- **MongoDB** & **Mongoose** for flexible and scalable database solutions
- **YouTube Data API** for comprehensive channel and video metadata
- **Iconsax** & **Phosphor Icons** for beautiful and extensive icon libraries
- **Recharts** for powerful and customizable data visualizations
- **TailwindCSS** for the utility-first CSS framework
- **Vite** for blazing-fast development experience
- **React Team** for the amazing React 19 updates

## 📞 Support

- 📧 Email: goddivor7@gmail.com
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/shorthub/issues)
- 📖 Backend Documentation: [Server README](../server/README.md)

## 🔗 Related Projects

- **[ShortHub Server](../server)**: GraphQL API backend with MongoDB
- **ShortHub Browser Extension** (coming soon): Chrome extension for quick channel addition

## 🛠️ API Integration

This frontend communicates with the ShortHub GraphQL API. Key integration points:

### Authentication
```typescript
// Login mutation returns JWT tokens
mutation Login {
  login(username: "admin", password: "admin123") {
    token
    refreshToken
    user { id, username, role }
  }
}
```

### Real-Time Subscriptions
```typescript
// Subscribe to notifications via WebSocket
subscription OnNotification {
  notificationReceived(userId: "USER_ID") {
    id, type, message, createdAt
  }
}
```

### Pagination
```typescript
// Cursor-based pagination (Relay spec)
query GetVideos {
  videos(first: 20, after: "cursor") {
    edges { node { id, title } }
    pageInfo { hasNextPage, endCursor }
  }
}
```

For complete API documentation, see the [GraphQL Schema](../server/src/graphql/schema.graphql).

---

<div align="center">
  <p>Made with ❤️ for YouTube Shorts production teams</p>
  <p>© 2025 ShortHub. All rights reserved.</p>
</div>