import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import {
  LoadingOverlay,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTaskStore } from "../../../store";
import { TaskStatusEnum } from "../../../utils/constants";
import TaskCard from "../TaskCard";

/**
 * Kanban board component for visualizing tasks in columns by status
 * @param {Object} props - Component props
 * @param {Array} props.tasks - Array of tasks to display
 * @param {Function} props.onTaskClick - Function to call when a task is clicked
 * @param {Function} props.onDragEnd - Function to handle drag end event
 */
export default function KanbanBoard({ tasks = [], onTaskClick, onDragEnd }) {
  const { projectId } = useParams();
  const { isLoading } = useTaskStore();
  const [columns, setColumns] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const theme = useMantineTheme();

  // Group tasks by status whenever tasks array changes
  useEffect(() => {
    const groupedTasks = Object.values(TaskStatusEnum).reduce(
      (acc, status) => ({
        ...acc,
        [status]: tasks.filter((task) => task.status === status),
      }),
      {}
    );

    setColumns(groupedTasks);
  }, [tasks]);

  const getColumnColor = (status) => {
    const colors = {
      [TaskStatusEnum.TODO]: theme.colors.blue[0],
      [TaskStatusEnum.IN_PROGRESS]: theme.colors.yellow[0],
      [TaskStatusEnum.DONE]: theme.colors.green[0],
    };
    return colors[status] || theme.colors.gray[0];
  };

  const getColumnTitle = (status) => {
    const titles = {
      [TaskStatusEnum.TODO]: "To Do",
      [TaskStatusEnum.IN_PROGRESS]: "In Progress",
      [TaskStatusEnum.DONE]: "Done",
    };
    return titles[status] || status;
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (result) => {
    setIsDragging(false);

    const { destination, source } = result;

    // Return if dropped outside or in the same position
    if (
      !destination ||
      (destination.droppableId === source.droppableId &&
        destination.index === source.index)
    ) {
      return;
    }

    // Update columns state
    setColumns((prevColumns) => {
      const sourceColumn = [...prevColumns[source.droppableId]];
      const destColumn = [...prevColumns[destination.droppableId]];

      // Get the task and update its status
      const [movedTask] = sourceColumn.splice(source.index, 1);
      const updatedTask = { ...movedTask, status: destination.droppableId };

      // Insert task at new position
      destColumn.splice(destination.index, 0, updatedTask);

      return {
        ...prevColumns,
        [source.droppableId]: sourceColumn,
        [destination.droppableId]: destColumn,
      };
    });

    // Call parent's onDragEnd to handle API update
    if (onDragEnd) {
      onDragEnd(result);
    }
  };

  return (
    <div>
      <LoadingOverlay visible={isLoading} overlayBlur={2} />

      <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <SimpleGrid cols={3} spacing="md">
          {Object.entries(columns).map(([status, statusTasks]) => (
            <Droppable droppableId={status} key={status}>
              {(provided, snapshot) => (
                <Paper
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  p="md"
                  radius="md"
                  withBorder
                  style={{
                    minHeight: "70vh",
                    backgroundColor: getColumnColor(status),
                    borderColor: snapshot.isDraggingOver
                      ? theme.colors.blue[5]
                      : theme.colors.gray[3],
                    borderWidth: snapshot.isDraggingOver ? 2 : 1,
                    transition: "all 0.2s ease",
                    boxShadow: snapshot.isDraggingOver
                      ? "0 0 10px rgba(0, 0, 0, 0.1)"
                      : "none",
                  }}
                >
                  <Stack>
                    <Title order={4}>
                      {getColumnTitle(status)} ({statusTasks.length})
                    </Title>

                    {statusTasks.map((task, index) => (
                      <Draggable
                        key={`task-${task._id}`}
                        draggableId={`task-${task._id}`}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => {
                              if (!isDragging && onTaskClick) {
                                onTaskClick(task._id);
                              }
                            }}
                            style={{
                              ...provided.draggableProps.style,
                              marginBottom: "8px",
                              opacity: snapshot.isDragging ? 0.8 : 1,
                              transform: snapshot.isDragging
                                ? `${provided.draggableProps.style.transform} scale(1.02)`
                                : provided.draggableProps.style.transform,
                            }}
                          >
                            <TaskCard
                              task={task}
                              projectId={projectId}
                              isDragging={snapshot.isDragging}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}

                    {statusTasks.length === 0 && (
                      <Text c="dimmed" ta="center" mt="xl">
                        No tasks in this column
                      </Text>
                    )}
                    {provided.placeholder}
                  </Stack>
                </Paper>
              )}
            </Droppable>
          ))}
        </SimpleGrid>
      </DragDropContext>
    </div>
  );
}
