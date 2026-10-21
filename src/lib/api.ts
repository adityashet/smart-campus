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
    const response = await fetch('/api/complaints', {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to load complaints from the database.');
    }

    const result = await response.json();

    const complaints: Complaint[] = result.complaints.map(
      (item: {
        id: string | number;
        public_id: string;
        title: string;
        description: string;
        status: ComplaintStatus;
        severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
        priority_score: number | string;
        created_at: string;
        updated_at: string;
        category_id: string | number;
        category_name: string;
        location_id: string | number;
        building: string;
        floor: string | null;
        room: string | null;
        submitted_by_id: string | number;
        submitted_by_name: string;
        submitted_by_email: string;
        department_name: string | null;
        assigned_department_id: string | number | null;
        assigned_staff_id: string | number | null;
        assigned_staff_name: string | null;
      }) => {
        const score = Number(item.priority_score);

        const priorityLevel =
          score >= 80
            ? 'CRITICAL'
            : score >= 60
              ? 'HIGH'
              : score >= 40
                ? 'MEDIUM'
                : 'LOW';

        return {
          id: String(item.id),
          complaintNumber: `CMP-${item.id}`,
          title: item.title,
          categoryId: String(item.category_id),
          categoryName: item.category_name,
          locationId: String(item.location_id),
          locationName: [
            item.building,
            item.floor,
            item.room,
          ]
            .filter(Boolean)
            .join(' - '),
          roomDetails: item.room || '',
          severity: item.severity,
          priorityScore: score,
          priorityLevel,
          status: item.status,
          description: item.description,
          submittedBy: {
            id: String(item.submitted_by_id),
            name: item.submitted_by_name || 'Campus user',
            email: item.submitted_by_email || '',
          },
          assignedDepartmentName: item.department_name || undefined,
          assignedDepartmentId:
            item.assigned_department_id != null
              ? String(item.assigned_department_id)
              : undefined,
          assignedStaffId:
            item.assigned_staff_id != null
              ? String(item.assigned_staff_id)
              : undefined,
          assignedStaffName: item.assigned_staff_name ?? undefined,
          createdDate: item.created_at,
          updatedDate: item.updated_at,
          timeline: [],
        };
      },
    );

    if (!filters) return complaints;

    let filtered = complaints.filter((item) => {
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const searchable = [
          item.complaintNumber,
          item.title,
          item.locationName,
          item.categoryName,
          item.description,
        ].join(' ').toLowerCase();

        if (!searchable.includes(query)) return false;
      }

      if (filters.status && filters.status !== 'ALL') {
        if (item.status !== filters.status) return false;
      }

      if (filters.priority && filters.priority !== 'ALL') {
        if (item.priorityLevel !== filters.priority) return false;
      }

      if (filters.category && filters.category !== 'ALL') {
        if (
          item.categoryId !== filters.category &&
          item.categoryName !== filters.category
        ) {
          return false;
        }
      }

      if (filters.location && filters.location !== 'ALL') {
        if (
          item.locationId !== filters.location &&
          item.locationName !== filters.location
        ) {
          return false;
        }
      }

      return true;
    });

    filtered = filtered.sort((a, b) => {
      if (filters.sortBy === 'OLDEST') {
        return new Date(a.createdDate).getTime() -
          new Date(b.createdDate).getTime();
      }

      if (filters.sortBy === 'PRIORITY_HIGH') {
        return b.priorityScore - a.priorityScore;
      }

      if (filters.sortBy === 'PRIORITY_LOW') {
        return a.priorityScore - b.priorityScore;
      }

      return new Date(b.createdDate).getTime() -
        new Date(a.createdDate).getTime();
    });

    return filtered;
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
    submittedBy: {
      id: string;
      name: string;
      email: string;
      phone?: string;
    };
    imageEvidenceUrl?: string;
  }): Promise<Complaint> {
    const categories = await this.getCategories();
    const locations = await this.getLocations();

    const category = categories.find(
      (item) => item.id === data.categoryId,
    );
    const location = locations.find(
      (item) => item.id === data.locationId,
    );

    if (!category || !location) {
      throw new Error('Please select a valid category and location.');
    }

    // Temporary local-demo mapping. Replace with real authentication later.
    const parsedUserId = Number(data.submittedBy.id);
    const submittedBy =
      Number.isInteger(parsedUserId) && parsedUserId > 0
        ? parsedUserId
        : 1;

    const response = await fetch('/api/complaints', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: data.title,
        description: data.description,
        categoryId: Number(data.categoryId),
        locationId: Number(data.locationId),
        submittedBy,
        severity: data.severity,
        safetyRisk: false,
        affectsMultiplePeople: false,
        recurring: false,
        roomDetails: data.roomDetails,
        contactPreference: data.contactPreference,
        additionalNotes: data.additionalNotes,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.error || 'Failed to submit the complaint.',
      );
    }

    const saved = result.complaint;
    const score = Number(saved.priority_score);
    const priorityLevel =
      score >= 80
        ? 'CRITICAL'
        : score >= 60
          ? 'HIGH'
          : score >= 40
            ? 'MEDIUM'
            : 'LOW';

    const now = new Date().toISOString();
    const complaintId = String(saved.id);
    const complaintNumber = `CMP-${saved.id}`;

    const newComplaint: Complaint = {
      id: complaintId,
      complaintNumber,
      title: saved.title,
      categoryId: data.categoryId,
      categoryName: category.name,
      locationId: data.locationId,
      locationName: location.name,
      roomDetails: data.roomDetails,
      severity: saved.severity,
      priorityScore: score,
      priorityLevel,
      status: saved.status,
      description: saved.description,
      contactPreference: data.contactPreference,
      additionalNotes: data.additionalNotes,
      submittedBy: data.submittedBy,
      createdDate: saved.created_at || now,
      updatedDate: saved.created_at || now,
      imageEvidenceUrl: data.imageEvidenceUrl,
      timeline: [
        {
          id: `t-${complaintId}`,
          status: 'SUBMITTED',
          title: 'Complaint Submitted',
          description: `Complaint registered with priority score ${score}/100.`,
          timestamp: saved.created_at || now,
          performedBy: data.submittedBy.name,
          userRole: 'STUDENT',
        },
      ],
    };

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
  const item = complaints.find(
    (c) => c.id === id || c.complaintNumber === id
  );

  if (!item) {
    throw new Error('Complaint not found');
  }

  const changedBy = Number(
    item.submittedBy?.id
  );

  const response = await fetch('/api/complaints/status', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      complaintId: Number(item.id),
      status,
      changedBy,
      notes: notes || `Status updated to ${status} by ${userName} (${userRole}).`,
    }),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.error || 'Failed to update complaint status');
  }

  // Reload from PostgreSQL so the UI reflects the saved status.
  const updatedComplaints = await this.getComplaints();
  const updatedItem = updatedComplaints.find(
    (c) => c.id === item.id || c.complaintNumber === id
  );

  if (!updatedItem) {
    throw new Error('Status was saved, but the updated complaint could not be reloaded');
  }

  return updatedItem;
},


  
async assignComplaint(
  id: string,
  departmentId: string,
  staffId?: string,
  adminName: string = 'Dr. Vikram Singh'
): Promise<Complaint> {
  const complaints = await this.getComplaints();

  const item = complaints.find(
    (c) => c.id === id || c.complaintNumber === id
  );

  if (!item) {
    throw new Error('Complaint not found');
  }

  const response = await fetch('/api/complaints/assign', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      complaintId: Number(item.id),
      departmentId: Number(departmentId),
      assignedBy: 1,
      ...(staffId ? { staffId: Number(staffId) } : {}),
    }),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.error || 'Failed to assign complaint');
  }

  // Reload the saved assignment from PostgreSQL.
  const updatedComplaints = await this.getComplaints();

  const updatedItem = updatedComplaints.find(
    (c) => c.id === item.id || c.complaintNumber === id
  );

  if (!updatedItem) {
    throw new Error(
      'Assignment was saved, but the updated complaint could not be reloaded'
    );
  }

  return updatedItem;
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

  const item = complaints.find(
    (c) => c.id === id || c.complaintNumber === id
  );

  if (!item) {
    throw new Error('Complaint not found');
  }

  const response = await fetch('/api/complaints/resolve', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      complaintId: Number(item.id),
      staffId: Number(resolutionData.staffId),
      description: resolutionData.description,
      actualCost: resolutionData.actualCost,
      notes: resolutionData.notes,
    }),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.error || 'Failed to resolve complaint');
  }

  // Reload the saved complaint from PostgreSQL.
  const updatedComplaints = await this.getComplaints();

  const updatedItem = updatedComplaints.find(
    (c) => c.id === item.id || c.complaintNumber === id
  );

  if (!updatedItem) {
    throw new Error(
      'Resolution was saved, but the updated complaint could not be reloaded'
    );
  }

  return {
    ...updatedItem,
    resolution: {
      description: resolutionData.description,
      resolvedBy: resolutionData.staffName,
      resolvedById: resolutionData.staffId,
      resolvedDate: new Date().toISOString(),
      actualCost: resolutionData.actualCost,
      notes: resolutionData.notes,
    },
  };
},


  
  // --- DEPARTMENTS & STAFF ---
  
