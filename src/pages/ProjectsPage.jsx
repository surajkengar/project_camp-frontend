import { Button, Container, Group, LoadingOverlay, Title } from "@mantine/core";
import { useEffect, useState } from "react";
import { EmptyState, ErrorAlert } from "../components/common";
import { ConfirmDeleteModal, ProjectFormModal } from "../components/modals";
import { ProjectTable } from "../components/projects";
import { useAuthStore, useProjectStore } from "../store";
import { canManageMembers } from "../utils/permissions";

export default function ProjectsPage() {
  const {
    projects,
    isLoading,
    error,
    clearError,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
  } = useProjectStore();

  const { user } = useAuthStore();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    // Fetch projects on component mount
    fetchProjects().catch(console.error);
  }, [fetchProjects]);

  const handleCreateProject = async (values) => {
    try {
      await createProject(values);
      // Refresh projects after creating a new one to ensure we have the latest data
      await fetchProjects();
      setCreateModalOpen(false);
    } catch (error) {
      console.error("Failed to create project:", error);
    }
  };

  const openEditModal = (projectItem) => {
    setSelectedProject(projectItem);
    setEditModalOpen(true);
  };

  const openDeleteModal = (projectItem) => {
    setSelectedProject(projectItem);
    setConfirmDeleteOpen(true);
  };

  const handleEditProject = async (values) => {
    if (!selectedProject) return;

    try {
      await updateProject(selectedProject.project._id, values);
      // Refresh projects after updating
      await fetchProjects();
      setEditModalOpen(false);
      setSelectedProject(null);
    } catch (error) {
      console.error("Failed to update project:", error);
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;

    try {
      await deleteProject(selectedProject.project._id);
      setConfirmDeleteOpen(false);
      setSelectedProject(null);
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  };

  // Check if user can create projects (any authenticated user)
  const canCreateProject = !!user; // Allow any authenticated user to create projects

  // Check if user can manage a specific project using the permissions utility
  const canManageProject = (projectItem) => {
    if (!user || !projectItem) return false;

    // The projectItem structure from the API is { project: {...}, role: "..." }
    const role = projectItem.role;

    if (!role) {
      console.warn("Project role is undefined:", projectItem);
      return false;
    }

    // Create a projectMembers array with just this project's membership
    const projectMembers = [
      {
        user: { _id: user._id },
        role: role,
      },
    ];

    // Use the canManageMembers function from permissions.js
    return canManageMembers(user, projectMembers);
  };

  return (
    <Container size="lg" py="xl">
      <LoadingOverlay
        visible={
          isLoading && !createModalOpen && !editModalOpen && !confirmDeleteOpen
        }
        overlayBlur={2}
      />

      <Group justify="space-between" mb="md">
        <Title order={2}>Projects</Title>
        {canCreateProject && (
          <Button onClick={() => setCreateModalOpen(true)}>
            Create New Project
          </Button>
        )}
      </Group>

      {error && (
        <ErrorAlert title="Error" message={error} onClose={clearError} />
      )}

      {projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Create your first project to get started"
          buttonText={canCreateProject ? "Create Your First Project" : ""}
          onButtonClick={
            canCreateProject ? () => setCreateModalOpen(true) : undefined
          }
        />
      ) : (
        <ProjectTable
          projects={projects}
          canManageProject={canManageProject}
          onEdit={openEditModal}
          onDelete={openDeleteModal}
        />
      )}

      {/* Create Project Modal */}
      <ProjectFormModal
        opened={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Project"
        onSubmit={handleCreateProject}
        initialValues={{
          name: "",
          description: "",
        }}
      />

      {/* Edit Project Modal */}
      {selectedProject && (
        <ProjectFormModal
          opened={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedProject(null);
          }}
          title="Edit Project"
          onSubmit={handleEditProject}
          initialValues={{
            name: selectedProject.project.name,
            description: selectedProject.project.description || "",
          }}
        />
      )}

      {/* Confirm Delete Modal */}
      {selectedProject && (
        <ConfirmDeleteModal
          opened={confirmDeleteOpen}
          onClose={() => {
            setConfirmDeleteOpen(false);
            setSelectedProject(null);
          }}
          title="Delete Project"
          message={`Are you sure you want to delete "${selectedProject.project.name}"? This action cannot be undone.`}
          onConfirm={handleDeleteProject}
        />
      )}
    </Container>
  );
}
