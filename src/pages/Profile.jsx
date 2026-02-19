import { Card, Form, Input, Button, Avatar, Upload, message } from "antd";
import { UserOutlined, UploadOutlined } from "@ant-design/icons";
import { useAuth } from "../context/AuthContext";
import { userApi } from "../api/userApi";
import { useState, useEffect } from "react";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState(user?.avatar);

  useEffect(() => {
    if (user) {
      setAvatar(user.avatar);
      form.setFieldsValue({
        name: user.name,
        email: user.email,
        bio: user.bio || "",
        role: user.role,
      });
    }
  }, [user, form]);

  const onFinish = async (values) => {
    try {
      setLoading(true);

      const userId = user?._id || user?.id;
      if (!userId) {
        message.error("Kullanıcı ID'si bulunamadı!");
        return;
      }

      const updateData = {
        name: values.name,
        bio: values.bio,
        // avatar burada gönderilmiyor, sadece profil bilgileri
      };

      const res = await userApi.update(userId, updateData);
      updateUser(res.data);

      message.success("Profil başarıyla güncellendi.");
    } catch (error) {
      console.error("Güncelleme hatası:", error);
      message.error(error.response?.data?.message || "Güncelleme başarısız.");
    } finally {
      setLoading(false);
    }
  };

  //  MULTER İLE AVATAR YÜKLEME
  // Sadece Fotoğraf Yükleme İşlemi
const handleAvatarUpload = async (file) => {
  const userId = user?._id || user?.id;
  if (!userId) {
    message.error("Kullanıcı ID'si bulunamadı!");
    return false;
  }
  
  try {
    setLoading(true);
    
    const res = await userApi.uploadAvatar(userId, file);
    
    updateUser(res.data);
    setAvatar(res.data.avatar);
    
    message.success("Profil fotoğrafı güncellendi.");
  } catch (error) {
    console.error("Avatar yükleme hatası:", error);
    message.error("Fotoğraf yüklenemedi.");
  } finally {
    setLoading(false);
  }
  return false;
};

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">Yükleniyor...</div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card title="Profil Bilgilerim" bordered={false} className="shadow-lg">
        {/* Avatar Alanı */}
        <div className="flex flex-col items-center mb-6">
          <Avatar
            size={120}
            src={avatar ? `http://localhost:5000${avatar}` : null}
            icon={!avatar && <UserOutlined />}
            className="border-4 border-blue-100 shadow-sm"
          />
          <Upload
            name="avatar"
            showUploadList={false}
            beforeUpload={handleAvatarUpload}
            accept="image/*"
          >
            <Button
              icon={<UploadOutlined />}
              className="mt-4"
              loading={loading}
            >
              Fotoğrafı Değiştir
            </Button>
          </Upload>
        </div>

        {/* Bilgi Formu */}
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
        >
          <Form.Item
            label="Ad Soyad"
            name="name"
            rules={[{ required: true, message: "Lütfen adınızı girin" }]}
          >
            <Input size="large" placeholder="Adınız ve Soyadınız" />
          </Form.Item>

          <Form.Item label="E-posta Adresi" name="email">
            <Input size="large" disabled className="bg-gray-50" />
          </Form.Item>

          <Form.Item label="Sistem Rolü" name="role">
            <Input size="large" disabled className="bg-gray-50" />
          </Form.Item>

          <Form.Item label="Hakkımda" name="bio">
            <Input.TextArea
              rows={4}
              placeholder="Kendinizden bahsedin..."
              maxLength={200}
              showCount
            />
          </Form.Item>

          <Form.Item className="mt-8">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              block
            >
              Değişiklikleri Kaydet
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
