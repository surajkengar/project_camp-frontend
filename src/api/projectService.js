import axiosInstance from "./axios";

const projectService = {
  // Get all projects
  getProjects: async () => {
    const response = await axiosInstance.get("/projects");
    return response.data;
  },

  // Get project by ID
  getProjectById: async (projectId) => {
    const response = await axiosInstance.get(`/projects/${projectId}`);
    return response.data;
  },

  // Create a new project
  createProject: async (projectData) => {
    const response = await axiosInstance.post("/projects", projectData);
    return response.data;
  },

  // Update a project
  updateProject: async (projectId, projectData) => {
    const response = await axiosInstance.put(
      `/projects/${projectId}`,
      projectData
    );
    return response.data;
  },

  // Delete a project
  deleteProject: async (projectId) => {
    const response = await axiosInstance.delete(`/projects/${projectId}`);
    return response.data;
  },

  // Get project members
  getProjectMembers: async (projectId) => {
    const response = await axiosInstance.get(`/projects/${projectId}/members`);
    return response.data;
  },

  // Add member to project
  addMemberToProject: async (projectId, memberData) => {
    const response = await axiosInstance.post(
      `/projects/${projectId}/members`,
      memberData
    );
    return response.data;
  },

  // Update member role
  updateMemberRole: async (projectId, userId, roleData) => {
    const response = await axiosInstance.put(
      `/projects/${projectId}/members/${userId}`,
      roleData
    );
    return response.data;
  },

  // Remove member from project
  removeMemberFromProject: async (projectId, userId) => {
    const response = await axiosInstance.delete(
      `/projects/${projectId}/members/${userId}`
    );
    return response.data;
  },
};

export default projectService;
