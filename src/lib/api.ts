import {
  Complaint,
  ComplaintFilters,
  Department,
  StaffMember,
  CampusLocation,
  ComplaintCategory,
  AnalyticsData,
  RecurringProblem,
  User,
  NotificationItem,
  ComplaintStatus,
} from '@/types';
import {
  MOCK_COMPLAINTS,
  MOCK_DEPARTMENTS,
  MOCK_STAFF,
  MOCK_LOCATIONS,
  MOCK_CATEGORIES,
  MOCK_USERS,
  MOCK_NOTIFICATIONS,
  MOCK_RECURRING_PROBLEMS,
  MOCK_ANALYTICS,
} from './mockData';
import { calculatePriorityScore } from './utils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
const STORAGE_KEY_COMPLAINTS = 'campusfix_complaints_v1';
const STORAGE_KEY_NOTIFS = 'campusfix_notifications_v1';
const STORAGE_KEY_USERS = 'campusfix_users_v1';

// Local storage helper
function getStoredItems<T>(key: string, defaultData: T): T {
  if (typeof window === 'undefined') return defaultData;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultData;
  } catch {
    return defaultData;
  }
}

function setStoredItems<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

// API Abstraction Service
export const api = {
  // --- COMPLAINTS API ---
  async getComplaints(filters?: ComplaintFilters): Promise<Complaint[]> {
    if (API_BASE_URL && false) {
      // Prepared for real backend fetch
      const res = await fetch(`${API_BASE_URL}/api/complaints`);
      return res.json();
    }

    // Local Mock Implementation with persistence
    let complaints: Complaint[] = getStoredItems(STORAGE_KEY_COMPLAINTS, MOCK_COMPLAINTS);
    if (!complaints || complaints.length === 0) {
      complaints = [...MOCK_COMPLAINTS];
      setStoredItems(STORAGE_KEY_COMPLAINTS, complaints);
    }

    if (!filters) return complaints;

    return complaints.filter((item) => {
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchesQuery =
          item.complaintNumber.toLowerCase().includes(query) ||
          item.title.toLowerCase().includes(query) ||
          item.locationName.toLowerCase().includes(query) ||
          item.categoryName.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query);
        if (!matchesQuery) return false;
      }

      if (filters.status && filters.status !== 'ALL') {
        if (item.status !== filters.status) return false;
      }

      if (filters.priority && filters.priority !== 'ALL') {
        if (item.priorityLevel !== filters.priority) return false;
      }

      if (filters.category && filters.category !== 'ALL') {
        if (item.categoryId !== filters.category && item.categoryName !== filters.category) return false;
      }

      if (filters.location && filters.location !== 'ALL') {
        if (item.locationId !== filters.location && item.locationName !== filters.location) return false;
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'OLDEST') {
        return new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime();
      }
      if (filters.sortBy === 'PRIORITY_HIGH') {
        return b.priorityScore - a.priorityScore;
      }
      if (filters.sortBy === 'PRIORITY_LOW') {
        return a.priorityScore - b.priorityScore;
      }
      // Default: NEWEST
      return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
    });
  },

  async getComplaintById(id: string): Promise<Complaint | null> {
    const complaints = await this.getComplaints();
    const found = complaints.find(
      (c) => c.id.toLowerCase() === id.toLowerCase() || c.complaintNumber.toLowerCase() === id.toLowerCase()
    );
    return found || null;
  },

  async createComplaint(data: {
    title: string;
    categoryId: string;
    locationId: string;
    roomDetails: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    description: string;
    contactPreference?: string;
    additionalNotes?: string;
    submittedBy: { id: string; name: string; email: string; phone?: string };
    imageEvidenceUrl?: string;
  }): Promise<Complaint> {
    const complaints = await this.getComplaints();
    const categories = await this.getCategories();
    const locations = await this.getLocations();

    const categoryObj = categories.find((c) => c.id === data.categoryId);
    const locationObj = locations.find((l) => l.id === data.locationId);

    const categoryName = categoryObj ? categoryObj.name : 'General Issue';
    const locationName = locationObj ? locationObj.name : 'Main Campus';

    // Calculate priority score according to category, severity, location
    const { score, level } = calculatePriorityScore(data.severity, locationName, categoryName);

    const newNumberIndex = 1025 + complaints.length;
    const newId = `cmp-${newNumberIndex}`;
    const newNumber = `CMP-${newNumberIndex}`;

    const newComplaint: Complaint = {
      id: newId,
      complaintNumber: newNumber,
      title: data.title,
      categoryId: data.categoryId,
      categoryName: categoryName,
      locationId: data.locationId,
      locationName: locationName,
      roomDetails: data.roomDetails,
      severity: data.severity,
      priorityScore: score,
      priorityLevel: level,
      status: 'SUBMITTED',
      description: data.description,
      contactPreference: data.contactPreference,
      additionalNotes: data.additionalNotes,
      submittedBy: data.submittedBy,
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      imageEvidenceUrl: data.imageEvidenceUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600',
      timeline: [
        {
          id: `t-${Date.now()}`,
          status: 'SUBMITTED',
          title: 'Complaint Submitted',
          description: `Complaint registered. Backend priority engine assigned initial score of ${score}/100 (${level}).`,
          timestamp: new Date().toISOString(),
          performedBy: data.submittedBy.name,
          userRole: 'STUDENT',
        },
      ],
    };

    const updated = [newComplaint, ...complaints];
    setStoredItems(STORAGE_KEY_COMPLAINTS, updated);

    // Push notification for Admin & Staff
    const notifs = getStoredItems(STORAGE_KEY_NOTIFS, MOCK_NOTIFICATIONS);
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: level === 'CRITICAL' ? 'Critical Complaint Submitted' : 'New Complaint Submitted',
      message: `${newNumber}: "${data.title}" reported in ${locationName}. Score: ${score}.`,
      type: level === 'CRITICAL' ? 'CRITICAL' : 'STATUS_CHANGE',
      read: false,
      timestamp: 'Just now',
      complaintId: newId,
    };
    setStoredItems(STORAGE_KEY_NOTIFS, [newNotif, ...notifs]);

    return newComplaint;
  },

  async updateComplaintStatus(
    id: string,
    status: ComplaintStatus,
    notes?: string,
    userRole: 'STUDENT' | 'STAFF' | 'ADMIN' = 'ADMIN',
    userName: string = 'Campus Admin'
  ): Promise<Complaint> {
    const complaints = await this.getComplaints();
    const index = complaints.findIndex((c) => c.id === id || c.complaintNumber === id);
    if (index === -1) throw new Error('Complaint not found');

    const item = complaints[index];
    item.status = status;
    item.updatedDate = new Date().toISOString();

    let eventTitle = `Status updated to ${status}`;
    if (status === 'REVIEWED') eventTitle = 'Admin Priority Reviewed';
    if (status === 'ASSIGNED') eventTitle = 'Department & Staff Assigned';
    if (status === 'IN_PROGRESS') eventTitle = 'Work Started by Technician';
    if (status === 'RESOLVED') eventTitle = 'Issue Marked as Resolved';

    item.timeline.push({
      id: `t-${Date.now()}`,
      status,
      title: eventTitle,
      description: notes || `Complaint status updated to ${status}.`,
      timestamp: new Date().toISOString(),
      performedBy: userName,
      userRole,
    });

    complaints[index] = item;
    setStoredItems(STORAGE_KEY_COMPLAINTS, complaints);
    return item;
  },

  async assignComplaint(
    id: string,
    departmentId: string,
    staffId?: string,
    adminName: string = 'Dr. Vikram Singh'
  ): Promise<Complaint> {
    const complaints = await this.getComplaints();
    const departments = await this.getDepartments();
    const staffList = await this.getStaff();

    const index = complaints.findIndex((c) => c.id === id || c.complaintNumber === id);
    if (index === -1) throw new Error('Complaint not found');

    const deptObj = departments.find((d) => d.id === departmentId);
    const staffObj = staffList.find((s) => s.id === staffId);

    const item = complaints[index];
    item.assignedDepartmentId = departmentId;
    item.assignedDepartmentName = deptObj ? deptObj.name : 'Maintenance Dept';
    if (staffObj) {
      item.assignedStaffId = staffObj.id;
      item.assignedStaffName = staffObj.name;
    }
    item.assignedDate = new Date().toISOString();
    item.status = 'ASSIGNED';
    item.updatedDate = new Date().toISOString();

    item.timeline.push({
      id: `t-${Date.now()}`,
      status: 'ASSIGNED',
      title: 'Assigned to Staff',
      description: `Assigned to ${deptObj ? deptObj.name : 'Department'}${staffObj ? ` (${staffObj.name})` : ''}.`,
      timestamp: new Date().toISOString(),
      performedBy: adminName,
      userRole: 'ADMIN',
    });

    complaints[index] = item;
    setStoredItems(STORAGE_KEY_COMPLAINTS, complaints);
    return item;
  },

  async resolveComplaint(
    id: string,
    resolutionData: {
      description: string;
      actualCost?: number;
      notes?: string;
      staffName: string;
      staffId: string;
    }
  ): Promise<Complaint> {
    const complaints = await this.getComplaints();
    const index = complaints.findIndex((c) => c.id === id || c.complaintNumber === id);
    if (index === -1) throw new Error('Complaint not found');

    const item = complaints[index];
    item.status = 'RESOLVED';
    item.updatedDate = new Date().toISOString();
    item.resolution = {
      description: resolutionData.description,
      resolvedBy: resolutionData.staffName,
      resolvedById: resolutionData.staffId,
      resolvedDate: new Date().toISOString(),
      actualCost: resolutionData.actualCost,
      notes: resolutionData.notes,
    };

    item.timeline.push({
      id: `t-${Date.now()}`,
      status: 'RESOLVED',
      title: 'Work Completed & Resolved',
      description: resolutionData.description,
      timestamp: new Date().toISOString(),
      performedBy: resolutionData.staffName,
      userRole: 'STAFF',
    });

    complaints[index] = item;
    setStoredItems(STORAGE_KEY_COMPLAINTS, complaints);
    return item;
  },

  // --- DEPARTMENTS & STAFF ---
  async getDepartments(): Promise<Department[]> {
    return MOCK_DEPARTMENTS;
  },

  async getStaff(): Promise<StaffMember[]> {
    return MOCK_STAFF;
  },

  async getLocations(): Promise<CampusLocation[]> {
    return MOCK_LOCATIONS;
  },

  async getCategories(): Promise<ComplaintCategory[]> {
    return MOCK_CATEGORIES;
  },

  // --- ANALYTICS & PRIORITY QUEUE ---
  async getAnalytics(): Promise<AnalyticsData> {
    const complaints = await this.getComplaints();
    const total = complaints.length;
    const critical = complaints.filter((c) => c.priorityLevel === 'CRITICAL').length;
    const pending = complaints.filter((c) => c.status === 'SUBMITTED' || c.status === 'REVIEWED').length;
    const inProgress = complaints.filter((c) => c.status === 'ASSIGNED' || c.status === 'IN_PROGRESS').length;
    const resolved = complaints.filter((c) => c.status === 'RESOLVED').length;

    return {
      ...MOCK_ANALYTICS,
      totalComplaints: total,
      criticalCount: critical,
      pendingCount: pending,
      inProgressCount: inProgress,
      resolvedCount: resolved,
    };
  },

  async getPriorityQueue(): Promise<Complaint[]> {
    const complaints = await this.getComplaints();
    return complaints.sort((a, b) => b.priorityScore - a.priorityScore);
  },

  async getRecurringProblems(): Promise<RecurringProblem[]> {
    return MOCK_RECURRING_PROBLEMS;
  },

  // --- USER MANAGEMENT ---
  async getUsers(): Promise<User[]> {
    return getStoredItems(STORAGE_KEY_USERS, MOCK_USERS);
  },

  async toggleUserStatus(userId: string): Promise<User[]> {
    const users = await this.getUsers();
    const updated = users.map((u) => {
      if (u.id === userId) {
        return { ...u, status: u.status === 'ACTIVE' ? ('INACTIVE' as const) : ('ACTIVE' as const) };
      }
      return u;
    });
    setStoredItems(STORAGE_KEY_USERS, updated);
    return updated;
  },

  // --- NOTIFICATIONS ---
  async getNotifications(): Promise<NotificationItem[]> {
    return getStoredItems(STORAGE_KEY_NOTIFS, MOCK_NOTIFICATIONS);
  },

  async markNotificationRead(id: string): Promise<NotificationItem[]> {
    const notifs = await this.getNotifications();
    const updated = notifs.map((n) => (n.id === id ? { ...n, read: true } : n));
    setStoredItems(STORAGE_KEY_NOTIFS, updated);
    return updated;
  },

  async markAllNotificationsRead(): Promise<NotificationItem[]> {
    const notifs = await this.getNotifications();
    const updated = notifs.map((n) => ({ ...n, read: true }));
    setStoredItems(STORAGE_KEY_NOTIFS, updated);
    return updated;
  },
};
