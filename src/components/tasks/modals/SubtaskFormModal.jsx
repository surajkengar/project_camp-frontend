import { Button, Modal, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import React from "react";

/**
 * Subtask form modal component
 * @param {Object} props - Component props
 * @param {boolean} props.opened - Whether the modal is open
 * @param {Function} props.onClose - Function to call when modal is closed
 * @param {Function} props.onSubmit - Function to call when form is submitted
 * @param {Object} [props.initialValues] - Initial values for the form
 * @param {boolean} [props.isLoading] - Whether the form is loading
 * @param {string} [props.title="Add Subtask"] - Modal title
 * @param {string} [props.submitText="Add Subtask"] - Submit button text
 */
export default function SubtaskFormModal({
  opened,
  onClose,
  onSubmit,
  initialValues = { title: "" },
  isLoading = false,
  title = "Add Subtask",
  submitText = "Add Subtask",
}) {
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      title: initialValues.title || "",
    },
    validate: {
      title: (value) => (value.trim().length < 1 ? "Title is required" : null),
    },
  });

  return (
    <Modal
      opened={opened}
      onClose={() => {
        form.reset();
        onClose();
      }}
      title={title}
      size="md"
      centered
    >
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack spacing="md">
          <TextInput
            label="Subtask Title"
            placeholder="Enter subtask title"
            required
            key={form.key("title")}
            {...form.getInputProps("title")}
            data-autofocus
          />
          <Button type="submit" loading={isLoading} fullWidth mt="md">
            {submitText}
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
