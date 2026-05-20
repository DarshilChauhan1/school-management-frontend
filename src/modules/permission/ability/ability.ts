import {
  AbilityBuilder,
  createMongoAbility,
  type MongoAbility,
} from "@casl/ability";

import type {
  MyPermissions,
  PermissionAction,
} from "../api/permission.types";

export type AppAbility = MongoAbility<[PermissionAction, string]>;

/**
 * Build a CASL ability from the `/permissions/me` response.
 * Each module → subject → action becomes a `can(action, subject)` rule.
 */
export function buildAbility(permissions?: MyPermissions | null): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  permissions?.modules.forEach((module) => {
    module.subjects.forEach((subject) => {
      subject.actions.forEach((action) => {
        can(action, subject.subject);
      });
    });
  });

  return build();
}

export const EMPTY_ABILITY: AppAbility = buildAbility(null);
