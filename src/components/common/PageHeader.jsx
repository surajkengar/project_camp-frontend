import { Group, Text, Title } from "@mantine/core";

/**
 * Reusable page header component with title and optional subtitle
 * @param {Object} props - Component props
 * @param {string} props.title - Main title text
 * @param {string} [props.subtitle] - Optional subtitle text
 * @param {React.ReactNode} [props.rightSection] - Optional content for the right side of the header
 */
export default function PageHeader({ title, subtitle, rightSection }) {
  return (
    <Group position="apart" mb="xl">
      <div>
        <Title order={2}>{title}</Title>
        {subtitle && (
          <Text c="dimmed" mt="xs">
            {subtitle}
          </Text>
        )}
      </div>
      {rightSection && rightSection}
    </Group>
  );
}
