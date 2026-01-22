"use client";

import React, { useState, useEffect } from "react";
import {
  LocationNode,
  LocationSelection,
} from "../schemas/locations";
import LocationHierarchySelector from "./LocationHierarchySelector";
import LocationTreeSelector from "./LocationTreeSelector";

type LocationSelectorMode = "cascade" | "tree";

interface LocationSelectorProps {
  initialSelection?: LocationSelection | null;
  onChange: (selection: LocationSelection | null) => void;
  locationTree: LocationNode[];
  required?: boolean;
  disabled?: boolean;
  storageKey?: string;
  label?: string;
}

export default function LocationSelector({
  initialSelection,
  onChange,
  locationTree,
  required = false,
  disabled = false,
  storageKey = "ehs-location-selector-mode",
  label = "Location",
}: LocationSelectorProps) {
  const [mode, setMode] = useState<LocationSelectorMode>("cascade");
  const [mounted, setMounted] = useState(false);

  // Load mode from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const savedMode = localStorage.getItem(storageKey);
    if (savedMode === "cascade" || savedMode === "tree") {
      setMode(savedMode);
    }
  }, [storageKey]);

  // Toggle mode and save to localStorage
  const toggleMode = () => {
    const newMode: LocationSelectorMode = mode === "cascade" ? "tree" : "cascade";
    setMode(newMode);
    localStorage.setItem(storageKey, newMode);
  };

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="space-y-2">
        <div className="h-5 bg-gray-100 animate-pulse rounded w-24" />
        <div className="h-10 bg-gray-100 animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Label with Mode Toggle Switch */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        {/* Compact Mode Toggle Switch */}
        <div className="flex items-center gap-2 px-2 py-1 bg-gray-50 rounded-md border border-gray-200">
          <span className="text-xs font-medium text-gray-600">Cascade</span>
          <button
            type="button"
            onClick={toggleMode}
            disabled={disabled}
            className={`relative inline-flex h-4 w-8 flex-shrink-0 items-center rounded-full transition-colors ${
              mode === "tree" ? "bg-blue-600" : "bg-gray-300"
            } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            title={`Switch to ${mode === "cascade" ? "tree" : "cascade"} mode`}
          >
            <span
              className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                mode === "tree" ? "translate-x-4" : "translate-x-0.5"
              }`}
            />
          </button>
          <span className="text-xs font-medium text-gray-600">Tree</span>
        </div>
      </div>

      {/* Render appropriate selector based on mode */}
      {mode === "cascade" ? (
        <LocationHierarchySelector
          initialSelection={initialSelection}
          onChange={onChange}
          locationTree={locationTree}
          required={required}
          disabled={disabled}
        />
      ) : (
        <LocationTreeSelector
          initialSelection={initialSelection}
          onChange={onChange}
          locationTree={locationTree}
          required={required}
          disabled={disabled}
        />
      )}
    </div>
  );
}
