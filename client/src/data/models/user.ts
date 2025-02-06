export type UserRole = "admin" | "reader" | "writer" | "tracker";

export const ALL_ROLES: UserRole[] = ["admin", "writer", "reader", "tracker"];

export interface User {
  id: string;
  name: string;
  username: string;
  roles: UserRole[];
  lastLoggedInAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export class UserPermissions {
  id: string;
  name: string;
  username: string;
  roles: UserRole[];
  lastLoggedInAt: string | null;
  createdAt: string;
  updatedAt: string;


  constructor(public user: User | null) {
    this.id = user?.id ?? "";
    this.name = user?.name ?? "";
    this.username = user?.username ?? "";
    this.roles = user?.roles ?? [];
    this.lastLoggedInAt = user?.lastLoggedInAt ?? null;
    this.createdAt = user?.createdAt ?? "";
    this.updatedAt = user?.updatedAt ?? "";
  }

  // hasRole returns true if the user has the specified role.
  private hasRole(role: UserRole) {
    return this.user?.roles.includes(role) ?? false;
  }

  // isAuthenticated is true if the user is present.
  get isAuthenticated() {
    return !!this.user;
  }

  // isAdmin is true if the user has the "admin" role.
  get isAdmin() {
    return this.hasRole("admin");
  }

  // hasReadPermissions returns true if the user has the "reader", "writer", or "tracker" role or is an Admin.
  hasReadPermissions() {
    return this.hasRole("reader") || this.hasRole("writer") || this.hasRole("tracker") || this.isAdmin;
  }

  // hasWriterPermissions returns true if the user has the "writer" role or is an Admin.
  hasWriterPermissions() {
    return this.hasRole("writer") || this.isAdmin;
  }

  // hasTrackerPermissions returns true if the user has the "tracker" role.
  hasTrackerPermissions() {
    return this.hasRole("tracker");
  }
}