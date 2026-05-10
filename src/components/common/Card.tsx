import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({
  children,
  className = '',
  title,
  subtitle,
  action,
  padding = 'md',
}: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>
      {(title || action) && (
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <div>
            {title && <h3 className="font-semibold text-gray-900">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={paddingClasses[padding]}>{children}</div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    label: string;
  };
  color?: 'default' | 'green' | 'red' | 'yellow' | 'blue';
  onClick?: () => void;
}

export function StatCard({
  title,
  value,
  unit,
  icon,
  trend,
  color = 'default',
  onClick,
}: StatCardProps) {
  const colorClasses = {
    default: 'bg-gray-50',
    green: 'bg-green-50',
    red: 'bg-red-50',
    yellow: 'bg-yellow-50',
    blue: 'bg-blue-50',
  };

  const iconColorClasses = {
    default: 'text-gray-600',
    green: 'text-green-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600',
    blue: 'text-blue-600',
  };

  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 shadow-sm p-2 sm:p-4 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs sm:text-sm text-gray-500">{title}</p>
          <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-0.5 sm:mt-1">
            {value}
            {unit && <span className="text-xs sm:text-sm font-normal text-gray-500 ml-1">{unit}</span>}
          </p>
          {trend && (
            <p className={`text-sm mt-2 flex items-center gap-1 ${
              trend.value >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend.value >= 0 ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              )}
              {Math.abs(trend.value)}% {trend.label}
            </p>
          )}
        </div>
        {icon && (
          <div className={`p-2 sm:p-3 rounded-lg ${colorClasses[color]}`}>
            <div className={`${iconColorClasses[color]} text-sm sm:text-base`}>{icon}</div>
          </div>
        )}
      </div>
    </div>
  );
}
