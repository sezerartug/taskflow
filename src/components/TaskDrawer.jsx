import { Drawer, Tag } from "antd";

export default function TaskDrawer({ open, onClose, task }) {
  if (!task) return null;

  let color = "default";
  if (task.status === "Tamamlandı") color = "green";
  if (task.status === "Devam Ediyor") color = "blue";
  if (task.status === "Bekliyor") color = "orange";

  return (
    <Drawer
      title="Görev Detayı"
      open={open}
      onClose={onClose}
      size="default" // width yerine size kullan
    >
      <div className="space-y-3">
        <p><strong className="text-gray-700">Başlık:</strong> {task.title}</p>
        <p><strong className="text-gray-700">Açıklama:</strong> {task.description || "Açıklama yok"}</p>
        <p><strong className="text-gray-700">Tarih:</strong> {task.date ? new Date(task.date).toLocaleDateString('tr-TR') : "Tarih yok"}</p>
        <p><strong className="text-gray-700">Durum:</strong> <Tag color={color}>{task.status}</Tag></p>
      </div>
    </Drawer>
  );
}