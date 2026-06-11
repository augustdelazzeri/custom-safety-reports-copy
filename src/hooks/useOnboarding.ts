import { useOnboarding as useOnboardingFromContext } from '../contexts/OnboardingContext';

export { type OnboardingStyle, type OnboardingState } from '../contexts/OnboardingContext';

export function useOnboarding() {
  return useOnboardingFromContext();
}
