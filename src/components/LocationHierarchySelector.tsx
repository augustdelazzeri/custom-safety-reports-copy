"use client";

import React, { useState, useEffect } from "react";
import {
  LocationNode,
  LocationSelection,
  LocationSelectionState,
  findNodeById,
  buildLocationPath,
} from "../schemas/locations";

interface LocationHierarchySelectorProps {
  initialSelection?: LocationSelection | null;
  onChange: (selection: LocationSelection | null) => void;
  locationTree: LocationNode[];
  required?: boolean;
  disabled?: boolean;
}

export default function LocationHierarchySelector({
  initialSelection,
  onChange,
  locationTree,
  required = false,
  disabled = false,
}: LocationHierarchySelectorProps) {
  const [selectionState, setSelectionState] = useState<LocationSelectionState>({
    level1: null,
    level2: null,
    level3: null,
    level4: null,
    level5: null,
    level6: null,
  });

  // Initialize from initialSelection if provided
  useEffect(() => {
    if (initialSelection && initialSelection.locationId) {
      // Build selection state from parentIds + locationId
      const newState: LocationSelectionState = {
        level1: null,
        level2: null,
        level3: null,
        level4: null,
        level5: null,
        level6: null,
      };

      initialSelection.parentIds.forEach((parentId, index) => {
        const levelKey = `level${index + 1}` as keyof LocationSelectionState;
        newState[levelKey] = parentId;
      });

      const finalLevelKey = `level${initialSelection.selectedLevel}` as keyof LocationSelectionState;
      newState[finalLevelKey] = initialSelection.locationId;

      setSelectionState(newState);
    } else if (!initialSelection) {
      // Reset state when initialSelection is null
      setSelectionState({
        level1: null,
        level2: null,
        level3: null,
        level4: null,
        level5: null,
        level6: null,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSelection?.locationId, initialSelection?.selectedLevel]);

  // Get options for a specific level
  const getOptionsForLevel = (level: number): LocationNode[] => {
    if (level === 1) {
      return locationTree;
    }

    const parentLevelKey = `level${level - 1}` as keyof LocationSelectionState;
    const parentId = selectionState[parentLevelKey];

    if (!parentId) {
      return [];
    }

    const parentNode = findNodeById(parentId, locationTree);
    return parentNode?.children || [];
  };

  // Check if a level should be visible
  const isLevelVisible = (level: number): boolean => {
    if (level === 1) return true;

    const parentLevelKey = `level${level - 1}` as keyof LocationSelectionState;
    const parentId = selectionState[parentLevelKey];

    if (!parentId) return false;

    // Also check if parent has children
    const options = getOptionsForLevel(level);
    return options.length > 0;
  };

  // Handle selection change for a level
  const handleLevelChange = (level: number, value: string) => {
    const levelKey = `level${level}` as keyof LocationSelectionState;

    // Create new state
    const newState: LocationSelectionState = { ...selectionState };
    newState[levelKey] = value || null;

    // Clear all levels after this one
    for (let i = level + 1; i <= 6; i++) {
      const clearKey = `level${i}` as keyof LocationSelectionState;
      newState[clearKey] = null;
    }

    setSelectionState(newState);

    // Build LocationSelection object
    if (value) {
      const selectedNode = findNodeById(value, locationTree);
      if (selectedNode) {
        const parentIds: string[] = [];
        
        // Collect parent IDs from level 1 to level (n-1)
        for (let i = 1; i < level; i++) {
          const parentKey = `level${i}` as keyof LocationSelectionState;
          const parentId = newState[parentKey];
          if (parentId) {
            parentIds.push(parentId);
          }
        }

        const locationSelection: LocationSelection = {
          selectedLevel: level,
          locationId: selectedNode.id,
          locationName: selectedNode.name,
          fullPath: buildLocationPath(selectedNode.id, locationTree),
          parentIds: parentIds,
        };

        onChange(locationSelection);
      }
    } else {
      // If cleared, check if there's a selection in a previous level
      let lastSelectedLevel = 0;
      let lastSelectedId = null;
      
      for (let i = level - 1; i >= 1; i--) {
        const checkKey = `level${i}` as keyof LocationSelectionState;
        if (newState[checkKey]) {
          lastSelectedLevel = i;
          lastSelectedId = newState[checkKey];
          break;
        }
      }

      if (lastSelectedId) {
        const selectedNode = findNodeById(lastSelectedId, locationTree);
        if (selectedNode) {
          const parentIds: string[] = [];
          
          for (let i = 1; i < lastSelectedLevel; i++) {
            const parentKey = `level${i}` as keyof LocationSelectionState;
            const parentId = newState[parentKey];
            if (parentId) {
              parentIds.push(parentId);
            }
          }

          const locationSelection: LocationSelection = {
            selectedLevel: lastSelectedLevel,
            locationId: selectedNode.id,
            locationName: selectedNode.name,
            fullPath: buildLocationPath(selectedNode.id, locationTree),
            parentIds: parentIds,
          };

          onChange(locationSelection);
        }
      } else {
        onChange(null);
      }
    }
  };

  // Render a single level dropdown
  const renderLevel = (level: number) => {
    if (!isLevelVisible(level)) return null;

    const levelKey = `level${level}` as keyof LocationSelectionState;
    const currentValue = selectionState[levelKey] || "";
    const options = getOptionsForLevel(level);

    if (options.length === 0) return null;

    // Use "Location" for Level 1, "Level N" for others
    const labelText = level === 1 ? "Location" : `Level ${level}`;
    const placeholderText = level === 1 ? "Select Location" : `Select Level ${level}`;

    return (
      <div key={level} className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {labelText}
          {required && level === 1 && <span className="text-red-500 ml-1">*</span>}
        </label>
        <select
          value={currentValue}
          onChange={(e) => handleLevelChange(level, e.target.value)}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">{placeholderText}</option>
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5, 6].map((level) => renderLevel(level))}
    </div>
  );
}
