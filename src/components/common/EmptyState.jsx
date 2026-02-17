import { Button, Card, Stack, Text } from "@mantine/core";

/**
 * Reusable empty state component
 * @param {Object} props - Component props
 * @param {string} props.message - Message to display
 * @param {string} [props.buttonText] - Optional button text
 * @param {Function} [props.onButtonClick] - Optional button click handler
 */
export default function EmptyState({ message, buttonText, onButtonClick }) {
  return (
    <Card p="xl" withBorder>
      <Stack align="center" spacing="md">
        <Text size="lg" c="dimmed">
          {message}
        </Text>
        {buttonText && onButtonClick && (
          <Button onClick={onButtonClick}>{buttonText}</Button>
        )}
      </Stack>
    </Card>
  );
}
