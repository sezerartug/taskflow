import { Modal, Form, Input, Select, DatePicker } from "antd";
import { useEffect } from "react";
import dayjs from "dayjs";

export default function TaskModal({ open, onClose, onAddTask, task }) {
  const [form] = Form.useForm();

  // 🔄 CRITICAL FIX: Form'u her task veya open değiştiğinde güncelle
  useEffect(() => {
    if (open) {
      console.log("Modal açıldı, task bilgisi:", task);

      // Form'u sıfırla
      form.resetFields();

      // Kısa bir gecikme ile form'u doldur
      setTimeout(() => {
        if (task) {
          // Tarih formatını kontrol et
          let dateValue;
          try {
            if (task.date) {
              // Önce YYYY-MM-DD formatını dene
              dateValue = dayjs(task.date, "YYYY-MM-DD");
              if (!dateValue.isValid()) {
                // Değilse direkt parse et
                dateValue = dayjs(task.date);
              }
            } else {
              dateValue = dayjs();
            }
          } catch (error) {
            console.error("Tarih parse hatası:", error);
            dateValue = dayjs();
          }

          form.setFieldsValue({
            title: task.title || "",
            description: task.description || "",
            date: dateValue,
            status: task.status || "Bekliyor",
          });
        }
      }, 50);
    }
  }, [open, task, form]);

  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        console.log("Form değerleri:", values);

        const taskData = {
          title: values.title,
          description: values.description || "",
          date: values.date
            ? values.date.format("YYYY-MM-DD")
            : dayjs().format("YYYY-MM-DD"),
          status: values.status,
        };

        if (task) {
          // DÜZENLEME
          console.log("Güncellenecek görev (eski):", task);
          console.log("Güncellenecek görev (yeni):", {
            id: task.id,
            ...taskData,
          });

          onAddTask({
            id: task.id,
            ...taskData,
          });
        } else {
          // YENİ GÖREV
          onAddTask({
            id: Date.now(),
            ...taskData,
          });
        }

        onClose();
      })
      .catch((error) => {
        console.log("Form validation failed:", error);
      });
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={task ? "Görevi Düzenle" : "Yeni Görev"}
      open={open}
      onCancel={handleCancel}
      onOk={handleSubmit}
      okText={task ? "Güncelle" : "Ekle"}
      destroyOnClose={false} // IMPORTANT: false yap ki form state'i korunsun
      forceRender={true} // IMPORTANT: true yap ki form her zaman render olsun
    >
      <Form
        layout="vertical"
        form={form}
        preserve={true} // IMPORTANT: true yap ki form state'i korunsun
      >
        <Form.Item
          label="Başlık"
          name="title"
          rules={[
            { required: true, message: "Başlık zorunlu" },
            { min: 3, message: "En az 3 karakter girin" },
          ]}
        >
          <Input placeholder="Görev başlığını girin" />
        </Form.Item>

        <Form.Item label="Açıklama" name="description">
          <Input.TextArea
            rows={3}
            placeholder="Görev açıklamasını girin (isteğe bağlı)"
            showCount
            maxLength={500}
          />
        </Form.Item>

        <Form.Item
          label="Tarih"
          name="date"
          rules={[{ required: true, message: "Tarih zorunlu" }]}
        >
          <DatePicker
            className="w-full"
            format="DD/MM/YYYY"
            placeholder="Görev tarihini seçin"
          />
        </Form.Item>

        <Form.Item
          label="Durum"
          name="status"
          rules={[{ required: true, message: "Durum zorunlu" }]}
        >
          <Select
            placeholder="Durum seçin"
            options={[
              { label: " Bekliyor", value: "Bekliyor" },
              { label: " Devam Ediyor", value: "Devam Ediyor" },
              { label: " Tamamlandı", value: "Tamamlandı" },
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
