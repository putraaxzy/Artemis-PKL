/**
 * Badge Component - Status/label badge
 */

import React from "react";

interface BadgeProps {
  variant?: "default" | "success" | "error" | "warning" | "info";
  size?: "sm" | "md";
  children: React.ReactNode;
  className?: string;
}

export function Badge({
  variant = "default",
  size = "md",
  children,
  className = "",
}: BadgeProps) {
  const variantStyles = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800",
    error: "bg-red-100 text-red-800",
    warning: "bg-yellow-100 text-yellow-800",
    info: "bg-blue-100 text-blue-800",
  };

  const sizeStyles = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
  };

  return (
    <span
      className={`inline-block rounded-full font-medium ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
}

interface StatusBadgeProps {
  status: "pending" | "dikirim" | "selesai" | "ditolak";
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const statusConfig = {
    pending: { variant: "warning" as const, label: "Pending" },
    dikirim: { variant: "info" as const, label: "Submitted" },
    selesai: { variant: "success" as const, label: "Completed" },
    ditolak: { variant: "error" as const, label: "Rejected" },
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}
