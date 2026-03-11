import React, { useState, useMemo } from 'react';
import {
  Download,
  ChevronDown,
  AlertCircle,
  TrendingUp,
  Filter,
  ArrowUpDown,
} from 'lucide-react';
import { kpiData } from './data';

interface KPIRecord {
  id: string;
  name: string;
  department: string;
  manager: string;
  kpiActual: number;
  kpiTarget: number;
  humanScore: number;
  finalScore: number;
  category: 'Alto' | 'Medio' | 'Bajo';
}

interface SortConfig {
  key: keyof KPIRecord | null;
  direction: 'asc' | 'desc';
}

const HRAdminPanel: React.FC = () => {
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'finalScore',
    direction: 'desc',
  });

  const departments = useMemo(
    () => ['All', ...new Set(kpiData.map((emp) => emp.department))],
    []
  );

  const categoryConfig = {
    Alto: {
      bgColor: 'bg-emerald-100',
      textColor: 'text-emerald-700',
      borderColor: 'border-emerald-300',
      dotColor: 'bg-emerald-500',
    },
    Medio: {
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-300',
      dotColor: 'bg-blue-500',
    },
    Bajo: {
      bgColor: 'bg-amber-100',
      textColor: 'text-amber-700',
      borderColor: 'border-amber-300',
      dotColor: 'bg-amber-500',
    },
  };

  const filteredAndSortedData = useMemo(() => {
    let filtered = kpiData.filter((record) =>
      selectedDepartment === 'All'
        ? true
        : record.department === selectedDepartment
    );

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof KPIRecord];
        const bValue = b[sortConfig.key as keyof KPIRecord];

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'asc'
            ? aValue - bValue
            : bValue - aValue;
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          const comparison = aValue.localeCompare(bValue, 'en-US');
          return sortConfig.direction === 'asc' ? comparison : -comparison;
        }

        return 0;
      });
    }

    return filtered;
  }, [selectedDepartment, sortConfig]);

  const handleSort = (key: keyof KPIRecord) => {
    setSortConfig((prev) => ({
      key,
      direction:
        prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleExport = () => {
    // Prepare CSV data
    const headers = [
      'Name',
      'Department',
      'Manager',
      'KPI Actual',
      'KPI Target',
      'KPI Achievement %',
      'Human Score',
      'Final Score',
      'Category',
    ];

    const rows = filteredAndSortedData.map((record) => {
      const kpiAchievement = (
        (record.kpiActual / record.kpiTarget) *
        100
      ).toFixed(1);
      return [
        record.name,
        record.department,
        record.manager,
        record.kpiActual,
        record.kpiTarget,
        kpiAchievement,
        record.humanScore.toFixed(1),
        record.finalScore.toFixed(1),
        record.category,
      ];
    });

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    // Download CSV
    const element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent)
    );
    element.setAttribute('download', `KPI_Report_${new Date().toISOString().split('T')[0]}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const SortableHeader = ({
    label,
    sortKey,
  }: {
    label: string;
    sortKey: keyof KPIRecord;
  }) => (
    <th className="px-6 py-3">
      <button
        onClick={() => handleSort(sortKey)}
        className="flex items-center gap-2 text-left text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
      >
        {label}
        <ArrowUpDown
          className={`w-4 h-4 transition-colors ${
            sortConfig.key === sortKey ? 'text-blue-600' : 'text-slate-300'
          }`}
        />
      </button>
    </th>
  );

  // Calculate summary stats
  const stats = useMemo(() => {
    const total = filteredAndSortedData.length;
    const alto = filteredAndSortedData.filter(
      (r) => r.category === 'Alto'
    ).length;
    const medio = filteredAndSortedData.filter(
      (r) => r.category === 'Medio'
    ).length;
    const bajo = filteredAndSortedData.filter(
      (r) => r.category === 'Bajo'
    ).length;
    const avgScore =
      filteredAndSortedData.reduce((sum, r) => sum + r.finalScore, 0) / total;

    return { total, alto, medio, bajo, avgScore };
  }, [filteredAndSortedData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            HR KPI Management
          </h1>
          <p className="text-slate-600">
            Monitor employee performance and KPI achievement across departments
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
            <p className="text-xs text-slate-600 font-medium mb-1">Total</p>
            <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
            <p className="text-xs text-slate-600 font-medium mb-1">Alto</p>
            <p className="text-2xl font-bold text-emerald-600">{stats.alto}</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
            <p className="text-xs text-slate-600 font-medium mb-1">Medio</p>
            <p className="text-2xl font-bold text-blue-600">{stats.medio}</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
            <p className="text-xs text-slate-600 font-medium mb-1">Bajo</p>
            <p className="text-2xl font-bold text-amber-600">{stats.bajo}</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
            <p className="text-xs text-slate-600 font-medium mb-1">Avg Score</p>
            <p className="text-2xl font-bold text-slate-900">
              {stats.avgScore.toFixed(1)}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="w-full md:w-64">
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Filter by Department
            </label>
            <div className="relative">
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white transition-all cursor-pointer"
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept === 'All' ? 'All Departments' : dept}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <SortableHeader label="Name" sortKey="name" />
                  <SortableHeader label="Department" sortKey="department" />
                  <SortableHeader label="Manager" sortKey="manager" />
                  <th className="px-6 py-3">
                    <span className="text-sm font-semibold text-slate-700">
                      KPI (Actual/Target)
                    </span>
                  </th>
                  <th className="px-6 py-3">
                    <span className="text-sm font-semibold text-slate-700">
                      Achievement %
                    </span>
                  </th>
                  <SortableHeader label="Human Score" sortKey="humanScore" />
                  <SortableHeader label="Final Score" sortKey="finalScore" />
                  <SortableHeader label="Category" sortKey="category" />
                  <th className="px-6 py-3 text-right">
                    <span className="text-sm font-semibold text-slate-700">
                      Action
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredAndSortedData.map((record) => {
                  const kpiAchievement = (
                    (record.kpiActual / record.kpiTarget) *
                    100
                  ).toFixed(1);
                  const achievementNum = parseFloat(kpiAchievement);
                  const categoryStyle = categoryConfig[record.category];
                  const isAtRisk = record.category === 'Bajo';

                  return (
                    <tr
                      key={record.id}
                      className={`hover:bg-blue-50 transition-colors ${isAtRisk ? 'bg-red-50' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900">
                          {record.name}
                        </p>
                        <p className="text-xs text-slate-500">{record.id}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
                          {record.department}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {record.manager}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">
                            {record.kpiActual}
                          </span>
                          <span className="text-slate-400">/</span>
                          <span className="text-slate-600">
                            {record.kpiTarget}
                          </span>
                        </div>
                        <div className="w-32 h-1.5 bg-slate-200 rounded-full mt-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              achievementNum >= 100
                                ? 'bg-emerald-500'
                                : achievementNum >= 75
                                  ? 'bg-blue-500'
                                  : 'bg-amber-500'
                            }`}
                            style={{
                              width: `${Math.min(achievementNum, 100)}%`,
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">
                            {kpiAchievement}%
                          </span>
                          {achievementNum >= 100 && (
                            <TrendingUp className="w-4 h-4 text-emerald-600" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-900 font-semibold">
                        {record.humanScore.toFixed(1)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-lg font-bold text-slate-900">
                          {record.finalScore.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center gap-2">
                          <div
                            className={`w-2.5 h-2.5 rounded-full ${categoryStyle.dotColor}`}
                          />
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${categoryStyle.bgColor} ${categoryStyle.textColor} ${categoryStyle.borderColor}`}
                          >
                            {record.category}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isAtRisk && (
                            <button
                              title="Requires attention"
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <AlertCircle className="w-5 h-5" />
                            </button>
                          )}
                          <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            Review
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredAndSortedData.length === 0 && (
            <div className="px-6 py-12 text-center">
              <Filter className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600">No records found</p>
              <p className="text-sm text-slate-500">
                Try adjusting your department filter
              </p>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-6 bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Category Legend</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-4">
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium text-slate-900">Alto (High)</p>
                <p className="text-sm text-slate-600">
                  Exceeds targets and expectations
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-3.5 h-3.5 rounded-full bg-blue-500 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium text-slate-900">Medio (Medium)</p>
                <p className="text-sm text-slate-600">
                  Meets most targets and expectations
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-3.5 h-3.5 rounded-full bg-amber-500 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium text-slate-900">Bajo (Low)</p>
                <p className="text-sm text-slate-600">
                  Below expectations, needs support
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRAdminPanel;
