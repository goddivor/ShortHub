// src/components/admin/users/UsersTable.tsx
import React from 'react';
import { Edit2, Trash, Lock, Unlock, User as UserIcon } from 'iconsax-react';
import type { UserStatus, User } from '@/types/graphql';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Force TypeScript reload - Uses global User interface from @/types/graphql
interface UsersTableProps {
  users: User[];
  loading?: boolean;
  currentUserId?: string;
  onToggleStatus: (userId: string, currentStatus: UserStatus) => void;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
}

const UsersTable: React.FC<UsersTableProps> = ({
  users,
  loading = false,
  currentUserId,
  onToggleStatus,
  onEdit,
  onDelete,
}) => {
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'VIDEASTE':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ASSISTANT':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrateur';
      case 'VIDEASTE':
        return 'Vidéaste';
      case 'ASSISTANT':
        return 'Assistant';
      default:
        return role;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    return status === 'ACTIVE'
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-red-100 text-red-800 border-red-200';
  };

  const getStatusLabel = (status: string) => {
    return status === 'ACTIVE' ? 'Actif' : 'Bloqué';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Chargement des utilisateurs...</p>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-12 text-center">
          <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <UserIcon size={32} color="#9CA3AF" variant="Bulk" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun utilisateur</h3>
          <p className="text-gray-500">Aucun utilisateur ne correspond aux filtres sélectionnés</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <th className="px-6 py-4 text-left">
                <span className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  Utilisateur
                </span>
              </th>
              <th className="px-6 py-4 text-left">
                <span className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  Email
                </span>
              </th>
              <th className="px-6 py-4 text-left">
                <span className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  Rôle
                </span>
              </th>
              <th className="px-6 py-4 text-left">
                <span className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  Statut
                </span>
              </th>
              <th className="px-6 py-4 text-left">
                <span className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  Date création
                </span>
              </th>
              <th className="px-6 py-4 text-right">
                <span className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  Actions
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user, index) => (
              <tr
                key={user.id}
                className="hover:bg-gray-50 transition-colors group"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* User Info */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{user.username}</p>
                      <p className="text-xs text-gray-500">ID: {user.id.slice(0, 8)}...</p>
                    </div>
                  </div>
                </td>

                {/* Email */}
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-700">
                    {user.email || <span className="text-gray-400 italic">Non connecté</span>}
                  </span>
                </td>

                {/* Role */}
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(
                      user.role
                    )}`}
                  >
                    {getRoleLabel(user.role)}
                  </span>
                </td>

                {/* Status */}
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeColor(
                      user.status
                    )}`}
                  >
                    {getStatusLabel(user.status)}
                  </span>
                </td>

                {/* Created Date */}
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm text-gray-900">
                      {format(new Date(user.createdAt), 'dd MMM yyyy', { locale: fr })}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(user.createdAt), 'HH:mm', { locale: fr })}
                    </p>
                  </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-4">
                  {user.id !== currentUserId ? (
                    <div className="flex items-center justify-end gap-2 invisible group-hover:visible transition-all">
                      {/* Toggle Status */}
                      <button
                        onClick={() => onToggleStatus(user.id, user.status as UserStatus)}
                        className={`p-2 rounded-lg transition-all hover:scale-110 ${
                          user.status === 'ACTIVE'
                            ? 'hover:bg-red-50 text-red-600'
                            : 'hover:bg-green-50 text-green-600'
                        }`}
                        title={user.status === 'ACTIVE' ? 'Bloquer' : 'Débloquer'}
                      >
                        {user.status === 'ACTIVE' ? (
                          <Lock size={18} color="currentColor" />
                        ) : (
                          <Unlock size={18} color="currentColor" />
                        )}
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => onEdit && onEdit(user)}
                        className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-all hover:scale-110"
                        title="Modifier"
                      >
                        <Edit2 size={18} color="currentColor" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => onDelete && onDelete(user)}
                        className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-all hover:scale-110"
                        title="Supprimer"
                      >
                        <Trash size={18} color="currentColor" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-end">
                      <span className="text-xs text-gray-400 italic">Vous</span>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersTable;
