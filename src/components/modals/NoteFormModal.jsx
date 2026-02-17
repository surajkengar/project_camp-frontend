import { Button, Group, Modal, Stack, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import React from "react";

/**
 * Note form modal component
 * @param {Object} props - Component props
 * @param {boolean} props.opened - Whether the modal is open
 * @param {Function} props.onClose - Function to call when modal is closed
 * @param {Function} props.onSubmit - Function to call when form is submitted
 * @param {Object} [props.initialValues] - Initial values for the form
 * @param {boolean} [props.isLoading] - Whether the form is loading
 * @param {string} [props.title="Create New Note"] - Modal title
 * @param {string} [props.submitText="Save Note"] - Submit button text
 */
export default function NoteFormModal({
  opened,
  onClose,
  onSubmit,
  initialValues = { content: "" },
  isLoading = false,
  title = "Create New Note",
  submitText = "Save Note",
}) {
  const form = useForm({
    mode: "uncontrolled",
    initialValues,
    validate: {
      content: (value) => (!value?.trim() ? "Content is required" : null),
    },
  });

  const handleSubmit = (values) => {
    onSubmit(values);
    form.reset();
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={title}
      size="md"
      centered
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack spacing="md">
          <Textarea
            label="Note Content"
            placeholder="Enter your note here..."
            minRows={4}
            required
            {...form.getInputProps("content")}
            data-autofocus
          />
          <Group justify="flex-end" mt="md">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" loading={isLoading}>
              {submitText}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
