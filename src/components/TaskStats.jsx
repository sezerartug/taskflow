import { Card } from "antd";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#FF8042", "#0088FE", "#00C49F"];
const STATUS_ORDER = ["Bekliyor", "Devam Ediyor", "Tamamlandı"];

export default function TaskStats({ tasks }) {
  // Durumlara göre görev sayıları
  const statusCounts = {
    Bekliyor: tasks.filter((t) => t.status === "Bekliyor").length,
    "Devam Ediyor": tasks.filter((t) => t.status === "Devam Ediyor").length,
    Tamamlandı: tasks.filter((t) => t.status === "Tamamlandı").length,
  };

  // PieChart için veri formatı
  const pieData = STATUS_ORDER.map((status) => ({
    name: status,
    value: statusCounts[status],
  })).filter(item => item.value > 0);

  // Tamamlanma oranı
  const totalTasks = tasks.length;
  const completedCount = statusCounts.Tamamlandı;
  const completedPercentage = totalTasks 
    ? ((completedCount / totalTasks) * 100).toFixed(0)
    : 0;

  // Öncelik dağılımı
  const priorityCounts = {
    Düşük: tasks.filter((t) => t.priority === "Düşük").length,
    Orta: tasks.filter((t) => t.priority === "Orta").length,
    Yüksek: tasks.filter((t) => t.priority === "Yüksek").length,
  };

  const barData = [
    { name: "Düşük", count: priorityCounts.Düşük },
    { name: "Orta", count: priorityCounts.Orta },
    { name: "Yüksek", count: priorityCounts.Yüksek },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      {/* Pasta Grafiği - Görev Dağılımı */}
      <Card 
        title={
          <div className="flex items-center gap-2">
            <span className="text-lg">📊</span> {/* text-xl → text-lg */}
            <span className="text-base font-medium">Görev Dağılımı</span> {/* font-semibold → font-medium, text-base eklendi */}
          </div>
        }
        className="shadow-sm"
        size="small" // ✅ KART BOYUTUNU KÜÇÜLT
        bodyStyle={{ padding: '12px' }} // ✅ İÇ PADDING'İ AZALT
      >
        {totalTasks === 0 ? (
          <div className="h-48 flex items-center justify-center text-gray-500"> {/* h-62 → h-48 */}
            📭 Henüz görev yok
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={180}> {/* height 250 → 180 */}
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => 
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={60} // 80 → 60
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name) => [`${value} görev`, name]}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} /> {/* Legend yazı boyutunu küçült */}
            </PieChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Tamamlanma Oranı ve Öncelik Dağılımı */}
      <Card 
        title={
          <div className="flex items-center gap-2">
            <span className="text-lg">📈</span> {/* text-xl → text-lg */}
            <span className="text-base font-medium">İlerleme Durumu</span> {/* font-semibold → font-medium, text-base eklendi */}
          </div>
        }
        className="shadow-sm"
        size="small" // ✅ KART BOYUTUNU KÜÇÜLT
        bodyStyle={{ padding: '12px' }} // ✅ İÇ PADDING'İ AZALT
      >
        <div className="flex flex-col h-full">
          {/* Tamamlanma Oranı */}
          <div className="flex-1 flex flex-col items-center justify-center py-2"> {/* py-4 → py-2 */}
            <div className="relative w-24 h-24 mb-2"> {/* w-32 h-32 → w-24 h-24 */}
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  className="stroke-gray-200 dark:stroke-gray-700"
                  strokeWidth="2"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  className="stroke-green-500"
                  strokeWidth="2"
                  strokeDasharray={`${completedPercentage * 1.01} 100`}
                  strokeLinecap="round"
                  transform="rotate(-90 18 18)"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-green-500"> {/* text-3xl → text-xl */}
                  {completedPercentage}%
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400"> {/* text-sm → text-xs */}
              {completedCount} / {totalTasks} görev tamamlandı
            </p>
          </div>

          {/* Öncelik Dağılımı - Bar Grafiği */}
          {totalTasks > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700"> {/* mt-4 pt-4 → mt-2 pt-2 */}
              <h4 className="text-xs font-medium mb-2">Öncelik Dağılımı</h4> {/* text-sm → text-xs */}
              <ResponsiveContainer width="100%" height={70}> {/* height 100 → 70 */}
                <BarChart data={barData} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={50} tick={{ fontSize: 11 }} /> {/* width 60 → 50, font küçült */}
                  <Tooltip wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="count" fill="#8884d8" radius={[0, 4, 4, 0]}>
                    {barData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.name === "Düşük"
                            ? "#52c41a"
                            : entry.name === "Orta"
                            ? "#fa8c16"
                            : "#f5222d"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}