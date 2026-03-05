import { Popover, Badge, List, Button, Avatar } from "antd";
import { BellOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { notificationApi } from "../api/notificationApi";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/tr";

dayjs.extend(relativeTime);
dayjs.locale("tr");

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const navigate = useNavigate();

  // Bildirimleri yükle
  useEffect(() => {
    if (!user?._id) return;

    const loadNotifications = async () => {
      try {
        const res = await notificationApi.getMyNotifications();
        setNotifications(res.data);
      } catch (error) {
        console.error("Bildirimler yüklenemedi:", error);
      }
    };

    loadNotifications();
  }, [user]);

  // Okunmamış bildirim sayısı
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Bildirimi okundu işaretle
  const handleMarkAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n)),
      );
    } catch (error) {
      console.error("Bildirim okundu işaretlenemedi:", error);
    }
  };

  // Tümünü okundu işaretle
  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error("Tüm bildirimler okundu işaretlenemedi:", error);
    }
  };

  // Bildirime tıklandığında
  const handleNotificationClick = (item) => {
    handleMarkAsRead(item._id);
    setPopoverOpen(false);

    if (item.type === "assignment" || item.type === "mention") {
      navigate(`/dashboard?task=${item.relatedId}`);
    }
  };

  // Popover içeriği
  const content = (
    <div className="w-80">
      {/* Başlık ve Tümünü Okundu Butonu */}
      <div className="flex justify-between items-center mb-2 px-2">
        <h4 className="font-semibold text-gray-700 dark:text-gray-200">
          Bildirimler
        </h4>
        {unreadCount > 0 && (
          <Button
            type="link"
            size="small"
            onClick={handleMarkAllRead}
            className="text-blue-500"
          >
            Tümünü Okundu İşaretle
          </Button>
        )}
      </div>

      {/* Bildirim Listesi */}
      <List
        itemLayout="horizontal"
        dataSource={notifications.slice(0, 5)}
        // List'in locale kısmını güncelle
        locale={{
          emptyText: (
            <div className="text-center py-12">
              <div className="text-5xl mb-3">🔔</div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                Henüz bildirim yok
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Yeni bildirimler burada görünecek
              </p>
            </div>
          ),
        }}
        renderItem={(item) => (
          <List.Item
            className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 p-3 transition-colors ${
              !item.read ? "bg-blue-50/50 dark:bg-blue-900/20" : ""
            }`}
            onClick={() => handleNotificationClick(item)}
          >
            <List.Item.Meta
              avatar={
                <Avatar
                  icon={<BellOutlined />}
                  className={!item.read ? "bg-blue-500" : "bg-gray-400"}
                  size="small"
                />
              }
              title={
                <span className={!item.read ? "font-semibold" : ""}>
                  {item.message}
                </span>
              }
              description={
                <span className="text-xs text-gray-500">
                  {dayjs(item.createdAt).fromNow()}
                </span>
              }
            />
          </List.Item>
        )}
      />

      {/* Tümünü Gör Butonu */}
      {notifications.length > 5 && (
        <div className="text-center mt-2 pt-2 border-t border-gray-100 dark:border-slate-700">
          <Button
            type="link"
            onClick={() => {
              setPopoverOpen(false);
              navigate("/notifications");
            }}
            className="text-blue-500"
          >
            Tüm Bildirimleri Gör ({notifications.length})
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      placement="bottomRight"
      arrow={false}
      open={popoverOpen}
      onOpenChange={setPopoverOpen}
    >
      <Badge
        count={unreadCount}
        size="small"
        overflowCount={99}
        className="cursor-pointer"
      >
        <BellOutlined className=" text-xl  text-white! hover:text-blue-200! " />
      </Badge>
    </Popover>
  );
}
