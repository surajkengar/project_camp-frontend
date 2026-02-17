import { Button, Modal, Stack, TextInput, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import React from "react";

/**
 * Project form modal component
 * @param {Object} props - Component props
 * @param {boolean} props.opened - Whether the modal is open
 * @param {Function} props.onClose - Function to call when modal is closed
 * @param {Function} props.onSubmit - Function to call when form is submitted
 * @param {Object} [props.initialValues] - Initial values for the form
 * @param {boolean} [props.isLoading] - Whether the form is loading
 * @param {string} [props.title="Create New Project"] - Modal title
 * @param {string} [props.submitText="Create Project"] - Submit button text
 */
export default function ProjectFormModal({
  opened,
  onClose,
  onSubmit,
  initialValues = { name: "", description: "" },
  isLoading = false,
  title = "Create New Project",
  submitText = "Create Project",
}) {
  const form = useForm({
    mode: "uncontrolled",
    initialValues,
    validate: {
      name: (value) => (!value?.trim() ? "Name is required" : null),
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
          <TextInput
            label="Project Name"
            placeholder="Enter project name"
            required
            {...form.getInputProps("name")}
            data-autofocus
          />
          <Textarea
            label="Description"
            placeholder="Enter project description (optional)"
            autosize
            minRows={3}
            maxRows={6}
            {...form.getInputProps("description")}
          />
          <Button type="submit" loading={isLoading} fullWidth mt="md">
            {submitText}
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
