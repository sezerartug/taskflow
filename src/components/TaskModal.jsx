import { Modal, Form, Input, Select } from "antd";
import { useEffect } from "react";

export default function TaskModal({ open, onClose, onAddTask, task }) {
  const [form] = Form.useForm();

  // 🔹 4.1 FORMU DOLDUR (EDIT İÇİN)
  useEffect(() => {
    if (task) {
      form.setFieldsValue(task);
    } else {
      form.resetFields();
    }
  }, [task, form]);

  // 🔹 4.2 KAYDETME MANTIĞI (NEW / EDIT)
  const handleSubmit = () => {
    form.validateFields().then(values => {
      if (task) {
        // düzenleme
        onAddTask({
          ...task,
          ...values,
        });
      } else {
        // yeni görev
        onAddTask({
          id: Date.now(),
          ...values,
        });
      }

      form.resetFields();
      onClose();
    });
  };

  return (
    <Modal
      title={task ? "Görevi Düzenle" : "Yeni Görev"}
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      okText={task ? "Güncelle" : "Ekle"}
    >
      <Form layout="vertical" form={form}>
        <Form.Item
          label="Başlık"
          name="title"
          rules={[{ required: true, message: "Başlık zorunlu" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Açıklama"
          name="description"
        >
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item
          label="Durum"
          name="status"
          rules={[{ required: true, message: "Durum zorunlu" }]}
        >
          <Select
            options={[
              { value: "Bekliyor" },
              { value: "Devam Ediyor" },
              { value: "Tamamlandı" },
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
