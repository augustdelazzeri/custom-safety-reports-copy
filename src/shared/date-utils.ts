export const formatDate = (date: Date | string | number, ..._args: any[]) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString();
};

export const formatTime = (date: Date | string | number, ..._args: any[]) => {
  if (!date) return "";
  return new Date(date).toLocaleTimeString();
};
