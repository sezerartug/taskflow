import { Card, Tag, Avatar, Tooltip, Badge, Progress } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  CommentOutlined,
  PaperClipOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { userApi } from "../api/userApi";
import { useAuth } from "../context/AuthContext";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/tr";

dayjs.extend(relativeTime);
dayjs.locale("tr");

export default function TaskCard({ task, onEdit, onDelete, onClick }) {
  const { user } = useAuth();
  const [assignees, setAssignees] = useState([]);
  const [loading, setLoading] = useState(false);

  const TAG_COLORS = {
    Frontend: "blue",
    Backend: "green",
    Bug: "red",
    Feature: "purple",
    Urgent: "orange",
    Documentation: "cyan",
  };

  useEffect(() => {
    const loadAssignees = async () => {
      if (!task.assignedTo?.length) return;
      setLoading(true);
      try {
        const res = await userApi.getAll();
        // _id ile karşılaştır
        const users = res.data.filter((u) => task.assignedTo.includes(u._id));
        setAssignees(users);
      } catch (error) {
        console.error("Kullanıcılar yüklenemedi:", error);
      } finally {
        setLoading(false);
      }
    };
    loadAssignees();
  }, [task.assignedTo]);

  const canEdit = user && (user.role === "Admin" || user.role === "Project Manager");
  const canDelete = user && user.role === "Admin";

  const statusColor =
    {
      Bekliyor: "orange",
      "Devam Ediyor": "blue",
      Tamamlandı: "green",
    }[task.status] || "default";

  const priorityConfig = {
    Düşük: { color: "green", icon: "🟢", label: "Düşük" },
    Orta: { color: "orange", icon: "🟠", label: "Orta" },
    Yüksek: { color: "red", icon: "🔴", label: "Yüksek" },
  }[task.priority] || { color: "default", icon: "⚪", label: "Belirsiz" };

  const progressPercent =
    {
      Bekliyor: 25,
      "Devam Ediyor": 60,
      Tamamlandı: 100,
    }[task.status] || 0;

  return (
    <Card
      size="small"
      hoverable
      className="cursor-pointer border-l-4 dark:bg-slate-800 dark:border-slate-700 shadow-md hover:shadow-xl transition-all duration-200 group"
      style={{
        borderLeftColor: statusColor === "default" ? "#d9d9d9" : statusColor,
      }}
      onClick={onClick}
      bodyStyle={{ padding: "16px" }}
    >
      <div className="flex flex-col h-full space-y-3">
        {/* ÜST KISIM: Başlık ve Öncelik */}
        <div className="flex justify-between items-start gap-2">
          <h4 className="font-semibold text-base text-gray-900 dark:text-white line-clamp-2 flex-1">
            {task.title}
          </h4>
          <Tooltip title={`Öncelik: ${priorityConfig.label}`}>
            <Tag
              color={priorityConfig.color}
              className="flex items-center gap-1 shrink-0"
            >
              <span>{priorityConfig.icon}</span>
              <span className="hidden sm:inline">{priorityConfig.label}</span>
            </Tag>
          </Tooltip>
        </div>

        {/* Etiketler */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {task.tags.map((tag) => (
              <Tag key={tag} color={TAG_COLORS[tag] || "default"} size="small">
                {tag}
              </Tag>
            ))}
          </div>
        )}

        {/* Açıklama */}
        {task.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* PROGRESS BAR */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-600 dark:text-gray-400">İlerleme</span>
            <span className="font-medium" style={{ color: statusColor }}>
              {task.status}
            </span>
          </div>
          <Progress
            percent={progressPercent}
            size="small"
            status={task.status === "Tamamlandı" ? "success" : "active"}
            strokeColor={statusColor}
            showInfo={false}
          />
        </div>

        {/* ALT KISIM: Atananlar, Tarih, Aksiyonlar */}
        <div className="flex justify-between items-end pt-2">
          <div className="flex items-center gap-2">
            {/* Atanan kişi avatarları - Düzeltildi */}
            <div className="flex -space-x-1">
              {!loading &&
                assignees.slice(0, 3).map((u, index) => (
                  <Tooltip key={u._id} title={`${u.name} (${u.role})`}>
                    <Avatar
                      src={u.avatar ? `http://localhost:5000${u.avatar}` : null}
                      icon={!u.avatar && <UserOutlined />}
                      size="small"
                      className="border-2 border-white dark:border-slate-800 hover:z-10"
                      style={{ zIndex: assignees.length - index }}
                    />
                  </Tooltip>
                ))}
              {assignees.length > 3 && (
                <Tooltip title={`${assignees.length - 3} kişi daha`}>
                  <Avatar
                    size="small"
                    className="bg-gray-400 border-2 border-white dark:border-slate-800"
                  >
                    +{assignees.length - 3}
                  </Avatar>
                </Tooltip>
              )}
              {assignees.length === 0 && !loading && (
                <span className="text-xs text-gray-400 italic">Atanmamış</span>
              )}
            </div>

            {/* Yorum ve dosya badge'leri */}
            <div className="flex items-center gap-2 ml-2">
              {task.commentsCount > 0 && (
                <Badge
                  count={task.commentsCount}
                  size="small"
                  className="[&_.ant-badge-count]:text-xs"
                >
                  <CommentOutlined className="text-gray-400 text-sm" />
                </Badge>
              )}
              {task.attachmentsCount > 0 && (
                <Badge
                  count={task.attachmentsCount}
                  size="small"
                  className="[&_.ant-badge-count]:text-xs"
                >
                  <PaperClipOutlined className="text-gray-400 text-sm" />
                </Badge>
              )}
            </div>
          </div>

          {/* Sağ taraf - Tarih ve aksiyon butonları */}
          <div className="flex items-center gap-2 sm:gap-3">
            {task.date && (
              <Tooltip title={dayjs(task.date).format("DD MMMM YYYY")}>
                <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {dayjs(task.date).fromNow()}
                </span>
              </Tooltip>
            )}

            {/* Hızlı aksiyon butonları */}
            <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              {canEdit && (
                <Tooltip title="Düzenle">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(task);
                    }}
                    className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-colors"
                  >
                    <EditOutlined style={{ fontSize: "16px" }} />
                  </button>
                </Tooltip>
              )}
              {canDelete && (
                <Tooltip title="Sil">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(task);
                    }}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors"
                  >
                    <DeleteOutlined style={{ fontSize: "16px" }} />
                  </button>
                </Tooltip>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}