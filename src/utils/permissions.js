import { UserRolesEnum } from "./constants";

/**
 * Find the user's role in a specific project
 * @param {Object} user - Current user
 * @param {Array} projectMembers - Project members
 * @returns {string|null} - User's role in the project or null if not a member
 */
const getUserProjectRole = (user, projectMembers) => {
  if (!user || !projectMembers || !Array.isArray(projectMembers)) return null;

  const userMembership = projectMembers.find(
    (member) => member.user._id === user._id
  );

  return userMembership ? userMembership.role : null;
};

/**
 * Check if user can manage project members
 * @param {Object} user - Current user
 * @param {Array} projectMembers - Project members
 * @returns {boolean} - Whether user can manage project members
 */
export const canManageMembers = (user, projectMembers) => {
  if (!user) return false;

  // Check user's role in this specific project
  const userRole = getUserProjectRole(user, projectMembers);

  // Only project admin can manage members
  return userRole === UserRolesEnum.ADMIN;
};

/**
 * Check if user can create tasks
 * @param {Object} user - Current user
 * @param {Array} projectMembers - Project members
 * @returns {boolean} - Whether user can create tasks
 */
export const canCreateTask = (user, projectMembers) => {
  if (!user) return false;

  // Check user's role in this specific project
  const userRole = getUserProjectRole(user, projectMembers);

  // Project admin and project_admin can create tasks
  return (
    userRole === UserRolesEnum.ADMIN || userRole === UserRolesEnum.PROJECT_ADMIN
  );
};

/**
 * Check if user can edit a task
 * @param {Object} user - Current user
 * @param {Array} projectMembers - Project members
 * @returns {boolean} - Whether user can edit the task
 */
export const canEditTask = (user, projectMembers) => {
  if (!user) return false;

  // Check user's role in this specific project
  const userRole = getUserProjectRole(user, projectMembers);

  // Project admin and project_admin can edit tasks
  return (
    userRole === UserRolesEnum.ADMIN || userRole === UserRolesEnum.PROJECT_ADMIN
  );
};

/**
 * Check if user can create notes
 * @param {Object} user - Current user
 * @param {Array} projectMembers - Project members
 * @returns {boolean} - Whether user can create notes
 */
export const canCreateNote = (user, projectMembers) => {
  if (!user) return false;

  // Check user's role in this specific project
  const userRole = getUserProjectRole(user, projectMembers);

  // Only project admin can create notes
  return userRole === UserRolesEnum.ADMIN;
};

/**
 * Check if user can edit a note
 * @param {Object} user - Current user
 * @param {Array} projectMembers - Project members
 * @returns {boolean} - Whether user can edit the note
 */
export const canEditNote = (user, projectMembers) => {
  if (!user) return false;

  // Check user's role in this specific project
  const userRole = getUserProjectRole(user, projectMembers);

  // Only project admin can edit notes
  return userRole === UserRolesEnum.ADMIN;
};

/**
 * Check if user can delete a note
 * @param {Object} user - Current user
 * @param {Array} projectMembers - Project members
 * @returns {boolean} - Whether user can delete the note
 */
export const canDeleteNote = (user, projectMembers) => {
  if (!user) return false;

  // Check user's role in this specific project
  const userRole = getUserProjectRole(user, projectMembers);

  // Only project admin can delete notes
  return userRole === UserRolesEnum.ADMIN;
};

/**
 * Check if user can create a project
 * @param {Object} user - Current user
 * @returns {boolean} - Whether user can create a project
 */
export const canCreateProject = (user) => {
  if (!user) return false;

  // Any authenticated user can create a project
  return true;
};

/**
 * Check if user can edit a project
 * @param {Object} user - Current user
 * @param {Array} projectMembers - Project members
 * @returns {boolean} - Whether user can edit the project
 */
export const canEditProject = (user, projectMembers) => {
  if (!user) return false;

  // Check user's role in this specific project
  const userRole = getUserProjectRole(user, projectMembers);

  // Only project admin can edit projects
  return userRole === UserRolesEnum.ADMIN;
};

/**
 * Check if user can delete a project
 * @param {Object} user - Current user
 * @param {Array} projectMembers - Project members
 * @returns {boolean} - Whether user can delete the project
 */
export const canDeleteProject = (user, projectMembers) => {
  if (!user) return false;

  // Check user's role in this specific project
  const userRole = getUserProjectRole(user, projectMembers);

  // Only project admin can delete projects
  return userRole === UserRolesEnum.ADMIN;
};

/**
 * Check if user can create a subtask
 * @param {Object} user - Current user
 * @param {Array} projectMembers - Project members
 * @returns {boolean} - Whether user can create a subtask
 */
export const canCreateSubtask = (user, projectMembers) => {
  if (!user) return false;

  // Check user's role in this specific project
  const userRole = getUserProjectRole(user, projectMembers);

  // Project admin and project_admin can create subtasks
  return (
    userRole === UserRolesEnum.ADMIN || userRole === UserRolesEnum.PROJECT_ADMIN
  );
};

/**
 * Check if user can update a subtask
 * @param {Object} user - Current user
 * @param {Array} projectMembers - Project members
 * @returns {boolean} - Whether user can update a subtask
 */
export const canUpdateSubtask = (user, projectMembers) => {
  if (!user) return false;

  // Any project member can update subtasks (completion status only)
  // Check if user is a member of the project
  return getUserProjectRole(user, projectMembers) !== null;
};

/**
 * Check if user can delete a subtask
 * @param {Object} user - Current user
 * @param {Array} projectMembers - Project members
 * @returns {boolean} - Whether user can delete a subtask
 */
export const canDeleteSubtask = (user, projectMembers) => {
  if (!user) return false;

  // Check user's role in this specific project
  const userRole = getUserProjectRole(user, projectMembers);

  // Project admin and project_admin can delete subtasks
  return (
    userRole === UserRolesEnum.ADMIN || userRole === UserRolesEnum.PROJECT_ADMIN
  );
};

/**
 * Check if a member can be removed from a project
 * @param {Object} currentUser - Current user attempting the removal
 * @param {Object} memberToRemove - Member to be removed
 * @param {Array} projectMembers - Project members
 * @returns {Object} - Result object with status and message
 */
export const canRemoveMember = (
  currentUser,
  memberToRemove,
  projectMembers
) => {
  // Check if member to remove exists
  if (!memberToRemove) {
    return { allowed: false, message: "Invalid member selected for removal" };
  }

  // Check if current user has admin rights
  const userRole = getUserProjectRole(currentUser, projectMembers);
  if (userRole !== UserRolesEnum.ADMIN) {
    return {
      allowed: false,
      message: "Only project admins can remove members",
    };
  }

  // Get the role of the member to be removed
  const memberRole = getUserProjectRole(memberToRemove, projectMembers);
  if (!memberRole) {
    return {
      allowed: false,
      message: "Selected user is not a member of this project",
    };
  }

  // Prevent admin from removing themselves
  if (currentUser._id === memberToRemove._id) {
    return {
      allowed: false,
      message: "Project admins cannot remove themselves from the project",
    };
  }

  // If all checks pass, allow the removal
  return { allowed: true, message: "" };
};
