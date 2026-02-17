import {
  Avatar,
  Badge,
  Card,
  Checkbox,
  Group,
  Progress,
  Stack,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCalendar, IconSubtask } from "@tabler/icons-react";
import React, { useEffect, useState } from "react";
import { useAuthStore, useProjectStore, useTaskStore } from "../../store";
import { TaskStatusEnum } from "../../utils/constants";
import { formatRelativeTime } from "../../utils/dateUtils";
import { canEditTask } from "../../utils/permissions";
import { getStatusColor, getStatusLabel } from "../../utils/taskStatusUtils";

const MAX_VISIBLE_SUBTASKS = 3;

/**
 * Task card component for displaying a task in the kanban board or list
 * @param {Object} props - Component props
 * @param {Object} props.task - Task object to display
 * @param {string} props.projectId - ID of the project the task belongs to
 * @param {boolean} props.isDragging - Whether the card is being dragged
 * @param {Function} props.onClick - Function to call when the card is clicked
 */
export default function TaskCard({ task, projectId, isDragging, onClick }) {
  const theme = useMantineTheme();
  const { toggleSubtaskCompletion } = useTaskStore();
  const { projectMembers, fetchProjectMembers } = useProjectStore();
  const { user } = useAuthStore();
  const [subtasks, setSubtasks] = useState(task.subtasks || []);

  useEffect(() => {
    setSubtasks(task.subtasks || []);
  }, [task.subtasks]);

  useEffect(() => {
    if (projectId) {
      fetchProjectMembers(projectId).catch(console.error);
    }
  }, [projectId, fetchProjectMembers]);

  const userCanEditTask = canEditTask(user, projectMembers);

  const getAssigneeInfo = () => {
    if (!task.assignedTo) {
      return {
        avatar: null,
        name: "Unassigned",
        initial: "?",
        color: "gray",
      };
    }

    const assignee = task.assignedTo;
    const name = assignee.fullName || assignee.username || "Unknown";

    return {
      avatar: assignee.avatar?.url,
      name,
      initial: name.charAt(0).toUpperCase(),
      color: "blue",
    };
  };

  const getSubtaskProgress = () => {
    const completed = subtasks.filter((subtask) => subtask.isCompleted).length;
    const total = subtasks.length;
    return {
      completed,
      total,
      percentage: total > 0 ? (completed / total) * 100 : 0,
    };
  };

  const handleSubtaskToggle = async (subtaskId, isCompleted) => {
    if (!userCanEditTask) {
      notifications.show({
        title: "Permission Denied",
        message: "You don't have permission to update subtasks for this task.",
        color: "red",
      });
      return;
    }

    try {
      await toggleSubtaskCompletion(projectId, subtaskId, isCompleted);
      setSubtasks(
        subtasks.map((subtask) =>
          subtask._id === subtaskId
            ? { ...subtask, isCompleted: !isCompleted }
            : subtask
        )
      );
    } catch (error) {
      console.error("Failed to toggle subtask:", error);
      notifications.show({
        title: "Error",
        message: "Failed to update subtask. Please try again.",
        color: "red",
      });
    }
  };

  const { completed, total, percentage } = getSubtaskProgress();
  const { avatar, name, initial, color } = getAssigneeInfo();
  const statusColor = getStatusColor(task.status);

  return (
    <Card
      shadow="sm"
      padding="md"
      radius="md"
      withBorder
      mb="md"
      style={{
        opacity: isDragging ? 0.8 : 1,
        borderLeft: `4px solid ${theme.colors[statusColor][6]}`,
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        cursor: "pointer",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: theme.shadows.md,
        },
      }}
      onClick={() => onClick?.(task._id)}
    >
      <Stack gap="xs">
        <Group justify="space-between" wrap="nowrap">
          <Text fw={500} size="lg" truncate>
            {task.title}
          </Text>
          <Badge color={statusColor}>{getStatusLabel(task.status)}</Badge>
        </Group>

        <Text size="sm" c="dimmed" lineClamp={2}>
          {task.description || "No description provided."}
        </Text>

        <Group gap="xs">
          <Avatar src={avatar} size="sm" radius="xl" color={color}>
            {initial}
          </Avatar>
          <Text size="sm" c={name === "Unassigned" ? "dimmed" : undefined}>
            {name}
          </Text>
        </Group>

        {total > 0 && (
          <>
            <Progress
              value={percentage}
              size="sm"
              color={statusColor}
              radius="xl"
              striped={task.status === TaskStatusEnum.IN_PROGRESS}
              animate={task.status === TaskStatusEnum.IN_PROGRESS}
            />
            <Group gap="xs">
              <IconSubtask size={14} />
              <Text size="xs">
                {completed} of {total} subtasks completed
              </Text>
            </Group>

            <Stack gap="xs" mt="xs">
              {subtasks.slice(0, MAX_VISIBLE_SUBTASKS).map((subtask) => (
                <Group key={subtask._id} gap="xs">
                  <Checkbox
                    checked={subtask.isCompleted}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleSubtaskToggle(subtask._id, subtask.isCompleted);
                    }}
                    size="xs"
                    color={statusColor}
                    disabled={!userCanEditTask}
                  />
                  <Text
                    size="sm"
                    style={{
                      textDecoration: subtask.isCompleted
                        ? "line-through"
                        : "none",
                      opacity: subtask.isCompleted ? 0.7 : 1,
                    }}
                  >
                    {subtask.title}
                  </Text>
                </Group>
              ))}
              {total > MAX_VISIBLE_SUBTASKS && (
                <Text size="xs" c="dimmed">
                  +{total - MAX_VISIBLE_SUBTASKS} more subtasks
                </Text>
              )}
            </Stack>
          </>
        )}

        {task.createdAt && (
          <Group gap="xs" mt="xs">
            <IconCalendar size={14} />
            <Text size="xs" c="dimmed">
              {formatRelativeTime(task.createdAt)}
            </Text>
          </Group>
        )}
      </Stack>
    </Card>
  );
}
