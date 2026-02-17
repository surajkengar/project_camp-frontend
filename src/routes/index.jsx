import { Navigate, useRoutes } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import AuthPage from "../pages/AuthPage";
import NotFoundPage from "../pages/NotFoundPage";
import NotesPage from "../pages/NotesPage";
import ProfilePage from "../pages/ProfilePage";
import ProjectDetailsPage from "../pages/ProjectDetailsPage";
import ProjectsPage from "../pages/ProjectsPage";
import TasksPage from "../pages/TasksPage";
import useAuthStore from "../store/authStore";

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default function Router() {
  return useRoutes([
    {
      path: "/login",
      element: <AuthPage />,
    },
    {
      path: "/",
      element: (
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      ),
      children: [
        { path: "", element: <Navigate to="/projects" replace /> },
        { path: "tasks", element: <TasksPage /> },
        { path: "projects/:projectId/tasks", element: <TasksPage /> },
        { path: "notes", element: <NotesPage /> },
        { path: "projects/:projectId/notes", element: <NotesPage /> },
        { path: "profile", element: <ProfilePage /> },
        { path: "projects", element: <ProjectsPage /> },
        { path: "projects/:projectId", element: <ProjectDetailsPage /> },
        // Catch any unmatched routes within the protected area
        { path: "*", element: <NotFoundPage /> },
      ],
    },
    // Catch any unmatched routes outside the protected area
    {
      path: "*",
      element: <NotFoundPage />,
    },
  ]);
}
