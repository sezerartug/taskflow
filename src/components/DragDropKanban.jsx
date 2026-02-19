import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Card, Tag, Spin } from "antd";
import SortableTaskCard from "./SortableTaskCard";
import { useDroppable } from "@dnd-kit/core";

// Normal TaskCard (sürüklenemez, sadece overlay için)
const TaskCard = ({ task, onEdit, onDelete, onClick }) => {
  const statusColor =
    {
      Bekliyor: "orange",
      "Devam Ediyor": "blue",
      Tamamlandı: "green",
    }[task.status] || "default";

  return (
    <Card
      size="small"
      hoverable
      className="border-l-4 dark:bg-slate-800 dark:border-slate-700 shadow-md hover:shadow-xl transition-all"
      style={{ borderLeftColor: statusColor }}
      onClick={onClick}
    >
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-start">
          <h4 className="font-medium text-gray-900 dark:text-white">
            {task.title}
          </h4>
          <Tag color={statusColor}>{task.status}</Tag>
        </div>
        {task.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
            {task.description}
          </p>
        )}
        <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
          <span>
            {task.date ? new Date(task.date).toLocaleDateString("tr-TR") : ""}
          </span>
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(task);
              }}
            >
              ✏️
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task);
              }}
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Kolon bileşeni - droppable alan (MODERN RENKLER)
function Column({ column, tasks, onEdit, onDelete, onTaskClick, currentPage }) {
  const { setNodeRef } = useDroppable({ id: column.key });
  const tasksPerColumn = 6;
  const startIndex = (currentPage - 1) * tasksPerColumn;
  const endIndex = startIndex + tasksPerColumn;
  const paginatedTasks = tasks.slice(startIndex, endIndex);
  const totalTasks = tasks.length;
  const totalPages = Math.ceil(totalTasks / tasksPerColumn) || 1;

  return (
    <div className="space-y-2">
      {/* Kolon başlığı - Modern gradient arka plan */}
      <div className="p-3 bg-linear-to-r from-indigo-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 rounded-lg shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            <span className="text-gray-800 dark:text-white">{column.title}</span>
          </h3>
          <Tag color={column.color} className="font-medium">
            {totalTasks} görev
          </Tag>
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
          Sayfa {currentPage}/{totalPages}
        </div>
      </div>

      {/* Droppable alan */}
      <div ref={setNodeRef} className="space-y-3 min-h-50 p-2 rounded-lg bg-gray-50/50 dark:bg-slate-800/50">
        <SortableContext
          items={paginatedTasks.map((t) => String(t._id))}
          strategy={verticalListSortingStrategy}
        >
          {paginatedTasks.length > 0 ? (
            paginatedTasks.map((task) => (
              <SortableTaskCard
                key={task._id}
                task={task}
                onEdit={onEdit}
                onDelete={onDelete}
                onClick={() => onTaskClick(task)}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-6xl mb-3">📭</div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                Bu kolonda görev yok
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Yeni görev eklemek için "+ Yeni Görev" butonunu kullanın
              </p>
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
}

const statusColumns = [
  {
    key: "column-bekliyor",
    title: "⏳ Bekliyor",
    status: "Bekliyor",
    color: "orange",
  },
  {
    key: "column-devam",
    title: "🚀 Devam Ediyor",
    status: "Devam Ediyor",
    color: "blue",
  },
  {
    key: "column-tamamlandi",
    title: "✅ Tamamlandı",
    status: "Tamamlandı",
    color: "green",
  },
];

export default function DragDropKanban({
  tasks,
  onEdit,
  onDelete,
  onStatusChange,
  onTaskClick,
  loading,
  currentPage = 1,
}) {
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const activeTask = tasks.find((t) => String(t._id) === String(activeId));

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const taskId = active.id;
    const task = tasks.find((t) => String(t._id) === String(taskId));
    if (!task) return;

    let targetColumn = statusColumns.find((col) => col.key === over.id);
    if (!targetColumn) {
      const targetTask = tasks.find((t) => String(t._id) === String(over.id));
      if (targetTask) {
        targetColumn = statusColumns.find(
          (col) => col.status === targetTask.status,
        );
      }
    }

    if (!targetColumn) {
      console.error("Hedef kolon veya görev bulunamadı:", over.id);
      return;
    }

    const newStatus = targetColumn.status;
    if (task.status === newStatus) return;

    console.log("🔄 Status değişiyor:", { taskId: String(taskId), newStatus });
    await onStatusChange(taskId, newStatus);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {statusColumns.map((column) => {
            const columnTasks = tasks.filter((t) => t.status === column.status);
            return (
              <Column
                key={column.key}
                column={column}
                tasks={columnTasks}
                onEdit={onEdit}
                onDelete={onDelete}
                onTaskClick={onTaskClick}
                currentPage={currentPage}
              />
            );
          })}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="opacity-80 rotate-3 scale-105 shadow-xl">
              <TaskCard
                task={activeTask}
                onEdit={onEdit}
                onDelete={onDelete}
                onClick={() => {}}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}