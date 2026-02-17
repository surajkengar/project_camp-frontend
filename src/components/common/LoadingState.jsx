import { LoadingOverlay } from "@mantine/core";

/**
 * Reusable loading overlay component
 * @param {Object} props - Component props
 * @param {boolean} props.visible - Whether the loading overlay is visible
 */
export default function LoadingState({ visible }) {
  return <LoadingOverlay visible={visible} overlayBlur={2} />;
}
