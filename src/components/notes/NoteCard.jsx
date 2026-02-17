import {
  ActionIcon,
  Avatar,
  Card,
  Group,
  Menu,
  Stack,
  Text,
} from "@mantine/core";
import { IconDots, IconEdit, IconTrash } from "@tabler/icons-react";
import React from "react";

/**
 * Note card component
 * @param {Object} props - Component props
 * @param {Object} props.note - Note object
 * @param {Function} props.onEdit - Function to call when edit button is clicked
 * @param {Function} props.onDelete - Function to call when delete button is clicked
 */
export default function NoteCard({ note, onEdit, onDelete }) {
  // Function to render the creator information
  const renderCreator = () => {
    // If there's no createdBy field or it's null
    if (!note.createdBy) {
      return (
        <Group gap="xs">
          <Avatar size="xs" radius="xl" color="gray">
            ?
          </Avatar>
          <Text size="xs" c="dimmed">
            Unknown User
          </Text>
        </Group>
      );
    }

    // If createdBy is an object with user details
    if (typeof note.createdBy === "object") {
      const name =
        note.createdBy.fullName || note.createdBy.username || "Unknown";
      const initial = name.charAt(0).toUpperCase();

      return (
        <Group gap="xs">
          <Avatar
            src={note.createdBy.avatar?.url}
            size="xs"
            radius="xl"
            color="blue"
          >
            {initial}
          </Avatar>
          <Text size="xs" c="dimmed">
            By: {name}
          </Text>
        </Group>
      );
    }

    // If createdBy is just an ID (string)
    return (
      <Group gap="xs">
        <Avatar size="xs" radius="xl" color="blue">
          U
        </Avatar>
        <Text size="xs" c="dimmed">
          By: User
        </Text>
      </Group>
    );
  };

  return (
    <Card shadow="sm" padding="md" radius="md" withBorder>
      <Stack>
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            {note.createdAt
              ? new Date(note.createdAt).toLocaleDateString()
              : ""}
          </Text>
          <Menu position="bottom-end" withArrow>
            <Menu.Target>
              <ActionIcon variant="subtle" size="sm">
                <IconDots size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconEdit size={14} />}
                onClick={() => onEdit && onEdit(note)}
              >
                Edit Note
              </Menu.Item>
              <Menu.Item
                color="red"
                leftSection={<IconTrash size={14} />}
                onClick={() => onDelete && onDelete(note)}
              >
                Delete Note
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>

        <Text>{note.content}</Text>

        {renderCreator()}
      </Stack>
    </Card>
  );
}
