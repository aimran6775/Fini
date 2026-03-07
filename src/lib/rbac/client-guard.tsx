"use client";

import { type ReactNode } from "react";
import { type Role, type Permission, hasPermission, hasAnyPermission } from "./permissions";

interface RequirePermissionProps {
  role: Role;
  permission: Permission | Permission[];
  children: ReactNode;
  fallback?: ReactNode;
  requireAll?: boolean;
}

export function RequirePermission({
  role,
  permission,
  children,
  fallback = null,
  requireAll = false,
}: RequirePermissionProps) {
  const permissions = Array.isArray(permission) ? permission : [permission];

  const allowed = requireAll
    ? permissions.every((p) => hasPermission(role, p))
    : hasAnyPermission(role, permissions);

  if (!allowed) return <>{fallback}</>;
  return <>{children}</>;
}

interface RequireRoleProps {
  currentRole: Role;
  allowedRoles: Role[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function RequireRole({
  currentRole,
  allowedRoles,
  children,
  fallback = null,
}: RequireRoleProps) {
  if (!allowedRoles.includes(currentRole)) return <>{fallback}</>;
  return <>{children}</>;
}
