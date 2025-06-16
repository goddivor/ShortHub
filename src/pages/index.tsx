import { createBrowserRouter, RouterProvider } from "react-router";
import RootLayout from "@/app.layout";
import NotFound from "./NotFound";
import LandingPage from "./LandingPage";
import AddChannelPage from "./AddChannelPage";
import RollShortsPage from "./RollShortsPage";
import DebugPage from "./DebugPage";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardPage from "./DashboardPage";

const router = createBrowserRouter([
  {
    // Wraps the entire app in the root layout
    element: <RootLayout />,
    // Mounted where the <Outlet /> component is inside the root layout
    children: [
      { path: "/", element: <LandingPage /> },
      {
        path: "/dashboard",
        element: <DashboardLayout />,
        children: [
          { path: "", element: <DashboardPage /> },
          { path: "add-channel", element: <AddChannelPage /> },
          { path: "roll-shorts", element: <RollShortsPage /> },
          { path: "debug", element: <DebugPage /> },
        ],
      },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

export const AppRouter = () => <RouterProvider router={router} />;
