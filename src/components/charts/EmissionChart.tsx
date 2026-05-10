import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, ReferenceDot } from 'recharts';
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

  // 통계 계산
  const stats = useMemo(() => {
    if (!data || data.length === 0) return null;

    const values = data.map(d => d[selectedGas] as number).filter(v => v !== undefined);
    const currentValue = values[values.length - 1] || 0;
    const previousValue = values[values.length - 2] || currentValue;

    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;

    // 최고/최저 지점 찾기
    const maxIndex = values.indexOf(max);
    const minIndex = values.indexOf(min);
    const maxPoint = data[maxIndex];
    const minPoint = data[minIndex];

    // 비교 기간별 변화율 계산
    let comparisonValue = 0;
    let comparisonLabel = '';

    if (timeRange === 'day') {
      // 어제보다
      comparisonValue = previousValue;
      comparisonLabel = '어제보다';
    } else if (timeRange === 'week') {
      // 지난주보다 (7일 전 값)
      comparisonValue = values[Math.max(0, values.length - 8)] || values[0];
      comparisonLabel = '지난주보다';
    } else if (timeRange === 'month') {
      // 지난달보다 (30일 전 값)
      comparisonValue = values[0] || currentValue;
      comparisonLabel = '지난달보다';
    } else {
      // 작년보다
      comparisonValue = values[0] || currentValue;
      comparisonLabel = '작년보다';
    }

    const change = currentValue - comparisonValue;
    const changePercent = comparisonValue === 0 ? 0 : (change / comparisonValue) * 100;

    return {
      current: currentValue,
      min,
      max,
      avg,
      change,
      changePercent,
      comparisonLabel,
      maxPoint,
      minPoint,
    };
  }, [data, selectedGas, timeRange]);

  const timeRanges: { value: TimeRange; label: string }[] = [
    { value: 'day', label: '오늘' },
    { value: 'week', label: '이번 주' },
    { value: 'month', label: '이번 달' },
    { value: 'year', label: '올해' },
  ];

  return (
    <Card padding="none">
      <div className="p-3 sm:p-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">배출량 추이</h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">시간별 온실가스 배출량 변화</p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            {/* 변화율 표시 */}
            {stats && (
              <div className="text-right">
                <p className="text-xs text-gray-500">{stats.comparisonLabel}</p>
                <p
                  className={`text-base font-bold ${
                    stats.changePercent > 0 ? 'text-red-600' : stats.changePercent < 0 ? 'text-blue-600' : 'text-gray-600'
                  }`}
                >
                  {stats.changePercent > 0 ? '+' : ''}
                  {stats.changePercent.toFixed(1)}%
                </p>
              </div>
            )}

            <div className="flex items-center gap-1.5 sm:gap-2">
              {timeRanges.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setTimeRange(value)}
                  className={`px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
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
        </div>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-3 sm:mt-4">
          {(Object.keys(GAS_INFO) as GasType[]).map(gas => (
            <button
              key={gas}
              onClick={() => setSelectedGas(gas)}
              className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs font-medium transition-all ${
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

      <div className="p-3 sm:p-6">
        <div className="h-[200px] sm:h-[250px] md:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="label"
              stroke="#9ca3af"
              fontSize={10}
              tickLine={false}
              angle={0}
            />
            <YAxis
              stroke="#9ca3af"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              width={35}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '11px',
                padding: '6px 8px',
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }}
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
                label={{ value: '목표', position: 'right', fill: '#ef4444', fontSize: 10 }}
              />
            )}
            {data[0]?.average && (
              <ReferenceLine
                y={data[0].average}
                stroke="#3b82f6"
                strokeDasharray="3 3"
                label={{ value: '평균', position: 'right', fill: '#3b82f6', fontSize: 10 }}
              />
            )}
            {/* 최고점 표시 */}
            {stats && stats.maxPoint && (
              <ReferenceDot
                x={stats.maxPoint.label}
                y={stats.max}
                r={4}
                fill="#dc2626"
                stroke="#fff"
                strokeWidth={1.5}
                label={{
                  value: `최고 ${stats.max.toFixed(1)}`,
                  position: 'top',
                  fill: '#dc2626',
                  fontSize: 9,
                  offset: 8
                }}
              />
            )}
            {/* 최저점 표시 */}
            {stats && stats.minPoint && (
              <ReferenceDot
                x={stats.minPoint.label}
                y={stats.min}
                r={4}
                fill="#dc2626"
                stroke="#fff"
                strokeWidth={1.5}
                label={{
                  value: `최저 ${stats.min.toFixed(1)}`,
                  position: 'bottom',
                  fill: '#dc2626',
                  fontSize: 9,
                  offset: 8
                }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}
