export const onboardingKeys = {
  all: ["onboarding"] as const,
  overview: () => [...onboardingKeys.all, "overview"] as const,
};
