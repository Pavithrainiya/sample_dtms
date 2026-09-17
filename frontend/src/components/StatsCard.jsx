import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatsCard({ title, value, icon: Icon, trend, trendValue, color = 'indigo' }) {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const colorClasses = {
    indigo: {
      icon: isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600',
      trend: 'text-indigo-600',
    },
    emerald: {
      icon: isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600',
      trend: 'text-emerald-600',
    },
    amber: {
      icon: isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-600',
      trend: 'text-amber-600',
    },
    rose: {
      icon: isDark ? 'bg-rose-500/20 text-rose-400' : 'bg-rose-100 text-rose-600',
      trend: 'text-rose-600',
    },
  };

  const colors = colorClasses[color] || colorClasses.indigo;

  return (
    <div 
      className={`rounded-xl p-6 border transition-all duration-200 hover:shadow-lg ${
        isDark 
          ? 'bg-slate-800/50 border-slate-700 hover:border-slate-600' 
          : 'bg-white border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={`text-sm font-medium mb-1 ${
            isDark ? 'text-slate-400' : 'text-slate-600'
          }`}>
            {title}
          </p>
          <p className={`text-3xl font-bold mb-2 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            {value}
          </p>
          {trend !== undefined && trendValue !== undefined && (
            <div className="flex items-center gap-1">
              {trend === 'up' ? (
                <TrendingUp size={16} className={colors.trend} />
              ) : (
                <TrendingDown size={16} className={colors.trend} />
              )}
              <span className={`text-sm font-medium ${colors.trend}`}>
                {trendValue}
              </span>
              <span className={`text-xs ${
                isDark ? 'text-slate-500' : 'text-slate-500'
              }`}>
                vs last month
              </span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colors.icon}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}
