import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import { setNavigationCallback } from "@/lib/apollo-client";
import { setAuthNavigationCallback } from "@/context/auth-context";

export default function RootLayout() {
  const navigate = useNavigate();

  // Set up navigation callbacks for Apollo Client and Auth context
  useEffect(() => {
    const navigationHandler = (path: string) => {
      navigate(path, { replace: true });
    };

    setNavigationCallback(navigationHandler);
    setAuthNavigationCallback(navigationHandler);
  }, [navigate]);

  return <Outlet />;
}
