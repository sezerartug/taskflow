import { Card, Button, Modal } from "antd";
import { useState } from "react";
import { tasks as initialTasks } from "../data/tasks";
import TaskTable from "../components/TaskTable";
import TaskModal from "../components/TaskModal";

export default function Dashboard() {
  const [tasks, setTasks] = useState(initialTasks);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deleteTask, setDeleteTask] = useState(null);

  const completed = tasks.filter(t => t.status === "Tamamlandı").length;
  const ongoing = tasks.filter(t => t.status === "Devam Ediyor").length;
  const pending = tasks.filter(t => t.status === "Bekliyor").length;

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="Toplam Görev">{tasks.length}</Card>
        <Card title="Tamamlandı">{completed}</Card>
        <Card title="Devam Ediyor">{ongoing}</Card>
        <Card title="Bekliyor">{pending}</Card>
      </div>

      <Card
        title="Görev Listesi"
        extra={
          <Button type="primary" onClick={() => setModalOpen(true)}>
            + Yeni Görev
          </Button>
        }
      >
        <TaskTable
          tasks={tasks}
          onEdit={(task) => {
            setEditingTask(task);
            setModalOpen(true);
          }}
          onDelete={(task) => setDeleteTask(task)}
        />
      </Card>

      <TaskModal
        open={modalOpen}
        task={editingTask}
        onClose={() => {
          setModalOpen(false);
          setEditingTask(null);
        }}
        onAddTask={(updatedTask) =>
          setTasks(prev =>
            prev.some(t => t.id === updatedTask.id)
              ? prev.map(t =>
                  t.id === updatedTask.id ? updatedTask : t
                )
              : [...prev, updatedTask]
          )
        }
      />

      {/* 🔴 SİLME ONAY MODALI */}
      <Modal
        title="Görev Silinecek"
        open={!!deleteTask}
        onCancel={() => setDeleteTask(null)}
        onOk={() => {
          setTasks(prev =>
            prev.filter(t => t.id !== deleteTask.id)
          );
          setDeleteTask(null);
        }}
        okText="Sil"
        okButtonProps={{ danger: true }}
        cancelText="Vazgeç"
      >
        <p>
          <strong>{deleteTask?.title}</strong> görevini silmek
          istediğine emin misin?
        </p>
      </Modal>
    </div>
  );
}
