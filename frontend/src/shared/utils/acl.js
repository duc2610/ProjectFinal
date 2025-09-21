export const ROLES = {
  ADMIN: "admin",
  USER: "user",
};

export function hasRole(user, roleOrRoles) {
  if (!user) return false;
  if (Array.isArray(roleOrRoles)) {
    return roleOrRoles.includes(user.role);
  }
  return user.role === roleOrRoles;
}

// export function hasAnyRole(user, roles = []) {
//   return !!user && roles.includes(user.role);
// }
