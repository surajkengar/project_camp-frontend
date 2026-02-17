import { Button, Modal, Select, Stack } from "@mantine/core";
import { useForm } from "@mantine/form";
import React from "react";
import { UserRolesEnum } from "../../utils/constants";

/**
 * Member role modal component
 * @param {Object} props - Component props
 * @param {boolean} props.opened - Whether the modal is open
 * @param {Function} props.onClose - Function to call when modal is closed
 * @param {Function} props.onSubmit - Function to call when form is submitted
 * @param {Object} [props.initialValues] - Initial values for the form
 * @param {boolean} [props.isLoading] - Whether the form is loading
 */
export default function MemberRoleModal({
  opened,
  onClose,
  onSubmit,
  initialValues = { role: "" },
  isLoading = false,
}) {
  const form = useForm({
    mode: "uncontrolled",
    initialValues,
    validate: {
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

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Edit Member Role"
      size="md"
      centered
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack spacing="md">
          <Select
            label="Role"
            placeholder="Select role"
            data={[
              { value: UserRolesEnum.ADMIN, label: "Admin" },
              { value: UserRolesEnum.PROJECT_ADMIN, label: "Project Admin" },
              { value: UserRolesEnum.MEMBER, label: "Member" },
            ]}
            {...form.getInputProps("role")}
            data-autofocus
          />
          <Button type="submit" loading={isLoading} fullWidth mt="md">
            Update Role
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
