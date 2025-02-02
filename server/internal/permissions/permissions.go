package permissions

import "strings"

// Role is the role of the user in the system.
//
//	admin: can do everything including delete items and locations. Implies reader, writer and tracker.
//	writer: can create/update items and locations but cannot delete them. Implies reader. Does not imply tracker.
//	tracker: can change the location of an item, but cannot create/update/delete. Implies reader.
//	reader: can only read items and locations.
type Role string

const (
	AdminRole   Role = "admin"
	ReaderRole  Role = "reader"
	WriterRole  Role = "writer"
	TrackerRole Role = "tracker"
)

func NewRole(role string) Role {
	return Role(role)
}

func (r Role) String() string {
	return string(r)
}

type RoleCollection []Role

func (c RoleCollection) Valid() bool {
	return c != nil && len(c) > 0
}

func (c RoleCollection) String() string {
	if !c.Valid() {
		return "No roles assigned"
	}

	strRoles := make([]string, len(c))
	for i, role := range c {
		strRoles[i] = string(role)
	}

	return strings.Join(strRoles, ", ")
}

func (c RoleCollection) HasRole(role Role) bool {
	if !c.Valid() {
		return false
	}
	for _, r := range c {
		if r == role {
			return true
		}
	}
	return false
}

// IsAdmin checks if the user has the admin role.
func (c RoleCollection) IsAdmin() bool {
	return c.HasRole(AdminRole)
}

// HasReadPermissions checks if the user has the ReaderRole.
// The WriterRole, TrackerRole and AdminRole are also considered readers.
func (c RoleCollection) HasReadPermissions() bool {
	return c.HasRole(ReaderRole) || c.HasRole(WriterRole) || c.HasRole(TrackerRole) || c.HasRole(AdminRole)
}

// HasWritePermissions checks if the user has the WriterRole.
// The AdminRole is also considered a writer.
func (c RoleCollection) HasWritePermissions() bool {
	return c.HasRole(WriterRole) || c.HasRole(AdminRole)
}

// HasTrackPermissions checks if the user has the TrackerRole.
// The AdminRole is also considered a tracker.
func (c RoleCollection) HasTrackPermissions() bool {
	return c.HasRole(TrackerRole) || c.HasRole(AdminRole)
}
