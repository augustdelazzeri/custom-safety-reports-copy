/**
 * Feature Flags for EHS User Management
 * 
 * Control experimental features and UX variations for testing.
 */

/**
 * Role Creation Mode
 * 
 * Controls how the role creation interface is displayed:
 * - 'modal': Opens in a modal dialog (current default)
 * - 'fullscreen': Opens as a full-page form within the Custom Roles tab
 * 
 * Change this value to test different UX patterns.
 */
export const ROLE_CREATION_MODE: 'modal' | 'fullscreen' = 'fullscreen';
