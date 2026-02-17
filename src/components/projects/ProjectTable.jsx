import {
  ActionIcon,
  Badge,
  Card,
  Group,
  ScrollArea,
  Table,
  Text,
} from "@mantine/core";
import { IconEdit, IconTrash, IconUsers } from "@tabler/icons-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Link } from "react-router-dom";
import { formatDate } from "../../utils/dateUtils";

// Initialize dayjs plugins
dayjs.extend(relativeTime);

/**
 * Project table component
 * @param {Object} props - Component props
 * @param {Array} props.projects - Array of projects
 * @param {Function} props.onEdit - Function to call when edit button is clicked
 * @param {Function} props.onDelete - Function to call when delete button is clicked
 * @param {Function} props.canManageProject - Function to determine if user can manage a project
 */
export default function ProjectTable({
  projects,
  onEdit,
  onDelete,
  canManageProject,
}) {
  if (projects.length === 0) {
    return null;
  }

  return (
    <Card p="md" withBorder radius="md" shadow="sm">
      <ScrollArea>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Project Name</Table.Th>
              <Table.Th>Description</Table.Th>
              <Table.Th>Members</Table.Th>
              <Table.Th>Created</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {projects.map((projectItem) => (
              <Table.Tr key={projectItem.project._id}>
                <Table.Td>
                  <Link
                    to={`/projects/${projectItem.project._id}`}
                    style={{
                      textDecoration: "none",
                      color: "#228be6",
                      fontWeight: 500,
                    }}
                  >
                    {projectItem.project.name}
                  </Link>
                </Table.Td>
                <Table.Td>
                  <Text lineClamp={2} size="sm">
                    {projectItem.project.description || "No description"}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Badge leftSection={<IconUsers size={12} />}>
                    {projectItem.project.members || 0}
                  </Badge>
                </Table.Td>
                <Table.Td>{formatDate(projectItem.project.createdAt)}</Table.Td>
                <Table.Td>
                  <Group spacing={8}>
                    <ActionIcon
                      color="blue"
                      variant="light"
                      onClick={() => onEdit(projectItem)}
                      disabled={!canManageProject(projectItem)}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      color="red"
                      variant="light"
                      onClick={() => onDelete(projectItem)}
                      disabled={!canManageProject(projectItem)}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Card>
  );
}
