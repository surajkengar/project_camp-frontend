import {
  ActionIcon,
  Avatar,
  Badge,
  Group,
  Table,
  Text,
  Tooltip,
} from "@mantine/core";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import React from "react";
import { UserRolesEnum } from "../../utils/constants";
import { formatDate } from "../../utils/dateUtils";
import { canRemoveMember } from "../../utils/permissions";

/**
 * Project members table component
 * @param {Object} props - Component props
 * @param {Array} props.members - Array of project members
 * @param {Function} props.onEdit - Function to call when edit role button is clicked
 * @param {Function} props.onRemove - Function to call when remove member button is clicked
 * @param {boolean} props.canManage - Whether the current user can manage members
 * @param {boolean} props.compact - Whether to show a compact version of the table
 * @param {Object} props.currentUser - The current logged in user
 */
export default function ProjectMembersTable({
  members,
  onEdit,
  onRemove,
  canManage,
  compact,
  currentUser,
}) {
  if (!members || members.length === 0) {
    return (
      <Text c="dimmed" ta="center">
        No members in this project yet.
      </Text>
    );
  }

  return (
    <Table striped highlightOnHover compact={compact}>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Member</Table.Th>
          <Table.Th>Role</Table.Th>
          <Table.Th>Joined</Table.Th>
          {canManage && <Table.Th>Actions</Table.Th>}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {members.map((member) => {
          const { allowed: canBeRemoved, message: removeMessage } =
            canRemoveMember(currentUser, member.user, members);

          return (
            <Table.Tr key={member.user._id}>
              <Table.Td>
                <Group>
                  <Avatar src={member.user.avatar?.url} radius="xl" size="sm" />
                  <div>
                    <Text>{member.user.fullName || member.user.username}</Text>
                    <Text size="xs" c="dimmed">
                      {member.user.email}
                    </Text>
                  </div>
                </Group>
              </Table.Td>
              <Table.Td>
                <Badge
                  color={
                    member.role === UserRolesEnum.ADMIN
                      ? "red"
                      : member.role === UserRolesEnum.PROJECT_ADMIN
                      ? "blue"
                      : "green"
                  }
                >
                  {member.role}
                </Badge>
              </Table.Td>
              <Table.Td>{formatDate(member.createdAt)}</Table.Td>
              {canManage && (
                <Table.Td>
                  <Group spacing={5}>
                    <ActionIcon
                      color="blue"
                      variant="subtle"
                      onClick={() => onEdit(member)}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                    <Tooltip
                      label={!canBeRemoved ? removeMessage : "Remove member"}
                    >
                      <ActionIcon
                        color="red"
                        variant="subtle"
                        onClick={() => onRemove(member)}
                        disabled={!canBeRemoved}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Table.Td>
              )}
            </Table.Tr>
          );
        })}
      </Table.Tbody>
    </Table>
  );
}
