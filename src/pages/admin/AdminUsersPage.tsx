// src/pages/admin/AdminUsersPage.tsx
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserManagement } from '@/hooks/useUserManagement';
import { CreateUserModal, UsersTable, UsersFilters } from '@/components/admin/users';
import SpinLoader from '@/components/SpinLoader';
import { Add, People } from 'iconsax-react';
import { UserRole } from '@/types/graphql';

const AdminUsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const {
    users,
    totalCount,
    loading,
    creating,
    filterRole,
    filterStatus,
    setFilterRole,
    setFilterStatus,
    createUser,
    toggleUserStatus,
  } = useUserManagement();

  const handleCreateUser = async (data: {
    username: string;
    email: string;
    password: string;
    role: UserRole;
  }) => {
    const success = await createUser(data);
    if (success) {
      setShowCreateModal(false);
    }
    return success;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <SpinLoader />
          <p className="text-gray-600 mt-4">Chargement des utilisateurs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-white/20 rounded-xl p-3">
                <People size={32} color="white" variant="Bold" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Gestion des Utilisateurs</h1>
                <p className="text-red-100 text-sm mt-1">
                  Gérez les comptes et les accès de votre équipe
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-white text-red-600 rounded-xl font-semibold hover:bg-red-50 transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            <Add size={20} color="currentColor" variant="Bold" />
            <span>Créer utilisateur</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <p className="text-red-100 text-sm font-medium">Total</p>
            <p className="text-3xl font-bold mt-1">{totalCount}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <p className="text-red-100 text-sm font-medium">Actifs</p>
            <p className="text-3xl font-bold mt-1">
              {users.filter((u) => u.status === 'ACTIVE').length}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <p className="text-red-100 text-sm font-medium">Vidéastes</p>
            <p className="text-3xl font-bold mt-1">
              {users.filter((u) => u.role === 'VIDEASTE').length}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <p className="text-red-100 text-sm font-medium">Assistants</p>
            <p className="text-3xl font-bold mt-1">
              {users.filter((u) => u.role === 'ASSISTANT').length}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <UsersFilters
        filterRole={filterRole}
        filterStatus={filterStatus}
        onRoleChange={setFilterRole}
        onStatusChange={setFilterStatus}
        totalCount={totalCount}
      />

      {/* Users Table */}
      <UsersTable
        users={users}
        loading={loading}
        currentUserId={currentUser?.id}
        onToggleStatus={toggleUserStatus}
        // onEdit and onDelete can be added later
      />

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateUser}
        isSubmitting={creating}
      />
    </div>
  );
};

export default AdminUsersPage;
