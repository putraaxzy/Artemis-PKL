/**
 * Card Component - Reusable card container
 */

import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export function Card({
  children,
  className = "",
  onClick,
  hoverable = false,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-gray-200 rounded-lg p-6 ${
        hoverable
          ? "cursor-pointer transition-all duration-200 hover:shadow-md hover:border-gray-300"
          : "shadow-sm"
      } ${className}`}
    >
      {children}
    </div>
  );
}
