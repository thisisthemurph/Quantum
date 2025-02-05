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

  private hasRole(role: UserRole) {
    return this.user?.roles.includes(role) ?? false;
  }

  get isAuthenticated() {
    return !!this.user;
  }

  get isAdmin() {
    return this.hasRole("admin");
  }

  hasReadPermissions() {
    return this.hasRole("reader") || this.hasRole("writer") || this.hasRole("tracker") || this.isAdmin;
  }

  hasWriterPermissions() {
    return this.hasRole("writer") || this.isAdmin;
  }

  hasTrackerPermissions() {
    return this.hasRole("tracker") || this.isAdmin;
  }
}