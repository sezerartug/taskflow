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
      width={400}
    >
      <p><b>Başlık:</b> {task.title}</p>
      <p className="mt-2"><b>Açıklama:</b> {task.description}</p>
      <p className="mt-2">
        <b>Durum:</b> <Tag color={color}>{task.status}</Tag>
      </p>
    </Drawer>
  );
}
