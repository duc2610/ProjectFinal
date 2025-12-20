export const ROLES = {
  Admin: "Admin",
  Examinee: "Examinee",
  TestCreator: "TestCreator",
};

export function hasRole(user, roleOrRoles) {
  if (!user) return false;
  const userRoles = Array.isArray(user.roles) ? user.roles : [];
  if (Array.isArray(roleOrRoles)) {
    return roleOrRoles.some((r) => userRoles.includes(r));
  }
  return userRoles.includes(roleOrRoles);
}
