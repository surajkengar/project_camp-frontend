import { Anchor, Breadcrumbs as MantineBreadcrumbs } from "@mantine/core";
import { Link } from "react-router-dom";

/**
 * Reusable breadcrumbs component
 * @param {Object} props - Component props
 * @param {Array} props.items - Array of breadcrumb items with title and href
 */
export default function Breadcrumbs({ items }) {
  return (
    <MantineBreadcrumbs mb="md" separator="→">
      {items.map((item, index) => (
        <Anchor
          key={index}
          component={Link}
          to={item.href}
          underline={index === items.length - 1 ? false : true}
          color={index === items.length - 1 ? "dimmed" : "blue"}
        >
          {item.title}
        </Anchor>
      ))}
    </MantineBreadcrumbs>
  );
}
