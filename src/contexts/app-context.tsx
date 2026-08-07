import React, { createContext, useContext } from 'react';

type AppContextType = {
  user: { hasPartialAccess: boolean } | null;
  isUsCompany: boolean;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <AppContext.Provider value={{ user: { hasPartialAccess: false }, isUsCompany: true }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    return { user: { hasPartialAccess: false }, isUsCompany: true }; // Fallback for prototype
  }
  return context;
};
