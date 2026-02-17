import { Button, Container, Stack, Text, Title } from "@mantine/core";
import { IconMoodSad } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Container size="lg" py="xl">
      <Stack align="center" spacing="xl" py={50}>
        <IconMoodSad size={64} color="gray" />
        <Title order={1} align="center">
          404 - Page Not Found
        </Title>
        <Text size="xl" color="dimmed" align="center" maw={500}>
          Sorry, we couldn't find the page you're looking for. The page might
          have been removed, renamed, or doesn't exist.
        </Text>
        <Stack spacing="md" align="center" mt="md">
          <Button size="md" onClick={() => navigate("/projects")}>
            Go to Projects
          </Button>
          <Button variant="subtle" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
}
