import {
  Alert,
  Anchor,
  Box,
  Button,
  PasswordInput,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconAlertCircle } from "@tabler/icons-react";
import { useState } from "react";
import useAuthStore from "../../store/authStore";

export default function RegisterForm({ onLoginClick }) {
  const { register, isLoading } = useAuthStore();
  const [registerError, setRegisterError] = useState(null);
  const [success, setSuccess] = useState(false);

  const form = useForm({
    initialValues: {
      fullName: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validate: {
      fullName: (value) =>
        value.length < 3 ? "Name must be at least 3 characters" : null,
      username: (value) =>
        /^[a-zA-Z0-9_]+$/.test(value)
          ? null
          : "Username can only contain letters, numbers and underscore",
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      password: (value) =>
        value.length < 6 ? "Password must be at least 6 characters" : null,
      confirmPassword: (value, values) =>
        value !== values.password ? "Passwords do not match" : null,
    },
  });

  const handleSubmit = async (values) => {
    setRegisterError(null);
    setSuccess(false);

    try {
      const userData = {
        fullName: values.fullName,
        username: values.username,
        email: values.email,
        password: values.password,
      };

      await register(userData);
      setSuccess(true);
      form.reset();
    } catch (error) {
      setRegisterError(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    }
  };

  return (
    <Box mx="auto" sx={{ maxWidth: 400 }} p="md">
      <Text size="xl" weight={700} mb="md">
        Create your Project Camp account
      </Text>

      {registerError && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Registration Error"
          color="red"
          mb="md"
        >
          {registerError}
        </Alert>
      )}

      {success && (
        <Alert title="Registration Successful" color="green" mb="md">
          Your account has been created. Please check your email to verify your
          account.
        </Alert>
      )}

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput
            required
            label="Full Name"
            placeholder="John Doe"
            {...form.getInputProps("fullName")}
          />

          <TextInput
            required
            label="Username"
            placeholder="johndoe"
            {...form.getInputProps("username")}
          />

          <TextInput
            required
            label="Email"
            placeholder="your@email.com"
            {...form.getInputProps("email")}
          />

          <PasswordInput
            required
            label="Password"
            placeholder="Your password"
            {...form.getInputProps("password")}
          />

          <PasswordInput
            required
            label="Confirm Password"
            placeholder="Confirm your password"
            {...form.getInputProps("confirmPassword")}
          />

          <Button type="submit" loading={isLoading}>
            Register
          </Button>

          <Anchor
            component="button"
            type="button"
            color="dimmed"
            size="xs"
            onClick={onLoginClick}
          >
            Already have an account? Login
          </Anchor>
        </Stack>
      </form>
    </Box>
  );
}
