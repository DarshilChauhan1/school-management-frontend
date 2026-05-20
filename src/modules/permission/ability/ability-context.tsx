"use client";

import { createContextualCan } from "@casl/react";
import { createContext, useContext, useMemo } from "react";

import { useMyPermissions } from "../api/use-permissions";
import {
  buildAbility,
  EMPTY_ABILITY,
  type AppAbility,
} from "./ability";

/** Holds only the ability instance — consumed by createContextualCan. */
const AbilityContext = createContext<AppAbility>(EMPTY_ABILITY);

interface AbilityMeta {
  isLoading: boolean;
  isError: boolean;
  role: string | null;
}

const AbilityMetaContext = createContext<AbilityMeta>({
  isLoading: true,
  isError: false,
  role: null,
});

export function AbilityProvider({ children }: { children: React.ReactNode }) {
  const { data, isLoading, isError } = useMyPermissions();
  const permissions = data?.data ?? null;

  const ability = useMemo(() => buildAbility(permissions), [permissions]);

  const meta = useMemo<AbilityMeta>(
    () => ({ isLoading, isError, role: permissions?.role ?? null }),
    [isLoading, isError, permissions?.role],
  );

  return (
    <AbilityContext.Provider value={ability}>
      <AbilityMetaContext.Provider value={meta}>
        {children}
      </AbilityMetaContext.Provider>
    </AbilityContext.Provider>
  );
}

export function useAppAbility() {
  return useContext(AbilityContext);
}

export function useAbilityMeta() {
  return useContext(AbilityMetaContext);
}

/** Render-prop guard: <Can I="read" a="classes">…</Can> */
export const Can = createContextualCan(AbilityContext.Consumer);
