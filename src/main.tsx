import { createRoot } from "react-dom/client";
import "./index.css";
import { AppRouter } from "./pages";
import { ToastProvider } from "./context/toast-context";
import { ToastContainer } from "./components/Toast";

createRoot(document.getElementById("root")!).render(
  <ToastProvider>
    <AppRouter />
    <ToastContainer />
  </ToastProvider>
);
