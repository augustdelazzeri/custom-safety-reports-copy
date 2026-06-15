"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export type OnboardingStyle = 'floating_checklist' | 'setup_center' | 'sample_data';

export interface OnboardingState {
  isOpen: boolean;
  completedSteps: boolean[];
  style: OnboardingStyle;
}

interface OnboardingContextType extends OnboardingState {
  isLoaded: boolean;
  toggleOpen: () => void;
  setStepComplete: (stepIndex: number, complete?: boolean) => void;
  setOnboardingStyle: (style: OnboardingStyle) => void;
  resetOnboarding: () => void;
}

const STORAGE_KEY = 'upkeep_ehs_onboarding';

const initialState: OnboardingState = {
  isOpen: true,
  completedSteps: [false, false, false],
  style: 'floating_checklist',
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OnboardingState>(initialState);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.style) parsed.style = initialState.style;
        setState(parsed);
      } catch (e) {
        console.error('Failed to parse onboarding state', e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, isLoaded]);

  const toggleOpen = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: !prev.isOpen }));
  }, []);

  const setStepComplete = useCallback((stepIndex: number, complete: boolean = true) => {
    setState((prev) => {
      if (prev.completedSteps[stepIndex] === complete) return prev;
      const newSteps = [...prev.completedSteps];
      newSteps[stepIndex] = complete;
      return { ...prev, completedSteps: newSteps };
    });
  }, []);

  const setOnboardingStyle = useCallback((style: OnboardingStyle) => {
    setState((prev) => ({ ...prev, style }));
  }, []);

  const resetOnboarding = useCallback(() => {
    setState((prev) => ({
      ...initialState,
      style: prev.style,
    }));
  }, []);

  return (
    <OnboardingContext.Provider
      value={{
        ...state,
        isLoaded,
        toggleOpen,
        setStepComplete,
        setOnboardingStyle,
        resetOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
