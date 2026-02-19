import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, Tag } from "antd";
import { useAuth } from "../context/AuthContext";

export default function SortableTaskCard({ task, onEdit, onDelete, onClick }) {
  const { user } = useAuth();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: String(task._id) }); // _id kullan

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? "grabbing" : "grab",
  };

  const statusColor = {
    Bekliyor: "orange",
    "Devam Ediyor": "blue",
    Tamamlandı: "green",
  }[task.status] || "default";

  const canEdit = user && (user.role === "Admin" || user.role === "Project Manager");
  const canDelete = user && user.role === "Admin";

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card
        size="small"
        hoverable
        className="border-l-4 dark:bg-slate-800 dark:border-slate-700 shadow-md"
        style={{ borderLeftColor: statusColor }}
        onClick={onClick}
      >
        <div className="flex justify-between items-start">
          <h4 className="font-medium text-gray-900 dark:text-white">
            {task.title}
          </h4>
          <Tag color={statusColor}>{task.status}</Tag>
        </div>
        {task.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
            {task.description}
          </p>
        )}
        <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
          <span>
            {task.date
              ? new Date(task.date).toLocaleDateString("tr-TR")
              : ""}
          </span>
          <div className="flex gap-2">
            {canEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(task);
                }}
              >
                ✏️
              </button>
            )}
            {canDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(task);
                }}
              >
                🗑️
              </button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}