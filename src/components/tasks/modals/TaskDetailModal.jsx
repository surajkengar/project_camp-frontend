import { Modal } from "@mantine/core";
import React from "react";
import TaskDetail from "../TaskDetail";

/**
 * Task detail modal component
 * @param {Object} props - Component props
 * @param {boolean} props.opened - Whether the modal is open
 * @param {Function} props.onClose - Function to call when modal is closed
 * @param {string} props.taskId - ID of the task to display
 */
export default function TaskDetailModal({ opened, onClose, taskId }) {
  return (
    <Modal opened={opened} onClose={onClose} title="Task Details" size="lg">
      <TaskDetail taskId={taskId} onClose={onClose} />
    </Modal>
  );
}
