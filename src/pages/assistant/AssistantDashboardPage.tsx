// src/pages/assistant/AssistantDashboardPage.tsx
import React from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import SpinLoader from '@/components/SpinLoader';
import {
  Video,
  Calendar,
  TickCircle,
  Timer,
  Chart,
  ArrowRight,
  Notification,
  CloseCircle,
  Play,
  People
} from 'iconsax-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const AssistantDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifications, loading: notificationsLoading } = useNotifications({
    first: 5,
    unreadOnly: false,
  });

  const userStats = user?.stats;

  const statsCards = [
    {
      title: 'Vidéos Assignées',
      value: userStats?.totalVideosAssigned || 0,
      icon: <Video color="#06B6D4" size={24} variant="Bold" />,
      bgColor: 'bg-cyan-50',
      textColor: 'text-cyan-600'
    },
    {
      title: 'En Cours',
      value: userStats?.totalVideosInProgress || 0,
      icon: <Play color="#F59E0B" size={24} variant="Bold" />,
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Complétées',
      value: userStats?.totalVideosCompleted || 0,
      icon: <TickCircle color="#10B981" size={24} variant="Bold" />,
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'En Retard',
      value: userStats?.videosLate || 0,
      icon: <CloseCircle color="#EF4444" size={24} variant="Bold" />,
      bgColor: 'bg-red-50',
      textColor: 'text-red-600'
    }
  ];

  const quickActions = [
    {
      title: 'Mes Vidéos',
      description: 'Voir toutes mes vidéos assignées',
      icon: <Video color="#06B6D4" size={24} variant="Bold" />,
      color: 'cyan',
      path: '/assistant/videos'
    },
    {
      title: 'Calendrier',
      description: 'Consulter le calendrier de publication',
      icon: <Calendar color="#8B5CF6" size={24} variant="Bold" />,
      color: 'purple',
      path: '/assistant/calendar'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-cyan-600 to-teal-700 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <People size={32} color="white" variant="Bold" />
              <h1 className="text-3xl font-bold">Bienvenue, {user?.username}</h1>
            </div>
            <p className="text-cyan-100 text-lg">
              Assistant vidéaste - Gérez vos tâches et collaborez efficacement
            </p>
          </div>
          <div className="hidden md:block">
            <Video size={64} color="white" className="opacity-20" variant="Bold" />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-2">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 group-hover:scale-110 transition-transform duration-300">
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${stat.bgColor} group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-sm`}>
                {stat.icon}
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className={`w-2 h-2 rounded-full ${stat.bgColor.replace('bg-', 'bg-')}`}></div>
                <span className="group-hover:text-gray-700 transition-colors">Voir détails</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quickActions.map((action, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group cursor-pointer"
            onClick={() => navigate(action.path)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                {action.icon}
              </div>
              <ArrowRight
                color={action.color === 'cyan' ? '#06B6D4' : '#8B5CF6'}
                size={24}
                className="group-hover:translate-x-1 transition-transform duration-300"
                variant="Bold"
              />
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {action.title}
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">{action.description}</p>

            <div
              className={`
                w-full py-3 px-4 font-medium rounded-lg transition-all flex items-center justify-center gap-2 shadow-md group-hover:shadow-lg
                ${action.color === 'cyan'
                  ? 'bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white'
                }
              `}
            >
              <span>Accéder</span>
              <ArrowRight size={18} variant="Bold" />
            </div>
          </div>
        ))}
      </div>

      {/* Activity & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notifications récentes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-cyan-100 rounded-lg p-2">
                  <Notification size={20} color="#06B6D4" variant="Bold" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Notifications Récentes</h2>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
            {notificationsLoading ? (
              <div className="p-6 text-center">
                <SpinLoader />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Notification size={48} color="#9CA3AF" className="mx-auto mb-3" variant="Bulk" />
                <p className="text-gray-500">Aucune notification</p>
              </div>
            ) : (
              notifications.slice(0, 5).map((notif) => (
                <div key={notif.id} className={`p-4 hover:bg-gray-50 transition-colors ${!notif.read ? 'bg-cyan-50/30' : ''}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${!notif.read ? 'bg-cyan-600' : 'bg-gray-300'}`}></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">{notif.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {format(new Date(notif.createdAt), 'PPp', { locale: fr })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Performance Overview */}
        <div className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-xl shadow-sm border border-cyan-200 overflow-hidden">
          <div className="p-6 border-b border-cyan-200">
            <div className="flex items-center gap-3">
              <div className="bg-cyan-600 rounded-lg p-2">
                <Chart size={20} color="white" variant="Bold" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Ma Performance</h2>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {/* Completion Rate */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Taux de complétion</span>
                <span className="text-lg font-bold text-cyan-600">
                  {userStats?.completionRate ? `${userStats.completionRate.toFixed(1)}%` : '0%'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-teal-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${userStats?.completionRate || 0}%` }}
                ></div>
              </div>
            </div>

            {/* Average Completion Time */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Temps moyen</span>
                <div className="flex items-center gap-2">
                  <Timer size={16} color="#06B6D4" variant="Bold" />
                  <span className="text-lg font-bold text-teal-600">
                    {userStats?.averageCompletionTime
                      ? `${Math.round(userStats.averageCompletionTime / 60)} min`
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Monthly Stats */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Ce mois-ci</span>
                <span className="text-lg font-bold text-green-600">
                  {userStats?.videosCompletedThisMonth || 0} vidéos
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                <div className="flex items-center gap-1">
                  <TickCircle size={12} color="#10B981" variant="Bold" />
                  <span>{userStats?.videosOnTime || 0} à temps</span>
                </div>
                <div className="flex items-center gap-1">
                  <CloseCircle size={12} color="#EF4444" variant="Bold" />
                  <span>{userStats?.videosLate || 0} en retard</span>
                </div>
              </div>
            </div>

            {/* Info Badge */}
            <div className="bg-gradient-to-r from-cyan-100 to-teal-100 rounded-lg p-4 border border-cyan-200">
              <div className="flex items-start gap-3">
                <People size={20} color="#06B6D4" variant="Bold" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Rôle: Assistant</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Vous secondez le vidéaste dans la réalisation des vidéos
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssistantDashboardPage;
