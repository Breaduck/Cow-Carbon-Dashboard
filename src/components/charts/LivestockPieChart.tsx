import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from 'recharts';
import { LIVESTOCK_INFO } from '../../types';

interface LivestockPieChartProps {
  beefCount: number;
  pigCount: number;
  dairyCount: number;
}

export function LivestockPieChart({ beefCount, pigCount, dairyCount }: LivestockPieChartProps) {
  const data = [
    { name: LIVESTOCK_INFO.beef_cattle.nameKo, value: beefCount, color: LIVESTOCK_INFO.beef_cattle.color },
    { name: LIVESTOCK_INFO.pig.nameKo, value: pigCount, color: LIVESTOCK_INFO.pig.color },
    { name: LIVESTOCK_INFO.dairy_cattle.nameKo, value: dairyCount, color: LIVESTOCK_INFO.dairy_cattle.color },
  ].filter(item => item.value > 0);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        데이터가 없습니다
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
