import { Table, Tag, Button } from "antd";
import { useState } from "react";
import TaskDrawer from "./TaskDrawer";

export default function TaskTable({ tasks, onEdit, onDelete }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const columns = [
    {
      title: "Başlık",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Durum",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "default";
        if (status === "Tamamlandı") color = "green";
        if (status === "Devam Ediyor") color = "blue";
        if (status === "Bekliyor") color = "orange";

        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "İşlemler",
      key: "action",
      render: (_, record) => (
        <div className="flex flex-wrap gap-2">
          <Button
            type="link"
            onClick={() => {
              setSelectedTask(record);
              setDrawerOpen(true);
            }}
          >
            Detay
          </Button>

          <Button
            type="link"
            onClick={() => onEdit(record)}
          >
            Düzenle
          </Button>

          <Button
            type="link"
            danger
            onClick={() => onDelete(record)}
          >
            Sil
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Table
        columns={columns}
        dataSource={tasks}
        rowKey="id"
        pagination={{ pageSize: 6 }}
        scroll={{ x: true }}
      />

      <TaskDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        task={selectedTask}
      />
    </>
  );
}
