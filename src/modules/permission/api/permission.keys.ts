export const permissionKeys = {
  all: ["permissions"] as const,
  me: () => [...permissionKeys.all, "me"] as const,
  byModule: () => [...permissionKeys.all, "by-module"] as const,
  role: (roleId: string) => [...permissionKeys.all, "role", roleId] as const,
};
