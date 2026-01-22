"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  LocationNode,
  LocationSelection,
  searchLocationTree,
  buildLocationSelectionForFilter,
  getAllChildNodeIds,
} from "../schemas/locations";

interface LocationFilterDropdownProps {
  initialSelection?: LocationSelection | null;
  onChange: (selection: LocationSelection | null) => void;
  locationTree: LocationNode[];
  alwaysIncludeChildren?: boolean; // When true, hides toggle and always includes children
}

export default function LocationFilterDropdown({
  initialSelection,
  onChange,
  locationTree,
  alwaysIncludeChildren = false,
}: LocationFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [tempSelectedNodeId, setTempSelectedNodeId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [includeSubLocations, setIncludeSubLocations] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // When alwaysIncludeChildren is true, always use includeSubLocations=true
  const effectiveIncludeSubLocations = alwaysIncludeChildren ? true : includeSubLocations;

  // Expand all nodes by default
  useEffect(() => {
    const allNodeIds = new Set<string>();
    function collectIds(nodes: LocationNode[]) {
      nodes.forEach((node) => {
        allNodeIds.add(node.id);
        if (node.children && node.children.length > 0) {
          collectIds(node.children);
        }
      });
    }
    collectIds(locationTree);
    setExpandedNodes(allNodeIds);
  }, [locationTree]);

  // Initialize from initialSelection
  useEffect(() => {
    if (initialSelection && initialSelection.locationId) {
      setSelectedNodeId(initialSelection.locationId);
      setTempSelectedNodeId(initialSelection.locationId);
    } else if (!initialSelection) {
      setSelectedNodeId(null);
      setTempSelectedNodeId(null);
    }
  }, [initialSelection?.locationId]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Reset temp selection on cancel
        setTempSelectedNodeId(selectedNodeId);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, selectedNodeId]);

  // Get filtered tree based on search term
  const filteredTree = searchTerm.trim()
    ? searchLocationTree(searchTerm, locationTree)
    : locationTree;

  // Auto-expand nodes when searching
  useEffect(() => {
    if (searchTerm.trim()) {
      const allNodeIds = new Set<string>();
      function collectIds(nodes: LocationNode[]) {
        nodes.forEach((node) => {
          allNodeIds.add(node.id);
          if (node.children && node.children.length > 0) {
            collectIds(node.children);
          }
        });
      }
      collectIds(filteredTree);
      setExpandedNodes(allNodeIds);
    }
  }, [searchTerm, filteredTree]);

  const handleToggleExpand = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const handleCheckboxChange = (node: LocationNode) => {
    const newSelectedId = tempSelectedNodeId === node.id ? null : node.id;
    setTempSelectedNodeId(newSelectedId);

    if (newSelectedId && node.children && node.children.length > 0) {
      setExpandedNodes((prev) => {
        const newSet = new Set(prev);
        newSet.add(newSelectedId);
        return newSet;
      });
    }
  };

  const handleSave = () => {
    setSelectedNodeId(tempSelectedNodeId);
    if (tempSelectedNodeId) {
      const selection = buildLocationSelectionForFilter(tempSelectedNodeId, locationTree, effectiveIncludeSubLocations);
      onChange(selection);
    } else {
      onChange(null);
    }
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempSelectedNodeId(selectedNodeId);
    setIsOpen(false);
  };

  const countChildren = (node: LocationNode): number => {
    return node.children ? node.children.length : 0;
  };

  // Check if a node is a child of the temp selected node
  const isChildOfSelected = (nodeId: string): boolean => {
    if (!tempSelectedNodeId || !effectiveIncludeSubLocations) return false;
    const allChildren = getAllChildNodeIds(tempSelectedNodeId, locationTree);
    // allChildren includes the parent node itself, so filter it out
    return allChildren.includes(nodeId) && nodeId !== tempSelectedNodeId;
  };

  const renderNode = (node: LocationNode, depth: number = 0): React.ReactNode => {
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = tempSelectedNodeId === node.id;
    const isChild = isChildOfSelected(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const childCount = countChildren(node);
    const paddingLeft = depth * 24;

    return (
      <div key={node.id}>
        <div
          className={`flex items-center py-2 px-2 hover:bg-gray-50 rounded ${
            isSelected ? "bg-blue-50" : isChild ? "bg-blue-50/40" : ""
          }`}
          style={{ paddingLeft: `${paddingLeft + 8}px` }}
        >
          {/* Expand/Collapse Icon */}
          {hasChildren ? (
            <button
              type="button"
              onClick={() => handleToggleExpand(node.id)}
              className="mr-2 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {isExpanded ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              )}
            </button>
          ) : (
            <span className="mr-2 w-4" />
          )}

          {/* Checkbox with Label */}
          <label className="flex items-center flex-1 cursor-pointer min-w-0">
            {isChild ? (
              // Show indeterminate-style checkbox for children when "Include sub-locations" is on
              <div className="mr-3 h-4 w-4 rounded border-2 border-blue-400 bg-blue-100 flex items-center justify-center flex-shrink-0 cursor-pointer">
                <svg className="w-2.5 h-2.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleCheckboxChange(node)}
                className="mr-3 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
              />
            )}

            <span
              className={`text-sm truncate ${
                isSelected 
                  ? "font-medium text-blue-700" 
                  : isChild
                  ? "font-medium text-blue-600"
                  : "text-gray-900"
              }`}
            >
              {node.name}
            </span>
          </label>

          {hasChildren && (
            <span className="ml-2 text-xs text-gray-500 flex-shrink-0">
              {childCount} sub-location{childCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {isExpanded && hasChildren && (
          <div>{node.children!.map((child) => renderNode(child, depth + 1))}</div>
        )}
      </div>
    );
  };

  // Get display text
  const getDisplayText = () => {
    if (!selectedNodeId) return "Select Location";
    const selection = buildLocationSelectionForFilter(selectedNodeId, locationTree, effectiveIncludeSubLocations);
    return selection?.fullPath || "Select Location";
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2 min-w-[200px] justify-between"
      >
        <span className="truncate">{getDisplayText()}</span>
        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Modal */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-[480px] bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Location</h3>
            <button
              type="button"
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search */}
          <div className="px-4 pt-3 pb-2">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Toggle Include Sub-locations - Only show if not alwaysIncludeChildren */}
          {!alwaysIncludeChildren && (
            <div className="px-4 pb-2">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSubLocations}
                  onChange={(e) => setIncludeSubLocations(e.target.checked)}
                  className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Include sub-locations in selection</span>
              </label>
            </div>
          )}

          {/* Tree Container */}
          <div className="px-4 py-2 max-h-[400px] overflow-y-auto">
            {filteredTree.length > 0 ? (
              filteredTree.map((node) => renderNode(node, 0))
            ) : (
              <div className="text-center py-8 text-gray-500 text-sm">
                {searchTerm.trim()
                  ? "No locations found matching your search"
                  : "No locations available"}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {tempSelectedNodeId 
                ? effectiveIncludeSubLocations 
                  ? `${getAllChildNodeIds(tempSelectedNodeId, locationTree).length} selected (with sub-locations)`
                  : "1 selected"
                : "0 selected"
              }
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
