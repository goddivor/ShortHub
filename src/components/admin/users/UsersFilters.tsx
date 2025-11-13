// src/components/admin/users/UsersFilters.tsx
import React from 'react';
import { UserRole, UserStatus } from '@/types/graphql';
import { Filter } from 'iconsax-react';

interface UsersFiltersProps {
  filterRole: UserRole | '';
  filterStatus: UserStatus | '';
  onRoleChange: (role: UserRole | '') => void;
  onStatusChange: (status: UserStatus | '') => void;
  totalCount: number;
}

const UsersFilters: React.FC<UsersFiltersProps> = ({
  filterRole,
  filterStatus,
  onRoleChange,
  onStatusChange,
  totalCount,
}) => {
  const activeFiltersCount = [filterRole, filterStatus].filter(Boolean).length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-red-100 rounded-lg p-2">
            <Filter size={20} color="#DC2626" variant="Bold" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Filtres</h3>
          {activeFiltersCount > 0 && (
            <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-gray-900">{totalCount}</span> utilisateur
          {totalCount > 1 ? 's' : ''}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Role Filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Rôle</label>
          <select
            value={filterRole}
            onChange={(e) => onRoleChange(e.target.value as UserRole | '')}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all appearance-none bg-white"
          >
            <option value="">Tous les rôles</option>
            <option value="VIDEASTE">Vidéaste</option>
            <option value="ASSISTANT">Assistant</option>
            <option value="ADMIN">Administrateur</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Statut</label>
          <select
            value={filterStatus}
            onChange={(e) => onStatusChange(e.target.value as UserStatus | '')}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all appearance-none bg-white"
          >
            <option value="">Tous les statuts</option>
            <option value="ACTIVE">Actif</option>
            <option value="BLOCKED">Bloqué</option>
          </select>
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-gray-600">Filtres actifs:</span>
            {filterRole && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                Rôle: {filterRole}
                <button
                  onClick={() => onRoleChange('')}
                  className="hover:bg-blue-200 rounded-full p-0.5"
                >
                  ×
                </button>
              </span>
            )}
            {filterStatus && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                Statut: {filterStatus}
                <button
                  onClick={() => onStatusChange('')}
                  className="hover:bg-green-200 rounded-full p-0.5"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersFilters;
