// src/pages/admin/AdminUsersPage.tsx
import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_USERS_QUERY, CREATE_USER_MUTATION, UPDATE_USER_STATUS_MUTATION } from '@/lib/graphql';
import { useToast } from '@/context/toast-context';
import Button from '@/components/Button';
import SpinLoader from '@/components/SpinLoader';
import { Add, Edit, Trash, Lock, Unlock } from 'iconsax-react';
import { UserRole } from '@/types/graphql';
import type { UserStatus, UsersConnection } from '@/types/graphql';

interface CreateUserFormData {
  username: string;
  email: string;
  password: string;
  role: UserRole;
}

const AdminUsersPage: React.FC = () => {
  const { success, error } = useToast();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterRole, setFilterRole] = useState<UserRole | ''>('');
  const [filterStatus, setFilterStatus] = useState<UserStatus | ''>('');

  const { data, loading, refetch } = useQuery<{ users: UsersConnection }>(GET_USERS_QUERY, {
    variables: {
      first: 20,
      role: filterRole || undefined,
      status: filterStatus || undefined,
    },
  });

  const [createUserMutation] = useMutation(CREATE_USER_MUTATION, {
    refetchQueries: [{ query: GET_USERS_QUERY }],
  });

  const [updateUserStatusMutation] = useMutation(UPDATE_USER_STATUS_MUTATION, {
    refetchQueries: [{ query: GET_USERS_QUERY }],
  });

  const handleCreateUser = async (formData: CreateUserFormData) => {
    try {
      await createUserMutation({
        variables: {
          input: {
            username: formData.username,
            email: formData.email,
            password: formData.password,
            role: formData.role,
          },
        },
      });
      success('Utilisateur créé', 'Le nouvel utilisateur a été créé avec succès');
      setShowCreateModal(false);
    } catch (err) {
      error('Erreur', err instanceof Error ? err.message : 'Impossible de créer l\'utilisateur');
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: UserStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    try {
      await updateUserStatusMutation({
        variables: {
          id: userId,
          status: newStatus,
        },
      });
      success(
        'Statut mis à jour',
        `L'utilisateur a été ${newStatus === 'BLOCKED' ? 'bloqué' : 'débloqué'}`
      );
    } catch (err) {
      error('Erreur', err instanceof Error ? err.message : 'Impossible de mettre à jour le statut');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <SpinLoader />
      </div>
    );
  }

  const users = data?.users.edges.map(edge => edge.node) || [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
          <p className="text-gray-600 mt-2">Total: {data?.users.totalCount || 0} utilisateurs</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
        >
          <Add size={20} color="white" />
          <span>Créer utilisateur</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Filtrer par rôle</label>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as UserRole | '')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">Tous les rôles</option>
            <option value="VIDEASTE">VIDEASTE</option>
            <option value="ASSISTANT">ASSISTANT</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Filtrer par statut</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as UserStatus | '')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">Tous les statuts</option>
            <option value="ACTIVE">ACTIF</option>
            <option value="BLOCKED">BLOQUÉ</option>
          </select>
        </div>

        <div className="flex items-end">
          <Button
            onClick={() => refetch()}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Actualiser
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Nom d'utilisateur</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Rôle</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Statut</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Créé le</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-sm font-semibold text-red-600">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900">{user.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'VIDEASTE' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        user.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.status === 'ACTIVE' ? 'Actif' : 'Bloqué'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleStatus(user.id, user.status as UserStatus)}
                          className={`p-2 rounded-lg transition-colors ${
                            user.status === 'ACTIVE'
                              ? 'hover:bg-red-50 text-red-600'
                              : 'hover:bg-green-50 text-green-600'
                          }`}
                          title={user.status === 'ACTIVE' ? 'Bloquer' : 'Débloquer'}
                        >
                        {user.status === 'ACTIVE' ? <Lock size={18} color="currentColor" /> : <Unlock size={18} color="currentColor" />}
                        </button>
                        <button
                          className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                          title="Modifier"
                        >
                          <Edit size={18} color="blue" />
                        </button>
                        <button
                          className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                          title="Supprimer"
                          color="red"
                        >
                          <Trash size={18} color="red" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <CreateUserModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateUser}
        />
      )}
    </div>
  );
};

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserFormData) => Promise<void>;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<CreateUserFormData>({
    username: '',
    email: '',
    password: '',
    role: UserRole.VIDEASTE,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setFormData({ username: '', email: '', password: '', role: UserRole.VIDEASTE });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Créer un nouvel utilisateur</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom d'utilisateur *</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe *</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rôle *</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value={UserRole.VIDEASTE}>VIDEASTE</option>
              <option value={UserRole.ASSISTANT}>ASSISTANT</option>
            </select>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? <SpinLoader /> : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminUsersPage;
