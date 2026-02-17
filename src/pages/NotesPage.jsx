import {
  Badge,
  Button,
  Card,
  Container,
  Group,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconNotes } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ErrorAlert, NoProjectAlert } from "../components/common";
import { ConfirmDeleteModal, NoteFormModal } from "../components/modals";
import { NoteGrid } from "../components/notes";
import { useAuthStore, useNoteStore, useProjectStore } from "../store";
import {
  canCreateNote,
  canDeleteNote,
  canEditNote,
} from "../utils/permissions";

export default function NotesPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const {
    notes,
    isLoading: notesLoading,
    error,
    clearError,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
  } = useNoteStore();

  const {
    currentProject,
    fetchProjectWithMembers,
    projects,
    isLoading: projectsLoading,
    projectMembers,
  } = useProjectStore();

  const { user } = useAuthStore();

  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);

  // Effect to handle project and notes loading
  useEffect(() => {
    // Only fetch if we have a valid projectId
    if (projectId) {
      // This function already has built-in caching to prevent redundant calls
      fetchProjectWithMembers(projectId);
      fetchNotes(projectId);
    }
    // Handle navigation when no project ID is in URL
    else if (projects.length > 0) {
      const firstProjectId = projects[0].project?._id;
      if (firstProjectId) {
        navigate(`/projects/${firstProjectId}/notes`);
      }
    }
    // If no projects exist, redirect to projects page
    else if (!projectsLoading) {
      navigate("/projects");
    }
  }, [
    projectId,
    projects,
    navigate,
    projectsLoading,
    fetchProjectWithMembers,
    fetchNotes,
  ]);

  const handleAddNote = async (values) => {
    if (!projectId) {
      console.error("No valid project selected");
      return;
    }

    try {
      // Check if user has permission to create notes
      if (!canCreateNote(user, projectMembers)) {
        notifications.show({
          title: "Permission Denied",
          message: "You don't have permission to create notes in this project.",
          color: "red",
        });
        return;
      }

      await createNote(projectId, values);
      setIsAddingNote(false);
      notifications.show({
        title: "Success",
        message: "Note created successfully",
        color: "green",
      });
    } catch (error) {
      console.error("Failed to create note:", error);
      notifications.show({
        title: "Error",
        message: "Failed to create note. Please try again.",
        color: "red",
      });
    }
  };

  const openEditModal = (note) => {
    // Check if user has permission to edit this note
    if (!canEditNote(user, projectMembers)) {
      notifications.show({
        title: "Permission Denied",
        message: "You don't have permission to edit this note.",
        color: "red",
      });
      return;
    }

    setSelectedNote(note);
    setEditModalOpen(true);
  };

  const openDeleteModal = (note) => {
    // Check if user has permission to delete this note
    if (!canDeleteNote(user, projectMembers)) {
      notifications.show({
        title: "Permission Denied",
        message: "You don't have permission to delete this note.",
        color: "red",
      });
      return;
    }

    setSelectedNote(note);
    setConfirmDeleteOpen(true);
  };

  const handleEditNote = async (values) => {
    if (!selectedNote || !projectId) return;

    try {
      // Double-check permission
      if (!canEditNote(user, projectMembers)) {
        notifications.show({
          title: "Permission Denied",
          message: "You don't have permission to edit this note.",
          color: "red",
        });
        return;
      }

      await updateNote(projectId, selectedNote._id, values);
      setEditModalOpen(false);
      setSelectedNote(null);
      notifications.show({
        title: "Success",
        message: "Note updated successfully",
        color: "green",
      });
    } catch (error) {
      console.error("Failed to update note:", error);
      notifications.show({
        title: "Error",
        message: "Failed to update note. Please try again.",
        color: "red",
      });
    }
  };

  const handleDeleteNote = async () => {
    if (!selectedNote || !projectId) return;

    try {
      // Double-check permission
      if (!canDeleteNote(user, projectMembers)) {
        notifications.show({
          title: "Permission Denied",
          message: "You don't have permission to delete this note.",
          color: "red",
        });
        return;
      }

      await deleteNote(projectId, selectedNote._id);
      setConfirmDeleteOpen(false);
      setSelectedNote(null);
      notifications.show({
        title: "Success",
        message: "Note deleted successfully",
        color: "green",
      });
    } catch (error) {
      console.error("Failed to delete note:", error);
      notifications.show({
        title: "Error",
        message: "Failed to delete note. Please try again.",
        color: "red",
      });
    }
  };

  const isLoading = notesLoading || projectsLoading;

  // If no project is available, show a message
  if (!projectId) {
    return (
      <Container size="lg" py="xl">
        {!isLoading && (
          <NoProjectAlert
            title="No Project Selected"
            message="Please select a project from the header dropdown or create a new project."
            buttonText="Go to Projects"
            onButtonClick={() => navigate("/projects")}
          />
        )}
      </Container>
    );
  }

  const projectName =
    currentProject?.project?.name || currentProject?.name || "Project";

  // Check if user can create notes
  const userCanCreateNotes = canCreateNote(user, projectMembers);

  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" mb="md">
        <Title order={2}>{projectName} Notes</Title>
        {userCanCreateNotes ? (
          <Button onClick={() => setIsAddingNote(true)}>Add Note</Button>
        ) : (
          <Badge color="gray" size="lg">
            View Only
          </Badge>
        )}
      </Group>

      {error && (
        <ErrorAlert title="Error" message={error} onClose={clearError} />
      )}

      {notes.length === 0 ? (
        <Card withBorder shadow="sm" p="xl" radius="md">
          <Stack align="center" spacing="md">
            <IconNotes size={48} color="gray" />
            <Title order={3} align="center">
              No Notes Yet
            </Title>
            <Text align="center" color="dimmed" size="lg">
              {userCanCreateNotes
                ? "Create your first note to get started."
                : "There are no notes in this project yet. You don't have permission to create notes."}
            </Text>
            {userCanCreateNotes && (
              <Button onClick={() => setIsAddingNote(true)} mt="md">
                Create Your First Note
              </Button>
            )}
          </Stack>
        </Card>
      ) : (
        <NoteGrid
          notes={notes}
          onEditNote={openEditModal}
          onDeleteNote={openDeleteModal}
        />
      )}

      {/* Add Note Modal */}
      <NoteFormModal
        opened={isAddingNote}
        onClose={() => setIsAddingNote(false)}
        title="Add Note"
        onSubmit={handleAddNote}
        initialValues={{ content: "" }}
        isLoading={notesLoading}
      />

      {/* Edit Note Modal */}
      {selectedNote && (
        <NoteFormModal
          opened={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedNote(null);
          }}
          title="Edit Note"
          onSubmit={handleEditNote}
          initialValues={{ content: selectedNote.content }}
          isLoading={notesLoading}
        />
      )}

      {/* Confirm Delete Modal */}
      {selectedNote && (
        <ConfirmDeleteModal
          opened={confirmDeleteOpen}
          onClose={() => {
            setConfirmDeleteOpen(false);
            setSelectedNote(null);
          }}
          title="Delete Note"
          message="Are you sure you want to delete this note? This action cannot be undone."
          onConfirm={handleDeleteNote}
          isLoading={notesLoading}
        />
      )}
    </Container>
  );
}
