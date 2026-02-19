import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Avatar,
  message,
  Tag,
} from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { userApi } from "../api/userApi";

const { TextArea } = Input;

export default function TaskModal({ open, onClose, onAddTask, task }) {
  const [form] = Form.useForm();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  // Sabit etiket listesi
  const AVAILABLE_TAGS = [
    { value: "Frontend", label: "🎨 Frontend", color: "blue" },
    { value: "Backend", label: "⚙️ Backend", color: "green" },
    { value: "Bug", label: "🐞 Bug", color: "red" },
    { value: "Feature", label: "✨ Feature", color: "purple" },
    { value: "Urgent", label: "🔥 Acil", color: "orange" },
    { value: "Documentation", label: "📄 Dokümantasyon", color: "cyan" },
  ];

  // Kullanıcı listesini çek
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await userApi.getAll();
        setUsers(res.data);
      } catch {
        messageApi.error("Kullanıcılar yüklenemedi.");
      }
    };
    loadUsers();
  }, [messageApi]);

  // Form doldurma
  useEffect(() => {
    if (open) {
      form.resetFields();

      if (task) {
        let dateValue = dayjs();
        if (task.date) {
          dateValue = dayjs(task.date);
          if (!dateValue.isValid()) {
            dateValue = dayjs();
          }
        }

        // assignedTo'daki ID'leri _id'ye çevir
        const assignedToIds = task.assignedTo?.map((id) => id._id || id) || [];

        form.setFieldsValue({
          title: task.title || "",
          description: task.description || "",
          date: dateValue,
          status: task.status || "Bekliyor",
          priority: task.priority || "Orta",
          assignedTo: assignedToIds,
          tags: task.tags || [],
        });
      } else {
        form.setFieldsValue({
          date: dayjs(),
          status: "Bekliyor",
          priority: "Orta",
          assignedTo: [],
          tags: [],
        });
      }
    }
  }, [open, task, form]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      const taskData = {
        title: values.title,
        description: values.description || "",
        date: values.date
          ? values.date.format("YYYY-MM-DD")
          : dayjs().format("YYYY-MM-DD"),
        status: values.status,
        priority: values.priority,
        assignedTo: values.assignedTo || [], // Burada _id'ler geliyor
        tags: values.tags || [],
      };

      if (task) {
        await onAddTask({ id: task._id, ...taskData });
        messageApi.success("Görev güncellendi!");
      } else {
        await onAddTask(taskData);
        messageApi.success("Görev eklendi!");
      }

      onClose();
    } catch (error) {
      console.error("Form hatası:", error);
      messageApi.error("Lütfen tüm alanları doğru doldurun.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <>
      {contextHolder}
      <Modal
        title={task ? "✏️ Görevi Düzenle" : "➕ Yeni Görev"}
        open={open}
        onCancel={handleCancel}
        onOk={handleSubmit}
        okText={task ? "Güncelle" : "Ekle"}
        cancelText="Vazgeç"
        confirmLoading={loading}
        width={600}
        destroyOnHidden={false}
        forceRender={true}
      >
        <Form layout="vertical" form={form} preserve={true} className="mt-4">
          {/* Başlık */}
          <Form.Item
            label="Görev Başlığı"
            name="title"
            rules={[
              { required: true, message: "Başlık zorunludur" },
              { min: 3, message: "En az 3 karakter girin" },
            ]}
          >
            <Input placeholder="Örn: React Projesini Tamamla" size="large" />
          </Form.Item>

          {/* Etiketler */}
          <Form.Item label="Etiketler" name="tags">
            <Select
              mode="multiple"
              size="large"
              placeholder="Etiket seçin (opsiyonel)"
              allowClear
              maxTagCount="responsive"
              optionLabelProp="label"
            >
              {AVAILABLE_TAGS.map((tag) => (
                <Select.Option
                  key={tag.value}
                  value={tag.value}
                  label={tag.label}
                >
                  <Tag color={tag.color}>{tag.label}</Tag>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* Açıklama */}
          <Form.Item label="Açıklama" name="description">
            <TextArea
              rows={3}
              placeholder="Görev açıklamasını girin (isteğe bağlı)"
              showCount
              maxLength={500}
            />
          </Form.Item>

          {/* Tarih ve Durum */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              label="Tarih"
              name="date"
              rules={[{ required: true, message: "Tarih zorunludur" }]}
            >
              <DatePicker
                className="w-full"
                format="DD/MM/YYYY"
                placeholder="Tarih seçin"
                size="large"
              />
            </Form.Item>

            <Form.Item
              label="Durum"
              name="status"
              rules={[{ required: true, message: "Durum zorunludur" }]}
            >
              <Select size="large" placeholder="Durum seçin">
                <Select.Option value="Bekliyor">⏳ Bekliyor</Select.Option>
                <Select.Option value="Devam Ediyor">
                  🚀 Devam Ediyor
                </Select.Option>
                <Select.Option value="Tamamlandı">✅ Tamamlandı</Select.Option>
              </Select>
            </Form.Item>
          </div>

          {/* Öncelik ve Atama */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              label="Öncelik"
              name="priority"
              rules={[{ required: true, message: "Öncelik zorunludur" }]}
            >
              <Select size="large" placeholder="Öncelik seçin">
                <Select.Option value="Düşük">🟢 Düşük</Select.Option>
                <Select.Option value="Orta">🟠 Orta</Select.Option>
                <Select.Option value="Yüksek">🔴 Yüksek</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item label="Atanan Kişiler" name="assignedTo">
              <Select
                mode="multiple"
                size="large"
                placeholder="Kullanıcı seçin (opsiyonel)"
                optionFilterProp="children"
                allowClear
                maxTagCount="responsive"
              >
                {users.map((user) => (
                  <Select.Option key={user._id} value={user._id}>
                    <div className="flex items-center gap-2">
                      <Avatar
                        src={user.avatar}
                        icon={!user.avatar && <UserOutlined />}
                        size="small"
                      />
                      {user.name} ({user.role})
                    </div>
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </>
  );
}
