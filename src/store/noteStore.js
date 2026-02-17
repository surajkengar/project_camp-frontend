import { create } from "zustand";
import noteService from "../api/noteService";

const useNoteStore = create((set, get) => ({
  notes: [],
  currentNote: null,
  isLoading: false,
  error: null,
  projectId: null, // Track the current project ID

  // Fetch notes for a project
  fetchNotes: async (projectId) => {
    // Skip if we don't have a valid project ID
    if (!projectId) {
      return get().notes;
    }

    // If we're already showing notes for this project, don't fetch again
    // unless the notes array is empty
    if (get().projectId === projectId && get().notes.length > 0) {
      return get().notes;
    }

    // Only set loading state if we're actually making a network request
    set({ isLoading: true, error: null });

    try {
      const response = await noteService.getNotes(projectId);
      set({
        notes: response.data,
        projectId: projectId, // Store the current project ID
        isLoading: false,
      });
      return response.data;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Failed to fetch notes",
      });
      throw error;
    }
  },

  // Get note by ID
  fetchNoteById: async (projectId, noteId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await noteService.getNoteById(projectId, noteId);
      set({
        currentNote: response.data,
        isLoading: false,
      });
      return response.data;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Failed to fetch note",
      });
      throw error;
    }
  },

  // Create a new note
  createNote: async (projectId, noteData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await noteService.createNote(projectId, noteData);
      set((state) => ({
        notes: [...state.notes, response.data],
        isLoading: false,
      }));
      return response.data;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Failed to create note",
      });
      throw error;
    }
  },

  // Update a note
  updateNote: async (projectId, noteId, noteData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await noteService.updateNote(
        projectId,
        noteId,
        noteData
      );
      set((state) => ({
        notes: state.notes.map((note) =>
          note._id === noteId ? response.data : note
        ),
        currentNote:
          state.currentNote?._id === noteId ? response.data : state.currentNote,
        isLoading: false,
      }));
      return response.data;
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Failed to update note",
      });
      throw error;
    }
  },

  // Delete a note
  deleteNote: async (projectId, noteId) => {
    set({ isLoading: true, error: null });
    try {
      await noteService.deleteNote(projectId, noteId);
      set((state) => ({
        notes: state.notes.filter((note) => note._id !== noteId),
        currentNote:
          state.currentNote?._id === noteId ? null : state.currentNote,
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Failed to delete note",
      });
      throw error;
    }
  },

  // Get note by ID from store
  getNoteById: (noteId) => {
    const { notes } = get();
    return notes.find((note) => note._id === noteId);
  },

  // Clear any errors
  clearError: () => set({ error: null }),

  // Reset store state
  resetStore: () =>
    set({
      notes: [],
      currentNote: null,
      isLoading: false,
      error: null,
      projectId: null,
    }),
}));

export default useNoteStore;
