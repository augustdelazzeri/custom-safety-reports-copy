/**
 * Location-Based Filtering Utilities
 * 
 * Provides functions for automatic user-scoped filtering based on location hierarchy.
 * Implements the core business rule: users can see data from their assigned location node
 * and all descendant nodes, but NOT sibling or parent nodes.
 */

import { LocationNode, findNodeById, getAllChildNodeIds } from '@/schemas/locations';

/**
 * Get all location node IDs that a user has access to.
 * Returns the user's assigned node ID plus all descendant node IDs.
 * 
 * @param userLocationNodeId - The location node ID assigned to the user
 * @param allLocationNodes - The complete location hierarchy tree
 * @returns Array of node IDs the user can access (includes user's node + all descendants)
 * 
 * @example
 * // User assigned to "austin-plant"
 * // Returns: ["austin-plant", "austin-production", "austin-line-1", "austin-line-2"]
 */
export function getUserAccessibleNodes(
  userLocationNodeId: string,
  allLocationNodes: LocationNode[]
): string[] {
  return getAllChildNodeIds(userLocationNodeId, allLocationNodes);
}

/**
 * Filter an array of items based on user's location access.
 * Automatically filters data so users only see items within their location scope.
 * 
 * @param items - Array of items with locationNodeId property
 * @param userLocationNodeId - The user's assigned location node ID
 * @param allLocationNodes - The complete location hierarchy tree
 * @returns Filtered array containing only accessible items
 * 
 * @example
 * const accessibleEvents = filterItemsByLocation(
 *   allSafetyEvents,
 *   "austin-plant",
 *   locationHierarchy
 * );
 */
export function filterItemsByLocation<T extends { locationNodeId?: string }>(
  items: T[],
  userLocationNodeId: string,
  allLocationNodes: LocationNode[]
): T[] {
  const accessibleNodeIds = getUserAccessibleNodes(userLocationNodeId, allLocationNodes);
  
  return items.filter(item => {
    // If item has no location, exclude it (location should be mandatory)
    if (!item.locationNodeId) return false;
    
    // Check if item's location is in user's accessible nodes
    return accessibleNodeIds.includes(item.locationNodeId);
  });
}

/**
 * Check if a document tagged with multiple locations is visible to a user.
 * Document is visible if ANY of its tagged locations is an ancestor of (or equal to) 
 * the user's location node.
 * 
 * Business rule: If a document is tagged at "USA" level, it should be visible to 
 * users assigned to "Austin Plant" (descendant of USA).
 * 
 * @param documentLocationNodeIds - Array of location node IDs the document is tagged with
 * @param userLocationNodeId - The user's assigned location node ID
 * @param allLocationNodes - The complete location hierarchy tree
 * @returns true if document should be visible to user
 * 
 * @example
 * // Document tagged with ["usa", "europe"]
 * // User assigned to "austin-plant" (child of usa)
 * // Returns: true (because austin-plant is descendant of usa)
 */
export function isDocumentVisibleToUser(
  documentLocationNodeIds: string[],
  userLocationNodeId: string,
  allLocationNodes: LocationNode[]
): boolean {
  const userNode = findNodeById(userLocationNodeId, allLocationNodes);
  if (!userNode) return false;

  // Build path from user's node to root
  const userPathToRoot: string[] = [];
  let currentNode: LocationNode | null = userNode;
  
  while (currentNode) {
    userPathToRoot.push(currentNode.id);
    if (currentNode.parentId) {
      currentNode = findNodeById(currentNode.parentId, allLocationNodes);
    } else {
      currentNode = null;
    }
  }

  // Check if any document location is in user's path to root (including user's own node)
  return documentLocationNodeIds.some(docLocationId => 
    userPathToRoot.includes(docLocationId)
  );
}

/**
 * Filter documents based on multi-location tagging and user access.
 * Documents can be tagged with multiple location nodes.
 * 
 * @param documents - Array of documents with locationNodeIds property
 * @param userLocationNodeId - The user's assigned location node ID
 * @param allLocationNodes - The complete location hierarchy tree
 * @returns Filtered array of accessible documents
 */
export function filterDocumentsByLocation<T extends { locationNodeIds?: string[] }>(
  documents: T[],
  userLocationNodeId: string,
  allLocationNodes: LocationNode[]
): T[] {
  return documents.filter(doc => {
    // If document has no locations, exclude it
    if (!doc.locationNodeIds || doc.locationNodeIds.length === 0) return false;
    
    // Check if document is visible to user
    return isDocumentVisibleToUser(doc.locationNodeIds, userLocationNodeId, allLocationNodes);
  });
}

/**
 * Check if a user has global-level access (can see everything).
 * Users assigned to the root/top-level location node have unrestricted access.
 * 
 * @param userLocationNodeId - The user's assigned location node ID
 * @param allLocationNodes - The complete location hierarchy tree
 * @returns true if user has global access
 */
export function hasGlobalAccess(
  userLocationNodeId: string,
  allLocationNodes: LocationNode[]
): boolean {
  const userNode = findNodeById(userLocationNodeId, allLocationNodes);
  return userNode?.level === 1 || false;
}
