import { Card, Input, Table, Avatar, Tag, Select, Space, Button } from "antd";
import { useState, useEffect } from "react";
import { userApi } from "../api/userApi";
import { 
  UserOutlined, 
  MailOutlined,
  TeamOutlined
} from "@ant-design/icons";

const { Search } = Input;
const { Option } = Select;

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await userApi.getAll();
      setUsers(res.data);
    } catch (error) {
      console.error("Kullanıcılar yüklenemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filtreleme
  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchText.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Tablo sütunları
  const columns = [
    {
      title: "Avatar",
      dataIndex: "avatar",
      key: "avatar",
      width: 80,
      render: (avatar) => (
        // ✅ DÜZELTİLDİ: Backend'den gelen avatar yolu '/uploads/...' şeklinde
        <Avatar 
          src={avatar ? `http://localhost:5000${avatar}` : null} 
          icon={!avatar && <UserOutlined />} 
        />
      ),
    },
    {
      title: "Ad Soyad",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name?.localeCompare(b.name),
    },
    {
      title: "E-posta",
      dataIndex: "email",
      key: "email",
      render: (email) => (
        <Space>
          <MailOutlined className="text-gray-400" />
          {email}
        </Space>
      ),
    },
    {
      title: "Rol",
      dataIndex: "role",
      key: "role",
      render: (role) => {
        let color = "default";
        if (role === "Admin") color = "red";
        if (role === "Project Manager") color = "blue";
        if (role === "Developer") color = "green";
        return <Tag color={color}>{role}</Tag>;
      },
      filters: [
        { text: "Admin", value: "Admin" },
        { text: "Project Manager", value: "Project Manager" },
        { text: "Developer", value: "Developer" },
      ],
      onFilter: (value, record) => record.role === value,
    },
    {
      title: "Bio",
      dataIndex: "bio",
      key: "bio",
      ellipsis: true,
      render: (bio) => bio || "-",
    },
  ];

  return (
    <div className="p-6">
      <Card 
        title={
          <div className="flex items-center gap-2">
            <TeamOutlined />
            <span>Kullanıcı Yönetimi</span>
          </div>
        }
      >
        {/* Filtreleme */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Search
            placeholder="İsim veya e-posta ile ara..."
            className="md:w-80"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
          <Select
            placeholder="Role göre filtrele"
            className="md:w-48"
            value={roleFilter}
            onChange={setRoleFilter}
          >
            <Option value="all">Tüm Roller</Option>
            <Option value="Admin">Admin</Option>
            <Option value="Project Manager">Project Manager</Option>
            <Option value="Developer">Developer</Option>
          </Select>
          {(searchText || roleFilter !== "all") && (
            <Button 
              onClick={() => {
                setSearchText("");
                setRoleFilter("all");
              }}
            >
              Filtreleri Temizle
            </Button>
          )}
        </div>

        {/* Tablo */}
        <Table
          dataSource={filteredUsers}
          columns={columns}
          rowKey="_id"
          loading={loading}
          pagination={{ 
            pageSize: 10,
            showTotal: (total) => `Toplam ${total} kullanıcı`
          }}
        />
      </Card>
    </div>
  );
}