import { Layout } from "antd";
import Dashboard from "./pages/Dashboard";

const { Header, Content } = Layout;

function App() {
  return (
    <Layout className="min-h-screen bg-gray-100">
      <Header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-5 flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            <span className="bg-linear-to-r from-indigo-500 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
              TaskFlow
            </span>
            <span className="ml-2 text-slate-700 font-medium">Görev Akışı</span>
          </h1>
        </div>
      </Header>

      <Content className="p-6 bg-gray-50">
        <Dashboard />
      </Content>
    </Layout>
  );
}

export default App;
