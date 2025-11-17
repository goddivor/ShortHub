// src/pages/videaste/VideasteDashboardPage.tsx
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { useQuery } from '@apollo/client/react';
import { GET_MY_SHORTS_QUERY } from '@/lib/graphql';
import { Short, ShortStatus, ShortFilterInput } from '@/types/graphql';
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
  TrendUp
} from 'iconsax-react';
import { format, subDays, startOfDay, eachDayOfInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const VideasteDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifications, loading: notificationsLoading } = useNotifications({
    first: 5,
    unreadOnly: false,
  });

  // Fetch all shorts for charts
  const filter: ShortFilterInput = {
    assignedToId: user?.id,
  };

  const { data: shortsData } = useQuery<{ shorts: Short[] }>(GET_MY_SHORTS_QUERY, {
    variables: { filter },
    skip: !user,
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const shorts: Short[] = shortsData?.shorts || [];

  const userStats = user?.stats;

  // Calculate stats from shorts
  const calculatedStats = useMemo(() => {
    return {
      total: shorts.length,
      assigned: shorts.filter((s) => s.status === ShortStatus.ASSIGNED).length,
      inProgress: shorts.filter((s) => s.status === ShortStatus.IN_PROGRESS).length,
      completed: shorts.filter((s) => s.status === ShortStatus.COMPLETED).length,
      late: shorts.filter((s) => {
        if (!s.deadline || s.status === ShortStatus.COMPLETED) return false;
        return new Date(s.deadline) < new Date();
      }).length,
    };
  }, [shorts]);

  const statsCards = [
    {
      title: 'Shorts Assignés',
      value: calculatedStats.total,
      icon: <Video color="#3B82F6" size={24} variant="Bold" />,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'En Cours',
      value: calculatedStats.inProgress,
      icon: <Play color="#F59E0B" size={24} variant="Bold" />,
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Terminés',
      value: calculatedStats.completed,
      icon: <TickCircle color="#10B981" size={24} variant="Bold" />,
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'En Retard',
      value: calculatedStats.late,
      icon: <CloseCircle color="#EF4444" size={24} variant="Bold" />,
      bgColor: 'bg-red-50',
      textColor: 'text-red-600'
    }
  ];

  const quickActions = [
    {
      title: 'Mes Shorts',
      description: 'Voir tous les shorts qui me sont assignés',
      icon: <Video color="#3B82F6" size={24} variant="Bold" />,
      color: 'blue',
      path: '/videaste/shorts'
    },
    {
      title: 'Calendrier',
      description: 'Consulter le calendrier des deadlines',
      icon: <Calendar color="#8B5CF6" size={24} variant="Bold" />,
      color: 'purple',
      path: '/videaste/calendar'
    }
  ];

  // Prepare data for charts
  const activityData = useMemo(() => {
    const last7Days = eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date()
    });

    return last7Days.map(day => {
      const dayStart = startOfDay(day);
      const completed = shorts.filter(s =>
        s.completedAt &&
        startOfDay(new Date(s.completedAt)).getTime() === dayStart.getTime()
      ).length;

      return {
        date: format(day, 'EEE', { locale: fr }),
        fullDate: format(day, 'dd/MM'),
        completed
      };
    });
  }, [shorts]);

  const statusDistribution = useMemo(() => {
    const assigned = shorts.filter(s => s.status === ShortStatus.ASSIGNED).length;
    const inProgress = shorts.filter(s => s.status === ShortStatus.IN_PROGRESS).length;
    const completed = shorts.filter(s => s.status === ShortStatus.COMPLETED).length;

    return [
      { name: 'Assignés', value: assigned, color: '#3B82F6' },
      { name: 'En cours', value: inProgress, color: '#F59E0B' },
      { name: 'Terminés', value: completed, color: '#10B981' }
    ];
  }, [shorts]);

  const performanceData = useMemo(() => {
    const last30Days = eachDayOfInterval({
      start: subDays(new Date(), 29),
      end: new Date()
    });

    // Group by week
    const weeks: { week: string; completed: number; onTime: number; late: number }[] = [];
    let weekIndex = 0;

    last30Days.forEach((day, index) => {
      if (index % 7 === 0) {
        weeks.push({
          week: `S${weekIndex + 1}`,
          completed: 0,
          onTime: 0,
          late: 0
        });
        weekIndex++;
      }

      const dayStart = startOfDay(day);
      const completedShorts = shorts.filter(s =>
        s.completedAt &&
        startOfDay(new Date(s.completedAt)).getTime() === dayStart.getTime()
      );

      const currentWeek = weeks[weeks.length - 1];
      currentWeek.completed += completedShorts.length;

      completedShorts.forEach(s => {
        if (s.deadline && s.completedAt) {
          const isLate = new Date(s.completedAt) > new Date(s.deadline);
          if (isLate) {
            currentWeek.late++;
          } else {
            currentWeek.onTime++;
          }
        }
      });
    });

    return weeks;
  }, [shorts]);

  const COLORS = ['#3B82F6', '#F59E0B', '#10B981'];

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Bienvenue, {user?.username}</h1>
            <p className="text-blue-100 text-lg">
              Gérez vos shorts et suivez votre progression
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

      {/* Charts Row 1 - Activity & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-green-100 rounded-lg p-2">
              <TrendUp size={20} color="#10B981" variant="Bold" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Activité des 7 derniers jours</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="date"
                stroke="#6B7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#6B7280"
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                labelFormatter={(value, payload) => {
                  if (payload && payload.length > 0) {
                    return payload[0].payload.fullDate;
                  }
                  return value;
                }}
              />
              <Line
                type="monotone"
                dataKey="completed"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ fill: '#10B981', r: 5 }}
                activeDot={{ r: 7 }}
                name="Shorts terminés"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-purple-100 rounded-lg p-2">
              <Chart size={20} color="#8B5CF6" variant="Bold" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Répartition par statut</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: { name?: string; percent?: number }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {statusDistribution.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 - Performance */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 rounded-lg p-2">
            <Chart size={20} color="#3B82F6" variant="Bold" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Performance hebdomadaire (30 derniers jours)</h2>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="week"
              stroke="#6B7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#6B7280"
              style={{ fontSize: '12px' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend />
            <Bar dataKey="onTime" fill="#10B981" name="À temps" radius={[8, 8, 0, 0]} />
            <Bar dataKey="late" fill="#EF4444" name="En retard" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
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
                color={action.color === 'blue' ? '#3B82F6' : '#8B5CF6'}
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
                ${action.color === 'blue'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
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
                <div className="bg-indigo-100 rounded-lg p-2">
                  <Notification size={20} color="#6366F1" variant="Bold" />
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
                <div key={notif.id} className={`p-4 hover:bg-gray-50 transition-colors ${!notif.read ? 'bg-indigo-50/30' : ''}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${!notif.read ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 rounded-lg p-2">
                <Chart size={20} color="#3B82F6" variant="Bold" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Ma Performance</h2>
            </div>
          </div>

          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  {
                    name: 'Taux complétion',
                    value: userStats?.completionRate || 0,
                    color: '#3B82F6'
                  },
                  {
                    name: 'À temps',
                    value: calculatedStats.completed > 0
                      ? ((calculatedStats.completed - calculatedStats.late) / calculatedStats.completed * 100)
                      : 0,
                    color: '#10B981'
                  },
                  {
                    name: 'En retard',
                    value: calculatedStats.completed > 0
                      ? (calculatedStats.late / calculatedStats.completed * 100)
                      : 0,
                    color: '#EF4444'
                  }
                ]}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis type="number" domain={[0, 100]} stroke="#6B7280" style={{ fontSize: '12px' }} />
                <YAxis type="category" dataKey="name" stroke="#6B7280" style={{ fontSize: '12px' }} width={120} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value: number) => `${value.toFixed(1)}%`}
                />
                <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                  {[
                    { name: 'Taux complétion', value: userStats?.completionRate || 0, color: '#3B82F6' },
                    { name: 'À temps', value: 0, color: '#10B981' },
                    { name: 'En retard', value: 0, color: '#EF4444' }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-200">
                <p className="text-xs font-medium text-blue-600 mb-1">Taux de complétion</p>
                <p className="text-2xl font-bold text-blue-700">
                  {userStats?.completionRate ? `${userStats.completionRate.toFixed(1)}%` : '0%'}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center border border-green-200">
                <p className="text-xs font-medium text-green-600 mb-1">Ce mois-ci</p>
                <p className="text-2xl font-bold text-green-700">
                  {userStats?.videosCompletedThisMonth || 0}
                </p>
                <p className="text-xs text-green-600 mt-1">shorts</p>
              </div>
              <div className="bg-indigo-50 rounded-lg p-4 text-center border border-indigo-200">
                <p className="text-xs font-medium text-indigo-600 mb-1 flex items-center justify-center gap-1">
                  <Timer size={12} color="#6366F1" variant="Bold" />
                  Temps moyen
                </p>
                <p className="text-2xl font-bold text-indigo-700">
                  {userStats?.averageCompletionTime
                    ? `${Math.round(userStats.averageCompletionTime / 60)}`
                    : 'N/A'}
                </p>
                <p className="text-xs text-indigo-600 mt-1">minutes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideasteDashboardPage;