async getDepartments(): Promise<Department[]> {
  const response = await fetch('/api/reference');

  if (!response.ok) {
    throw new Error('Failed to load departments.');
  }

  const data = await response.json();

  return data.departments.map(
    (department: {
      id: string | number;
      name: string;
      description?: string | null;
      code?: string | null;
      head_name?: string | null;
      email?: string | null;
      active_complaints?: number | null;
    }): Department => ({
      id: String(department.id),
      name: department.name,
      code: department.code ?? `DEPT-${department.id}`,
      headName: department.head_name ?? 'Not assigned',
      email: department.email ?? '',
      activeComplaints: Number(department.active_complaints ?? 0),
    })
  );
},


  async getStaff(): Promise<StaffMember[]> {
    const response = await fetch('/api/reference');

    if (!response.ok) {
      throw new Error('Failed to load staff.');
    }

    const data = await response.json();

    return data.staff.map(
      (staff: {
        id: string | number;
        full_name: string;
        email: string;
        department_id?: string | number | null;
        department_name?: string | null;
        role: 'STAFF' | 'ADMIN';
      }) => ({
        id: String(staff.id),
        name: staff.full_name,
        email: staff.email,
        departmentId: staff.department_id
          ? String(staff.department_id)
          : '',
        departmentName: staff.department_name ?? '',
        role: staff.role,
      }),
    );
  },

  
  async getLocations(): Promise<CampusLocation[]> {
    const response = await fetch('/api/reference');

    if (!response.ok) {
      throw new Error('Failed to load campus locations.');
    }

    const data = await response.json();

    return data.locations.map(
      (location: {
        id: string | number;
        building: string;
        floor: string | null;
        room: string | null;
        description: string;
      }) => ({
        id: String(location.id),
        name: [
          location.building,
          location.floor,
          location.room,
        ]
          .filter(Boolean)
          .join(' - '),
        code: `LOC-${location.id}`,
        building: location.building,
        totalComplaints: 0,
      }),
    );
  },

  
async getCategories(): Promise<ComplaintCategory[]> {
  const response = await fetch('/api/reference');

  if (!response.ok) {
    throw new Error('Failed to load complaint categories.');
  }

  const data = await response.json();

  const departments: Department[] = data.departments.map(
    (department: {
      id: string | number;
      name: string;
      description?: string | null;
    }) => ({
      id: String(department.id),
      name: department.name,
      code: `DEPT-${department.id}`,
      headName: 'Not assigned',
      email: '',
      activeComplaints: 0,
    })
  );

  return data.categories.map(
    (category: {
      id: string | number;
      name: string;
      department_name: string;
    }) => ({
      id: String(category.id),
      name: category.name,
      description: `Report issues related to ${category.name.toLowerCase()}.`,
      iconName: 'Wrench',
      defaultDepartmentId:
        departments.find(
          (department) =>
            department.name === category.department_name
        )?.id ?? '',
    })
  );
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
