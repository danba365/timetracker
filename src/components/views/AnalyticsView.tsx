import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';
import { useTasks } from '../../hooks/useTasks';
import { useCategories } from '../../hooks/useCategories';
import { useFormats } from '../../hooks/useFormats';
import {
  calculateMetrics,
  getCategoryStats,
  getFormatStats,
  getTimeDistribution,
  getDayStats,
  getCompletionTrend,
  formatDuration,
  type DateRange,
} from '../../services/analyticsService';
import styles from './AnalyticsView.module.css';

export const AnalyticsView: React.FC = () => {
  const { t } = useTranslation();
  const [dateRange, setDateRange] = useState<DateRange>('month');

  // Calculate the actual date range for fetching tasks
  const taskDateRange = useMemo(() => {
    const now = new Date();
    switch (dateRange) {
      case 'week':
        return {
          start: startOfWeek(now, { weekStartsOn: 0 }),
          end: endOfWeek(now, { weekStartsOn: 0 }),
        };
      case 'month':
        return {
          start: startOfMonth(now),
          end: endOfMonth(now),
        };
      case '3months':
        return {
          start: startOfMonth(subMonths(now, 3)),
          end: endOfMonth(now),
        };
      case 'all':
        // Fetch last 2 years for "all"
        return {
          start: subMonths(now, 24),
          end: now,
        };
      default:
        return {
          start: startOfMonth(now),
          end: endOfMonth(now),
        };
    }
  }, [dateRange]);

  const { tasks } = useTasks(taskDateRange);
  const { categories } = useCategories();
  const { formats } = useFormats();

  // Calculate all metrics
  const metrics = useMemo(() => calculateMetrics(tasks, dateRange), [tasks, dateRange]);
  const categoryStats = useMemo(
    () => getCategoryStats(tasks, categories, dateRange),
    [tasks, categories, dateRange]
  );
  const formatStats = useMemo(
    () => getFormatStats(tasks, formats, dateRange),
    [tasks, formats, dateRange]
  );
  const timeDistribution = useMemo(() => getTimeDistribution(tasks, dateRange), [tasks, dateRange]);
  const dayStats = useMemo(() => getDayStats(tasks, dateRange), [tasks, dateRange]);
  const completionTrend = useMemo(() => getCompletionTrend(tasks, dateRange), [tasks, dateRange]);

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
  };

  return (
    <div className={styles.analytics}>
      <div className={styles.header}>
        <h1 className={styles.title}>📊 {t('analytics.title', 'Analytics')}</h1>
        <div className={styles.dateRangeSelector}>
          <button
            className={`${styles.rangeButton} ${dateRange === 'week' ? styles.active : ''}`}
            onClick={() => handleDateRangeChange('week')}
          >
            {t('analytics.week', 'Week')}
          </button>
          <button
            className={`${styles.rangeButton} ${dateRange === 'month' ? styles.active : ''}`}
            onClick={() => handleDateRangeChange('month')}
          >
            {t('analytics.month', 'Month')}
          </button>
          <button
            className={`${styles.rangeButton} ${dateRange === '3months' ? styles.active : ''}`}
            onClick={() => handleDateRangeChange('3months')}
          >
            {t('analytics.3months', '3 Months')}
          </button>
          <button
            className={`${styles.rangeButton} ${dateRange === 'all' ? styles.active : ''}`}
            onClick={() => handleDateRangeChange('all')}
          >
            {t('analytics.all', 'All Time')}
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>🔥</div>
          <div className={styles.metricContent}>
            <div className={styles.metricValue}>{metrics.currentStreak}</div>
            <div className={styles.metricLabel}>{t('analytics.currentStreak', 'Day Streak')}</div>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>✅</div>
          <div className={styles.metricContent}>
            <div className={styles.metricValue}>{metrics.completionRate}%</div>
            <div className={styles.metricLabel}>
              {t('analytics.completionRate', 'Completion Rate')}
            </div>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>📈</div>
          <div className={styles.metricContent}>
            <div className={styles.metricValue}>{metrics.completedTasks}</div>
            <div className={styles.metricLabel}>
              {t('analytics.completedTasks', 'Tasks Completed')}
            </div>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>⏱️</div>
          <div className={styles.metricContent}>
            <div className={styles.metricValue}>{formatDuration(metrics.totalMinutes)}</div>
            <div className={styles.metricLabel}>{t('analytics.totalTime', 'Total Time')}</div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className={styles.chartsGrid}>
        {/* Completion Trend */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>
            {t('analytics.completionTrend', 'Completion Trend')}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={completionTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="completed"
                stroke="#10b981"
                strokeWidth={2}
                name={t('analytics.completed', 'Completed')}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#3b82f6"
                strokeWidth={2}
                name={t('analytics.total', 'Total')}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Time by Category (Pie Chart) */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>
            {t('analytics.timeByCategory', 'Time by Category')}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryStats as any[]}
                dataKey="totalMinutes"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry: any) => `${entry.name}: ${formatDuration(entry.totalMinutes)}`}
              >
                {categoryStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => formatDuration(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Tasks by Category (Bar Chart) */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>
            {t('analytics.tasksByCategory', 'Tasks by Category')}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="completed"
                fill="#10b981"
                name={t('analytics.completed', 'Completed')}
              />
              <Bar dataKey="count" fill="#3b82f6" name={t('analytics.total', 'Total')} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Most Productive Hours (Bar Chart) */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>
            {t('analytics.productiveHours', 'Most Productive Hours')}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={timeDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="hour"
                tick={{ fontSize: 12 }}
                tickFormatter={(hour) => `${hour}:00`}
              />
              <YAxis />
              <Tooltip labelFormatter={(hour) => `${hour}:00`} />
              <Bar dataKey="count" fill="#8b5cf6" name={t('analytics.tasks', 'Tasks')} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tasks by Day of Week */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>
            {t('analytics.tasksByDay', 'Tasks by Day of Week')}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dayStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="completed"
                fill="#10b981"
                name={t('analytics.completed', 'Completed')}
              />
              <Bar dataKey="total" fill="#3b82f6" name={t('analytics.total', 'Total')} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tasks by Format */}
        {formatStats.length > 0 && (
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>
              {t('analytics.tasksByFormat', 'Tasks by Format')}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={formatStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="format" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="completed"
                  fill="#f59e0b"
                  name={t('analytics.completed', 'Completed')}
                />
                <Bar dataKey="count" fill="#ec4899" name={t('analytics.total', 'Total')} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Category Details Table */}
      <div className={styles.tableCard}>
        <h3 className={styles.tableTitle}>{t('analytics.categoryDetails', 'Category Details')}</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('analytics.category', 'Category')}</th>
                <th>{t('analytics.totalTasks', 'Total Tasks')}</th>
                <th>{t('analytics.completed', 'Completed')}</th>
                <th>{t('analytics.completionRate', 'Completion Rate')}</th>
                <th>{t('analytics.timeSpent', 'Time Spent')}</th>
              </tr>
            </thead>
            <tbody>
              {categoryStats.map((cat) => (
                <tr key={cat.name}>
                  <td>
                    <div className={styles.categoryCell}>
                      <div
                        className={styles.categoryColor}
                        style={{ backgroundColor: cat.color }}
                      />
                      {cat.name}
                    </div>
                  </td>
                  <td>{cat.count}</td>
                  <td>{cat.completed}</td>
                  <td>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressFill}
                        style={{ width: `${cat.completionRate}%` }}
                      />
                      <span className={styles.progressText}>{cat.completionRate}%</span>
                    </div>
                  </td>
                  <td>{formatDuration(cat.totalMinutes)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

