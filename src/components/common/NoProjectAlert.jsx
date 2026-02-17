import { Alert, Button, Container } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

/**
 * Alert component shown when no project is selected
 */
export default function NoProjectAlert() {
  const navigate = useNavigate();

  return (
    <Container size="lg" py="xl">
      <Alert
        icon={<IconAlertCircle size={16} />}
        title="No Project Selected"
        color="blue"
      >
        Please select a project from the header dropdown or create a new
        project.
        <Button
          onClick={() => navigate("/projects")}
          variant="outline"
          fullWidth
          mt="md"
        >
          Go to Projects
        </Button>
      </Alert>
    </Container>
  );
}
