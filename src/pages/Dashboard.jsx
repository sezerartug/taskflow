import {
  Card,
  Button,
  Modal,
  message,
  Input,
  Pagination,
  Select,
  Tag,
} from "antd";
import { useEffect, useState, useMemo, useCallback } from "react";
import TaskKanban from "../components/TaskKanban";
import TaskModal from "../components/TaskModal";
import { taskApi } from "../api/taskApi";

const { Search } = Input;
const { Option } = Select;

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deleteTask, setDeleteTask] = useState(null);

  // Arama, filtreleme, sıralama state'leri
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");

  // Global page state - TÜM kolonlar için ortak
  const [globalPage, setGlobalPage] = useState(1);

  // 🔄 API'DEN TASK ÇEK
  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await taskApi.getAll();
      setTasks(res.data);
      setGlobalPage(1); // Yeni veride 1. sayfaya dön
    } catch (error) {
      console.error("Görev yükleme hatası:", error);
      message.error("Görevler yüklenemedi. Server'ı kontrol edin.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Filtrelenmiş ve sıralanmış görevler
  const filteredAndSortedTasks = useMemo(() => {
    let result = [...tasks];

    if (searchText.trim()) {
      const query = searchText.toLowerCase();
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          (task.description && task.description.toLowerCase().includes(query)),
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((task) => task.status === statusFilter);
    }

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
  }, [tasks, searchText, statusFilter, sortBy]);

  // Her kolon için görev sayılarını hesapla
  const columnStats = useMemo(() => {
    const bekliyorTasks = filteredAndSortedTasks.filter(
      (t) => t.status === "Bekliyor",
    );
    const devamTasks = filteredAndSortedTasks.filter(
      (t) => t.status === "Devam Ediyor",
    );
    const tamamlandiTasks = filteredAndSortedTasks.filter(
      (t) => t.status === "Tamamlandı",
    );

    return {
      Bekliyor: {
        total: bekliyorTasks.length,
        pages: Math.ceil(bekliyorTasks.length / 6),
      },
      "Devam Ediyor": {
        total: devamTasks.length,
        pages: Math.ceil(devamTasks.length / 6),
      },
      Tamamlandı: {
        total: tamamlandiTasks.length,
        pages: Math.ceil(tamamlandiTasks.length / 6),
      },
    };
  }, [filteredAndSortedTasks]);

  // Tüm kolonların maksimum sayfa sayısını bul
  const maxPages = useMemo(() => {
    return Math.max(
      columnStats.Bekliyor.pages,
      columnStats["Devam Ediyor"].pages,
      columnStats["Tamamlandı"].pages,
    );
  }, [columnStats]);

  return (
    <div className=" space-y-6 min-h-screen">
      {/* FİLTRELEME ve SIRALAMA PANELİ */}
      <Card title="Filtreleme ve Sıralama" className="mb-4">
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
              <Option value="Bekliyor"> Bekliyor</Option>
              <Option value="Devam Ediyor"> Devam Ediyor</Option>
              <Option value="Tamamlandı">Tamamlandı</Option>
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
              <Option value="date-desc">Tarihe göre (yeniden eskiye)</Option>
              <Option value="date-asc">Tarihe göre (eskiden yeniye)</Option>
              <Option value="title-asc"> A'dan Z'ye</Option>
              <Option value="title-desc"> Z'den A'ya</Option>
              <Option value="status"> Duruma göre</Option>
            </Select>
          </div>

          <Button
            onClick={() => {
              setSearchText("");
              setStatusFilter("all");
              setSortBy("date-desc");
              setGlobalPage(1);
            }}
          >
            Filtreleri Sıfırla
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {searchText && (
            <Tag closable onClose={() => setSearchText("")}>
              Arama: "{searchText}"
            </Tag>
          )}
          {statusFilter !== "all" && (
            <Tag
              color={
                statusFilter === "Bekliyor"
                  ? "orange"
                  : statusFilter === "Devam Ediyor"
                    ? "blue"
                    : "green"
              }
              closable
              onClose={() => setStatusFilter("all")}
            >
              Durum: {statusFilter}
            </Tag>
          )}
          {sortBy !== "date-desc" && (
            <Tag closable onClose={() => setSortBy("date-desc")}>
              Sıralama:{" "}
              {sortBy === "date-asc"
                ? "Tarih (E-Y)"
                : sortBy === "title-asc"
                  ? "A-Z"
                  : sortBy === "title-desc"
                    ? "Z-A"
                    : "Durum"}
            </Tag>
          )}
        </div>
      </Card>

      {/* ARAMA SONUÇ BİLGİSİ */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold dark:text-white">
              Görev Panosu
            </h2>
            <div className="flex gap-4 mt-2 text-xs">
              <span>
                ⏳ Bekliyor: {columnStats.Bekliyor.total} görev (
                {columnStats.Bekliyor.pages} sayfa)
              </span>
              <span>
                🚀 Devam: {columnStats["Devam Ediyor"].total} görev (
                {columnStats["Devam Ediyor"].pages} sayfa)
              </span>
              <span>
                ✅ Tamamlandı: {columnStats["Tamamlandı"].total} görev (
                {columnStats["Tamamlandı"].pages} sayfa)
              </span>
            </div>
          </div>

          <Button type="primary" onClick={() => setModalOpen(true)}>
            + Yeni Görev
          </Button>
        </div>
      </Card>

      {/* GÖREV PANOSU */}
      <Card>
        <TaskKanban
          loading={loading}
          tasks={filteredAndSortedTasks}
          currentPage={globalPage} // Global page bilgisini gönder
          onEdit={(task) => {
            setEditingTask(task);
            setModalOpen(true);
          }}
          onDelete={(task) => setDeleteTask(task)}
        />
      </Card>

      {/* GLOBAL PAGINATION */}
      {maxPages > 1 && (
        <Card>
          <div className="flex justify-center">
            <Pagination
              current={globalPage}
              total={maxPages * 5} // Ant Design total için item sayısı istiyor
              pageSize={1}
              onChange={(page) => setGlobalPage(page)}
              showSizeChanger={false}
              showTotal={() => {
                const pageNum = globalPage;
                return `Sayfa ${pageNum}/${maxPages}`;
              }}
            />
          </div>
        </Card>
      )}

      {/* MODALLAR */}
      <TaskModal
        open={modalOpen}
        task={editingTask}
        onClose={() => {
          setModalOpen(false);
          setEditingTask(null);
        }}
        onAddTask={async (task) => {
          try {
            if (editingTask) {
              await taskApi.update(task.id, task);
              message.success("Görev güncellendi");
            } else {
              await taskApi.create(task);
              message.success("Görev eklendi");
            }

            setModalOpen(false);
            setEditingTask(null);
            loadTasks();
          } catch (error) {
            console.error("Görev işlem hatası detayı:", error);
            message.error(
              "İşlem başarısız: " + (error.message || "Bilinmeyen hata"),
            );
          }
        }}
      />

      <Modal
        title="Görev Silinecek"
        open={!!deleteTask}
        onCancel={() => setDeleteTask(null)}
        onOk={async () => {
          try {
            setLoading(true);
            await taskApi.remove(deleteTask.id);
            message.success("Görev silindi");

            loadTasks();
            setDeleteTask(null);
            setLoading(false);
          } catch (error) {
            setLoading(false);
            console.error("Silme hatası:", error);
            message.error(
              "Silme başarısız: " + (error.message || "Sunucu hatası"),
            );
          }
        }}
        okText="Sil"
        okButtonProps={{ danger: true, loading: loading }}
        cancelText="Vazgeç"
        confirmLoading={loading}
      >
        <p>
          <strong>{deleteTask?.title}</strong> görevini silmek istediğine emin
          misin?
        </p>
      </Modal>
    </div>
  );
}
