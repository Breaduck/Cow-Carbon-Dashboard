import { Farm, GAS_INFO, GasType } from '../../types';
import { getSensorsByFarmId } from '../../data';
import { Card } from '../common';

interface GasGaugesProps {
  farm: Farm;
}

export function GasGauges({ farm }: GasGaugesProps) {
  const sensors = getSensorsByFarmId(farm.id);
  const activeSensors = sensors.filter(s => s.status === 'active');

  const currentValues: Record<GasType, number> = {
    CH4: 0,
    CO2: 0,
    N2O: 0,
    NH3: 0,
  };

  if (activeSensors.length > 0) {
    activeSensors.forEach(sensor => {
      currentValues.CH4 += sensor.lastReading.values.CH4;
      currentValues.CO2 += sensor.lastReading.values.CO2;
      currentValues.N2O += sensor.lastReading.values.N2O;
      currentValues.NH3 += sensor.lastReading.values.NH3;
    });

    currentValues.CH4 /= activeSensors.length;
    currentValues.CO2 /= activeSensors.length;
    currentValues.N2O /= activeSensors.length;
    currentValues.NH3 /= activeSensors.length;
  }

  return (
    <Card title="실시간 가스 농도" padding="lg">
      <div className="grid grid-cols-2 gap-4">
        {(Object.keys(GAS_INFO) as GasType[]).map(gasType => {
          const info = GAS_INFO[gasType];
          const value = currentValues[gasType];
          const maxValue = gasType === 'CO2' ? 800 : gasType === 'N2O' ? 1 : gasType === 'CH4' ? 100 : 50;
          const percentage = Math.min((value / maxValue) * 100, 100);

          return (
            <div key={gasType} className="p-4 rounded-xl bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-500">{info.nameKo}</p>
                  <p className="text-lg font-bold text-gray-900 mt-0.5">
                    {value.toFixed(gasType === 'N2O' ? 2 : 1)}
                    <span className="text-xs font-normal text-gray-500 ml-1">{info.unit}</span>
                  </p>
                </div>
              </div>

              <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: info.color,
                  }}
                />
              </div>

              <p className="text-xs text-gray-500 mt-2">
                {percentage < 60 ? '정상' : percentage < 80 ? '주의' : '경고'}
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
