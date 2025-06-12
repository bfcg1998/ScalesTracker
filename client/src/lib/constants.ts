export const USER_ROLES = {
  admin: 'Administrator',
  technician: 'Technician', 
  auditor: 'Auditor',
  viewer: 'Viewer'
} as const;

export const SCALE_STATUS = {
  available: 'Available',
  assigned: 'Assigned',
  maintenance: 'Maintenance',
  retired: 'Retired'
} as const;

export const ASSIGNMENT_STATUS = {
  active: 'Active',
  returned: 'Returned',
  overdue: 'Overdue'
} as const;

export const CONDITION_OPTIONS = {
  excellent: 'Excellent',
  good: 'Good',
  fair: 'Fair',
  needs_maintenance: 'Needs Maintenance',
  damaged: 'Damaged'
} as const;

export const ACTION_TYPES = {
  assigned: 'Assigned',
  returned: 'Returned',
  calibrated: 'Calibrated',
  created: 'Created',
  updated: 'Updated'
} as const;

export const PERMISSIONS = {
  admin: ['dashboard', 'inventory', 'assignments', 'reports', 'users', 'create', 'update', 'delete'],
  technician: ['dashboard', 'inventory', 'assignments', 'reports', 'create', 'update'],
  auditor: ['dashboard', 'inventory', 'reports'],
  viewer: ['dashboard', 'inventory']
} as const;
