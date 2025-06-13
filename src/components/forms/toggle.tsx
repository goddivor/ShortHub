import { useState } from "react";

interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  size?: "sm" | "md" | "lg";
}

export default function Toggle({
  enabled,
  onChange,
  size = "md",
}: ToggleProps) {
  const [isEnabled, setIsEnabled] = useState(enabled);

  const toggleSwitch = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    onChange(newState);
  };

  // Size classes
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return {
          toggle: "w-8 h-4",
          circle: "w-3 h-3",
          translate: "translate-x-4",
        };
      case "lg":
        return {
          toggle: "w-14 h-7",
          circle: "w-6 h-6",
          translate: "translate-x-7",
        };
      default: // md
        return {
          toggle: "w-11 h-6",
          circle: "w-5 h-5",
          translate: "translate-x-5",
        };
    }
  };

  const sizeClasses = getSizeClasses();

  return (
    <div
      onClick={toggleSwitch}
      className={`${
        sizeClasses.toggle
      } flex items-center rounded-full p-0.5 cursor-pointer transition-colors ease-in-out duration-200 ${
        isEnabled ? "bg-[#14A800]" : "bg-gray-200"
      }`}
    >
      <div
        className={`${
          sizeClasses.circle
        } bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
          isEnabled ? sizeClasses.translate : "translate-x-0"
        }`}
      />
    </div>
  );
}
