import {
  Card,
  Button,
  message,
  Input,
  Pagination,
  Select,
  Modal,
  DatePicker,
  Avatar,
} from "antd";
import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../context/AuthContext";
import { userApi } from "../api/userApi";
import DragDropKanban from "../components/DragDropKanban";
import TaskModal from "../components/TaskModal";
import TaskStats from "../components/TaskStats";
import TaskDrawer from "../components/TaskDrawer";
import { exportToCSV } from "../utils/exportToCSV";
import { DownloadOutlined, UserOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import {
  fetchTasks,
  addTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
} from "../features/task/taskSlice";
import { useSearchParams } from "react-router-dom";

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

export default function Dashboard() {
  const dispatch = useDispatch();
  const { items: tasks, loading, error } = useSelector((state) => state.tasks);
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [users, setUsers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deleteTaskState, setDeleteTaskState] = useState(null);

  // ✅ ARTIK STATE YOK! Sadece URL'den hesaplanan değerler
  // drawerTask ve drawerOpen'ı state olarak tutmuyoruz

  // Filtreleme state'leri
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  const [globalPage, setGlobalPage] = useState(1);
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [dateRange, setDateRange] = useState(null);
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");

  // 📌 Görevleri yükle
  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  // 📌 Kullanıcı listesini yükle (atama filtresi için)
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await userApi.getAll();
        setUsers(res.data);
      } catch (error) {
        console.error("Kullanıcılar yüklenemedi:", error);
      }
    };
    loadUsers();
  }, []);

  // 📌 Hata mesajını göster
  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  // 📌 URL'deki task parametresini bul
  const taskIdFromUrl = searchParams.get("task");

  // 📌 DERIVED STATE: URL'deki task parametresine göre task'ı bul
  const drawerTask = useMemo(() => {
    if (taskIdFromUrl && tasks.length > 0) {
      return tasks.find((t) => String(t._id) === String(taskIdFromUrl));
    }
    return null;
  }, [taskIdFromUrl, tasks]);

  // 📌 DERIVED STATE: Drawer'ın açık olup olmadığı (URL'de task varsa açık)
  const drawerOpen = !!drawerTask;

  // 📌 Görev durumunu güncelle (drag & drop)
  const handleStatusChange = async (taskId, newStatus) => {
    const task = tasks.find((t) => String(t._id) === String(taskId));
    if (!task || task.status === newStatus) return;
    try {
      await dispatch(
        updateTaskStatus({
          id: taskId,
          status: newStatus,
        }),
      ).unwrap();
      message.success(`✅ Görev "${newStatus}" durumuna taşındı!`);
    } catch {
      message.error("Görev güncellenemedi!");
    }
  };

  // 📌 Drawer'ı kapat - sadece URL'yi temizle
  const handleDrawerClose = () => {
    setSearchParams({}); // URL'yi temizle, drawer otomatik kapanır
  };

  // 📌 Görev kartına tıklanınca - URL'yi güncelle
  const handleTaskClick = (task) => {
    setSearchParams({ task: task._id }); // URL'yi güncelle, drawer otomatik açılır
  };

  // 📌 Filtrelenmiş ve sıralanmış görevler
  const filteredAndSortedTasks = useMemo(() => {
    let result = [...tasks];

    // 1. Metin araması
    if (searchText.trim()) {
      const query = searchText.toLowerCase();
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          (task.description && task.description.toLowerCase().includes(query)),
      );
    }

    // 2. Durum filtresi
    if (statusFilter !== "all") {
      result = result.filter((task) => task.status === statusFilter);
    }

    // 3. Öncelik filtresi
    if (priorityFilter !== "all") {
      result = result.filter((task) => task.priority === priorityFilter);
    }

    // 4. Atanan kişi filtresi - _id ile karşılaştır
    if (assigneeFilter !== "all") {
      result = result.filter((task) =>
        task.assignedTo?.some((id) => String(id) === String(assigneeFilter)),
      );
    }

    // 5. Etiket filtresi
    if (tagFilter !== "all") {
      result = result.filter(
        (task) => task.tags && task.tags.includes(tagFilter),
      );
    }

    // 6. Tarih aralığı filtresi
    if (dateRange && dateRange[0] && dateRange[1]) {
      const startDate = dateRange[0].startOf("day").valueOf();
      const endDate = dateRange[1].endOf("day").valueOf();
      result = result.filter((task) => {
        if (!task.date) return false;
        const taskDate = dayjs(task.date).valueOf();
        return taskDate >= startDate && taskDate <= endDate;
      });
    }

    // 7. Sıralama
    result.sort((a, b) => {
      switch (sortBy) {
        case "title-asc":
          return a.title.localeCompare(b.title);
        case "title-desc":
          return b.title.localeCompare(a.title);
        case "date-asc":
          return new Date(a.date || 0) - new Date(b.date || 0);
        case "date-desc":
          return new Date(b.date || 0) - new Date(a.date || 0);
        case "status":
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    return result;
  }, [
    tasks,
    searchText,
    statusFilter,
    sortBy,
    priorityFilter,
    assigneeFilter,
    dateRange,
    tagFilter,
  ]);

  // 📌 Kolon istatistikleri
  const columnStats = useMemo(() => {
    const bekliyor = filteredAndSortedTasks.filter(
      (t) => t.status === "Bekliyor",
    );
    const devam = filteredAndSortedTasks.filter(
      (t) => t.status === "Devam Ediyor",
    );
    const tamam = filteredAndSortedTasks.filter(
      (t) => t.status === "Tamamlandı",
    );
    return {
      Bekliyor: {
        total: bekliyor.length,
        pages: Math.ceil(bekliyor.length / 6) || 1,
      },
      "Devam Ediyor": {
        total: devam.length,
        pages: Math.ceil(devam.length / 6) || 1,
      },
      Tamamlandı: {
        total: tamam.length,
        pages: Math.ceil(tamam.length / 6) || 1,
      },
    };
  }, [filteredAndSortedTasks]);

  // 📌 Maksimum sayfa sayısı
  const maxPages = useMemo(
    () =>
      Math.max(
        columnStats.Bekliyor.pages,
        columnStats["Devam Ediyor"].pages,
        columnStats.Tamamlandı.pages,
      ),
    [columnStats],
  );

  // CSV Export
  const handleExportCSV = () => {
    exportToCSV(
      filteredAndSortedTasks,
      `taskflow_gorevler_${new Date().toISOString().split("T")[0]}.csv`,
    );
  };

  // 📌 Tüm filtreleri sıfırla
  const resetFilters = () => {
    setSearchText("");
    setStatusFilter("all");
    setSortBy("date-desc");
    setPriorityFilter("all");
    setAssigneeFilter("all");
    setDateRange(null);
    setTagFilter("all");
    setGlobalPage(1);
  };

  // Yeni görev butonu yetkisi: sadece Admin veya Project Manager
  const canCreateTask =
    user && (user.role === "Admin" || user.role === "Project Manager");

  return (
    <div className="space-y-6 min-h-screen">
      <TaskStats tasks={filteredAndSortedTasks} />

      {/* 🔍 Filtreleme ve Sıralama Paneli */}
      <Card
        title="🔍 Filtreleme ve Sıralama"
        className="mb-4 bg-linear-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-900 border-none shadow-lg"
      >
        <div className="flex flex-col gap-4">
          {/* 1. SATIR: Arama ve Durum */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Search
                placeholder="Görev başlığı veya açıklamada ara..."
                allowClear
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setGlobalPage(1);
                }}
                className="w-full"
              />
            </div>
            <div className="w-full md:w-48">
              <Select
                placeholder="Duruma göre filtrele"
                className="w-full"
                value={statusFilter}
                onChange={(value) => {
                  setStatusFilter(value);
                  setGlobalPage(1);
                }}
              >
                <Option value="all">Tüm Durumlar</Option>
                <Option value="Bekliyor">⏳ Bekliyor</Option>
                <Option value="Devam Ediyor">🚀 Devam Ediyor</Option>
                <Option value="Tamamlandı">✅ Tamamlandı</Option>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Select
                placeholder="Sırala"
                className="w-full"
                value={sortBy}
                onChange={(value) => {
                  setSortBy(value);
                  setGlobalPage(1);
                }}
              >
                <Option value="date-desc">📅 Tarihe göre (yeni→eski)</Option>
                <Option value="date-asc">📅 Tarihe göre (eski→yeni)</Option>
                <Option value="title-asc">🔤 A'dan Z'ye</Option>
                <Option value="title-desc">🔤 Z'den A'ya</Option>
                <Option value="status">📌 Duruma göre</Option>
              </Select>
            </div>
          </div>

          {/* 2. SATIR: Öncelik, Atama, Etiket, Tarih Aralığı */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-48">
              <Select
                placeholder="Önceliğe göre filtrele"
                className="w-full"
                value={priorityFilter}
                onChange={(value) => {
                  setPriorityFilter(value);
                  setGlobalPage(1);
                }}
                allowClear
              >
                <Option value="all">Tüm Öncelikler</Option>
                <Option value="Düşük">🟢 Düşük</Option>
                <Option value="Orta">🟠 Orta</Option>
                <Option value="Yüksek">🔴 Yüksek</Option>
              </Select>
            </div>

            <div className="w-full md:w-64">
              <Select
                placeholder="Atanan kişiye göre filtrele"
                className="w-full"
                value={assigneeFilter}
                onChange={(value) => {
                  setAssigneeFilter(value);
                  setGlobalPage(1);
                }}
                allowClear
              >
                <Option value="all">👥 Tüm Kullanıcılar</Option>
                {users.map((u) => (
                  <Option key={u._id} value={String(u._id)}>
                    <div className="flex items-center gap-2">
                      <Avatar
                        src={
                          u.avatar ? `http://localhost:5000${u.avatar}` : null
                        }
                        size="small"
                        icon={<UserOutlined />}
                      />
                      {u.name} ({u.role})
                    </div>
                  </Option>
                ))}
              </Select>
            </div>

            {/* Etiket Filtresi */}
            <div className="w-full md:w-48">
              <Select
                placeholder="Etikete göre filtrele"
                className="w-full"
                value={tagFilter}
                onChange={(value) => {
                  setTagFilter(value);
                  setGlobalPage(1);
                }}
                allowClear
              >
                <Option value="all">🏷️ Tüm Etiketler</Option>
                <Option value="Frontend">🎨 Frontend</Option>
                <Option value="Backend">⚙️ Backend</Option>
                <Option value="Bug">🐞 Bug</Option>
                <Option value="Feature">✨ Feature</Option>
                <Option value="Urgent">🔥 Acil</Option>
                <Option value="Documentation">📄 Dokümantasyon</Option>
              </Select>
            </div>

            <div className="flex-1">
              <RangePicker
                className="w-full"
                format="DD/MM/YYYY"
                placeholder={["Başlangıç Tarihi", "Bitiş Tarihi"]}
                value={dateRange}
                onChange={(dates) => {
                  setDateRange(dates);
                  setGlobalPage(1);
                }}
              />
            </div>
          </div>

          {/* 3. SATIR: Butonlar (mobilde ayrı satır) */}
          <div className="flex flex-col sm:flex-row gap-2 justify-end">
            <Button onClick={resetFilters}>Filtreleri Sıfırla</Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleExportCSV}
              disabled={filteredAndSortedTasks.length === 0}
            >
              CSV Export
            </Button>
          </div>
        </div>
      </Card>

      {/* Görev Panosu Başlığı */}
      <Card className="bg-linear-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-900 border-none shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold dark:text-white">
              📋 Görev Panosu
            </h2>
            <div className="flex gap-4 mt-2 text-sm">
              <span className="text-orange-600 dark:text-orange-400">
                ⏳ Bekliyor: {columnStats.Bekliyor.total}
              </span>
              <span className="text-blue-600 dark:text-blue-400">
                🚀 Devam: {columnStats["Devam Ediyor"].total}
              </span>
              <span className="text-green-600 dark:text-green-400">
                ✅ Tamamlandı: {columnStats.Tamamlandı.total}
              </span>
            </div>
          </div>

          {canCreateTask && (
            <Button
              type="primary"
              onClick={() => setModalOpen(true)}
              size="large"
            >
              + Yeni Görev
            </Button>
          )}
        </div>
      </Card>

      {/* Drag & Drop Kanban Board */}
      <Card className="bg-linear-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-900 border-none shadow-lg">
        <DragDropKanban
          tasks={filteredAndSortedTasks}
          loading={loading}
          currentPage={globalPage}
          onStatusChange={handleStatusChange}
          onEdit={(task) => {
            setEditingTask(task);
            setModalOpen(true);
          }}
          onDelete={(task) => setDeleteTaskState(task)}
          onTaskClick={handleTaskClick}
        />
      </Card>

      {/* Sayfalama */}
      {maxPages > 1 && (
        <Card className="bg-linear-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-900 border-none shadow-lg">
          <div className="flex justify-center">
            <Pagination
              current={globalPage}
              total={maxPages * 10}
              pageSize={1}
              onChange={(page) => setGlobalPage(page)}
              showSizeChanger={false}
              showTotal={() => `Sayfa ${globalPage}/${maxPages}`}
            />
          </div>
        </Card>
      )}

      {/* Görev Ekleme/Düzenleme Modalı */}
      <TaskModal
        open={modalOpen}
        task={editingTask}
        onClose={() => {
          setModalOpen(false);
          setEditingTask(null);
        }}
        onAddTask={async (taskData) => {
          try {
            if (editingTask) {
              await dispatch(
                updateTask({
                  id: editingTask._id,
                  updatedTask: taskData,
                }),
              ).unwrap();
            } else {
              await dispatch(addTask({ task: taskData })).unwrap();
            }
            setModalOpen(false);
            setEditingTask(null);
          } catch (error) {
            console.error("Görev işlemi hatası:", error);
            message.error("İşlem başarısız!");
          }
        }}
      />

      {/* Silme Onay Modalı */}
      <Modal
        title="🗑️ Görev Silinecek"
        open={!!deleteTaskState}
        onCancel={() => setDeleteTaskState(null)}
        onOk={async () => {
          try {
            await dispatch(
              deleteTask({
                id: deleteTaskState._id,
              }),
            ).unwrap();
            setDeleteTaskState(null);
          } catch {
            message.error("Görev silinemedi!");
          }
        }}
        okText="Sil"
        okButtonProps={{ danger: true }}
        cancelText="Vazgeç"
        destroyOnHidden
      >
        <p>
          <strong>{deleteTaskState?.title}</strong> görevini silmek istediğine
          emin misin?
        </p>
      </Modal>

      {/* Görev Detay Drawer'ı - derived state kullanıyor */}
      <TaskDrawer
        open={drawerOpen}
        onClose={handleDrawerClose}
        task={drawerTask}
      />
    </div>
  );
}
