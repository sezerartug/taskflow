import { Drawer, Tag, Avatar, Tooltip, Tabs } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useEffect, useState, useCallback } from "react";
import { userApi } from "../api/userApi";
import { assignmentApi } from "../api/assignmentApi";
import { activityApi } from "../api/activityApi";
import SimpleCommentList from "./SimpleCommentList";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/tr";

const TAG_COLORS = {
  Frontend: "blue",
  Backend: "green",
  Bug: "red",
  Feature: "purple",
  Urgent: "orange",
  Documentation: "cyan",
};

const BASE_URL = "http://localhost:5000"; // Backend adresi

dayjs.extend(relativeTime);
dayjs.locale("tr");

export default function TaskDrawer({ open, onClose, task }) {
  const [users, setUsers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      const res = await userApi.getAll();
      setUsers(res.data);
    } catch (error) {
      console.error("Kullanıcılar yüklenemedi:", error);
    }
  }, []);

  const loadAssignments = useCallback(async () => {
    if (!task?._id) return;
    try {
      const res = await assignmentApi.getByTask(task._id);
      setAssignments(res.data);
    } catch (error) {
      console.error("Atama geçmişi yüklenemedi:", error);
    }
  }, [task?._id]);

  const loadActivities = useCallback(async () => {
    if (!task?._id) return;
    try {
      const res = await activityApi.getByTask(task._id);
      setActivities(res.data);
    } catch (error) {
      console.error("Aktivite logları yüklenemedi:", error);
    }
  }, [task?._id]);

  useEffect(() => {
    if (!task) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([loadUsers(), loadAssignments(), loadActivities()]);
      } catch (error) {
        console.error("Veri yükleme hatası:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [task, loadUsers, loadAssignments, loadActivities]);

  if (!task) return null;

  const statusColor =
    {
      Bekliyor: "orange",
      "Devam Ediyor": "blue",
      Tamamlandı: "green",
    }[task.status] || "default";

  const priorityColor =
    {
      Düşük: "green",
      Orta: "orange",
      Yüksek: "red",
    }[task.priority] || "default";

  const assignees = task.assignedTo || [];

  const tabItems = [
    {
      key: "1",
      label: "💬 Yorumlar",
      children: <SimpleCommentList taskId={task._id} />,
    },
    {
      key: "2",
      label: "📋 Atama Geçmişi",
      children: loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-500">Yükleniyor...</p>
        </div>
      ) : assignments.length > 0 ? (
        <ul className="space-y-3">
          {assignments.map((a) => {
            const assigner = users.find(
              (u) =>
                String(u._id) === String(a.assignedBy?._id || a.assignedBy),
            );
            const assigneeNames = a.newAssignees
              .map((idOrObj) => {
                const userId =
                  typeof idOrObj === "object" ? idOrObj._id : idOrObj;
                const u = users.find((u) => String(u._id) === String(userId));
                return u?.name;
              })
              .filter(Boolean)
              .join(", ");
            return (
              <li
                key={a._id}
                className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg"
              >
                <div className="flex items-start gap-2">
                  <Avatar
                    src={assigner?.avatar ? `${BASE_URL}${assigner.avatar}` : null}
                    icon={!assigner?.avatar && <UserOutlined />}
                    size="small"
                  />
                  <div>
                    <span className="font-medium">
                      {assigner?.name || "Biri"}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {" "}
                      şu kişilere atadı:{" "}
                    </span>
                    <span className="font-medium">{assigneeNames}</span>
                    <div className="text-xs text-gray-500 mt-1">
                      {dayjs(a.createdAt).fromNow()}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-gray-500 text-center py-8">Atama geçmişi yok.</p>
      ),
    },
    {
      key: "3",
      label: "📝 Aktivite",
      children: loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-500">Yükleniyor...</p>
        </div>
      ) : activities.length > 0 ? (
        <ul className="space-y-3">
          {activities.map((log) => {
            const actor = users.find(
              (u) => String(u._id) === String(log.userId?._id || log.userId),
            );
            let actionText = "";
            let valueDisplay = "";

            if (log.action === "create") {
              actionText = "görevi oluşturdu";
              valueDisplay = `📌 ${log.newValue || ""}`;
            } else if (log.action === "delete") {
              actionText = "görevi sildi";
              valueDisplay = `🗑️ ${log.oldValue || ""}`;
            } else if (log.action === "status") {
              actionText = "durumu değiştirdi";
              valueDisplay = `${log.oldValue || "?"} → ${log.newValue || "?"}`;
            } else if (log.action === "priority") {
              actionText = "önceliği değiştirdi";
              valueDisplay = `${log.oldValue || "?"} → ${log.newValue || "?"}`;
            } else if (log.action === "title") {
              actionText = "başlığı değiştirdi";
              valueDisplay = `“${log.oldValue || ""}” → “${log.newValue || ""}”`;
            } else if (log.action === "description") {
              actionText = "açıklamayı değiştirdi";
              valueDisplay = log.newValue
                ? "Açıklama güncellendi"
                : "Açıklama silindi";
            } else if (log.action === "assign_add") {
              actionText = "yeni kişi/kişiler atadı";
              valueDisplay = `👥 ${log.newValue || ""}`;
            } else if (log.action === "assign_remove") {
              actionText = "atamayı kaldırdı";
              valueDisplay = `👤 ${log.oldValue || ""}`;
            } else if (log.action === "comment") {
              actionText = "yorum ekledi";
              valueDisplay = "💬";
            } else {
              actionText = "işlem yaptı";
              valueDisplay = log.newValue || log.oldValue || "";
            }

            return (
              <li
                key={log._id}
                className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg"
              >
                <div className="flex items-start gap-2">
                  <Avatar
                    src={actor?.avatar ? `${BASE_URL}${actor.avatar}` : null}
                    icon={!actor?.avatar && <UserOutlined />}
                    size="small"
                  />
                  <div>
                    <span className="font-medium">{actor?.name || "Biri"}</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {" "}
                      {actionText}{" "}
                    </span>
                    {valueDisplay && (
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {valueDisplay}
                      </span>
                    )}
                    <div className="text-xs text-gray-500 mt-1">
                      {dayjs(log.createdAt).fromNow()}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-gray-500 text-center py-8">Aktivite yok.</p>
      ),
    },
  ];

  return (
    <Drawer
      title={<span className="text-lg md:text-xl">Görev Detayı</span>}
      open={open}
      onClose={onClose}
      size="large"
      destroyOnClose={false}
      className="[&_.ant-drawer-body]:p-4 md:[&_.ant-drawer-body]:p-6"
    >
      <div className="space-y-4 md:space-y-6">
        {/* Başlık ve Temel Bilgiler */}
        <div>
          <h2 className="text-xl md:text-2xl font-bold mb-2">{task.title}</h2>
          <div className="flex gap-2 flex-wrap">
            <Tag color={statusColor}>{task.status}</Tag>
            <Tag color={priorityColor}>{task.priority || "Orta"}</Tag>
            <Tag>
              {task.date ? dayjs(task.date).format("DD/MM/YYYY") : "Tarih yok"}
            </Tag>
            {task.tags &&
              task.tags.map((tag) => (
                <Tag key={tag} color={TAG_COLORS[tag] || "default"}>
                  {tag}
                </Tag>
              ))}
          </div>
        </div>

        {/* Atanan Kişiler */}
        <div>
          <h3 className="font-semibold mb-2">Atanan Kişiler</h3>
          <div className="flex gap-2 flex-wrap">
            {loading ? (
              <div className="flex gap-1">
                <Avatar size="default" className="bg-gray-300 animate-pulse" />
                <Avatar size="default" className="bg-gray-300 animate-pulse" />
                <Avatar size="default" className="bg-gray-300 animate-pulse" />
              </div>
            ) : assignees.length > 0 ? (
              assignees.map((u) => (
                <Tooltip key={u._id} title={`${u.name} ${u.role ? `(${u.role})` : ""}`}>
                  <Avatar
                    src={u.avatar ? `${BASE_URL}${u.avatar}` : null}
                    icon={!u.avatar && <UserOutlined />}
                  />
                </Tooltip>
              ))
            ) : (
              <span className="text-gray-500">Atanmış kişi yok</span>
            )}
          </div>
        </div>
        {/* Açıklama */}
        <div>
          <h3 className="font-semibold mb-2">Açıklama</h3>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {task.description || "Açıklama yok"}
          </p>
        </div>
        {/* Tabs */}
        <Tabs defaultActiveKey="1" items={tabItems} />
      </div>
    </Drawer>
  );
}