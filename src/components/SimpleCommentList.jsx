import { useState, useEffect } from "react";
import { Avatar, Input, Button, message, Popconfirm, Upload, Image, Tooltip, Modal } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  SendOutlined,
  UserOutlined,
  PaperClipOutlined,
  LoadingOutlined,
  PlusOutlined,
  FilePdfOutlined,
  FileOutlined,
  FileImageOutlined,
} from "@ant-design/icons";
import { useAuth } from "../context/AuthContext";
import { commentApi } from "../api/commentApi";
import { userApi } from "../api/userApi";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/tr";

dayjs.extend(relativeTime);
dayjs.locale("tr");

const { TextArea } = Input;
const BASE_URL = "http://localhost:5000"; // Backend adresi

export default function SimpleCommentList({ taskId, onCommentChange }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Dosya yükleme state'leri
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  
  // PDF önizleme için state
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState("");
  const [pdfPreviewName, setPdfPreviewName] = useState("");

  // Kullanıcıları yükle
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await userApi.getAll();
        setUsers(res.data);
      } catch {
        message.error("Kullanıcılar yüklenemedi.");
      }
    };
    loadUsers();
  }, []);

  // Yorumları yükle
  useEffect(() => {
    if (!taskId) return;
    
    const loadComments = async () => {
      try {
        const res = await commentApi.getByTask(taskId);
        setComments(res.data);
      } catch {
        message.error("Yorumlar yüklenemedi.");
      }
    };
    
    loadComments();
  }, [taskId]);

  // @mention bul
  const findMentions = (text) => {
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;
    while ((match = mentionRegex.exec(text)) !== null) {
      const username = match[1];
      const mentionedUser = users.find(u => 
        u.name?.toLowerCase().includes(username.toLowerCase())
      );
      if (mentionedUser) {
        mentions.push(mentionedUser._id);
      }
    }
    return mentions;
  };

  // Dosya ikonu seçici
  const getFileIcon = (fileType) => {
    if (fileType?.includes("pdf")) return <FilePdfOutlined className="text-red-500" />;
    if (fileType?.includes("image")) return <FileImageOutlined className="text-blue-500" />;
    return <FileOutlined />;
  };

  // Resim önizleme
  const handlePreview = async (file) => {
    if (file.url) {
      setPreviewImage(file.url);
      setPreviewOpen(true);
    }
  };

  // PDF önizleme
  const handlePdfPreview = (file) => {
    if (file.url?.startsWith('blob:')) {
      setPdfPreviewUrl(file.url);
      setPdfPreviewName(file.name);
      setPdfPreviewOpen(true);
      return;
    }
    
    if (file.url?.startsWith('data:application/pdf;base64,')) {
      try {
        const base64Data = file.url.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);
        
        setPdfPreviewUrl(blobUrl);
        setPdfPreviewName(file.name);
        setPdfPreviewOpen(true);
      } catch (error) {
        console.error("PDF dönüştürme hatası:", error);
        message.error("PDF görüntülenemedi.");
      }
      return;
    }
    
    setPdfPreviewUrl(file.url);
    setPdfPreviewName(file.name);
    setPdfPreviewOpen(true);
  };

  // PDF Modal kapandığında blob URL'ini temizle
  const handlePdfPreviewClose = () => {
    if (pdfPreviewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(pdfPreviewUrl);
    }
    setPdfPreviewOpen(false);
    setPdfPreviewUrl("");
  };

  // Dosya değiştiğinde
  const handleFileChange = ({ fileList: newFileList }) => {
    const updatedFileList = newFileList.map(file => {
      if (file.originFileObj && !file.url) {
        return {
          ...file,
          url: URL.createObjectURL(file.originFileObj)
        };
      }
      return file;
    });
    setFileList(updatedFileList);
  };

  // Dosya yükleme butonu
  const uploadButton = (
    <button
      style={{
        border: 0,
        background: "none",
        cursor: "pointer",
      }}
      type="button"
    >
      {uploading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8, fontSize: 12 }}>Dosya Ekle</div>
    </button>
  );

  // Yorum ekle
  const handleAddComment = async () => {
    if (!newComment.trim() && fileList.length === 0) return;
    
    setLoading(true);
    setUploading(true);
    
    try {
      const mentions = findMentions(newComment);
      
      const attachments = await Promise.all(
        fileList.map(async (file) => {
          if (file.url?.startsWith('blob:')) {
            const response = await fetch(file.url);
            const blob = await response.blob();
            return new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve({
                name: file.name,
                url: reader.result,
                type: file.type,
                size: file.size,
              });
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
          }
          return {
            name: file.name,
            url: file.url,
            type: file.type,
            size: file.size,
          };
        })
      );

      const commentData = {
        taskId,
        content: newComment || (attachments.length > 0 ? "📎 Dosya eklendi" : ""),
        mentions,
        attachments,
      };

      const res = await commentApi.create(commentData);
      setComments([...comments, res.data]);
      setNewComment("");
      
      fileList.forEach(file => {
        if (file.url?.startsWith('blob:')) {
          URL.revokeObjectURL(file.url);
        }
      });
      setFileList([]);
      
      message.success("Yorum eklendi.");

      onCommentChange?.();
    } catch (error) {
      console.error("Yorum ekleme hatası:", error);
      message.error("Yorum eklenemedi: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  // Component unmount olurken Object URL'leri temizle
  useEffect(() => {
    return () => {
      fileList.forEach(file => {
        if (file.url?.startsWith('blob:')) {
          URL.revokeObjectURL(file.url);
        }
      });
    };
  }, [fileList]);

  // Yorum güncelle
  const handleUpdate = async (commentId) => {
    try {
      await commentApi.update(commentId, { content: editContent });
      setComments(comments.map(c => 
        c._id === commentId 
          ? { ...c, content: editContent, updatedAt: new Date().toISOString() } 
          : c
      ));
      setEditingId(null);
      message.success("Yorum güncellendi.");
    } catch {
      message.error("Güncelleme başarısız.");
    }
  };

  // Yorum sil
  const handleDelete = async (commentId) => {
    try {
      await commentApi.delete(commentId);
      setComments(comments.filter(c => c._id !== commentId));
      message.success("Yorum silindi.");
    } catch {
      message.error("Silme başarısız.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Yorum Listesi Başlığı */}
      <div className="font-medium text-gray-700 dark:text-gray-300">
        {comments.length} Yorum
      </div>
      
      {/* Yorum Listesi */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-gray-50 dark:bg-slate-800 rounded-lg">
            💬 Henüz yorum yapılmamış. İlk yorumu sen yap!
          </div>
        ) : (
          comments.map((comment) => {
            const commentUser = users.find(u => u._id === (comment.userId?._id || comment.userId));
            return (
              <div 
                key={comment._id} 
                className="flex gap-3 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm"
              >
                {/* Avatar Düzeltildi */}
                <Avatar 
                  src={commentUser?.avatar ? `${BASE_URL}${commentUser.avatar}` : null} 
                  icon={!commentUser?.avatar && <UserOutlined />}
                  className="shrink-0"
                />
                
                {/* Yorum İçeriği */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {commentUser?.name || "Bilinmeyen Kullanıcı"}
                    </span>
                    <span className="text-xs text-gray-500">
                      {dayjs(comment.createdAt).fromNow()}
                      {comment.updatedAt && " (düzenlendi)"}
                    </span>
                  </div>

                  {/* Düzenleme Modu */}
                  {editingId === comment._id ? (
                    <div className="space-y-2">
                      <TextArea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        autoSize
                      />
                      <div className="flex gap-2">
                        <Button size="small" type="primary" onClick={() => handleUpdate(comment._id)}>
                          Kaydet
                        </Button>
                        <Button size="small" onClick={() => setEditingId(null)}>
                          İptal
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-2">
                        {comment.content}
                      </p>
                      
                      {/* Eklenen dosyalar */}
                      {comment.attachments && comment.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2 mb-2">
                          {comment.attachments.map((file, index) => (
                            <div key={`${comment._id}-attach-${index}`} className="relative group">
                              {file.type?.includes("image") ? (
                                <div 
                                  className="cursor-pointer"
                                  onClick={() => {
                                    setPreviewImage(file.url);
                                    setPreviewOpen(true);
                                  }}
                                >
                                  <Image
                                    src={file.url}
                                    alt={file.name}
                                    className="w-20 h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                                    preview={false}
                                  />
                                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                                    <span className="text-white text-xs opacity-0 group-hover:opacity-100">
                                      🔍
                                    </span>
                                  </div>
                                </div>
                              ) : file.type?.includes("pdf") ? (
                                <div
                                  onClick={() => handlePdfPreview(file)}
                                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors cursor-pointer"
                                >
                                  <FilePdfOutlined className="text-red-500" />
                                  <span className="text-sm max-w-50 truncate">
                                    {file.name}
                                  </span>
                                  <span className="text-xs text-gray-500">PDF</span>
                                </div>
                              ) : (
                                <a
                                  href={file.url}
                                  download={file.name}
                                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                                >
                                  {getFileIcon(file.type)}
                                  <span className="text-sm max-w-50 truncate">
                                    {file.name}
                                  </span>
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {/* Aksiyon Butonları */}
                  {user?._id === (comment.userId?._id || comment.userId) && (
                    <div className="flex gap-3 mt-2">
                      <button
                        onClick={() => {
                          setEditingId(comment._id);
                          setEditContent(comment.content);
                        }}
                        className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1"
                      >
                        <EditOutlined /> Düzenle
                      </button>
                      <Popconfirm
                        title="Yorumu silmek istediğine emin misin?"
                        onConfirm={() => handleDelete(comment._id)}
                        okText="Evet"
                        cancelText="Hayır"
                      >
                        <button className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
                          <DeleteOutlined /> Sil
                        </button>
                      </Popconfirm>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* PDF Önizleme Modalı */}
      <Modal
        title={pdfPreviewName || "PDF Önizleme"}
        open={pdfPreviewOpen}
        onCancel={handlePdfPreviewClose}
        footer={[
          <Button key="download" onClick={() => window.open(pdfPreviewUrl, "_blank")}>
            İndir
          </Button>,
          <Button key="close" type="primary" onClick={handlePdfPreviewClose}>
            Kapat
          </Button>
        ]}
        width={800}
        styles={{ body: { height: "80vh", padding: 0 } }}
      >
        {pdfPreviewUrl && (
          <iframe
            src={pdfPreviewUrl}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
            }}
            title="PDF Preview"
          />
        )}
      </Modal>

      {/* Yeni Yorum Ekleme Alanı */}
      <div className="flex gap-3">
        {/* Admin Avatarı Düzeltildi */}
        <Avatar 
          src={user?.avatar ? `${BASE_URL}${user.avatar}` : null} 
          icon={!user?.avatar && <UserOutlined />}
          className="shrink-0"
        />
        <div className="flex-1">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <TextArea
              rows={3}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Yorum yaz... (@kullanıcı ile etiketle)"
              className="border-0 focus:ring-0 resize-none"
            />
            
            <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-800 border-t border-gray-200 dark:border-gray-700">
              <Upload
                listType="picture-card"
                fileList={fileList}
                onPreview={handlePreview}
                onChange={handleFileChange}
                beforeUpload={() => false}
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
                multiple
                showUploadList={{
                  showPreviewIcon: true,
                  showRemoveIcon: true,
                }}
                className="comment-uploader"
              >
                {fileList.length >= 5 ? null : uploadButton}
              </Upload>
              
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleAddComment}
                loading={loading}
                disabled={!newComment.trim() && fileList.length === 0}
                className="ml-2"
              >
                Yorum Yap
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Resim önizleme modalı */}
      {previewImage && (
        <Image
          style={{ display: "none" }}
          preview={{
            open: previewOpen,
            onOpenChange: (visible) => setPreviewOpen(visible),
            afterOpenChange: (visible) => !visible && setPreviewImage(""),
          }}
          src={previewImage}
        />
      )}
    </div>
  );
}