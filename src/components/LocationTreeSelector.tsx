"use client";

import React, { useState, useEffect } from "react";
import {
  LocationNode,
  LocationSelection,
  searchLocationTree,
  buildLocationSelectionFromId,
  getAllChildNodeIds,
} from "../schemas/locations";

interface LocationTreeSelectorProps {
  initialSelection?: LocationSelection | null;
  onChange: (selection: LocationSelection | null) => void;
  locationTree: LocationNode[];
  required?: boolean;
  disabled?: boolean;
}

export default function LocationTreeSelector({
  initialSelection,
  onChange,
  locationTree,
  required = false,
  disabled = false,
}: LocationTreeSelectorProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Expand all nodes by default on mount
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
      
      // Expand all parent nodes to show the selected node
      const parentsToExpand = new Set(initialSelection.parentIds);
      setExpandedNodes((prev) => new Set([...prev, ...parentsToExpand]));
    } else if (!initialSelection) {
      // Reset state when initialSelection is null
      setSelectedNodeId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSelection?.locationId]);

  // Get filtered tree based on search term
  const filteredTree = searchTerm.trim()
    ? searchLocationTree(searchTerm, locationTree)
    : locationTree;

  // Auto-expand nodes when searching
  useEffect(() => {
    if (searchTerm.trim()) {
      // Expand all nodes in filtered results to show matches
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
    const newSelectedId = selectedNodeId === node.id ? null : node.id;
    setSelectedNodeId(newSelectedId);

    if (newSelectedId) {
      // Auto-expand this node to show children (only if it has children)
      if (node.children && node.children.length > 0) {
        setExpandedNodes((prev) => {
          const newSet = new Set(prev);
          newSet.add(newSelectedId);
          return newSet;
        });
      }

      // Build location selection
      const selection = buildLocationSelectionFromId(newSelectedId, locationTree);
      onChange(selection);
    } else {
      onChange(null);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  const countChildren = (node: LocationNode): number => {
    return node.children ? node.children.length : 0;
  };

  // Check if a node is a parent of the selected node
  const isParentOfSelected = (nodeId: string): boolean => {
    if (!selectedNodeId) return false;
    const selection = buildLocationSelectionFromId(selectedNodeId, locationTree);
    return selection?.parentIds?.includes(nodeId) || false;
  };

  const renderNode = (node: LocationNode, depth: number = 0): React.ReactNode => {
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedNodeId === node.id;
    const isParent = isParentOfSelected(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const childCount = countChildren(node);

    // Indentation based on depth
    const paddingLeft = depth * 24;

    return (
      <div key={node.id}>
        <div
          className={`flex items-center py-2 px-2 hover:bg-gray-50 rounded ${
            isSelected ? "bg-blue-50" : isParent ? "bg-blue-50/30" : ""
          }`}
          style={{ paddingLeft: `${paddingLeft + 8}px` }}
        >
          {/* Expand/Collapse Icon */}
          {hasChildren ? (
            <button
              type="button"
              onClick={() => handleToggleExpand(node.id)}
              className="mr-2 text-gray-500 hover:text-gray-700 focus:outline-none"
              disabled={disabled}
            >
              {isExpanded ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              )}
            </button>
          ) : (
            <span className="mr-2 w-4" />
          )}

          {/* Checkbox with Label */}
          <label className="flex items-center flex-1 cursor-pointer min-w-0" onClick={(e) => {
            // Allow clicking on parent nodes to select them
            if (isParent && !isSelected) {
              e.preventDefault();
              handleCheckboxChange(node);
            }
          }}>
            {/* Checkbox - show checked for selected, indeterminate-style for parents */}
            {isParent && !isSelected ? (
              <div className="mr-3 h-4 w-4 rounded border-2 border-blue-400 bg-blue-100 flex items-center justify-center flex-shrink-0 cursor-pointer">
                <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 16 16" strokeWidth="3">
                  <path d="M3 8h10" />
                </svg>
              </div>
            ) : (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleCheckboxChange(node)}
                disabled={disabled}
                className="mr-3 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
              />
            )}

            {/* Node Name */}
            <span
              className={`text-sm truncate ${
                isSelected 
                  ? "font-medium text-blue-700" 
                  : isParent 
                  ? "font-medium text-blue-600" 
                  : "text-gray-900"
              }`}
            >
              {node.name}
            </span>
          </label>

          {/* Child Count Badge */}
          {hasChildren && (
            <span className="ml-2 text-xs text-gray-500 flex-shrink-0">
              {childCount} sub-location{childCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Render children if expanded */}
        {isExpanded && hasChildren && (
          <div>{node.children!.map((child) => renderNode(child, depth + 1))}</div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Info Message */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-blue-600 flex-shrink-0 mt-0.5"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </svg>
        <p className="text-xs text-blue-700">
          All locations are shown expanded. Use the search to quickly find a specific location, or browse the tree to select one.
        </p>
      </div>

      {/* Search Input with Clear Button */}
      <div className="relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search locations..."
          disabled={disabled}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={handleClearSearch}
            disabled={disabled}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            title="Clear search"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="m15 9-6 6" />
              <path d="m9 9 6 6" />
            </svg>
          </button>
        )}
      </div>

      {/* Tree Container */}
      <div className="border border-gray-300 rounded-lg bg-white max-h-96 overflow-y-auto">
        <div className="p-2">
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
      </div>

    </div>
  );
}
