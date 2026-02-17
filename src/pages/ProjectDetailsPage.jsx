import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Breadcrumbs,
  Button,
  Card,
  Container,
  Grid,
  Group,
  Modal,
  Space,
  Stack,
  Tabs,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import {
  IconCalendar,
  IconChecklist,
  IconEdit,
  IconNotes,
  IconPlus,
  IconSearch,
  IconTrash,
  IconUsers,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { EmptyState, ErrorAlert, PageHeader } from "../components/common";
import {
  AddMemberModal,
  ConfirmDeleteModal,
  MemberRoleModal,
  NoteFormModal,
  TaskFormModal,
} from "../components/modals";
import { ProjectMembersTable } from "../components/projects";
import { KanbanBoard, TaskDetail, TaskTable } from "../components/tasks";
import {
  useAuthStore,
  useNoteStore,
  useProjectStore,
  useTaskStore,
} from "../store";
import { TaskStatusEnum } from "../utils/constants";
import { formatDate } from "../utils/dateUtils";
import {
  canCreateNote,
  canCreateTask,
  canDeleteNote,
  canEditNote,
  canManageMembers,
  canRemoveMember,
} from "../utils/permissions";

export default function ProjectDetailsPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const {
    currentProject,
    projectMembers,
    isLoading: projectLoading,
    error: projectError,
    clearError: clearProjectError,
    fetchProjectById,
    fetchProjectMembers,
    addProjectMember,
    removeProjectMember,
    updateMemberRole,
    projects,
  } = useProjectStore();

  const {
    tasks,
    isLoading: tasksLoading,
    error: tasksError,
    clearError: clearTasksError,
    fetchTasks,
    createTask,
    changeTaskStatus,
  } = useTaskStore();

  const {
    notes,
    isLoading: notesLoading,
    error: notesError,
    clearError: clearNotesError,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
  } = useNoteStore();

  const { user } = useAuthStore();

  const [activeTab, setActiveTab] = useState("kanban");
  const [membersModalOpen, setMembersModalOpen] = useState(false);
  const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);
  const [editRoleModalOpen, setEditRoleModalOpen] = useState(false);
  const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false);
  const [createNoteModalOpen, setCreateNoteModalOpen] = useState(false);
  const [editNoteModalOpen, setEditNoteModalOpen] = useState(false);
  const [deleteNoteModalOpen, setDeleteNoteModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);
  const [taskDetailModalOpen, setTaskDetailModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteMemberModalOpen, setDeleteMemberModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);

  useEffect(() => {
    if (projectId) {
      // Fetch project data
      fetchProjectById(projectId).catch(console.error);
      fetchProjectMembers(projectId).catch(console.error);
    } else {
      // No project ID, navigate back to projects
      navigate("/projects");
    }
  }, [projectId, fetchProjectById, fetchProjectMembers, navigate]);

  // Separate useEffect for tasks and notes
  useEffect(() => {
    if (projectId) {
      // Fetch tasks and notes
      fetchTasks(projectId).catch(console.error);
      fetchNotes(projectId).catch(console.error);
    }
  }, [projectId, fetchTasks, fetchNotes]);

  // Reset selected task when changing tabs
  useEffect(() => {
    if (activeTab !== "kanban" && activeTab !== "list") {
      setSelectedTaskId(null);
      setTaskDetailModalOpen(false);
    }
  }, [activeTab]);

  const roleForm = useForm({
    initialValues: {
      role: "",
    },
    validate: {
      role: (value) => (!value ? "Role is required" : null),
    },
  });

  const taskForm = useForm({
    initialValues: {
      title: "",
      description: "",
      assignedTo: "",
      status: TaskStatusEnum.TODO,
    },
    validate: {
      title: (value) => (value.trim().length < 1 ? "Title is required" : null),
    },
  });

  const noteForm = useForm({
    initialValues: {
      content: "",
    },
    validate: {
      content: (value) =>
        value.trim().length < 1 ? "Content is required" : null,
    },
  });

  const handleAddMembers = async (values) => {
    try {
      await addProjectMember(projectId, values);
      await fetchProjectMembers(projectId);
      setAddMemberModalOpen(false);
    } catch (error) {
      console.error("Failed to add member:", error);
    }
  };

  const handleOpenDeleteMemberModal = (member) => {
    const { allowed, message } = canRemoveMember(
      user,
      member.user,
      projectMembers
    );
    if (!allowed) {
      notifications.show({
        title: "Cannot Remove Member",
        message: message,
        color: "red",
      });
      return;
    }
    setMemberToDelete(member);
    setDeleteMemberModalOpen(true);
  };

  const handleRemoveMember = async () => {
    if (!memberToDelete) return;

    try {
      await removeProjectMember(projectId, memberToDelete.user._id);
      await fetchProjectMembers(projectId);
      setDeleteMemberModalOpen(false);
      setMemberToDelete(null);
      notifications.show({
        title: "Success",
        message: "Member removed successfully",
        color: "green",
      });
    } catch (error) {
      console.error("Failed to remove member:", error);
      notifications.show({
        title: "Error",
        message: "Failed to remove member. Please try again.",
        color: "red",
      });
    }
  };

  const handleOpenAddMemberModal = () => {
    setAddMemberModalOpen(true);
  };

  const handleOpenEditRoleModal = (member) => {
    setSelectedMember(member);
    roleForm.setValues({ role: member.role });
    setEditRoleModalOpen(true);
  };

  const handleUpdateRole = async (values) => {
    if (!selectedMember) return;

    try {
      await updateMemberRole(projectId, selectedMember.user._id, values.role);
      await fetchProjectMembers(projectId);
      setEditRoleModalOpen(false);
      setSelectedMember(null);
    } catch (error) {
      console.error("Failed to update role:", error);
    }
  };

  const handleCreateTask = async (values) => {
    try {
      await createTask(projectId, values);
      setCreateTaskModalOpen(false);
      taskForm.reset();
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  const handleCreateNote = async (values) => {
    try {
      await createNote(projectId, values);
      setCreateNoteModalOpen(false);
      noteForm.reset();
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

  const handleEditNote = async (values) => {
    if (!selectedNote) return;

    try {
      if (!canEditNote(user, projectMembers)) {
        notifications.show({
          title: "Permission Denied",
          message: "You don't have permission to edit this note.",
          color: "red",
        });
        return;
      }

      await updateNote(projectId, selectedNote._id, values);
      setEditNoteModalOpen(false);
      setSelectedNote(null);
      notifications.show({
        title: "Success",
        message: "Note updated successfully",
        color: "green",
      });
      // Refresh notes
      fetchNotes(projectId).catch(console.error);
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
    if (!selectedNote) return;

    try {
      if (!canDeleteNote(user, projectMembers)) {
        notifications.show({
          title: "Permission Denied",
          message: "You don't have permission to delete this note.",
          color: "red",
        });
        return;
      }

      await deleteNote(projectId, selectedNote._id);
      setDeleteNoteModalOpen(false);
      setSelectedNote(null);
      notifications.show({
        title: "Success",
        message: "Note deleted successfully",
        color: "green",
      });
      // Refresh notes
      fetchNotes(projectId).catch(console.error);
    } catch (error) {
      console.error("Failed to delete note:", error);
      notifications.show({
        title: "Error",
        message: "Failed to delete note. Please try again.",
        color: "red",
      });
    }
  };

  const handleOpenTaskDetail = (taskId) => {
    setSelectedTaskId(taskId);
    setTaskDetailModalOpen(true);
  };

  const handleCloseTaskDetail = () => {
    setTaskDetailModalOpen(false);
    setSelectedTaskId(null);
    // Refresh tasks after closing detail view
    fetchTasks(projectId).catch(console.error);
  };

  const handleOpenEditNoteModal = (note) => {
    if (!canEditNote(user, projectMembers)) {
      notifications.show({
        title: "Permission Denied",
        message: "You don't have permission to edit this note.",
        color: "red",
      });
      return;
    }

    setSelectedNote(note);
    setEditNoteModalOpen(true);
  };

  const handleOpenDeleteNoteModal = (note) => {
    if (!canDeleteNote(user, projectMembers)) {
      notifications.show({
        title: "Permission Denied",
        message: "You don't have permission to delete this note.",
        color: "red",
      });
      return;
    }

    setSelectedNote(note);
    setDeleteNoteModalOpen(true);
  };

  // Handle drag and drop for Kanban board
  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    // If there's no destination or the item is dropped back to its original position
    if (
      !destination ||
      (destination.droppableId === source.droppableId &&
        destination.index === source.index)
    ) {
      return;
    }

    // Get the task ID from the draggableId
    const taskId = draggableId.split("-")[1];

    // Make the API call to update the backend
    changeTaskStatus(projectId, taskId, destination.droppableId)
      .then(() => {
        // Show success notification
        notifications.show({
          title: "Task Updated",
          message: "Task status changed successfully",
          color: "green",
        });
      })
      .catch((error) => {
        console.error("Failed to change task status:", error);
        // Show detailed error notification
        notifications.show({
          title: "Error",
          message:
            error.response?.data?.message ||
            "Failed to update task status. Please try again.",
          color: "red",
        });
        // Refresh tasks to ensure UI is in sync with backend
        fetchTasks(projectId).catch(console.error);
      });
  };

  // Filter tasks based on search query
  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description &&
        task.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Filter notes based on search query
  const filteredNotes = notes.filter((note) =>
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get next and previous projects for navigation
  const getAdjacentProjects = () => {
    if (!projects || projects.length <= 1) return { next: null, prev: null };

    const projectsList = projects.map((p) => p.project);
    const currentIndex = projectsList.findIndex((p) => p._id === projectId);

    if (currentIndex === -1) return { next: null, prev: null };

    const nextIndex = (currentIndex + 1) % projectsList.length;
    const prevIndex =
      (currentIndex - 1 + projectsList.length) % projectsList.length;

    return {
      next: projectsList[nextIndex] || null,
      prev: projectsList[prevIndex] || null,
    };
  };

  const { next, prev } = getAdjacentProjects();

  if (!currentProject && !projectLoading) {
    return (
      <Container size="lg" py="xl">
        <ErrorAlert
          title="Error"
          message="Project not found or you don't have access to it."
          onClose={() => navigate("/projects")}
        />
      </Container>
    );
  }

  const isLoading = projectLoading || tasksLoading || notesLoading;
  const error = projectError || tasksError || notesError;
  const clearError = () => {
    clearProjectError();
    clearTasksError();
    clearNotesError();
  };

  // Breadcrumbs items
  const breadcrumbItems = [
    { title: "Home", href: "/" },
    { title: "Projects", href: "/projects" },
    { title: currentProject?.name || "Project Details", href: "#" },
  ];

  // Determine if task details should be shown
  const shouldShowTaskDetails =
    (activeTab === "kanban" || activeTab === "list") &&
    selectedTaskId &&
    taskDetailModalOpen;

  // Check if user can create notes
  const userCanCreateNotes = canCreateNote(user, projectMembers);

  return (
    <Container size="lg" py="xl">
      {error && (
        <ErrorAlert title="Error" message={error} onClose={clearError} />
      )}

      <Breadcrumbs items={breadcrumbItems} mb="md" />

      <PageHeader
        title={currentProject?.name || "Project"}
        description={currentProject?.description}
        actions={
          <Group>
            {prev && (
              <Button
                variant="subtle"
                onClick={() => navigate(`/projects/${prev._id}`)}
                size="sm"
              >
                ← {prev.name}
              </Button>
            )}
            <Button
              leftIcon={<IconUsers size={16} />}
              variant="outline"
              onClick={() => setMembersModalOpen(true)}
            >
              Members ({projectMembers?.length || 0})
            </Button>
            {next && (
              <Button
                variant="subtle"
                onClick={() => navigate(`/projects/${next._id}`)}
                size="sm"
              >
                {next.name} →
              </Button>
            )}
          </Group>
        }
      />

      <Space h="md" />

      <Tabs value={activeTab} onChange={setActiveTab} mb="xl">
        <Tabs.List>
          <Tabs.Tab value="kanban" icon={<IconChecklist size={14} />}>
            Kanban Board
          </Tabs.Tab>
          <Tabs.Tab value="list" icon={<IconChecklist size={14} />}>
            List View
          </Tabs.Tab>
          <Tabs.Tab value="members" icon={<IconUsers size={14} />}>
            Members
          </Tabs.Tab>
          <Tabs.Tab value="notes" icon={<IconNotes size={14} />}>
            Notes
          </Tabs.Tab>
        </Tabs.List>
      </Tabs>

      {/* Search bar for tasks and notes */}
      {(activeTab === "kanban" ||
        activeTab === "list" ||
        activeTab === "notes") && (
        <Group position="apart" mb="lg">
          <TextInput
            placeholder="Search..."
            icon={<IconSearch size={14} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            style={{ width: "300px" }}
          />
          {(activeTab === "kanban" || activeTab === "list") &&
          canCreateTask(user, projectMembers) ? (
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => setCreateTaskModalOpen(true)}
            >
              Add Task
            </Button>
          ) : activeTab === "notes" && userCanCreateNotes ? (
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => setCreateNoteModalOpen(true)}
            >
              Add Note
            </Button>
          ) : activeTab === "notes" && !userCanCreateNotes ? (
            <Badge color="gray" size="lg">
              View Only
            </Badge>
          ) : null}
        </Group>
      )}

      <Box>
        {activeTab === "kanban" && (
          <KanbanBoard
            tasks={filteredTasks}
            onTaskClick={handleOpenTaskDetail}
            onDragEnd={handleDragEnd}
          />
        )}

        {activeTab === "list" && (
          <TaskTable tasks={filteredTasks} onTaskClick={handleOpenTaskDetail} />
        )}

        {activeTab === "members" && (
          <Stack spacing="lg">
            {canManageMembers(user, projectMembers) && (
              <Group position="right" mb="md">
                <Button
                  leftSection={<IconPlus size={16} />}
                  onClick={handleOpenAddMemberModal}
                >
                  Add Members
                </Button>
              </Group>
            )}

            {!projectMembers || projectMembers.length === 0 ? (
              <EmptyState
                title="No members yet"
                description="Add members to collaborate on this project"
                buttonText={
                  canManageMembers(user, projectMembers)
                    ? "Add Your First Member"
                    : ""
                }
                onButtonClick={
                  canManageMembers(user, projectMembers)
                    ? handleOpenAddMemberModal
                    : undefined
                }
              />
            ) : (
              <ProjectMembersTable
                members={projectMembers}
                canManage={canManageMembers(user, projectMembers)}
                onEdit={handleOpenEditRoleModal}
                onRemove={handleOpenDeleteMemberModal}
                currentUser={user}
              />
            )}
          </Stack>
        )}

        {activeTab === "notes" && (
          <Grid gutter="lg">
            {filteredNotes.length > 0 ? (
              filteredNotes.map((note) => (
                <Grid.Col key={note._id} span={6}>
                  <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Stack spacing="md">
                      <Group position="apart">
                        <Group spacing="xs">
                          <IconCalendar size={16} />
                          <Text size="sm" c="dimmed">
                            {formatDate(note.createdAt)}
                          </Text>
                        </Group>
                        <Group spacing={5}>
                          {canEditNote(user, projectMembers) && (
                            <ActionIcon
                              color="blue"
                              variant="subtle"
                              onClick={() => handleOpenEditNoteModal(note)}
                            >
                              <IconEdit size={16} />
                            </ActionIcon>
                          )}
                          {canDeleteNote(user, projectMembers) && (
                            <ActionIcon
                              color="red"
                              variant="subtle"
                              onClick={() => handleOpenDeleteNoteModal(note)}
                            >
                              <IconTrash size={16} />
                            </ActionIcon>
                          )}
                        </Group>
                      </Group>

                      <Text lineClamp={4}>{note.content}</Text>

                      {note.createdBy && (
                        <Group spacing="xs">
                          <Avatar
                            size="sm"
                            radius="xl"
                            color="blue"
                            src={note.createdBy.avatar?.url}
                          >
                            {note.createdBy.fullName?.charAt(0) ||
                              note.createdBy.username?.charAt(0) ||
                              "U"}
                          </Avatar>
                          <Text size="sm">
                            {note.createdBy.fullName || note.createdBy.username}
                          </Text>
                        </Group>
                      )}
                    </Stack>
                  </Card>
                </Grid.Col>
              ))
            ) : (
              <Grid.Col>
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
                    {userCanCreateNotes ? (
                      <Button
                        onClick={() => setCreateNoteModalOpen(true)}
                        mt="md"
                      >
                        Create Your First Note
                      </Button>
                    ) : (
                      <Badge color="gray" size="lg" mt="md">
                        View Only Access
                      </Badge>
                    )}
                  </Stack>
                </Card>
              </Grid.Col>
            )}
          </Grid>
        )}
      </Box>

      {/* Task Detail Drawer */}
      {(activeTab === "kanban" || activeTab === "list") && (
        <TaskDetail
          taskId={selectedTaskId}
          projectId={projectId}
          onClose={handleCloseTaskDetail}
          opened={shouldShowTaskDetails}
        />
      )}

      {/* Members Modal */}
      <Modal
        opened={membersModalOpen}
        onClose={() => setMembersModalOpen(false)}
        title="Project Members"
        size="lg"
      >
        {!projectMembers || projectMembers.length === 0 ? (
          <EmptyState
            title="No members yet"
            description="Add members to collaborate on this project"
            buttonText={
              canManageMembers(user, projectMembers)
                ? "Add Your First Member"
                : ""
            }
            onButtonClick={
              canManageMembers(user, projectMembers)
                ? () => {
                    setMembersModalOpen(false);
                    handleOpenAddMemberModal();
                  }
                : undefined
            }
          />
        ) : (
          <Stack>
            <ProjectMembersTable
              members={projectMembers}
              canManage={false}
              compact
            />
            {canManageMembers(user, projectMembers) && (
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={() => {
                  setMembersModalOpen(false);
                  handleOpenAddMemberModal();
                }}
                mt="md"
              >
                Add Members
              </Button>
            )}
          </Stack>
        )}
      </Modal>

      {/* Add Members Modal */}
      <AddMemberModal
        opened={addMemberModalOpen}
        onClose={() => setAddMemberModalOpen(false)}
        onSubmit={handleAddMembers}
        isLoading={isLoading}
      />

      {/* Edit Role Modal */}
      <MemberRoleModal
        opened={editRoleModalOpen}
        onClose={() => setEditRoleModalOpen(false)}
        onSubmit={handleUpdateRole}
        isLoading={isLoading}
        initialValues={
          selectedMember ? { role: selectedMember.role } : { role: "" }
        }
      />

      {/* Create Task Modal */}
      <TaskFormModal
        opened={createTaskModalOpen}
        onClose={() => setCreateTaskModalOpen(false)}
        title="Create New Task"
        projectId={projectId}
        members={projectMembers}
        onSubmit={handleCreateTask}
        initialValues={taskForm.values}
      />

      {/* Create Note Modal */}
      <NoteFormModal
        opened={createNoteModalOpen}
        onClose={() => setCreateNoteModalOpen(false)}
        title="Create New Note"
        onSubmit={handleCreateNote}
        initialValues={noteForm.values}
        isLoading={notesLoading}
      />

      {/* Edit Note Modal */}
      {selectedNote && (
        <NoteFormModal
          opened={editNoteModalOpen}
          onClose={() => {
            setEditNoteModalOpen(false);
            setSelectedNote(null);
          }}
          title="Edit Note"
          onSubmit={handleEditNote}
          initialValues={{ content: selectedNote.content }}
          isLoading={notesLoading}
        />
      )}

      {/* Delete Note Confirmation Modal */}
      {selectedNote && (
        <ConfirmDeleteModal
          opened={deleteNoteModalOpen}
          onClose={() => {
            setDeleteNoteModalOpen(false);
            setSelectedNote(null);
          }}
          title="Delete Note"
          message="Are you sure you want to delete this note? This action cannot be undone."
          onConfirm={handleDeleteNote}
          isLoading={notesLoading}
        />
      )}

      {/* Delete Member Confirmation Modal */}
      {memberToDelete && (
        <ConfirmDeleteModal
          opened={deleteMemberModalOpen}
          onClose={() => {
            setDeleteMemberModalOpen(false);
            setMemberToDelete(null);
          }}
          title="Remove Member"
          message={`Are you sure you want to remove ${
            memberToDelete.user.fullName || memberToDelete.user.username
          } from this project? This action cannot be undone.`}
          onConfirm={handleRemoveMember}
          isLoading={isLoading}
        />
      )}
    </Container>
  );
}
