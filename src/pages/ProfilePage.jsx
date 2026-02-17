import {
  Avatar,
  Badge,
  Box,
  Card,
  Container,
  Divider,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
  useMantineTheme,
} from "@mantine/core";
import {
  IconBriefcase,
  IconCalendar,
  IconMail,
  IconUser,
} from "@tabler/icons-react";
import { useAuthStore } from "../store";
import { formatDate } from "../utils/dateUtils";

export default function ProfilePage() {
  const { user } = useAuthStore();
  const theme = useMantineTheme();

  if (!user) {
    return (
      <Container size="md" py="xl">
        <Paper p="xl" radius="md" withBorder>
          <Title order={3} align="center" mb="md">
            Authentication Required
          </Title>
          <Text align="center" color="dimmed">
            You must be logged in to view your profile.
          </Text>
        </Paper>
      </Container>
    );
  }

  // Get initials for avatar fallback
  const getInitials = () => {
    if (user.fullName) {
      return user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
    }
    return user.username?.charAt(0).toUpperCase() || "U";
  };

  return (
    <Container size="md" py="xl">
      <Title order={2} mb="xl">
        My Profile
      </Title>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
        {/* Profile Card */}
        <Card shadow="sm" padding="xl" radius="md" withBorder>
          <Stack align="center" spacing="md">
            <Avatar
              src={user.avatar?.url}
              size={120}
              radius={120}
              color="blue"
              mb="md"
            >
              {getInitials()}
            </Avatar>

            <Title order={3}>{user.fullName || "User"}</Title>
            <Text size="lg" c="dimmed">
              @{user.username}
            </Text>

            <Badge size="lg" color="blue" variant="filled">
              {user.role || "Member"}
            </Badge>

            <Text size="sm" c="dimmed" align="center" mt="xs">
              Member since {formatDate(user.createdAt)}
            </Text>
          </Stack>
        </Card>

        {/* User Details */}
        <Card shadow="sm" padding="xl" radius="md" withBorder>
          <Title order={3} mb="xl">
            Account Information
          </Title>

          <Stack spacing="lg">
            <Group>
              <ThemeIcon size="lg" radius="md" color={theme.primaryColor}>
                <IconUser size={18} />
              </ThemeIcon>
              <Box>
                <Text size="sm" c="dimmed">
                  Username
                </Text>
                <Text weight={500}>{user.username}</Text>
              </Box>
            </Group>

            <Divider />

            <Group>
              <ThemeIcon size="lg" radius="md" color={theme.primaryColor}>
                <IconMail size={18} />
              </ThemeIcon>
              <Box>
                <Text size="sm" c="dimmed">
                  Email
                </Text>
                <Text weight={500}>{user.email}</Text>
              </Box>
            </Group>

            <Divider />

            <Group>
              <ThemeIcon size="lg" radius="md" color={theme.primaryColor}>
                <IconBriefcase size={18} />
              </ThemeIcon>
              <Box>
                <Text size="sm" c="dimmed">
                  Role
                </Text>
                <Text weight={500}>{user.role || "Member"}</Text>
              </Box>
            </Group>

            <Divider />

            <Group>
              <ThemeIcon size="lg" radius="md" color={theme.primaryColor}>
                <IconCalendar size={18} />
              </ThemeIcon>
              <Box>
                <Text size="sm" c="dimmed">
                  Account Created
                </Text>
                <Text weight={500}>{formatDate(user.createdAt)}</Text>
              </Box>
            </Group>
          </Stack>
        </Card>
      </SimpleGrid>
    </Container>
  );
}
