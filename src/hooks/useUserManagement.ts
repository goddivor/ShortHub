// src/hooks/useUserManagement.ts
import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import {
  GET_USERS_QUERY,
  CREATE_USER_MUTATION,
  UPDATE_USER_MUTATION,
  UPDATE_USER_STATUS_MUTATION,
  DELETE_USER_MUTATION,
  CHANGE_USER_PASSWORD_MUTATION
} from '@/lib/graphql';
import { useToast } from '@/context/toast-context';
import { UserRole, UserStatus, UsersConnection } from '@/types/graphql';

interface CreateUserInput {
  username: string;
  password: string;
  role: UserRole;
}

interface UpdateUserInput {
  email?: string;
  phone?: string;
  emailNotifications?: boolean;
  whatsappNotifications?: boolean;
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

  const [updateUserMutation, { loading: updatingUser }] = useMutation(UPDATE_USER_MUTATION, {
    refetchQueries: [{ query: GET_USERS_QUERY }],
  });

  const [deleteUserMutation, { loading: deleting }] = useMutation(DELETE_USER_MUTATION, {
    refetchQueries: [{ query: GET_USERS_QUERY }],
  });

  const [changeUserPasswordMutation, { loading: changingPassword }] = useMutation(CHANGE_USER_PASSWORD_MUTATION, {
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

  const updateUser = async (userId: string, input: UpdateUserInput) => {
    try {
      await updateUserMutation({
        variables: {
          id: userId,
          input,
        },
      });
      success('Utilisateur modifié', 'Les informations de l\'utilisateur ont été mises à jour');
      return true;
    } catch (err) {
      error('Erreur', err instanceof Error ? err.message : 'Impossible de modifier l\'utilisateur');
      return false;
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      await deleteUserMutation({
        variables: { id: userId },
      });
      success('Utilisateur supprimé', 'L\'utilisateur a été supprimé avec succès');
      return true;
    } catch (err) {
      error('Erreur', err instanceof Error ? err.message : 'Impossible de supprimer l\'utilisateur');
      return false;
    }
  };

  const changeUserPassword = async (userId: string, newPassword: string) => {
    try {
      await changeUserPasswordMutation({
        variables: {
          userId,
          newPassword,
        },
      });
      success('Mot de passe modifié', 'Le mot de passe de l\'utilisateur a été changé avec succès');
      return true;
    } catch (err) {
      error('Erreur', err instanceof Error ? err.message : 'Impossible de modifier le mot de passe');
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
    updatingUser,
    deleting,
    changingPassword,
    filterRole,
    filterStatus,
    setFilterRole,
    setFilterStatus,
    createUser,
    updateUser,
    deleteUser,
    changeUserPassword,
    toggleUserStatus,
  };
};
