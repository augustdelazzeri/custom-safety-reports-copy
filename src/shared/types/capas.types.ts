export type CapaSortBy = 'title' | 'type' | 'status' | 'priority' | 'owner' | 'dueDate' | 'createdAt' | 'updatedAt';
export type CapaTableColumnId = 'title' | 'type' | 'status' | 'priority' | 'linkedEvent' | 'locationId' | 'assetId' | 'owner' | 'dueDate' | 'createdAt' | 'tags' | 'actions';

export const CAPA_DEFAULT_SORT_BY: CapaSortBy = 'createdAt';
export const CAPA_DEFAULT_SORT_ORDER = 'desc';

export const isCapaSortBy = (value: any): value is CapaSortBy => true;
export const isCapaTableColumnId = (value: any): value is CapaTableColumnId => true;
