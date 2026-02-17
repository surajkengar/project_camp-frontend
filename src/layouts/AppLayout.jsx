import {
  ActionIcon,
  AppShell,
  Avatar,
  Box,
  Burger,
  Button,
  Container,
  Divider,
  Group,
  Menu,
  NavLink,
  Select,
  Stack,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import {
  IconChecklist,
  IconFolder,
  IconLogout,
  IconNotes,
  IconPlus,
  IconUser,
} from "@tabler/icons-react";
import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import useProjectStore from "../store/projectStore";

export default function AppLayout() {
  const [opened, { toggle, close }] = useDisclosure();
  const { user, isAuthenticated, logout, getUserAvatar } = useAuthStore();
  const { projects, fetchProjects } = useProjectStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedWorkspace, setSelectedWorkspace] = useState("all");
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  // Fix the currentPath logic to correctly identify the active navigation item
  const getCurrentPath = () => {
    const pathParts = location.pathname.split("/");

    // Handle root path
    if (location.pathname === "/") {
      return "projects";
    }

    // Handle project-specific routes like /projects/:projectId/notes or /projects/:projectId/tasks
    if (
      pathParts.length >= 4 &&
      pathParts[1] === "projects" &&
      (pathParts[3] === "notes" || pathParts[3] === "tasks")
    ) {
      return pathParts[3]; // Return "notes" or "tasks"
    }

    // Default case: first path segment or projects
    return pathParts[1] || "projects";
  };

  const currentPath = getCurrentPath();

  useEffect(() => {
    if (isAuthenticated) {
      fetchProjects().catch(console.error);
    }
  }, [isAuthenticated, fetchProjects]);

  // Set the first project as default when projects are loaded
  useEffect(() => {
    if (
      projects.length > 0 &&
      (selectedWorkspace === "all" || !selectedWorkspace)
    ) {
      const firstProjectId = projects[0].project._id;

      // Only navigate if we're not already on a project page
      const pathParts = location.pathname.split("/");
      if (pathParts[1] !== "projects" || !pathParts[2]) {
        setSelectedWorkspace(firstProjectId);
        navigate(`/projects/${firstProjectId}`);
      }
    }
  }, [projects, selectedWorkspace, navigate, location.pathname]);

  // Extract project ID from URL if present - only when the URL changes
  useEffect(() => {
    const pathParts = location.pathname.split("/");
    if (
      pathParts[1] === "projects" &&
      pathParts[2] &&
      pathParts[2] !== selectedWorkspace
    ) {
      setSelectedWorkspace(pathParts[2]);
    }
  }, [location.pathname, selectedWorkspace]);

  // Close mobile navbar when navigating
  useEffect(() => {
    if (isMobile) {
      close();
    }
  }, [location.pathname, isMobile, close]);

  const handleWorkspaceChange = (value) => {
    navigate(`/projects/${value}`);
    setSelectedWorkspace(value);
  };

  const navItems = [
    {
      label: "Tasks",
      value: "tasks",
      path: "/tasks",
      icon: <IconChecklist size={18} />,
    },
    {
      label: "Notes",
      value: "notes",
      path: "/notes",
      icon: <IconNotes size={18} />,
    },
    {
      label: "Projects",
      value: "projects",
      path: "/projects",
      icon: <IconFolder size={18} />,
    },
  ];

  const handleNavClick = (path) => {
    // For tasks and notes, navigate to the project-specific route if a project is selected
    if (
      (path === "/tasks" || path === "/notes") &&
      selectedWorkspace &&
      selectedWorkspace !== "all"
    ) {
      const routeType = path.substring(1); // Remove the leading slash
      navigate(`/projects/${selectedWorkspace}/${routeType}`);
    } else {
      navigate(path);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  // Create workspace options for the dropdown - without "All Projects" option
  const workspaceOptions = projects.map((projectItem) => ({
    value: projectItem.project._id,
    label: projectItem.project.name,
  }));

  return (
    <AppShell
      header={{ height: 70 }}
      navbar={{
        width: 280,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="md"
      bg={theme.colors.gray[0]}
      style={{ minHeight: "100vh" }}
    >
      <AppShell.Header
        bg={theme.white}
        style={{
          borderBottom: `1px solid ${theme.colors.gray[2]}`,
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <Container fluid h="100%">
          <Group h="100%" position="apart" noWrap px="md">
            <Group spacing="md" noWrap>
              <Burger
                opened={opened}
                onClick={toggle}
                hiddenFrom="sm"
                size="sm"
                color={theme.colors.gray[6]}
              />
              <Title order={3} c="blue.6" style={{ letterSpacing: "-0.5px" }}>
                Project Camp
              </Title>
            </Group>

            {isAuthenticated ? (
              <Group position="apart" noWrap spacing={isMobile ? "xs" : "xl"}>
                <Group spacing="xs" noWrap visibleFrom="xs">
                  {projects.length > 0 ? (
                    <Select
                      placeholder="Select project"
                      data={workspaceOptions}
                      value={selectedWorkspace}
                      onChange={handleWorkspaceChange}
                      style={{ width: isMobile ? "150px" : "200px" }}
                      clearable={false}
                      nothingFound="No projects found"
                      size={isMobile ? "xs" : "sm"}
                    />
                  ) : (
                    <Button
                      variant="light"
                      onClick={() => navigate("/projects")}
                      leftIcon={<IconPlus size={16} />}
                      size="sm"
                    >
                      Create Project
                    </Button>
                  )}
                  <ActionIcon
                    color="blue"
                    variant="light"
                    onClick={() => navigate("/projects")}
                    title="View all projects"
                  >
                    <IconFolder size={18} />
                  </ActionIcon>
                </Group>
                <Menu position="bottom-end" withArrow shadow="md">
                  <Menu.Target>
                    <Group spacing="xs" style={{ cursor: "pointer" }} noWrap>
                      <Avatar
                        src={getUserAvatar()}
                        radius="xl"
                        size="sm"
                        alt={user?.fullName || user?.username}
                        color="blue"
                      />
                      <Text
                        size="sm"
                        weight={500}
                        lineClamp={1}
                        visibleFrom="md"
                      >
                        {user?.fullName || user?.username}
                      </Text>
                    </Group>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item
                      icon={<IconUser size={14} />}
                      onClick={() => navigate("/profile")}
                    >
                      Profile
                    </Menu.Item>
                    <Divider />
                    <Menu.Item
                      color="red"
                      icon={<IconLogout size={14} />}
                      onClick={handleLogout}
                    >
                      Logout
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Group>
            ) : (
              <Button variant="light" onClick={() => navigate("/login")}>
                Login
              </Button>
            )}
          </Group>
        </Container>
      </AppShell.Header>

      <AppShell.Navbar
        p="md"
        bg={theme.white}
        style={{
          borderRight: `1px solid ${theme.colors.gray[2]}`,
        }}
      >
        <Stack spacing="xs">
          {navItems.map((item) => {
            const isActive = currentPath === item.value;

            return (
              <NavLink
                key={item.value}
                label={item.label}
                icon={item.icon}
                active={isActive}
                onClick={() => handleNavClick(item.path)}
                style={{
                  borderRadius: theme.radius.sm,
                  fontWeight: 500,
                }}
                styles={{
                  root: {
                    "&[data-active]": {
                      backgroundColor: `rgba(${theme.colors.blue[6].replace(
                        /rgb\(|\)/g,
                        ""
                      )}, 0.1)`,
                    },
                  },
                  icon: {
                    color: isActive
                      ? theme.colors.blue[6]
                      : theme.colors.gray[6],
                  },
                }}
              />
            );
          })}

          {isMobile && projects.length > 0 && (
            <>
              <Divider my="sm" />
              <Text
                size="xs"
                color="dimmed"
                weight={500}
                transform="uppercase"
                mb="xs"
                px="sm"
              >
                Current Project
              </Text>
              <Select
                placeholder="Select project"
                data={workspaceOptions}
                value={selectedWorkspace}
                onChange={handleWorkspaceChange}
                style={{ width: "100%" }}
                clearable={false}
                nothingFound="No projects found"
                size="sm"
              />
            </>
          )}
        </Stack>

        <Box style={{ marginTop: "auto", paddingTop: "1rem" }}>
          <Divider mb="md" />
          <Text size="xs" color="dimmed" align="center">
            © {new Date().getFullYear()} Project Camp
          </Text>
        </Box>
      </AppShell.Navbar>

      <AppShell.Main bg={theme.colors.gray[0]}>
        <Container size="xl" py="md">
          <Outlet />
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
