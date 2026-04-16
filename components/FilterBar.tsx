import React, { useState } from "react";
import { Search, X } from "lucide-react";

interface FilterBarProps {
  areas: string[];
  auditors: string[];
  onFilterChange: (filters: {
    search: string;
    area: string;
    auditor: string;
    startDate: string;
    endDate: string;
  }) => void;
}

export function FilterBar({ areas, auditors, onFilterChange }: FilterBarProps) {
  const [search, setSearch] = useState("");
  const [area, setArea] = useState("");
  const [auditor, setAuditor] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleFilterChange = () => {
    onFilterChange({ search, area, auditor, startDate, endDate });
  };

  const handleReset = () => {
    setSearch("");
    setArea("");
    setAuditor("");
    setStartDate("");
    setEndDate("");
    onFilterChange({
      search: "",
      area: "",
      auditor: "",
      startDate: "",
      endDate: "",
    });
  };

  const isFiltered = search || area || auditor || startDate || endDate;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Buscar
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                handleFilterChange();
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Area */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Área
          </label>
          <select
            value={area}
            onChange={(e) => {
              setArea(e.target.value);
              handleFilterChange();
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todas las áreas</option>
            {areas.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        {/* Auditor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Auditor
          </label>
          <select
            value={auditor}
            onChange={(e) => {
              setAuditor(e.target.value);
              handleFilterChange();
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos los auditores</option>
            {auditors.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Desde
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              handleFilterChange();
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Hasta
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              handleFilterChange();
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {isFiltered && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleReset}
            className="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 gap-2"
          >
            <X className="w-4 h-4" />
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
}
