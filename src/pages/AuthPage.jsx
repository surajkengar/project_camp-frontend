import { Container, Paper, Tabs } from "@mantine/core";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/auth/LoginForm";
import RegisterForm from "../components/auth/RegisterForm";
import useAuthStore from "../store/authStore";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleTabChange = (value) => {
    setActiveTab(value);
  };

  return (
    <Container size="xs" py="xl">
      <Paper radius="md" p="xl" withBorder>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tabs.List grow mb="md">
            <Tabs.Tab value="login">Login</Tabs.Tab>
            <Tabs.Tab value="register">Register</Tabs.Tab>
          </Tabs.List>

          {activeTab === "login" ? (
            <LoginForm onRegisterClick={() => setActiveTab("register")} />
          ) : (
            <RegisterForm onLoginClick={() => setActiveTab("login")} />
          )}
        </Tabs>
      </Paper>
    </Container>
  );
}
