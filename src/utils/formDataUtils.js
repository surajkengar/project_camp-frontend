/**
 * Utility functions for handling FormData
 */

/**
 * Creates a FormData object from a task data object
 * @param {Object} taskData - The task data object
 * @param {Array} attachments - Optional array of file attachments
 * @returns {FormData} - FormData object ready to be sent to the API
 */
export const createTaskFormData = (taskData, attachments = []) => {
  const formData = new FormData();

  // Add task data to form
  Object.keys(taskData).forEach((key) => {
    // Skip null or undefined values
    if (taskData[key] !== null && taskData[key] !== undefined) {
      // Handle special case for assignedTo which might be an object
      if (
        key === "assignedTo" &&
        typeof taskData[key] === "object" &&
        taskData[key]._id
      ) {
        formData.append(key, taskData[key]._id);
      } else {
        formData.append(key, taskData[key]);
      }
    }
  });

  // Add attachments if any
  if (attachments && attachments.length > 0) {
    Array.from(attachments).forEach((file) => {
      if (file instanceof File) {
        formData.append("attachments", file);
      }
    });
  }

  return formData;
};

/**
 * Creates a simple JSON object for task status updates
 * @param {Object} task - The original task object
 * @param {String} newStatus - The new status value
 * @returns {Object} - Object ready to be sent to the API
 */
export const createStatusUpdateData = (task, newStatus) => {
  // Properly handle assignedTo which could be an object or an ID string
  let assignedTo = null;

  if (task.assignedTo) {
    // If assignedTo is an object with _id property, use that
    if (typeof task.assignedTo === "object" && task.assignedTo._id) {
      assignedTo = task.assignedTo._id;
    }
    // If it's already a string ID, use it directly
    else if (typeof task.assignedTo === "string") {
      assignedTo = task.assignedTo;
    }
  }

  // Create update data with all necessary fields
  return {
    status: newStatus,
    title: task.title,
    description: task.description || "",
    assignedTo: assignedTo, // Always include assignedTo, even if null
  };
};
