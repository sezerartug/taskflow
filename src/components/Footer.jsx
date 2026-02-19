import { Layout } from "antd";
import { HeartOutlined } from "@ant-design/icons";

const { Footer: AntFooter } = Layout;

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <AntFooter style={{ 
      padding: '12px 24px',
      background: 'transparent !important',
      borderTop: '1px solid #e2e8f0'
    }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ 
          margin: 0, 
          color: '#4b5563',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px'
        }}>
          <span>© {currentYear} TaskFlow.</span>
          <span>All rights reserved.</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '8px' }}>
            Made with <HeartOutlined style={{ color: '#ef4444', fontSize: '12px' }} /> by{" "}
            <a
              href="https://github.com/sezerartug"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#3b82f6', textDecoration: 'none' }}
            >
              Sezer Artug
            </a>
          </span>
        </p>
      </div>
    </AntFooter>
  );
}