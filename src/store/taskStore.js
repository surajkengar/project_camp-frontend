import { create } from "zustand";
import taskService from "../api/taskService";
import {
  createStatusUpdateData,
  createTaskFormData,
} from "../utils/formDataUtils";

const useTaskStore = create((set, get) => ({
  tasks: [],
  currentTask: null,
  subtasks: [],
  isLoading: false,
  error: null,
  projectId: null, // Track the current project ID

  // Fetch tasks for a project
  fetchTasks: async (projectId) => {
    // Skip if we don't have a valid project ID
    if (!projectId) {
      return get().tasks;
    }

    // If we're already showing tasks for this project, don't fetch again
    // unless the tasks array is empty
    if (get().projectId === projectId && get().tasks.length > 0) {
      return get().tasks;
    }

    // Only set loading state if we're actually making a network request
    set({ isLoading: true, error: null });

    try {
      const response = await taskService.getTasks(projectId);
      set({
        tasks: response.data,
        projectId: projectId, // Store the current project ID
        isLoading: false,
      });
      return response.data;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Failed to fetch tasks",
      });
      throw error;
    }
  },

  // Get task by ID
  fetchTaskById: async (projectId, taskId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await taskService.getTaskById(projectId, taskId);
      set({
        currentTask: response.data,
        subtasks: response.data.subtasks || [],
        isLoading: false,
      });
      return response.data;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Failed to fetch task",
      });
      throw error;
    }
  },

  // Create a new task
  createTask: async (projectId, taskData, attachments = []) => {
    set({ isLoading: true, error: null });
    try {
      const formData = createTaskFormData(taskData, attachments);
      const response = await taskService.createTask(projectId, formData);
      set((state) => ({
        tasks: [...state.tasks, response.data],
        isLoading: false,
      }));
      return response.data;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Failed to create task",
      });
      throw error;
    }
  },

  // Update a task
  updateTask: async (projectId, taskId, taskData, attachments = []) => {
    set({ isLoading: true, error: null });
    try {
      const formData = createTaskFormData(taskData, attachments);
      const response = await taskService.updateTask(
        projectId,
        taskId,
        formData
      );
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task._id === taskId ? response.data : task
        ),
        currentTask:
          state.currentTask?._id === taskId ? response.data : state.currentTask,
        isLoading: false,
      }));
      return response.data;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Failed to update task",
      });
      throw error;
    }
  },

  // Delete a task
  deleteTask: async (projectId, taskId) => {
    set({ isLoading: true, error: null });
    try {
      await taskService.deleteTask(projectId, taskId);
      set((state) => ({
        tasks: state.tasks.filter((task) => task._id !== taskId),
        currentTask:
          state.currentTask?._id === taskId ? null : state.currentTask,
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Failed to delete task",
      });
      throw error;
    }
  },

  // Change task status
  changeTaskStatus: async (projectId, taskId, newStatus) => {
    set({ isLoading: true, error: null });

    // Find the task to update
    const task = get().tasks.find((t) => t._id === taskId);
    if (!task) {
      set({ isLoading: false });
      throw new Error("Task not found");
    }

    // Store the original task data for potential rollback
    const originalTask = { ...task };

    // Optimistically update the UI
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t._id === taskId ? { ...t, status: newStatus } : t
      ),
    }));

    try {
      // Create a simple object with just the status change and required fields
      const updateData = createStatusUpdateData(task, newStatus);

      // Make the API call
      const response = await taskService.updateTask(
        projectId,
        taskId,
        updateData
      );

      // Update the state with the response data
      set((state) => ({
        tasks: state.tasks.map((t) => (t._id === taskId ? response.data : t)),
        isLoading: false,
      }));

      return response.data;
    } catch (error) {
      // Revert the optimistic update on error
      set((state) => ({
        tasks: state.tasks.map((t) => (t._id === taskId ? originalTask : t)),
        isLoading: false,
        error: error.response?.data?.message || "Failed to change task status",
      }));
      throw error;
    }
  },

  // Create a subtask
  createSubtask: async (projectId, taskId, subtaskData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await taskService.createSubtask(
        projectId,
        taskId,
        subtaskData
      );
      set((state) => ({
        subtasks: [...state.subtasks, response.data],
        isLoading: false,
      }));
      return response.data;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Failed to create subtask",
      });
      throw error;
    }
  },

  // Update a subtask
  updateSubtask: async (projectId, subTaskId, updates) => {
    set({ isLoading: true, error: null });
    try {
      const response = await taskService.updateSubtask(
        projectId,
        subTaskId,
        updates
      );
      set((state) => ({
        subtasks: state.subtasks.map((subtask) =>
          subtask._id === subTaskId ? { ...subtask, ...response.data } : subtask
        ),
        isLoading: false,
      }));
      return response.data;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Failed to update subtask",
      });
      throw error;
    }
  },

  // Toggle subtask completion
  toggleSubtaskCompletion: async (projectId, subTaskId, currentStatus) => {
    set({ isLoading: true, error: null });
    try {
      const response = await taskService.updateSubtask(projectId, subTaskId, {
        isCompleted: !currentStatus,
      });
      set((state) => ({
        subtasks: state.subtasks.map((subtask) =>
          subtask._id === subTaskId
            ? { ...subtask, isCompleted: !currentStatus }
            : subtask
        ),
        isLoading: false,
      }));
      return response.data;
    } catch (error) {
      set({
        isLoading: false,
        error:
          error.response?.data?.message ||
          "Failed to toggle subtask completion",
      });
      throw error;
    }
  },

  // Delete a subtask
  deleteSubtask: async (projectId, subTaskId) => {
    set({ isLoading: true, error: null });
    try {
      await taskService.deleteSubtask(projectId, subTaskId);
      set((state) => ({
        subtasks: state.subtasks.filter((subtask) => subtask._id !== subTaskId),
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Failed to delete subtask",
      });
      throw error;
    }
  },

  // Get tasks by status
  getTasksByStatus: (status) => {
    const { tasks } = get();
    return tasks.filter((task) => task.status === status);
  },

  // Get task by ID from store
  getTaskById: (taskId) => {
    const { tasks } = get();
    return tasks.find((task) => task._id === taskId);
  },

  // Clear any errors
  clearError: () => set({ error: null }),

  // Reset store state
  resetStore: () =>
    set({
      tasks: [],
      currentTask: null,
      subtasks: [],
      isLoading: false,
      error: null,
      projectId: null,
    }),
}));

export default useTaskStore;
