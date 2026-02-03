import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-slate-900">
      <Result
        status="404"
        title="404"
        subTitle="Üzgünüz, aradığınız sayfa bulunamadı."
        extra={
          <Button 
            type="primary" 
            onClick={() => navigate('/dashboard')}
          >
            Gösterge Paneline Dön
          </Button>
        }
      />
    </div>
  );
}