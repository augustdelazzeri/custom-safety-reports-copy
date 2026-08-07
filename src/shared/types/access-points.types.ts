export const ACCESS_POINTS_DEFAULT_SORT_BY = 'name';
export const ACCESS_POINTS_DEFAULT_SORT_ORDER = 'asc';
export const isAccessPointsTableColumnId = (id: string) => true;
export const isAccessPointsSortBy = (id: string) => true;
export type AccessPointsSortBy = 'name' | 'status' | 'createdAt';
export type AccessPointsTableColumnId = string;
