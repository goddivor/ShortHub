// src/hooks/useUserManagement.ts
import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_USERS_QUERY, CREATE_USER_MUTATION, UPDATE_USER_STATUS_MUTATION } from '@/lib/graphql';
import { useToast } from '@/context/toast-context';
import { UserRole, UserStatus, UsersConnection } from '@/types/graphql';

interface CreateUserInput {
  username: string;
  email: string;
  password: string;
  role: UserRole;
}

export const useUserManagement = () => {
  const { success, error } = useToast();
  const [filterRole, setFilterRole] = useState<UserRole | ''>('');
  const [filterStatus, setFilterStatus] = useState<UserStatus | ''>('');

  // Query users with filters
  const { data, loading } = useQuery<{ users: UsersConnection }>(GET_USERS_QUERY, {
    variables: {
      first: 20,
      role: filterRole || undefined,
      status: filterStatus || undefined,
    },
  });

  // Mutations
  const [createUserMutation, { loading: creating }] = useMutation(CREATE_USER_MUTATION, {
    refetchQueries: [{ query: GET_USERS_QUERY }],
  });

  const [updateUserStatusMutation, { loading: updating }] = useMutation(UPDATE_USER_STATUS_MUTATION, {
    refetchQueries: [{ query: GET_USERS_QUERY }],
  });

  // Handlers
  const createUser = async (input: CreateUserInput) => {
    try {
      await createUserMutation({
        variables: { input },
      });
      success('Utilisateur créé', 'Le nouvel utilisateur a été créé avec succès');
      return true;
    } catch (err) {
      error('Erreur', err instanceof Error ? err.message : 'Impossible de créer l\'utilisateur');
      return false;
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: UserStatus) => {
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
      return true;
    } catch (err) {
      error('Erreur', err instanceof Error ? err.message : 'Impossible de mettre à jour le statut');
      return false;
    }
  };

  const users = data?.users.edges.map(edge => edge.node) || [];
  const totalCount = data?.users.totalCount || 0;

  return {
    users,
    totalCount,
    loading,
    creating,
    updating,
    filterRole,
    filterStatus,
    setFilterRole,
    setFilterStatus,
    createUser,
    toggleUserStatus,
  };
};
