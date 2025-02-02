export type UserRole = "admin" | "reader" | "writer" | "tracker";

export interface User {
  id: string;
  name: string;
  username: string;
  roles: UserRole[];
}

export class UserPermissions {
  id: string;
  name: string;
  username: string;
  roles: UserRole[];

  constructor(public user: User | null) {
    this.id = user?.id ?? "";
    this.name = user?.name ?? "";
    this.username = user?.username ?? "";
    this.roles = user?.roles ?? [];
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