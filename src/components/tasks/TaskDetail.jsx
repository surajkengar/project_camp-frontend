import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Divider,
  Drawer,
  FileInput,
  Group,
  Modal,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import {
  IconCalendar,
  IconClock,
  IconDownload,
  IconEdit,
  IconTrash,
  IconUpload,
} from "@tabler/icons-react";
import React, { useEffect, useState } from "react";
import { useAuthStore, useProjectStore, useTaskStore } from "../../store";
import { TaskStatusEnum } from "../../utils/constants";
import { formatDateTime } from "../../utils/dateUtils";
import { canEditTask } from "../../utils/permissions";
import {
  getStatusColor,
  getStatusLabel,
  getStatusOptions,
} from "../../utils/taskStatusUtils";
import SubtaskList from "./subtasks/SubtaskList";

/**
 * Task detail component for displaying and editing a task
 * @param {Object} props - Component props
 * @param {string} props.taskId - ID of the task to display
 * @param {string} props.projectId - ID of the project the task belongs to
 * @param {Function} props.onClose - Function to call when the detail view is closed
 * @param {boolean} props.opened - Whether the drawer is open
 */
export default function TaskDetail({ taskId, projectId, onClose, opened }) {
  const {
    currentTask,
    subtasks,
    isLoading,
    fetchTaskById,
    updateTask,
    deleteTask,
  } = useTaskStore();
  const { projectMembers, fetchProjectMembers } = useProjectStore();
  const { user } = useAuthStore();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [newAttachments, setNewAttachments] = useState([]);

  // Fetch task and project members data
  useEffect(() => {
    if (projectId && taskId && opened) {
      fetchTaskById(projectId, taskId).catch(console.error);
      fetchProjectMembers(projectId).catch(console.error);
    }
  }, [projectId, taskId, fetchTaskById, fetchProjectMembers, opened]);

  // Update attachments when currentTask changes
  useEffect(() => {
    if (currentTask?.attachments) {
      setAttachments(currentTask.attachments);
    }
  }, [currentTask]);

  // Initialize the edit form with uncontrolled mode
  const editForm = useForm({
    mode: "uncontrolled",
    initialValues: {
      title: "",
      description: "",
      status: TaskStatusEnum.TODO,
      assignedTo: "",
    },
  });

  // Check if user can edit this task
  const userCanEditTask = currentTask
    ? canEditTask(user, projectMembers)
    : false;

  // Handle opening the edit modal - set form values from currentTask
  const handleOpenEditModal = () => {
    // Check if user has permission to edit this task
    if (!userCanEditTask) {
      notifications.show({
        title: "Permission Denied",
        message: "You don't have permission to edit this task.",
        color: "red",
      });
      return;
    }

    if (currentTask) {
      editForm.setValues({
        title: currentTask.title || "",
        description: currentTask.description || "",
        status: currentTask.status || TaskStatusEnum.TODO,
        assignedTo: currentTask.assignedTo?._id || "",
      });
    }
    setEditModalOpen(true);
  };

  // Handle closing the edit modal - reset form
  const handleCloseEditModal = () => {
    editForm.reset();
    setNewAttachments([]);
    setEditModalOpen(false);
  };

  // Handle edit task submission
  const handleEditTask = async (values) => {
    // Double-check permission
    if (!userCanEditTask) {
      notifications.show({
        title: "Permission Denied",
        message: "You don't have permission to edit this task.",
        color: "red",
      });
      return;
    }

    try {
      await updateTask(projectId, taskId, values, newAttachments);
      handleCloseEditModal();
      notifications.show({
        title: "Success",
        message: "Task updated successfully",
        color: "green",
      });
    } catch (error) {
      console.error("Failed to update task:", error);
      notifications.show({
        title: "Error",
        message: "Failed to update task. Please try again.",
        color: "red",
      });
    }
  };

  const handleDeleteTask = async () => {
    // Check if user has permission to delete this task
    if (!userCanEditTask) {
      notifications.show({
        title: "Permission Denied",
        message: "You don't have permission to delete this task.",
        color: "red",
      });
      return;
    }

    try {
      await deleteTask(projectId, taskId);
      setDeleteModalOpen(false);
      onClose();
      notifications.show({
        title: "Success",
        message: "Task deleted successfully",
        color: "green",
      });
    } catch (error) {
      console.error("Failed to delete task:", error);
      notifications.show({
        title: "Error",
        message: "Failed to delete task. Please try again.",
        color: "red",
      });
    }
  };

  // Custom value component for FileInput to show file names
  const ValueComponent = ({ value }) => {
    if (!value || value.length === 0) {
      return null;
    }

    return (
      <Group gap="sm" py="xs">
        {Array.from(value).map((file, index) => (
          <Group key={index} gap="xs">
            <IconUpload size={16} />
            <Text size="sm">{file.name}</Text>
            <ActionIcon
              size="xs"
              color="red"
              onClick={(e) => {
                e.stopPropagation();
                const newFiles = Array.from(value).filter(
                  (_, i) => i !== index
                );
                setNewAttachments(newFiles);
              }}
            >
              <IconTrash size={14} />
            </ActionIcon>
          </Group>
        ))}
      </Group>
    );
  };

  return (
    <>
      <Drawer
        opened={opened}
        onClose={onClose}
        title="Task Details"
        padding="lg"
        size="md"
        position="right"
      >
        {!currentTask ? (
          <Text c="dimmed" ta="center">
            Loading task details...
          </Text>
        ) : (
          <Stack spacing="lg">
            <Group position="apart">
              <Title order={3}>{currentTask.title}</Title>
              <Group>
                <Badge color={getStatusColor(currentTask.status)} size="lg">
                  {getStatusLabel(currentTask.status)}
                </Badge>
                {userCanEditTask && (
                  <>
                    <ActionIcon
                      color="blue"
                      variant="subtle"
                      onClick={handleOpenEditModal}
                    >
                      <IconEdit size={20} />
                    </ActionIcon>
                    <ActionIcon
                      color="red"
                      variant="subtle"
                      onClick={() => setDeleteModalOpen(true)}
                    >
                      <IconTrash size={20} />
                    </ActionIcon>
                  </>
                )}
              </Group>
            </Group>

            <Divider />

            <Stack spacing="xs">
              <Title order={5}>Description</Title>
              <Text>
                {currentTask.description || "No description provided."}
              </Text>
            </Stack>

            <Divider />

            <Stack spacing="xs">
              <Title order={5}>Assigned To</Title>
              {currentTask.assignedTo ? (
                <Group>
                  <Avatar
                    src={currentTask.assignedTo.avatar?.url}
                    size="md"
                    radius="xl"
                    color="blue"
                    alt={
                      currentTask.assignedTo.fullName ||
                      currentTask.assignedTo.username
                    }
                  >
                    {(
                      currentTask.assignedTo.fullName ||
                      currentTask.assignedTo.username ||
                      "U"
                    ).charAt(0)}
                  </Avatar>
                  <div>
                    <Text>
                      {currentTask.assignedTo.fullName ||
                        currentTask.assignedTo.username}
                    </Text>
                  </div>
                </Group>
              ) : (
                <Text c="dimmed">Not assigned</Text>
              )}
            </Stack>

            <Divider />

            {attachments.length > 0 && (
              <>
                <Stack spacing="xs">
                  <Title order={5}>Attachments</Title>
                  <Group>
                    {attachments.map((attachment, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        leftIcon={<IconDownload size={16} />}
                        component="a"
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {attachment.url.split("/").pop()}
                      </Button>
                    ))}
                  </Group>
                </Stack>
                <Divider />
              </>
            )}

            <SubtaskList task={currentTask} subtasks={subtasks} />

            <Group position="apart">
              <Group spacing="xs">
                <IconCalendar size={16} />
                <Text size="sm" c="dimmed">
                  Created: {formatDateTime(currentTask.createdAt)}
                </Text>
              </Group>
              <Group spacing="xs">
                <IconClock size={16} />
                <Text size="sm" c="dimmed">
                  Updated: {formatDateTime(currentTask.updatedAt)}
                </Text>
              </Group>
            </Group>
          </Stack>
        )}
      </Drawer>

      {/* Edit Task Modal */}
      <Modal
        opened={editModalOpen}
        onClose={handleCloseEditModal}
        title="Edit Task"
        size="lg"
        centered
      >
        <form onSubmit={editForm.onSubmit(handleEditTask)}>
          <Stack spacing="md">
            <TextInput
              label="Title"
              placeholder="Task title"
              required
              key={editForm.key("title")}
              {...editForm.getInputProps("title")}
              data-autofocus
            />
            <Textarea
              label="Description"
              placeholder="Task description"
              minRows={3}
              key={editForm.key("description")}
              {...editForm.getInputProps("description")}
            />
            <Select
              label="Status"
              placeholder="Select status"
              data={getStatusOptions()}
              key={editForm.key("status")}
              {...editForm.getInputProps("status")}
            />
            <Select
              label="Assigned To"
              placeholder="Select team member"
              data={
                Array.isArray(projectMembers)
                  ? projectMembers.map((member) => ({
                      value: member.user._id,
                      label: member.user.fullName || member.user.username,
                    }))
                  : []
              }
              clearable
              key={editForm.key("assignedTo")}
              {...editForm.getInputProps("assignedTo")}
            />
            <FileInput
              label="Add Attachments"
              placeholder="Upload files"
              multiple
              accept="image/*, application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              icon={<IconUpload size={14} />}
              value={newAttachments}
              onChange={setNewAttachments}
              valueComponent={ValueComponent}
              clearable
            />
            {attachments.length > 0 && (
              <>
                <Divider label="Current Attachments" labelPosition="center" />
                <Group>
                  {attachments.map((attachment, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      leftIcon={<IconDownload size={16} />}
                      component="a"
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      size="sm"
                    >
                      {attachment.url.split("/").pop()}
                    </Button>
                  ))}
                </Group>
              </>
            )}
            <Group position="right" mt="md">
              <Button variant="outline" onClick={handleCloseEditModal}>
                Cancel
              </Button>
              <Button type="submit" loading={isLoading}>
                Save Changes
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Delete Task Modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Task"
        size="sm"
      >
        <Stack spacing="md">
          <Text>Are you sure you want to delete this task?</Text>
          <Text size="sm" c="dimmed">
            This action cannot be undone.
          </Text>
          <Group position="right" mt="md">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button color="red" onClick={handleDeleteTask} loading={isLoading}>
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
