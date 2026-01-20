/**
 * Cascading Location Selector Component
 * 
 * Displays 6-level location hierarchy as sequential cascading dropdowns.
 * Each dropdown only appears after the parent level is selected.
 * Auto-resets all child levels when parent selection changes.
 * 
 * Features:
 * - Dynamic field appearance (Level 2 appears only after Level 1 selected)
 * - Auto-reset: Changing Level 2 clears Levels 3-6
 * - Only shows levels that exist in data (stops at deepest available level)
 * - Returns final selection as breadcrumb (e.g., "North America > USA > Chicago Plant")
 * - Clean label display in dropdowns (not full path)
 */

import React, { useState, useEffect } from "react";
import type { LocationNode } from "../schemas/locations";
import { findNodeById, buildLocationPath } from "../schemas/locations";

interface CascadingLocationSelectorProps {
  nodes: LocationNode[];
  value?: string; // Selected locationNodeId
  onChange: (nodeId: string | undefined, breadcrumb: string) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

interface LevelSelection {
  level: number;
  nodeId: string;
  label: string;
}

export default function CascadingLocationSelector({
  nodes,
  value,
  onChange,
  required = false,
  disabled = false,
  className = ""
}: CascadingLocationSelectorProps) {
  // Track selection at each level (1-6)
  const [selections, setSelections] = useState<LevelSelection[]>([]);

  // Initialize selections from value prop
  useEffect(() => {
    if (value) {
      const pathToSelection = buildPathToNode(value, nodes);
      setSelections(pathToSelection);
    } else {
      setSelections([]);
    }
  }, [value, nodes]);

  /**
   * Build array of selections from root to target node
   */
  function buildPathToNode(nodeId: string, allNodes: LocationNode[]): LevelSelection[] {
    const path: LevelSelection[] = [];
    let currentNode = findNodeById(nodeId, allNodes);

    while (currentNode) {
      path.unshift({
        level: currentNode.level,
        nodeId: currentNode.id,
        label: currentNode.name
      });

      if (currentNode.parentId) {
        currentNode = findNodeById(currentNode.parentId, allNodes);
      } else {
        currentNode = null;
      }
    }

    return path;
  }

  /**
   * Get available options for a specific level
   * Level 1: root nodes
   * Level 2+: children of previous level's selection
   */
  function getOptionsForLevel(level: number): LocationNode[] {
    if (level === 1) {
      // Root level - return all nodes with level 1
      return nodes.filter(n => n.level === 1);
    }

    // Find parent selection
    const parentSelection = selections.find(s => s.level === level - 1);
    if (!parentSelection) return [];

    // Find parent node and return its children
    const parentNode = findNodeById(parentSelection.nodeId, nodes);
    return parentNode?.children || [];
  }

  /**
   * Handle selection change at a specific level
   * Clears all selections at deeper levels
   */
  function handleLevelChange(level: number, nodeId: string) {
    const node = findNodeById(nodeId, nodes);
    if (!node) return;

    // Build new selections array: keep selections up to (level-1), add new selection at level
    const newSelections = [
      ...selections.filter(s => s.level < level),
      { level, nodeId, label: node.name }
    ];

    setSelections(newSelections);

    // Determine final selected node
    // If this node has children, don't emit yet (wait for deeper selection)
    // If this is a leaf node or user explicitly selects it, emit the selection
    const hasChildren = node.children && node.children.length > 0;
    
    // Emit the selection (even if it has children - user can select at any level)
    const breadcrumb = buildLocationPath(nodeId, nodes);
    onChange(nodeId, breadcrumb);
  }

  /**
   * Handle clearing a level
   * Also clears all deeper levels and emits parent selection
   */
  function handleLevelClear(level: number) {
    // Remove this level and all deeper levels
    const newSelections = selections.filter(s => s.level < level);
    setSelections(newSelections);

    // Emit new selection (parent level or undefined)
    if (newSelections.length > 0) {
      const lastSelection = newSelections[newSelections.length - 1];
      const breadcrumb = buildLocationPath(lastSelection.nodeId, nodes);
      onChange(lastSelection.nodeId, breadcrumb);
    } else {
      onChange(undefined, "");
    }
  }

  /**
   * Check if a level should be displayed
   * Display if:
   * - It's level 1 (always show first level)
   * - Parent level (level-1) has a selection AND has children available
   */
  function shouldShowLevel(level: number): boolean {
    if (level === 1) return true;
    
    const parentSelection = selections.find(s => s.level === level - 1);
    if (!parentSelection) return false;

    const options = getOptionsForLevel(level);
    return options.length > 0;
  }

  /**
   * Get current selection for a level
   */
  function getSelectionForLevel(level: number): string {
    return selections.find(s => s.level === level)?.nodeId || "";
  }

  // Render cascading dropdowns (up to 6 levels)
  const maxLevel = 6;
  const levels = Array.from({ length: maxLevel }, (_, i) => i + 1);

  return (
    <div className={`space-y-3 ${className}`}>
      {levels.map(level => {
        if (!shouldShowLevel(level)) return null;

        const options = getOptionsForLevel(level);
        const currentValue = getSelectionForLevel(level);
        const isFirstLevel = level === 1;
        const levelLabel = getLevelLabel(level, selections);

        return (
          <div key={level}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {levelLabel}
              {isFirstLevel && required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="relative">
              <select
                value={currentValue}
                onChange={(e) => {
                  if (e.target.value) {
                    handleLevelChange(level, e.target.value);
                  } else {
                    handleLevelClear(level);
                  }
                }}
                disabled={disabled}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Select {levelLabel}</option>
                {options.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
              
              {/* Clear button */}
              {currentValue && !disabled && (
                <button
                  type="button"
                  onClick={() => handleLevelClear(level)}
                  className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Clear selection"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        );
      })}

      {/* Display final breadcrumb if selection exists */}
      {selections.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <div>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Selected Location
              </div>
              <div className="text-sm text-gray-900 font-medium">
                {selections.map((s, i) => (
                  <span key={s.nodeId}>
                    {i > 0 && <span className="text-gray-400 mx-2">→</span>}
                    {s.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Get human-readable label for each level
 * Dynamically adapts based on what's been selected
 */
function getLevelLabel(level: number, selections: LevelSelection[]): string {
  // If we have selections, show dynamic labels based on context
  if (selections.length > 0) {
    const lastSelection = selections[selections.length - 1];
    
    if (level === 1) return "Region";
    if (level === 2) return "Country";
    if (level === 3) return "Facility";
    if (level === 4) return "Department";
    if (level === 5) return "Area";
    if (level === 6) return "Specific Location";
  }

  // Default generic labels
  return `Level ${level}`;
}
