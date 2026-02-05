"use client";

import React from "react";
import {
  LocationNode,
  LocationSelection,
} from "../schemas/locations";
import LocationTreeSelector from "./LocationTreeSelector";

interface LocationSelectorProps {
  initialSelection?: LocationSelection | null;
  onChange: (selection: LocationSelection | null) => void;
  locationTree: LocationNode[];
  required?: boolean;
  disabled?: boolean;
  label?: string;
}

export default function LocationSelector({
  initialSelection,
  onChange,
  locationTree,
  required = false,
  disabled = false,
  label = "Location",
}: LocationSelectorProps) {
  return (
    <div className="space-y-2">
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Tree Selector (default mode) */}
      <LocationTreeSelector
        initialSelection={initialSelection}
        onChange={onChange}
        locationTree={locationTree}
        required={required}
        disabled={disabled}
      />
    </div>
  );
}
