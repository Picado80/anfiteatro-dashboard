import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Users, Target, AlertCircle } from 'lucide-react';
import { companyPerformanceData, departmentData, yearlyTrendData } from './data';

interface StatCard {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
}

const CompanyPerformanceDashboard: React.FC = () => {
  const stats: StatCard[] = useMemo(
    () => [
      {
        label: 'Total Employees',
        value: companyPerformanceData.totalEmployees,
        icon: <Users className="w-6 h-6" />,
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-600',
      },
      {
        label: 'Average Score',
        value: companyPerformanceData.averageScore.toFixed(1),
        icon: <Target className="w-6 h-6" />,
        bgColor: 'bg-green-50',
        textColor: 'text-green-600',
      },
      {
        label: 'High Performance',
        value: companyPerformanceData.highCount,
        icon: <TrendingUp className="w-6 h-6" />,
        bgColor: 'bg-emerald-50',
        textColor: 'text-emerald-600',
      },
      {
        label: 'Needs Support',
        value: companyPerformanceData.lowCount,
        icon: <AlertCircle className="w-6 h-6" />,
        bgColor: 'bg-amber-50',
        textColor: 'text-amber-600',
      },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Company Performance Dashboard
          </h1>
          <p className="text-slate-600">
            Real-time insights into organizational performance and employee metrics
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={`${stat.bgColor} rounded-lg border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-slate-600 font-medium mb-1">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-slate-900">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.textColor} opacity-80`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trend Chart */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 mb-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900 mb-1">
              Performance Trend (5-Year Overview)
            </h2>
            <p className="text-sm text-slate-500">
              Category-based performance evolution
            </p>
          </div>

          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={yearlyTrendData}
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="year"
                  stroke="#64748b"
                  style={{ fontSize: '0.875rem' }}
                />
                <YAxis
                  stroke="#64748b"
                  style={{ fontSize: '0.875rem' }}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  }}
                  cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                />
                <Legend
                  wrapperStyle={{
                    paddingTop: '1.5rem',
                    fontSize: '0.875rem',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="technical"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Technical"
                />
                <Line
                  type="monotone"
                  dataKey="leadership"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ fill: '#10b981', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Leadership"
                />
                <Line
                  type="monotone"
                  dataKey="collaboration"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  dot={{ fill: '#f59e0b', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Collaboration"
                />
                <Line
                  type="monotone"
                  dataKey="innovation"
                  stroke="#8b5cf6"
                  strokeWidth={2.5}
                  dot={{ fill: '#8b5cf6', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Innovation"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Breakdown */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Department Performance Breakdown
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departmentData.map((dept) => {
              const total = dept.high + dept.medium + dept.low;
              const highPercentage = ((dept.high / total) * 100).toFixed(0);
              const mediumPercentage = ((dept.medium / total) * 100).toFixed(0);
              const lowPercentage = ((dept.low / total) * 100).toFixed(0);

              return (
                <div
                  key={dept.name}
                  className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    {dept.name}
                  </h3>

                  <div className="space-y-4 mb-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-600">
                          High Performance
                        </span>
                        <span className="text-sm font-bold text-emerald-600">
                          {dept.high}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                          className="bg-emerald-500 h-2 rounded-full"
                          style={{ width: `${highPercentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {highPercentage}% of team
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-600">
                          Medium Performance
                        </span>
                        <span className="text-sm font-bold text-blue-600">
                          {dept.medium}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${mediumPercentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {mediumPercentage}% of team
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-600">
                          Low Performance
                        </span>
                        <span className="text-sm font-bold text-amber-600">
                          {dept.low}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                          className="bg-amber-500 h-2 rounded-full"
                          style={{ width: `${lowPercentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {lowPercentage}% of team
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <p className="text-xs text-slate-500 mb-1">Total</p>
                      <p className="text-lg font-bold text-slate-900">{total}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-500 mb-1">Avg Score</p>
                      <p className="text-lg font-bold text-slate-900">
                        {dept.avgScore}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-500 mb-1">Trend</p>
                      <p className="text-lg font-bold text-green-600">
                        +{dept.trend}%
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyPerformanceDashboard;
