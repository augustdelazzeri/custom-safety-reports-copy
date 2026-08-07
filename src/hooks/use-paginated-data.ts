export const useInfiniteAccessPoints = (config: any) => ({
  data: [
    { id: '1', name: 'Main Lobby', type: 'QR Code', location: 'Office A', createdAt: '2026-07-01', status: 'Active' },
    { id: '2', name: 'Back Entrance', type: 'QR Code', location: 'Warehouse B', createdAt: '2026-07-05', status: 'Inactive' }
  ],
  isLoading: false,
  error: null,
  hasNextPage: false,
  isFetchingNextPage: false,
  fetchNextPage: () => {},
  isFetchedAfterMount: true,
});

export const useInfiniteCapas = (config: any) => ({
  data: [
    { id: '1', title: 'Fix fire extinguisher in Block A', status: 'Open', priority: 'High', owner: 'John Doe', dueDate: '2026-08-15' },
    { id: '2', title: 'Review safety training materials', status: 'In Review', priority: 'Medium', owner: 'Jane Smith', dueDate: '2026-08-20' },
    { id: '3', title: 'Install new signage in warehouse', status: 'Closed', priority: 'Low', owner: 'Bob Wilson', dueDate: '2026-07-25' }
  ],
  isLoading: false,
  error: null,
  hasNextPage: false,
  isFetchingNextPage: false,
  fetchNextPage: () => {},
});
