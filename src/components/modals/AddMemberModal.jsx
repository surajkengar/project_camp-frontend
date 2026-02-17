import { Button, Modal, Radio, Stack, Text, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import React from "react";
import { UserRolesEnum } from "../../utils/constants";

/**
 * Add member modal component
 * @param {Object} props - Component props
 * @param {boolean} props.opened - Whether the modal is open
 * @param {Function} props.onClose - Function to call when modal is closed
 * @param {Function} props.onSubmit - Function to call when form is submitted
 * @param {boolean} [props.isLoading] - Whether the form is loading
 */
export default function AddMemberModal({
  opened,
  onClose,
  onSubmit,
  isLoading = false,
}) {
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      email: "",
      role: UserRolesEnum.MEMBER,
    },
    validate: {
      email: (value) => {
        if (!value?.trim()) return "Email is required";
        if (!/^\S+@\S+$/.test(value)) return "Invalid email";
        return null;
      },
      role: (value) => (!value ? "Role is required" : null),
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

  // Create role options with user-friendly labels and descriptions
  const roleOptions = [
    {
      value: UserRolesEnum.ADMIN,
      label: "Admin",
      description: "Full access to manage the project and its members",
    },
    {
      value: UserRolesEnum.PROJECT_ADMIN,
      label: "Project Admin",
      description: "Can manage project tasks and content, but not members",
    },
    {
      value: UserRolesEnum.MEMBER,
      label: "Member",
      description: "Basic access to view and contribute to the project",
    },
  ];

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Add Project Members"
      size="md"
      centered
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack spacing="md">
          <TextInput
            label="Email"
            placeholder="Enter email"
            required
            {...form.getInputProps("email")}
            data-autofocus
          />

          <div>
            <Text size="sm" weight={500} mb={5}>
              Role
            </Text>
            <Text size="xs" color="dimmed" mb={10}>
              Select the appropriate permission level for this member
            </Text>

            <Radio.Group {...form.getInputProps("role")} spacing="md">
              {roleOptions.map((option) => (
                <Radio
                  key={option.value}
                  value={option.value}
                  size="sm"
                  label={
                    <>
                      <Text weight={500}>{option.label}</Text>
                      <Text size="xs" color="dimmed">
                        {option.description}
                      </Text>
                    </>
                  }
                  styles={{
                    body: { display: "flex", alignItems: "flex-start" },
                    inner: { marginTop: "4px" },
                    labelWrapper: { marginLeft: "10px" },
                  }}
                  mb={10}
                />
              ))}
            </Radio.Group>
          </div>

          <Button type="submit" loading={isLoading} fullWidth mt="md">
            Add Member
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
