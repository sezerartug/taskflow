import { Layout } from "antd";
import { HeartOutlined } from "@ant-design/icons";

const { Footer: AntFooter } = Layout;

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <AntFooter 
      className="py-3! px-6! bg-white! dark:bg-slate-900! border-t! border-slate-200! dark:border-slate-800! transition-colors duration-300"
    >
      {/* gap-x-2 yatay boşluk, items-center dikey hizalama sağlar */}
      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-slate-600 dark:text-slate-400">
        
        <span className="flex items-center">
          © {currentYear} TaskFlow. All rights reserved.
        </span>

        {/* Ayırıcı Çizgi */}
        <span className="hidden md:block text-slate-300 dark:text-slate-700">|</span>

        <div className="flex items-center gap-1">
          <span>Made with</span>
          <HeartOutlined className="text-red-500 text-xs anticon-heart" />
          <span>by</span>
          <a
            href="https://github.com/sezerartug"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
          >
            Sezer Artug
          </a>
        </div>
      </div>
    </AntFooter>
  );
}