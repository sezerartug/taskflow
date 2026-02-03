import { Card, Empty, Tag, Spin } from "antd";
import { useState } from "react";
import TaskDrawer from "./TaskDrawer";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

const statusColumns = [
  { key: "Bekliyor", title: "⏳ Bekliyor", color: "orange" },
  { key: "Devam Ediyor", title: "🚀 Devam Ediyor", color: "blue" },
  { key: "Tamamlandı", title: "✅ Tamamlandı", color: "green" },
];

export default function TaskKanban({
  tasks,
  onEdit,
  onDelete,
  loading,
  currentPage = 1,
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const tasksPerColumn = 6;

  // Her kolon için o sayfadaki görevleri hesapla
  const getTasksForColumn = (status) => {
    const columnTasks = tasks.filter((task) => task.status === status);
    const startIndex = (currentPage - 1) * tasksPerColumn;
    const endIndex = startIndex + tasksPerColumn;
    return columnTasks.slice(startIndex, endIndex);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-2 text-gray-500">Görevler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statusColumns.map((column) => {
          const columnTasks = getTasksForColumn(column.key);
          const totalTasks = tasks.filter(
            (task) => task.status === column.key,
          ).length;
          const totalPages = Math.ceil(totalTasks / tasksPerColumn);
          const showingTasks = columnTasks.length;
          const hasMoreTasks = totalTasks > currentPage * tasksPerColumn;
          const hasPreviousTasks = currentPage > 1;

          return (
            <div key={column.key} className="space-y-2">
              {/* Kolon başlığı */}
              <div className="flex items-center justify-between mb-2 p-2 pl-5 bg-gray-50 dark:bg-slate-800 rounded-lg">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <span className="dark:text-white">{column.title}</span>
                  <Tag color={column.color}>
                    {totalTasks} görev
                    {showingTasks < totalTasks &&
                      ` (${showingTasks} gösteriliyor)`}
                  </Tag>
                </h3>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Sayfa {currentPage}/{totalPages || 1}
                </div>
              </div>

              {/* Görev kartları */}
              <div className="space-y-3 min-h-50">
                {columnTasks.length > 0 ? (
                  columnTasks.map((task) => (
                    <Card
                      key={task.id}
                      size="small"
                      hoverable
                      className="cursor-pointer border-l-4 dark:bg-slate-800 dark:border-slate-700 min-h-30"
                      style={{ borderLeftColor: column.color }}
                      onClick={() => {
                        setSelectedTask(task);
                        setDrawerOpen(true);
                      }}
                    >
                      <div className="flex flex-col h-full p-1">
                        <div className="[&_h4]:text-gray-900 dark:[&_h4]:text-white">
                          <h4 className="font-medium text-base leading-tight text-gray-900 dark:text-white !important">
                            {task.title}
                          </h4>
                        </div>

                        <div className="mb-3 flex-1">
                          <p className="text-sm text-gray-500 dark:text-gray-300">
                            {task.description || "Açıklama yok"}
                          </p>
                        </div>

                        <div className="flex justify-between items-center text-xs pt-2">
                          <span className="text-gray-500 dark:text-gray-400">
                            {task.date
                              ? new Date(task.date).toLocaleDateString("tr-TR")
                              : "Tarih yok"}
                          </span>
                          <div className="flex gap-2">
                            <button
                              className=" text-blue-500 hover:text-blue-700 dark:text-blue-400"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(task);
                              }}
                              title="Düzenle"
                            >
                              <EditOutlined style={{ fontSize: "16px" }} />
                            </button>
                            <button
                              className="text-red-500 hover:text-red-700 dark:text-red-400"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(task);
                              }}
                              title="Sil"
                            >
                              <DeleteOutlined style={{ fontSize: "16px" }} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <Empty
                    description={
                      hasPreviousTasks ? "Bu sayfada görev yok" : "Görev yok"
                    }
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    className="py-8 dark:text-gray-400"
                  />
                )}

                {/* Bilgi mesajları */}
                {hasMoreTasks && (
                  <div className="text-center pt-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Sonraki sayfada{" "}
                      {Math.min(
                        totalTasks - currentPage * tasksPerColumn,
                        tasksPerColumn,
                      )}{" "}
                      görev daha var
                    </p>
                  </div>
                )}

                {hasPreviousTasks && columnTasks.length === 0 && (
                  <div className="text-center pt-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Önceki sayfalarda görevler var
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <TaskDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        task={selectedTask}
      />
    </div>
  );
}
