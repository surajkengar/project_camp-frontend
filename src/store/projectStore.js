import { create } from "zustand";
import projectService from "../api/projectService";
import { UserRolesEnum } from "../utils/constants";

const useProjectStore = create((set, get) => ({
  projects: [],
  currentProject: null,
  projectMembers: [],
  isLoading: false,
  error: null,
  initialized: false, // Track if we've initialized the projects
  fetchedMemberProjects: {}, // Track which projects' members we've already fetched

  // Initialize projects
  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await projectService.getProjects();
      set({
        projects: response.data,
        initialized: true,
        isLoading: false,
      });
      return response.data;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Failed to fetch projects",
      });
      throw error;
    }
  },

  // Get project by ID
  fetchProjectById: async (projectId) => {
    // Check if we already have this project as the current project
    if (get().currentProject && get().currentProject._id === projectId) {
      return get().currentProject;
    }

    set({ isLoading: true, error: null });
    try {
      const response = await projectService.getProjectById(projectId);
      set({
        currentProject: response.data,
        isLoading: false,
      });
      return response.data;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Failed to fetch project",
      });
      throw error;
    }
  },

  // Combined function to fetch both project and its members
  fetchProjectWithMembers: async (projectId) => {
    // If we don't have a project ID, don't proceed
    if (!projectId) {
      return {
        project: null,
        members: [],
      };
    }

    // Checking if the current project matches - handle both structure variations
    const currentProject = get().currentProject;
    const hasProject =
      currentProject &&
      (currentProject._id === projectId ||
        (currentProject.project && currentProject.project._id === projectId));

    const hasMembers = get().fetchedMemberProjects[projectId];

    // Return cached data if we have both
    if (hasProject && hasMembers) {
      return {
        project: get().currentProject,
        members: get().projectMembers,
      };
    }

    set({ isLoading: true, error: null });

    try {
      const promises = [];

      // Only fetch the project if we don't have it
      if (!hasProject) {
        promises.push(projectService.getProjectById(projectId));
      }

      // Only fetch members if we don't have them
      if (!hasMembers) {
        promises.push(projectService.getProjectMembers(projectId));
      }

      // If no requests needed, return existing data
      if (promises.length === 0) {
        set({ isLoading: false });
        return {
          project: get().currentProject,
          members: get().projectMembers,
        };
      }

      const results = await Promise.all(promises);

      // Update state based on which requests were made
      if (!hasProject && !hasMembers) {
        // Both project and members were fetched
        const [projectResponse, membersResponse] = results;

        set((state) => ({
          currentProject: projectResponse.data,
          projectMembers: membersResponse.data,
          fetchedMemberProjects: {
            ...state.fetchedMemberProjects,
            [projectId]: true,
          },
          isLoading: false,
        }));

        return {
          project: projectResponse.data,
          members: membersResponse.data,
        };
      } else if (!hasProject) {
        // Only project was fetched
        const [projectResponse] = results;

        set({
          currentProject: projectResponse.data,
          isLoading: false,
        });

        return {
          project: projectResponse.data,
          members: get().projectMembers,
        };
      } else {
        // Only members were fetched
        const [membersResponse] = results;

        set((state) => ({
          projectMembers: membersResponse.data,
          fetchedMemberProjects: {
            ...state.fetchedMemberProjects,
            [projectId]: true,
          },
          isLoading: false,
        }));

        return {
          project: get().currentProject,
          members: membersResponse.data,
        };
      }
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Failed to fetch project data",
      });
      throw error;
    }
  },

  // Create a new project
  createProject: async (projectData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await projectService.createProject(projectData);

      // Add createdAt and members fields to the response data if they don't exist
      const projectWithDefaults = {
        ...response.data,
        createdAt: response.data.createdAt || new Date().toISOString(),
        members: response.data.members || 0,
      };

      set((state) => ({
        projects: [
          ...state.projects,
          {
            project: projectWithDefaults,
            role: UserRolesEnum.ADMIN,
          },
        ],
        isLoading: false,
      }));
      return response.data;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Failed to create project",
      });
      throw error;
    }
  },

  // Update a project
  updateProject: async (projectId, projectData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await projectService.updateProject(
        projectId,
        projectData
      );
      set((state) => ({
        projects: state.projects.map((projectItem) =>
          projectItem.project._id === projectId
            ? { ...projectItem, project: response.data }
            : projectItem
        ),
        currentProject:
          state.currentProject?._id === projectId
            ? response.data
            : state.currentProject,
        isLoading: false,
      }));
      return response.data;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Failed to update project",
      });
      throw error;
    }
  },

  // Delete a project
  deleteProject: async (projectId) => {
    set({ isLoading: true, error: null });
    try {
      await projectService.deleteProject(projectId);
      set((state) => ({
        projects: state.projects.filter(
          (projectItem) => projectItem.project._id !== projectId
        ),
        currentProject:
          state.currentProject?._id === projectId ? null : state.currentProject,
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Failed to delete project",
      });
      throw error;
    }
  },

  // Get project members - with tracking to prevent redundant fetches
  fetchProjectMembers: async (projectId, forceRefresh = false) => {
    // Skip if we've already fetched members for this project and not forcing refresh
    const alreadyFetched = get().fetchedMemberProjects[projectId];
    if (alreadyFetched && !forceRefresh) {
      return get().projectMembers;
    }

    set({ isLoading: true, error: null });
    try {
      const response = await projectService.getProjectMembers(projectId);
      set((state) => ({
        projectMembers: response.data,
        fetchedMemberProjects: {
          ...state.fetchedMemberProjects,
          [projectId]: true,
        },
        isLoading: false,
      }));
      return response.data;
    } catch (error) {
      set({
        isLoading: false,
        error:
          error.response?.data?.message || "Failed to fetch project members",
      });
      throw error;
    }
  },

  // Add member to project
  addProjectMember: async (projectId, memberData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await projectService.addMemberToProject(
        projectId,
        memberData
      );
      // Refresh project members after adding (force refresh)
      await get().fetchProjectMembers(projectId, true);
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      set({
        isLoading: false,
        error:
          error.response?.data?.message || "Failed to add member to project",
      });
      throw error;
    }
  },

  // Update member role
  updateMemberRole: async (projectId, userId, role) => {
    set({ isLoading: true, error: null });
    try {
      const response = await projectService.updateMemberRole(
        projectId,
        userId,
        { newRole: role }
      );
      // Update the member in the projectMembers array
      set((state) => ({
        projectMembers: state.projectMembers.map((member) =>
          member.user._id === userId ? { ...member, role } : member
        ),
        isLoading: false,
      }));
      return response.data;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Failed to update member role",
      });
      throw error;
    }
  },

  // Remove member from project
  removeProjectMember: async (projectId, userId) => {
    set({ isLoading: true, error: null });
    try {
      await projectService.removeMemberFromProject(projectId, userId);
      // Remove the member from the projectMembers array
      set((state) => ({
        projectMembers: state.projectMembers.filter(
          (member) => member.user._id !== userId
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error:
          error.response?.data?.message ||
          "Failed to remove member from project",
      });
      throw error;
    }
  },

  // Get user role in current project
  getCurrentUserRole: () => {
    const { currentProject } = get();
    return currentProject?.role || null;
  },

  // Check if user has specific permission in current project
  hasPermission: (requiredRoles) => {
    const { currentProject } = get();
    if (!currentProject || !currentProject.role) return false;
    return requiredRoles.includes(currentProject.role);
  },

  // Clear any errors
  clearError: () => set({ error: null }),

  // Reset store state
  resetStore: () =>
    set({
      projects: [],
      currentProject: null,
      projectMembers: [],
      isLoading: false,
      error: null,
      initialized: false,
      fetchedMemberProjects: {},
    }),
}));

export default useProjectStore;
