/**
 * usePermissions Hook
 * 
 * Utility hook for checking permissions and getting consistent button styling
 * based on permission state.
 */

import { useProfile } from "../contexts/ProfileContext";

export interface ActionPermissionResult {
  canPerform: boolean;
  buttonClass: string;
  disabled: boolean;
  title: string;
}

/**
 * Check if the current profile has permission for a specific action
 * and return styling classes for buttons
 */
export function useActionPermission(
  module: string,
  entity: string,
  action: string
): ActionPermissionResult {
  const { hasPermission } = useProfile();
  const canPerform = hasPermission(module, entity, action);

  return {
    canPerform,
    buttonClass: canPerform
      ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
      : "bg-gray-300 text-gray-500 cursor-not-allowed opacity-50",
    disabled: !canPerform,
    title: !canPerform ? "You do not have permission to perform this action" : ""
  };
}

/**
 * Get button classes for secondary/outline buttons based on permission
 */
export function useActionPermissionSecondary(
  module: string,
  entity: string,
  action: string
): ActionPermissionResult {
  const { hasPermission } = useProfile();
  const canPerform = hasPermission(module, entity, action);

  return {
    canPerform,
    buttonClass: canPerform
      ? "text-gray-700 hover:bg-gray-50 cursor-pointer"
      : "text-gray-400 cursor-not-allowed opacity-50",
    disabled: !canPerform,
    title: !canPerform ? "You do not have permission to perform this action" : ""
  };
}

/**
 * Get icon button classes (for menu items, etc.)
 */
export function useActionPermissionIcon(
  module: string,
  entity: string,
  action: string
): ActionPermissionResult {
  const { hasPermission } = useProfile();
  const canPerform = hasPermission(module, entity, action);

  return {
    canPerform,
    buttonClass: canPerform
      ? "text-gray-700 hover:bg-gray-100 cursor-pointer"
      : "text-gray-400 cursor-not-allowed opacity-50 pointer-events-none",
    disabled: !canPerform,
    title: !canPerform ? "You do not have permission to perform this action" : ""
  };
}
