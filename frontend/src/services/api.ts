const API_BASE = '/api';

export const getAuthToken = (): string => {
  return localStorage.getItem('cc_token') || 'usr_aarav_01';
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('cc_token', token);
};

const getHeaders = () => {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getAuthToken()}`
  };
};

export const api = {
  // Auth
  async getCurrentUser() {
    const res = await fetch(`${API_BASE}/auth/me`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch user');
    return res.json();
  },

  async getDemoUsers() {
    const res = await fetch(`${API_BASE}/auth/demo-users`);
    return res.json();
  },

  // Directory & Students
  async getStudents(params?: Record<string, string>) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/students?${query}`, { headers: getHeaders() });
    return res.json();
  },

  async getStudent(id: string) {
    const res = await fetch(`${API_BASE}/students/${id}`, { headers: getHeaders() });
    return res.json();
  },

  async updateStudent(id: string, data: any) {
    const res = await fetch(`${API_BASE}/students/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async getColleges() {
    const res = await fetch(`${API_BASE}/colleges`);
    return res.json();
  },

  async getSkills() {
    const res = await fetch(`${API_BASE}/skills`);
    return res.json();
  },

  async getInterests() {
    const res = await fetch(`${API_BASE}/interests`);
    return res.json();
  },

  // Projects
  async getProjects(params?: Record<string, string>) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/projects?${query}`, { headers: getHeaders() });
    return res.json();
  },

  async getProject(id: string) {
    const res = await fetch(`${API_BASE}/projects/${id}`, { headers: getHeaders() });
    return res.json();
  },

  async createProject(data: any) {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async updateProjectStatus(id: string, status: string) {
    const res = await fetch(`${API_BASE}/projects/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    return res.json();
  },

  async createTask(projectId: string, task: any) {
    const res = await fetch(`${API_BASE}/projects/${projectId}/tasks`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(task)
    });
    return res.json();
  },

  async updateTask(projectId: string, taskId: string, updates: any) {
    const res = await fetch(`${API_BASE}/projects/${projectId}/tasks/${taskId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  async createMilestone(projectId: string, milestone: any) {
    const res = await fetch(`${API_BASE}/projects/${projectId}/milestones`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(milestone)
    });
    return res.json();
  },

  async addResource(projectId: string, resource: any) {
    const res = await fetch(`${API_BASE}/projects/${projectId}/resources`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(resource)
    });
    return res.json();
  },

  // Matching Engine
  async getRecommendedProjects() {
    const res = await fetch(`${API_BASE}/matching/projects-for-student`, { headers: getHeaders() });
    return res.json();
  },

  async getRecommendedStudentsForProject(projectId: string) {
    const res = await fetch(`${API_BASE}/matching/students-for-project/${projectId}`, { headers: getHeaders() });
    return res.json();
  },

  async getRecommendedPeers() {
    const res = await fetch(`${API_BASE}/matching/peers`, { headers: getHeaders() });
    return res.json();
  },

  // Collaboration Requests
  async sendRequest(data: any) {
    const res = await fetch(`${API_BASE}/requests`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async getIncomingRequests() {
    const res = await fetch(`${API_BASE}/requests/inbox`, { headers: getHeaders() });
    return res.json();
  },

  async getSentRequests() {
    const res = await fetch(`${API_BASE}/requests/sent`, { headers: getHeaders() });
    return res.json();
  },

  async updateRequestStatus(id: string, status: string) {
    const res = await fetch(`${API_BASE}/requests/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    return res.json();
  },

  async getMyProjects() {
    const res = await fetch(`${API_BASE}/projects/user/my-projects`, { headers: getHeaders() });
    return res.json();
  },

  async inviteTeammate(projectId: string, data: any) {
    const res = await fetch(`${API_BASE}/projects/${projectId}/invite`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async featureInShowcase(projectId: string) {
    const res = await fetch(`${API_BASE}/projects/${projectId}/showcase`, {
      method: 'POST',
      headers: getHeaders()
    });
    return res.json();
  },

  // SkillShare
  async getSkillOffers(category?: string) {
    const q = category ? `?category=${category}` : '';
    const res = await fetch(`${API_BASE}/skillshare/offers${q}`);
    return res.json();
  },

  async getSkillRequests(category?: string) {
    const q = category ? `?category=${category}` : '';
    const res = await fetch(`${API_BASE}/skillshare/requests${q}`);
    return res.json();
  },

  async getLearningPartners() {
    const res = await fetch(`${API_BASE}/skillshare/learning-partners`, { headers: getHeaders() });
    return res.json();
  },

  async offerSkill(data: { skill_name: string; category?: string; proficiency?: string }) {
    const res = await fetch(`${API_BASE}/skillshare/offer`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async requestSkill(data: { skill_name: string; category?: string }) {
    const res = await fetch(`${API_BASE}/skillshare/request`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async sendGuidanceRequest(data: { recipient_id: string; role_name?: string; message?: string }) {
    const res = await fetch(`${API_BASE}/skillshare/guidance-request`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Clubs & Events & Showcase
  async getClubs() {
    const res = await fetch(`${API_BASE}/clubs`);
    return res.json();
  },

  async getClubPartnerships() {
    const res = await fetch(`${API_BASE}/clubs/partnerships`);
    return res.json();
  },

  async proposeClubPartnership(data: { recipient_club_id: string; title: string; proposal: string; sender_club_id?: string }) {
    const res = await fetch(`${API_BASE}/clubs/partnerships`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async getEvents() {
    const res = await fetch(`${API_BASE}/events`);
    return res.json();
  },

  async createEvent(data: any) {
    const res = await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async getShowcase() {
    const res = await fetch(`${API_BASE}/showcase`);
    return res.json();
  },

  async getNotifications() {
    const res = await fetch(`${API_BASE}/notifications`, { headers: getHeaders() });
    return res.json();
  },

  async markNotificationRead(id: string) {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PUT',
      headers: getHeaders()
    });
    return res.json();
  },

  // Registration & Direct Messaging
  async register(data: any) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Registration failed');
    }
    return res.json();
  },

  async sendDirectMessage(recipient_id: string, content: string) {
    const res = await fetch(`${API_BASE}/messages/direct`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ recipient_id, content })
    });
    return res.json();
  },

  async getDirectMessages(other_user_id: string) {
    const res = await fetch(`${API_BASE}/messages/direct/${other_user_id}`, { headers: getHeaders() });
    return res.json();
  },

  async sendProjectMessage(project_id: string, content: string) {
    const res = await fetch(`${API_BASE}/messages/project/${project_id}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ content })
    });
    return res.json();
  },

  async getProjectMessages(project_id: string) {
    const res = await fetch(`${API_BASE}/messages/project/${project_id}`);
    return res.json();
  },

  async getConversations() {
    const res = await fetch(`${API_BASE}/messages/conversations`, { headers: getHeaders() });
    return res.json();
  }
};
