/**
 * EHS Location Hierarchy Type Definitions
 * 
 * Defines a 6-level recursive organizational tree structure.
 * Users assigned to a node inherit visibility for that node and all children.
 */

export interface LocationNode {
  id: string;
  name: string;
  level: number;              // 1-6 (1 = top level, 6 = deepest)
  parentId: string | null;    // null for root nodes
  children?: LocationNode[];  // Recursive children
}

/**
 * Represents a complete location selection by a user
 * Includes the final selected node and its full hierarchical context
 */
export interface LocationSelection {
  selectedLevel: number;      // 1-6, indicates which level the user selected up to
  locationId: string;          // ID of the final selected node
  locationName: string;        // Name of the final selected node
  fullPath: string;            // Complete path (ex: "Global Operations > North America > United States")
  parentIds: string[];         // Array of parent IDs for easier queries [level1, level2, ..., level(n-1)]
  childrenIds?: string[];      // Array of all children IDs (for filter mode)
}

/**
 * Internal state for tracking user selections across all 6 levels
 * Used by LocationHierarchySelector component
 */
export interface LocationSelectionState {
  level1: string | null;
  level2: string | null;
  level3: string | null;
  level4: string | null;
  level5: string | null;
  level6: string | null;
}

// Utility function to build a full path string from a node
export function buildLocationPath(nodeId: string, allNodes: LocationNode[]): string {
  const path: string[] = [];
  let currentNode = findNodeById(nodeId, allNodes);
  
  while (currentNode) {
    path.unshift(currentNode.name);
    if (currentNode.parentId) {
      currentNode = findNodeById(currentNode.parentId, allNodes);
    } else {
      currentNode = null;
    }
  }
  
  return path.join(' > ');
}

// Utility function to find a node by ID in the tree
export function findNodeById(nodeId: string, nodes: LocationNode[]): LocationNode | null {
  for (const node of nodes) {
    if (node.id === nodeId) {
      return node;
    }
    if (node.children && node.children.length > 0) {
      const found = findNodeById(nodeId, node.children);
      if (found) return found;
    }
  }
  return null;
}

// Utility function to get all child node IDs (recursive)
export function getAllChildNodeIds(nodeId: string, nodes: LocationNode[]): string[] {
  const node = findNodeById(nodeId, nodes);
  if (!node) return [];
  
  const childIds: string[] = [nodeId]; // Include the node itself
  
  if (node.children) {
    node.children.forEach(child => {
      childIds.push(...getAllChildNodeIds(child.id, nodes));
    });
  }
  
  return childIds;
}

// Utility function to flatten tree to array (for searching)
export function flattenLocationTree(nodes: LocationNode[]): LocationNode[] {
  const flattened: LocationNode[] = [];
  
  function traverse(nodeList: LocationNode[]) {
    nodeList.forEach(node => {
      flattened.push(node);
      if (node.children && node.children.length > 0) {
        traverse(node.children);
      }
    });
  }
  
  traverse(nodes);
  return flattened;
}

// Utility function to search tree and return matching nodes with their parent paths visible
export function searchLocationTree(
  searchTerm: string,
  nodes: LocationNode[]
): LocationNode[] {
  if (!searchTerm.trim()) {
    return nodes;
  }

  const lowerSearchTerm = searchTerm.toLowerCase();
  const matchingNodeIds = new Set<string>();
  const ancestorIds = new Set<string>();

  // First pass: find all matching nodes and collect their ancestors
  function findMatches(nodeList: LocationNode[]) {
    nodeList.forEach((node) => {
      const matches = node.name.toLowerCase().includes(lowerSearchTerm);
      
      if (matches) {
        matchingNodeIds.add(node.id);
        // Add all ancestors
        let currentNode = node;
        while (currentNode.parentId) {
          ancestorIds.add(currentNode.parentId);
          const parent = findNodeById(currentNode.parentId, nodes);
          if (parent) {
            currentNode = parent;
          } else {
            break;
          }
        }
      }
      
      if (node.children && node.children.length > 0) {
        findMatches(node.children);
      }
    });
  }

  findMatches(nodes);

  // Second pass: filter tree to only include matches and their ancestors
  function filterNodes(nodeList: LocationNode[]): LocationNode[] {
    return nodeList
      .filter((node) => matchingNodeIds.has(node.id) || ancestorIds.has(node.id))
      .map((node) => ({
        ...node,
        children: node.children ? filterNodes(node.children) : undefined,
      }));
  }

  return filterNodes(nodes);
}

// Utility function to build LocationSelection from a node ID
export function buildLocationSelectionFromId(
  nodeId: string,
  nodes: LocationNode[]
): LocationSelection | null {
  const node = findNodeById(nodeId, nodes);
  if (!node) return null;

  const parentIds = getParentIds(nodeId, nodes);
  const fullPath = buildLocationPath(nodeId, nodes);

  return {
    selectedLevel: node.level,
    locationId: node.id,
    locationName: node.name,
    fullPath,
    parentIds,
  };
}

// Utility function to build LocationSelection for filtering (includes children)
export function buildLocationSelectionForFilter(
  nodeId: string,
  nodes: LocationNode[],
  includeChildren: boolean = true
): LocationSelection | null {
  const node = findNodeById(nodeId, nodes);
  if (!node) return null;

  const parentIds = getParentIds(nodeId, nodes);
  const fullPath = buildLocationPath(nodeId, nodes);
  const childrenIds = includeChildren ? getAllChildNodeIds(nodeId, nodes) : [nodeId];

  return {
    selectedLevel: node.level,
    locationId: node.id,
    locationName: node.name,
    fullPath,
    parentIds,
    childrenIds,
  };
}

// Utility function to get array of parent IDs for a node
export function getParentIds(
  nodeId: string,
  nodes: LocationNode[]
): string[] {
  const parentIds: string[] = [];
  let currentNode = findNodeById(nodeId, nodes);

  while (currentNode && currentNode.parentId) {
    parentIds.unshift(currentNode.parentId); // Add to beginning to maintain order
    currentNode = findNodeById(currentNode.parentId, nodes);
  }

  return parentIds;
}
