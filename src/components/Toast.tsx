// src/components/Toast.tsx
import React, { useEffect, useState } from "react";
import { useToast, type Toast as ToastType } from "../context/toast-context";
import { X } from "@phosphor-icons/react";
import { TickCircle, InfoCircle, Warning2, CloseCircle } from "iconsax-react";

interface ToastItemProps {
  toast: ToastType;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast }) => {
  const { removeToast } = useToast();
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      removeToast(toast.id);
    }, 300); // Match animation duration
  };

  const getToastStyles = () => {
    const baseStyles =
      "flex items-start space-x-3 p-4 rounded-xl shadow-lg border backdrop-blur-sm";

    switch (toast.type) {
      case "success":
        return `${baseStyles} bg-green-50/90 border-green-200/60 text-green-800`;
      case "error":
        return `${baseStyles} bg-red-50/90 border-red-200/60 text-red-800`;
      case "warning":
        return `${baseStyles} bg-yellow-50/90 border-yellow-200/60 text-yellow-800`;
      case "info":
        return `${baseStyles} bg-blue-50/90 border-blue-200/60 text-blue-800`;
      default:
        return `${baseStyles} bg-gray-50/90 border-gray-200/60 text-gray-800`;
    }
  };

  const getIcon = () => {
    const iconProps = { size: 20, variant: "Bold" as const };

    switch (toast.type) {
      case "success":
        return (
          <TickCircle
            color="green"
            {...iconProps}
            className="text-green-600 mt-0.5 flex-shrink-0"
          />
        );
      case "error":
        return (
          <CloseCircle
            color="red"
            {...iconProps}
            className="text-red-600 mt-0.5 flex-shrink-0"
          />
        );
      case "warning":
        return (
          <Warning2
            color="yellow"
            {...iconProps}
            className="text-yellow-600 mt-0.5 flex-shrink-0"
          />
        );
      case "info":
        return (
          <InfoCircle
            color="blue"
            {...iconProps}
            className="text-blue-600 mt-0.5 flex-shrink-0"
          />
        );
      default:
        return (
          <InfoCircle
            color="gray"
            {...iconProps}
            className="text-gray-600 mt-0.5 flex-shrink-0"
          />
        );
    }
  };

  return (
    <div
      className={`
        transform transition-all duration-300 ease-out
        ${
          isVisible && !isLeaving
            ? "translate-x-0 opacity-100 scale-100"
            : "translate-x-full opacity-0 scale-95"
        }
        ${getToastStyles()}
        max-w-sm w-full
      `}
    >
      {getIcon()}

      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm leading-5">{toast.title}</h4>
        {toast.message && (
          <p className="text-sm opacity-90 mt-1 leading-relaxed">
            {toast.message}
          </p>
        )}
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="text-sm font-medium underline mt-2 hover:no-underline transition-all"
          >
            {toast.action.label}
          </button>
        )}
      </div>

      <button
        onClick={handleClose}
        className="flex-shrink-0 ml-2 p-1 rounded-full hover:bg-black/10 transition-colors"
        aria-label="Close notification"
      >
        <X size={16} className="opacity-60" />
      </button>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-3 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} />
        </div>
      ))}
    </div>
  );
};
