/**
 * Why this module exists:
 * Keep low-level helper logic separate from DataTable rendering and hooks.
 *
 * What it does:
 * Provides small reusable utilities for state updater resolution, width clamping, and safe DOM attribute escaping.
 */
import type { Updater } from '@tanstack/react-table';

export const resolveState = <T>(updaterOrValue: Updater<T>, current: T): T => {
  if (typeof updaterOrValue === 'function') {
    return (updaterOrValue as (old: T) => T)(current);
  }
  return updaterOrValue;
};

export const clampWidth = (width: number, min: number, max: number) => Math.max(min, Math.min(max, width));

export const escapeAttributeValue = (value: string) => {
  if (typeof globalThis.CSS !== 'undefined' && typeof globalThis.CSS.escape === 'function') {
    return globalThis.CSS.escape(value);
  }

  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
};
