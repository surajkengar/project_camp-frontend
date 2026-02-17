import { Alert } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";

/**
 * Reusable error alert component
 * @param {Object} props - Component props
 * @param {string} props.error - Error message to display
 * @param {Function} [props.onClose] - Optional callback for when the alert is closed
 */
export default function ErrorAlert({ error, onClose }) {
  if (!error) return null;

  return (
    <Alert
      icon={<IconAlertCircle size={16} />}
      title="Error"
      color="red"
      mb="md"
      withCloseButton={!!onClose}
      onClose={onClose}
    >
      {error}
    </Alert>
  );
}
