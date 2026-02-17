import { Button, Group, Modal, Stack, Text } from "@mantine/core";
import React from "react";

/**
 * Confirm delete modal component
 * @param {Object} props - Component props
 * @param {boolean} props.opened - Whether the modal is open
 * @param {Function} props.onClose - Function to call when modal is closed
 * @param {Function} props.onConfirm - Function to call when delete is confirmed
 * @param {string} props.title - Modal title
 * @param {string} props.message - Confirmation message
 * @param {boolean} [props.isLoading=false] - Whether the delete action is loading
 */
export default function ConfirmDeleteModal({
  opened,
  onClose,
  onConfirm,
  title,
  message,
  isLoading = false,
}) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={title}
      centered
      withCloseButton
    >
      <Stack spacing="lg">
        <Text>{message}</Text>
        <Group justify="flex-end" mt="md">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button color="red" onClick={onConfirm} loading={isLoading}>
            Delete
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
