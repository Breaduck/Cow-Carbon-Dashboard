import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Farm, GAS_INFO, GasType, TimeRange } from '../../types';
import { generateEmissionData } from '../../utils/dataGenerator';
import { Card } from '../common';

interface EmissionChartProps {
  farm: Farm;
}

export function EmissionChart({ farm }: EmissionChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('day');
  const [selectedGas, setSelectedGas] = useState<GasType>('CH4');

  const data = generateEmissionData(farm, timeRange);

  const timeRanges: { value: TimeRange; label: string }[] = [
    { value: 'day', label: '오늘' },
    { value: 'week', label: '이번 주' },
    { value: 'month', label: '이번 달' },
    { value: 'year', label: '올해' },
  ];

  return (
    <Card padding="none">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">배출량 추이</h3>
            <p className="text-sm text-gray-500 mt-0.5">시간별 온실가스 배출량 변화</p>
          </div>

          <div className="flex items-center gap-2">
            {timeRanges.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setTimeRange(value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  timeRange === value
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4">
          {(Object.keys(GAS_INFO) as GasType[]).map(gas => (
            <button
              key={gas}
              onClick={() => setSelectedGas(gas)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedGas === gas
                  ? 'text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={selectedGas === gas ? { backgroundColor: GAS_INFO[gas].color } : {}}
            >
              {GAS_INFO[gas].nameKo}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="label"
              stroke="#9ca3af"
              fontSize={12}
              tickLine={false}
            />
            <YAxis
              stroke="#9ca3af"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '12px',
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
            />
            <Line
              type="monotone"
              dataKey={selectedGas}
              stroke={GAS_INFO[selectedGas].color}
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6 }}
              name={GAS_INFO[selectedGas].nameKo}
            />
            {data[0]?.target && (
              <ReferenceLine
                y={data[0].target}
                stroke="#ef4444"
                strokeDasharray="3 3"
                label={{ value: '목표', position: 'right', fill: '#ef4444', fontSize: 12 }}
              />
            )}
            {data[0]?.average && (
              <ReferenceLine
                y={data[0].average}
                stroke="#3b82f6"
                strokeDasharray="3 3"
                label={{ value: '평균', position: 'right', fill: '#3b82f6', fontSize: 12 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
