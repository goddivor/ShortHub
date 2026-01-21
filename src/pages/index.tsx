import { createBrowserRouter, RouterProvider } from "react-router";
import RootLayout from "@/app.layout";
import NotFound from "./NotFound";
import LandingPage from "./LandingPage";
import LoginPage from "./LoginPage";
import AdminDashboardLayout from "@/components/layout/AdminDashboardLayout";
import VideasteDashboardLayout from "@/components/layout/VideasteDashboardLayout";
import DashboardRedirectPage from "./DashboardRedirectPage";
import AdminDashboardPage from "./admin/AdminDashboardPage";
import AdminUsersPage from "./admin/AdminUsersPage";
import AdminSourceChannelsPage from "./admin/AdminSourceChannelsPage";
import AdminPublicationChannelsPage from "./admin/AdminPublicationChannelsPage";
import AdminRollingPage from "./admin/AdminRollingPage";
import AdminCalendarPage from "./admin/AdminCalendarPage";
import AdminSettingsPage from "./admin/AdminSettingsPage";
import AdminProfilePage from "./admin/AdminProfilePage";
import AdminShortsTrackingPage from "./admin/AdminShortsTrackingPage";
import { VideasteDashboardPage, VideasteShortsPage, VideasteCalendarPage, VideasteProfilePage } from "./videaste";
import { AssistantDashboardPage, AssistantVideosPage, AssistantCalendarPage, AssistantProfilePage } from "./assistant";
import AssistantDashboardLayout from "@/components/layout/AssistantDashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { UserRole } from "@/types/graphql";

const router = createBrowserRouter([
  {
    // Wraps the entire app in the root layout
    element: <RootLayout />,
    // Mounted where the <Outlet /> component is inside the root layout
    children: [
      { path: "/", element: <LandingPage /> },
      { path: "/login", element: <LoginPage /> },
      
      // Smart redirect based on role
      {
        path: "/dashboard",
        element: (
          <ProtectedRoute>
            <DashboardRedirectPage />
          </ProtectedRoute>
        ),
      },
      
      // Admin Routes
      {
        path: "/admin",
        element: (
          <ProtectedRoute requireRole={UserRole.ADMIN}>
            <AdminDashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          { path: "", element: <AdminDashboardPage /> }, // Default to dashboard
          { path: "dashboard", element: <AdminDashboardPage /> },
          { path: "users", element: <AdminUsersPage /> },
          { path: "source-channels", element: <AdminSourceChannelsPage /> },
          { path: "publication-channels", element: <AdminPublicationChannelsPage /> },
          { path: "rolling", element: <AdminRollingPage /> },
          { path: "shorts-tracking", element: <AdminShortsTrackingPage /> },
          { path: "calendar", element: <AdminCalendarPage /> },
          { path: "settings", element: <AdminSettingsPage /> },
          { path: "profile", element: <AdminProfilePage /> },
        ],
      },

      // Videaste Routes
      {
        path: "/videaste",
        element: (
          <ProtectedRoute requireRole={UserRole.VIDEASTE}>
            <VideasteDashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          { path: "", element: <VideasteDashboardPage /> },
          { path: "dashboard", element: <VideasteDashboardPage /> },
          { path: "shorts", element: <VideasteShortsPage /> },
          { path: "calendar", element: <VideasteCalendarPage /> },
          { path: "profile", element: <VideasteProfilePage /> },
        ],
      },

      // Assistant Routes
      {
        path: "/assistant",
        element: (
          <ProtectedRoute requireRole={UserRole.ASSISTANT}>
            <AssistantDashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          { path: "", element: <AssistantDashboardPage /> },
          { path: "dashboard", element: <AssistantDashboardPage /> },
          { path: "videos", element: <AssistantVideosPage /> },
          { path: "calendar", element: <AssistantCalendarPage /> },
          { path: "profile", element: <AssistantProfilePage /> },
        ],
      },

      { path: "*", element: <NotFound /> },
    ],
  },
]);

export const AppRouter = () => <RouterProvider router={router} />;

