// Loading Spinner Component - Reusable loading indicator

import React from "react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  color?: "blue" | "white" | "gray" | "red" | "green";
  className?: string;
  text?: string;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
  xl: "w-12 h-12",
};

const colorClasses = {
  blue: "border-blue-600",
  white: "border-white",
  gray: "border-gray-600",
  red: "border-red-600",
  green: "border-green-600",
};

export function LoadingSpinner({
  size = "md",
  color = "blue",
  className = "",
  text,
}: LoadingSpinnerProps) {
  const baseClasses = "border-2 border-t-transparent rounded-full animate-spin";
  const sizeClass = sizeClasses[size];
  const colorClass = colorClasses[color];

  const spinner = (
    <div
      className={cn(baseClasses, sizeClass, colorClass, className)}
      role="status"
      aria-label={text || "Loading"}
    />
  );

  if (text) {
    return (
      <div className={cn("flex items-center space-x-2")}>
        {spinner}
        <span className={cn("text-sm text-gray-600")}>{text}</span>
      </div>
    );
  }

  return spinner;
}

// Centered loading state for full page/section loading
export function LoadingState({
  text = "読み込み中...",
  size = "lg",
}: {
  text?: string;
  size?: LoadingSpinnerProps["size"];
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 space-y-4"
      )}
    >
      <LoadingSpinner size={size} />
      <p className={cn("text-gray-600 text-sm")}>{text}</p>
    </div>
  );
}

// Inline loading state for buttons
export function ButtonLoading({
  text = "処理中...",
  size = "sm",
}: {
  text?: string;
  size?: LoadingSpinnerProps["size"];
}) {
  return (
    <div className={cn("flex items-center space-x-2")}>
      <LoadingSpinner size={size} color="white" />
      <span>{text}</span>
    </div>
  );
}

export default LoadingSpinner;
