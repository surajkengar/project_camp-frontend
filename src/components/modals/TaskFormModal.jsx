import {
  Button,
  FileInput,
  Group,
  Modal,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconFile, IconUpload, IconX } from "@tabler/icons-react";
import React, { useState } from "react";
import { TaskStatusEnum } from "../../utils/constants";

/**
 * Task form modal component
 * @param {Object} props - Component props
 * @param {boolean} props.opened - Whether the modal is open
 * @param {Function} props.onClose - Function to call when modal is closed
 * @param {Function} props.onSubmit - Function to call when form is submitted
 * @param {Array} props.members - Array of project members for assignment dropdown
 * @param {string} [props.projectId] - ID of the project (not used directly in component)
 * @param {Object} [props.initialValues] - Initial values for the form
 * @param {boolean} [props.isLoading] - Whether the form is loading
 * @param {string} [props.title="Create New Task"] - Modal title
 * @param {string} [props.submitText="Create Task"] - Submit button text
 */
export default function TaskFormModal({
  opened,
  onClose,
  onSubmit,
  members = [],
  initialValues = {
    title: "",
    description: "",
    assignedTo: "",
    status: TaskStatusEnum.TODO,
  },
  isLoading = false,
  title = "Create New Task",
  submitText = "Create Task",
}) {
  const [files, setFiles] = useState([]);

  const form = useForm({
    mode: "uncontrolled",
    initialValues,
    validate: {
      title: (value) => (!value.trim() ? "Title is required" : null),
    },
  });

  const memberOptions = members.map((member) => ({
    value: member.user._id,
    label: member.user.fullName || member.user.username,
  }));

  const handleSubmit = (values) => {
    onSubmit(values, files);
    form.reset();
    setFiles([]);
  };

  const handleClose = () => {
    form.reset();
    setFiles([]);
    onClose();
  };

  const ValueComponent = ({ value }) => {
    if (!value?.length) return null;

    return (
      <Group gap="sm" py="xs">
        {Array.from(value).map((file, index) => (
          <Group key={index} gap="xs">
            <IconFile size={16} />
            <Text size="sm">{file.name}</Text>
            <IconX
              size={14}
              style={{ cursor: "pointer" }}
              onClick={(e) => {
                e.stopPropagation();
                setFiles(files.filter((_, i) => i !== index));
              }}
            />
          </Group>
        ))}
      </Group>
    );
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
            label="Task Title"
            placeholder="Enter task title"
            required
            {...form.getInputProps("title")}
            data-autofocus
          />
          <Textarea
            label="Description"
            placeholder="Enter task description"
            minRows={3}
            {...form.getInputProps("description")}
          />
          <Select
            label="Assigned To"
            placeholder="Select team member"
            data={memberOptions}
            clearable
            {...form.getInputProps("assignedTo")}
          />
          <Select
            label="Status"
            placeholder="Select status"
            data={[
              { value: TaskStatusEnum.TODO, label: "To Do" },
              { value: TaskStatusEnum.IN_PROGRESS, label: "In Progress" },
              { value: TaskStatusEnum.DONE, label: "Done" },
            ]}
            defaultValue={TaskStatusEnum.TODO}
            {...form.getInputProps("status")}
          />
          <FileInput
            label="Attachments"
            placeholder="Upload files"
            multiple
            accept="image/*, application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            icon={<IconUpload size={14} />}
            value={files}
            onChange={setFiles}
            valueComponent={ValueComponent}
            clearable
          />
          <Button type="submit" loading={isLoading} fullWidth mt="md">
            {submitText}
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
