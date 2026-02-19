import { Card, Table, Tag, Button } from "antd";
import { useMemo, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux"; // useDispatch eklendi
import { useAuth } from "../context/AuthContext";
import { EyeOutlined } from "@ant-design/icons";
import TaskDrawer from "../components/TaskDrawer";
import { fetchTasks } from "../features/task/taskSlice"; // fetchTasks eklendi

export default function MyTasks() {
  const dispatch = useDispatch(); // dispatch oluştur
  const { user } = useAuth();
  const { items: tasks, loading } = useSelector((state) => state.tasks);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // 📌 Sayfa yüklendiğinde görevleri getir
  useEffect(() => {
    console.log("📌 MyTasks sayfası yüklendi, fetchTasks dispatch ediliyor...");
    dispatch(fetchTasks());
  }, [dispatch]);

  // Kullanıcıya atanmış görevleri hesapla
  const myTasks = useMemo(() => {
    if (!user) return [];

    const userId = user._id || user.id;
    if (!userId) return [];

    console.log("Mevcut kullanıcı ID:", userId);
    console.log("Tüm görevler:", tasks);

    const filtered = tasks.filter((task) => {
      if (!task.assignedTo || !Array.isArray(task.assignedTo)) {
        return false;
      }

      return task.assignedTo.some((assignee) => {
        const assigneeId = assignee?._id || assignee;
        return String(assigneeId) === String(userId);
      });
    });

    console.log("Filtrelenmiş görevler:", filtered);
    return filtered;
  }, [tasks, user]);

  // Tablo sütunları
  const columns = [
    {
      title: "Başlık",
      dataIndex: "title",
      key: "title",
      render: (title) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {title}
        </span>
      ),
    },
    {
      title: "Durum",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "default";
        let icon = "";
        if (status === "Tamamlandı") {
          color = "green";
          icon = "✅";
        } else if (status === "Devam Ediyor") {
          color = "blue";
          icon = "🚀";
        } else if (status === "Bekliyor") {
          color = "orange";
          icon = "⏳";
        }
        return (
          <Tag color={color} className="flex items-center gap-1">
            {icon} {status}
          </Tag>
        );
      },
    },
    {
      title: "Öncelik",
      dataIndex: "priority",
      key: "priority",
      render: (priority) => {
        let color = "green";
        let icon = "🟢";
        if (priority === "Yüksek") {
          color = "red";
          icon = "🔴";
        } else if (priority === "Orta") {
          color = "orange";
          icon = "🟠";
        }
        return (
          <Tag color={color} className="flex items-center gap-1">
            {icon} {priority}
          </Tag>
        );
      },
    },
    {
      title: "Tarih",
      dataIndex: "date",
      key: "date",
      render: (date) => (
        <span className="text-gray-600 dark:text-gray-400">
          {date ? new Date(date).toLocaleDateString("tr-TR") : "-"}
        </span>
      ),
    },
    {
      title: "İşlem",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          ghost
          icon={<EyeOutlined />}
          onClick={() => {
            setSelectedTask(record);
            setDrawerOpen(true);
          }}
          size="small"
        >
          Görüntüle
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card
        title={
          <div className="flex items-center gap-2">
            <span className="text-xl">📋</span>
            <span>Bana Atanan Görevler</span>
          </div>
        }
        extra={<Button onClick={() => window.history.back()}>Geri Dön</Button>}
      >
        <Table
          dataSource={myTasks}
          columns={columns}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Toplam ${total} görev`,
          }}
          // Table'ın locale kısmını güncelle
          locale={{
            emptyText: (
              <div className="text-center py-16">
                <div className="text-8xl mb-4">📭</div>
                <p className="text-xl text-gray-600 dark:text-gray-300 font-medium mb-2">
                  Size atanmış görev bulunmuyor
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Yöneticiniz size görev atadığında burada görünecek
                </p>
                <Button
                  type="primary"
                  onClick={() => window.history.back()}
                  className="mt-2"
                >
                  Dashboard'a Dön
                </Button>
              </div>
            ),
          }}
        />
      </Card>

      <TaskDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
      />
    </div>
  );
}
