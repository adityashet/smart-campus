export type Role = 'STUDENT' | 'STAFF' | 'ADMIN';

export type PriorityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type ComplaintStatus =
  | 'SUBMITTED'
  | 'REVIEWED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'REJECTED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone: string;
  department?: string;
  avatarUrl?: string;
  status: 'ACTIVE' | 'INACTIVE';
  joinedDate: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  headName: string;
  email: string;
  activeComplaints: number;
}

export interface StaffMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  departmentId: string;
  departmentName: string;
  activeCount: number;
  resolvedCount: number;
  avatarUrl?: string;
}

export interface CampusLocation {
  id: string;
  name: string;
  code: string;
  building: string;
  totalComplaints: number;
}

export interface ComplaintCategory {
  id: string;
  name: string;
  description: string;
  iconName: string;
  defaultDepartmentId: string;
  assignedDepartmentId?: string;
  assignedDepartmentName?: string;
  assignedStaffId?: string;
  assignedStaffName?: string;
}

export interface TimelineEvent {
  id: string;
  status: ComplaintStatus;
  title: string;
  description: string;
  timestamp: string;
  performedBy: string;
  userRole: Role;
}

export interface Resolution {
  description: string;
  resolvedBy: string;
  resolvedById: string;
  resolvedDate: string;
  actualCost?: number;
  notes?: string;
}

export interface Complaint {
  id: string;
  complaintNumber: string; // e.g. CMP-1025
  title: string;
  categoryId: string;
  categoryName: string;
  locationId: string;
  locationName: string;
  roomDetails: string;
  severity: SeverityLevel;
  priorityScore: number; // 0 - 100
  priorityLevel: PriorityLevel;
  status: ComplaintStatus;
  description: string;
  contactPreference?: string;
  additionalNotes?: string;
  submittedBy: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  assignedDepartmentId?: string;
  assignedDepartmentName?: string;
  assignedStaffId?: string;
  assignedStaffName?: string;
  assignedDate?: string;
  createdDate: string;
  updatedDate: string;
  imageEvidenceUrl?: string;
  resolution?: Resolution;
  timeline: TimelineEvent[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'CRITICAL' | 'ASSIGNMENT' | 'STATUS_CHANGE' | 'SYSTEM';
  read: boolean;
  timestamp: string;
  complaintId?: string;
}

export interface RecurringProblem {
  id: string;
  locationName: string;
  categoryName: string;
  complaintCount: number;
  criticalCount: number;
  lastReported: string;
  trend: 'UP' | 'STABLE' | 'DOWN';
  statusSummary: string;
}

export interface AnalyticsData {
  totalComplaints: number;
  criticalCount: number;
  pendingCount: number;
  inProgressCount: number;
  resolvedCount: number;
  avgResolutionHours: number;
  complaintTrend: { date: string; total: number; resolved: number }[];
  categoryDistribution: { category: string; count: number }[];
  locationDistribution: { location: string; count: number }[];
  statusDistribution: { status: string; count: number }[];
}

export interface ComplaintFilters {
  search?: string;
  status?: ComplaintStatus | 'ALL';
  priority?: PriorityLevel | 'ALL';
  category?: string | 'ALL';
  location?: string | 'ALL';
  sortBy?: 'NEWEST' | 'OLDEST' | 'PRIORITY_HIGH' | 'PRIORITY_LOW';
}
