import React, { useState, useMemo } from 'react';
import {
  ChevronDown,
  Mail,
  Phone,
  FileText,
  Search,
  Edit2,
  X,
  Download,
  ArrowUpDown,
} from 'lucide-react';
import { employeeData } from './data';

interface Employee {
  id: string;
  name: string;
  department: string;
  role: string;
  manager: string | null;
  hireDate: string;
  email: string;
  phone: string;
  avatar: string;
  attachments?: Array<{ name: string; size: string }>;
}

interface SortConfig {
  key: keyof Employee | null;
  direction: 'asc' | 'desc';
}

const EmployeeDirectory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'name',
    direction: 'asc',
  });
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<Employee>>({});

  const departments = useMemo(
    () => ['All', ...new Set(employeeData.map((emp) => emp.department))],
    []
  );

  const filteredAndSortedEmployees = useMemo(() => {
    let filtered = employeeData.filter((emp) => {
      const matchesSearch =
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.phone.includes(searchTerm);

      const matchesDept =
        selectedDepartment === 'All' || emp.department === selectedDepartment;

      return matchesSearch && matchesDept;
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof Employee];
        const bValue = b[sortConfig.key as keyof Employee];

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        if (typeof aValue === 'string') {
          const comparison = aValue.localeCompare(
            bValue as string,
            'en-US',
            { numeric: true }
          );
          return sortConfig.direction === 'asc' ? comparison : -comparison;
        }

        return 0;
      });
    }

    return filtered;
  }, [searchTerm, selectedDepartment, sortConfig]);

  const handleSort = (key: keyof Employee) => {
    setSortConfig((prev) => ({
      key,
      direction:
        prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleViewProfile = (employee: Employee) => {
    setSelectedEmployee(employee);
    setEditData(employee);
    setEditMode(false);
    setIsModalOpen(true);
  };

  const handleEditSave = () => {
    if (selectedEmployee) {
      const updated = { ...selectedEmployee, ...editData };
      setSelectedEmployee(updated);
      setEditMode(false);
      // In production, would call API to save
    }
  };

  const SortableHeader = ({
    label,
    sortKey,
  }: {
    label: string;
    sortKey: keyof Employee;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Employee Directory
          </h1>
          <p className="text-slate-600">
            Find and manage employee information across your organization
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Department Filter */}
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

          <div className="text-sm text-slate-600">
            Showing {filteredAndSortedEmployees.length} of{' '}
            {employeeData.length} employees
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <span className="text-sm font-semibold text-slate-700">
                      Employee
                    </span>
                  </th>
                  <SortableHeader label="Department" sortKey="department" />
                  <SortableHeader label="Role" sortKey="role" />
                  <SortableHeader label="Manager" sortKey="manager" />
                  <SortableHeader label="Hire Date" sortKey="hireDate" />
                  <th className="px-6 py-3">
                    <span className="text-sm font-semibold text-slate-700">
                      Contact
                    </span>
                  </th>
                  <th className="px-6 py-3 text-right">
                    <span className="text-sm font-semibold text-slate-700">
                      Action
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredAndSortedEmployees.map((employee) => (
                  <tr
                    key={employee.id}
                    className="hover:bg-blue-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                          {employee.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {employee.name}
                          </p>
                          <p className="text-sm text-slate-500">
                            ID: {employee.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        {employee.department}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-700">{employee.role}</td>
                    <td className="px-6 py-4 text-slate-700">
                      {employee.manager}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {new Date(employee.hireDate).toLocaleDateString(
                        'en-US',
                        {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        }
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <a
                          href={`mailto:${employee.email}`}
                          title={employee.email}
                          className="text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          <Mail className="w-4 h-4" />
                        </a>
                        <a
                          href={`tel:${employee.phone}`}
                          title={employee.phone}
                          className="text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleViewProfile(employee)}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        <FileText className="w-4 h-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAndSortedEmployees.length === 0 && (
            <div className="px-6 py-12 text-center">
              <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600">No employees found</p>
              <p className="text-sm text-slate-500">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Profile Modal */}
      {isModalOpen && selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 flex items-center justify-between p-6 border-b border-slate-200 bg-white">
              <h2 className="text-2xl font-bold text-slate-900">
                Employee Profile
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Employee Header */}
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-2xl">
                  {selectedEmployee.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div className="flex-1">
                  {!editMode ? (
                    <>
                      <h3 className="text-2xl font-bold text-slate-900 mb-1">
                        {selectedEmployee.name}
                      </h3>
                      <p className="text-blue-600 font-medium mb-3">
                        {selectedEmployee.role}
                      </p>
                      <button
                        onClick={() => setEditMode(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit Information
                      </button>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editData.name || ''}
                        onChange={(e) =>
                          setEditData({ ...editData, name: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Name"
                      />
                      <input
                        type="text"
                        value={editData.role || ''}
                        onChange={(e) =>
                          setEditData({ ...editData, role: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Role"
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={handleEditSave}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={() => setEditMode(false)}
                          className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Details Grid */}
              {!editMode && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-slate-600 font-medium mb-1">
                        Employee ID
                      </p>
                      <p className="text-slate-900">{selectedEmployee.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 font-medium mb-1">
                        Department
                      </p>
                      <p className="text-slate-900">
                        {selectedEmployee.department}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 font-medium mb-1">
                        Manager
                      </p>
                      <p className="text-slate-900">{selectedEmployee.manager}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 font-medium mb-1">
                        Hire Date
                      </p>
                      <p className="text-slate-900">
                        {new Date(selectedEmployee.hireDate).toLocaleDateString(
                          'en-US',
                          {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          }
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 font-medium mb-1">
                        Email
                      </p>
                      <a
                        href={`mailto:${selectedEmployee.email}`}
                        className="text-blue-600 hover:underline"
                      >
                        {selectedEmployee.email}
                      </a>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 font-medium mb-1">
                        Phone
                      </p>
                      <a
                        href={`tel:${selectedEmployee.phone}`}
                        className="text-blue-600 hover:underline"
                      >
                        {selectedEmployee.phone}
                      </a>
                    </div>
                  </div>

                  {/* Attachments Section */}
                  {selectedEmployee.attachments &&
                    selectedEmployee.attachments.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-3">
                          File Attachments
                        </h4>
                        <div className="space-y-2">
                          {selectedEmployee.attachments.map((file, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-blue-600" />
                                <div>
                                  <p className="font-medium text-slate-900">
                                    {file.name}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {file.size}
                                  </p>
                                </div>
                              </div>
                              <button className="text-blue-600 hover:text-blue-700 transition-colors p-2">
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDirectory;
