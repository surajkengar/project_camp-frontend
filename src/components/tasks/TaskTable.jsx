import {
  Avatar,
  Badge,
  Box,
  Group,
  LoadingOverlay,
  ScrollArea,
  Select,
  Table,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconSubtask } from "@tabler/icons-react";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuthStore, useProjectStore, useTaskStore } from "../../store";
import { canEditTask } from "../../utils/permissions";
import {
  getStatusColor,
  getStatusLabel,
  getStatusOptions,
} from "../../utils/taskStatusUtils";

/**
 * Task table component for displaying tasks in a table format
 * @param {Object} props - Component props
 * @param {Array} props.tasks - Array of tasks to display
 * @param {Function} props.onTaskClick - Function to call when a task is clicked
 */
export default function TaskTable({ tasks = [], onTaskClick }) {
  const theme = useMantineTheme();
  const { projectId } = useParams();
  const { isLoading, changeTaskStatus } = useTaskStore();
  const { fetchProjectMembers, projectMembers } = useProjectStore();
  const { user } = useAuthStore();

  const [localTasks, setLocalTasks] = useState([]);
  const [taskStatuses, setTaskStatuses] = useState({});

  useEffect(() => {
    if (projectId) {
      fetchProjectMembers(projectId).catch(console.error);
    }
  }, [projectId, fetchProjectMembers]);

  useEffect(() => {
    setLocalTasks(tasks);
    // Initialize status state for each task
    const initialStatusState = {};
    tasks.forEach((task) => {
      initialStatusState[task._id] = task.status;
    });
    setTaskStatuses(initialStatusState);
  }, [tasks]);

  const userCanEditTask = () => {
    return canEditTask(user, projectMembers);
  };

  const handleTaskStatusChange = async (taskId, newStatus) => {
    const task = localTasks.find((t) => t._id === taskId);
    if (!task) return;

    // Check if user has permission to edit this task
    if (!userCanEditTask(task)) {
      notifications.show({
        title: "Permission Denied",
        message: "You don't have permission to change the status of this task.",
        color: "red",
      });
      return;
    }

    try {
      // Update global state
      await changeTaskStatus(projectId, taskId, newStatus);

      // Update local states
      setLocalTasks(
        localTasks.map((t) =>
          t._id === taskId ? { ...t, status: newStatus } : t
        )
      );
      setTaskStatuses((prev) => ({
        ...prev,
        [taskId]: newStatus,
      }));

      notifications.show({
        title: "Success",
        message: "Task status updated successfully",
        color: "green",
      });
    } catch (error) {
      console.error("Failed to change task status:", error);
      notifications.show({
        title: "Error",
        message: "Failed to update task status. Please try again.",
        color: "red",
      });
    }
  };

  // Simple function to render the assignee cell
  const renderAssigneeCell = (assignedTo) => {
    // If there's no assignedTo field or it's null
    if (!assignedTo) {
      return (
        <Text size="sm" c="dimmed">
          Unassigned
        </Text>
      );
    }

    // If assignedTo is an object with user details
    if (typeof assignedTo === "object") {
      const name = assignedTo.fullName || assignedTo.username || "Unknown";
      const initial = name.charAt(0).toUpperCase();

      return (
        <Group gap="xs">
          <Avatar
            src={assignedTo.avatar?.url}
            size="sm"
            radius="xl"
            color="blue"
          >
            {initial}
          </Avatar>
          <Text size="sm">{name}</Text>
        </Group>
      );
    }

    // If assignedTo is just an ID (string)
    return (
      <Group gap="xs">
        <Avatar size="sm" radius="xl" color="blue">
          U
        </Avatar>
        <Text size="sm">Assigned User</Text>
      </Group>
    );
  };

  return (
    <Box style={{ position: "relative" }}>
      <LoadingOverlay visible={isLoading} overlayBlur={2} />

      <ScrollArea>
        <Table striped highlightOnHover style={{ minWidth: 800 }}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Task</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Assigned To</Table.Th>
              <Table.Th>Created</Table.Th>
              <Table.Th>Change Status</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {localTasks.map((task) => (
              <React.Fragment key={task._id}>
                <Table.Tr
                  style={{
                    borderLeft: `4px solid ${
                      theme.colors[getStatusColor(task.status)][6]
                    }`,
                    cursor: "pointer",
                    transition: "background-color 0.1s ease",
                    "&:hover": {
                      backgroundColor:
                        theme.colorScheme === "dark"
                          ? theme.colors.dark[5]
                          : theme.colors.gray[1],
                    },
                  }}
                  onClick={() => onTaskClick && onTaskClick(task._id)}
                >
                  <Table.Td>
                    <Group gap="xs">
                      <Text fw={500}>{task.title}</Text>
                      {task.subtasks && task.subtasks.length > 0 && (
                        <Group gap={4}>
                          <IconSubtask size={14} />
                          <Text size="xs" c="dimmed">
                            ({task.subtasks.length})
                          </Text>
                        </Group>
                      )}
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={getStatusColor(task.status)}>
                      {getStatusLabel(task.status)}
                    </Badge>
                  </Table.Td>
                  <Table.Td>{renderAssigneeCell(task.assignedTo)}</Table.Td>
                  <Table.Td>
                    {task.createdAt
                      ? new Date(task.createdAt).toLocaleDateString()
                      : "N/A"}
                  </Table.Td>
                  <Table.Td onClick={(e) => e.stopPropagation()}>
                    <Select
                      value={taskStatuses[task._id] || task.status}
                      onChange={(value) =>
                        handleTaskStatusChange(task._id, value)
                      }
                      data={getStatusOptions()}
                      size="xs"
                      style={{ width: "120px" }}
                      disabled={!userCanEditTask(task)}
                    />
                  </Table.Td>
                </Table.Tr>
              </React.Fragment>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Box>
  );
}
