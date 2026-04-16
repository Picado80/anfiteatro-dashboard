import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Users,
  TrendingUp,
  AlertTriangle,
  BookOpen,
  Zap,
  MessageSquare,
  ChevronRight,
} from 'lucide-react';
import { directReports, actionItems, performanceData } from './data';

interface DirectReport {
  id: string;
  name: string;
  role: string;
  kpiScore: number;
  humanScore: number;
  category: 'Alto' | 'Medio' | 'Bajo';
  trend: number;
  status: string;
}

interface ActionItem {
  id: string;
  type: 'PIP' | 'Training' | 'Succession';
  employee: string;
  description: string;
  dueDate: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Not Started' | 'In Progress' | 'Completed';
}

const ManagerTeamDashboard: React.FC = () => {
  const categoryColors = {
    Alto: '#10b981',
    Medio: '#3b82f6',
    Bajo: '#f59e0b',
  };

  const performanceDistribution = useMemo(() => {
    const alto = directReports.filter((r) => r.category === 'Alto').length;
    const medio = directReports.filter((r) => r.category === 'Medio').length;
    const bajo = directReports.filter((r) => r.category === 'Bajo').length;

    return [
      { name: 'Alto', value: alto, fill: categoryColors.Alto },
      { name: 'Medio', value: medio, fill: categoryColors.Medio },
      { name: 'Bajo', value: bajo, fill: categoryColors.Bajo },
    ];
  }, []);

  const stats = useMemo(() => {
    const avgKPI = (
      directReports.reduce((sum, r) => sum + r.kpiScore, 0) /
      directReports.length
    ).toFixed(1);
    const avgHuman = (
      directReports.reduce((sum, r) => sum + r.humanScore, 0) /
      directReports.length
    ).toFixed(1);
    const upTrending = directReports.filter((r) => r.trend > 0).length;

    return { avgKPI, avgHuman, upTrending };
  }, []);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Alto':
        return 'bg-emerald-100 text-emerald-700 border-emerald-300';
      case 'Medio':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'Bajo':
        return 'bg-amber-100 text-amber-700 border-amber-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-emerald-600';
    if (trend < 0) return 'text-red-600';
    return 'text-slate-600';
  };

  const getActionPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-700';
      case 'Medium':
        return 'bg-amber-100 text-amber-700';
      case 'Low':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getActionStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-50 border-emerald-200';
      case 'In Progress':
        return 'bg-blue-50 border-blue-200';
      case 'Not Started':
        return 'bg-slate-50 border-slate-200';
      default:
        return 'bg-slate-50 border-slate-200';
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'PIP':
        return <AlertTriangle className="w-4 h-4" />;
      case 'Training':
        return <BookOpen className="w-4 h-4" />;
      case 'Succession':
        return <Zap className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Team Performance Dashboard
          </h1>
          <p className="text-slate-600">
            Direct reports overview and action items for your team
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-slate-600 font-medium">Team Size</p>
            </div>
            <p className="text-3xl font-bold text-slate-900">
              {directReports.length}
            </p>
            <p className="text-xs text-slate-500 mt-1">direct reports</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <p className="text-sm text-slate-600 font-medium">Avg KPI Score</p>
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.avgKPI}</p>
            <p className="text-xs text-slate-500 mt-1">out of 10</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <MessageSquare className="w-5 h-5 text-purple-600" />
              <p className="text-sm text-slate-600 font-medium">Avg Human Score</p>
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.avgHuman}</p>
            <p className="text-xs text-slate-500 mt-1">out of 10</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-slate-600 font-medium">Trending Up</p>
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.upTrending}</p>
            <p className="text-xs text-slate-500 mt-1">team members</p>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Team Members Cards */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Direct Reports ({directReports.length})
            </h2>
            <div className="space-y-3">
              {directReports.map((report) => (
                <div
                  key={report.id}
                  className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 hover:shadow-md transition-shadow hover:border-blue-300"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                          {report.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">
                            {report.name}
                          </p>
                          <p className="text-xs text-slate-500">{report.role}</p>
                        </div>
                      </div>
                    </div>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getCategoryColor(
                        report.category
                      )}`}
                    >
                      {report.category}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100">
                    <div>
                      <p className="text-xs text-slate-600 mb-1">KPI Score</p>
                      <div className="flex items-center gap-2">
                        <p className="text-lg font-bold text-slate-900">
                          {report.kpiScore.toFixed(1)}
                        </p>
                        <span className={`text-sm font-bold ${getTrendColor(report.trend)}`}>
                          {report.trend > 0 ? '+' : ''}
                          {report.trend}%
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Human Score</p>
                      <p className="text-lg font-bold text-slate-900">
                        {report.humanScore.toFixed(1)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Status</p>
                      <p className="text-sm font-medium text-blue-600">
                        {report.status}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Distribution */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-6">
              Performance Distribution
            </h2>

            <div className="w-full h-64 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={performanceDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {performanceDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '0.5rem',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              {performanceDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.fill }}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-700">
                      {item.name}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-slate-900">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Items Section */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Action Items</h2>
            <div className="text-sm text-slate-600">
              {actionItems.length} items
            </div>
          </div>

          <div className="space-y-3">
            {actionItems.map((item) => (
              <div
                key={item.id}
                className={`rounded-lg border p-4 transition-all hover:shadow-md ${getActionStatusColor(
                  item.status
                )}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`mt-1 p-2 rounded-lg ${getActionPriorityColor(item.priority)}`}>
                    {getActionIcon(item.type)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-slate-900">
                        {item.employee}
                      </h3>
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                          item.priority === 'High'
                            ? 'bg-red-100 text-red-700 border-red-300'
                            : item.priority === 'Medium'
                              ? 'bg-amber-100 text-amber-700 border-amber-300'
                              : 'bg-blue-100 text-blue-700 border-blue-300'
                        }`}
                      >
                        {item.priority}
                      </span>
                    </div>

                    <p className="text-sm text-slate-600 mb-2">
                      {item.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-slate-500">
                          Due: {new Date(item.dueDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        <span
                          className={`font-medium px-2 py-1 rounded ${
                            item.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-700'
                              : item.status === 'In Progress'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <button className="text-blue-600 hover:text-blue-700 transition-colors p-1">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {actionItems.length === 0 && (
            <div className="text-center py-8">
              <p className="text-slate-600">No action items at this time</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerTeamDashboard;
