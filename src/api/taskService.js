import axiosInstance from "./axios";

const taskService = {
  // Get all tasks for a project
  getTasks: async (projectId) => {
    const response = await axiosInstance.get(`/tasks/${projectId}`);
    return response.data;
  },

  // Get task by ID
  getTaskById: async (projectId, taskId) => {
    const response = await axiosInstance.get(`/tasks/${projectId}/t/${taskId}`);
    return response.data;
  },

  // Create a new task
  createTask: async (projectId, taskData) => {
    const response = await axiosInstance.post(`/tasks/${projectId}`, taskData);
    return response.data;
  },

  // Update a task
  updateTask: async (projectId, taskId, taskData) => {
    try {
      const config = {
        headers: {
          "Content-Type":
            taskData instanceof FormData
              ? "multipart/form-data"
              : "application/json",
        },
      };

      const response = await axiosInstance.put(
        `/tasks/${projectId}/t/${taskId}`,
        taskData,
        config
      );

      return response.data;
    } catch (error) {
      console.error("Failed to update task:", {
        error: error.message,
        details: error.response?.data,
      });
      throw error;
    }
  },

  // Delete a task
  deleteTask: async (projectId, taskId) => {
    const response = await axiosInstance.delete(
      `/tasks/${projectId}/t/${taskId}`
    );
    return response.data;
  },

  // Subtask operations
  subtasks: {
    create: async (projectId, taskId, subtaskData) => {
      const response = await axiosInstance.post(
        `/tasks/${projectId}/t/${taskId}/subtasks`,
        subtaskData
      );
      return response.data;
    },

    update: async (projectId, subTaskId, updates) => {
      const response = await axiosInstance.put(
        `/tasks/${projectId}/st/${subTaskId}`,
        updates
      );
      return response.data;
    },

    delete: async (projectId, subTaskId) => {
      const response = await axiosInstance.delete(
        `/tasks/${projectId}/st/${subTaskId}`
      );
      return response.data;
    },
  },
};

export default taskService;
