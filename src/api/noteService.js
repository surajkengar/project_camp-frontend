import axiosInstance from "./axios";

const noteService = {
  // Get all notes for a project
  getNotes: async (projectId) => {
    const response = await axiosInstance.get(`/notes/${projectId}`);
    return response.data;
  },

  // Get note by ID
  getNoteById: async (projectId, noteId) => {
    const response = await axiosInstance.get(`/notes/${projectId}/n/${noteId}`);
    return response.data;
  },

  // Create a new note
  createNote: async (projectId, noteData) => {
    const response = await axiosInstance.post(`/notes/${projectId}`, noteData);
    return response.data;
  },

  // Update a note
  updateNote: async (projectId, noteId, noteData) => {
    const response = await axiosInstance.put(
      `/notes/${projectId}/n/${noteId}`,
      noteData
    );
    return response.data;
  },

  // Delete a note
  deleteNote: async (projectId, noteId) => {
    const response = await axiosInstance.delete(
      `/notes/${projectId}/n/${noteId}`
    );
    return response.data;
  },
};

export default noteService;
