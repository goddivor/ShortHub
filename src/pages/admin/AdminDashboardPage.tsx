// src/pages/admin/AdminDashboardPage.tsx
import React, { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_DASHBOARD_ANALYTICS_QUERY, GET_VIDEOS_QUERY, GET_VIDEO_QUERY } from '@/lib/graphql';
import SpinLoader from '@/components/SpinLoader';
import VideoComments from '@/components/VideoComments';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  User,
  Video as VideoIcon,
  TrendUp,
  TickCircle,
  Timer,
  Youtube,
  MessageText,
  Eye,
  Calendar,
} from 'iconsax-react';
import type { DashboardAnalytics, Video, VideoStatus, VideosConnection } from '@/types/graphql';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const AdminDashboardPage: React.FC = () => {
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

  const { data, loading, error } = useQuery<{ dashboardAnalytics: DashboardAnalytics }>(
    GET_DASHBOARD_ANALYTICS_QUERY
  );

  // Fetch recent videos that need attention
  const { data: videosData, loading: videosLoading } = useQuery<{ videos: VideosConnection }>(GET_VIDEOS_QUERY, {
    variables: {
      first: 10,
      filter: {
        status: 'IN_PROGRESS' as VideoStatus,
      },
    },
  });

  // Fetch selected video details with comments
  const { data: videoData } = useQuery<{ video: Video }>(GET_VIDEO_QUERY, {
    variables: { id: selectedVideoId },
    skip: !selectedVideoId,
  });

  const recentVideos = videosData?.videos?.edges?.map((edge) => edge.node) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <SpinLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">Erreur: {error.message}</p>
      </div>
    );
  }

  const analytics = data?.dashboardAnalytics;

  // Données pour le graphique des vidéos par statut - Filter out zero values
  const videoStatusData = [
    { name: 'Rollées', value: analytics?.videosRolled || 0, fill: '#EF4444' },
    { name: 'Assignées', value: analytics?.videosAssigned || 0, fill: '#F97316' },
    { name: 'En cours', value: analytics?.videosInProgress || 0, fill: '#EAB308' },
    { name: 'Complétées', value: analytics?.videosCompleted || 0, fill: '#10B981' },
    { name: 'Validées', value: analytics?.videosValidated || 0, fill: '#06B6D4' },
    { name: 'Publiées', value: analytics?.videosPublished || 0, fill: '#8B5CF6' },
    { name: 'Rejetées', value: analytics?.videosRejected || 0, fill: '#64748B' },
  ].filter(item => item.value > 0); // Only show non-zero values

  // Données pour le graphique des vidéos complétées par jour (7 jours)
  const videosCompletedData = (analytics?.videosCompletedLast7Days || []).map((item, index) => ({
    day: `J${index - 6}`,
    count: item.count,
  }));

  // Données pour le graphique des chaînes
  const channelData = [
    { name: 'SOURCE', value: analytics?.totalSourceChannels || 0, fill: '#06B6D4' },
    { name: 'PUBLICATION', value: analytics?.totalPublicationChannels || 0, fill: '#8B5CF6' },
  ];

  // Données pour le graphique de performance - Meilleurs vidéastes
  const topVideastesData = (analytics?.topVideastes || []).slice(0, 5).map((v) => ({
    name: v.user.username,
    vidéos: v.videosCompleted,
    taux: v.completionRate,
  }));

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord Admin</h1>
        <p className="text-gray-600 mt-2">Vue d'ensemble de la plateforme ShortHub</p>
      </div>

      {/* KPI Cards - Improved Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Utilisateurs */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group cursor-pointer">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <User size={18} color="white" variant="Bold" />
                <p className="text-blue-100 text-sm font-medium">Utilisateurs</p>
              </div>
              <p className="text-4xl font-bold group-hover:scale-110 transition-transform duration-300">
                {analytics?.totalUsers || 0}
              </p>
              <p className="text-blue-100 text-xs mt-2">Total actifs</p>
            </div>
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
              <User size={32} color="white" variant="Bulk" />
            </div>
          </div>
        </div>

        {/* Total Chaînes */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group cursor-pointer">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Youtube size={18} color="white" variant="Bold" />
                <p className="text-purple-100 text-sm font-medium">Chaînes</p>
              </div>
              <p className="text-4xl font-bold group-hover:scale-110 transition-transform duration-300">
                {analytics?.totalChannels || 0}
              </p>
              <p className="text-purple-100 text-xs mt-2">
                {analytics?.totalSourceChannels || 0} sources / {analytics?.totalPublicationChannels || 0} pub
              </p>
            </div>
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
              <Youtube size={32} color="white" variant="Bulk" />
            </div>
          </div>
        </div>

        {/* Total Vidéos */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group cursor-pointer">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <VideoIcon size={18} color="white" variant="Bold" />
                <p className="text-green-100 text-sm font-medium">Vidéos Totales</p>
              </div>
              <p className="text-4xl font-bold group-hover:scale-110 transition-transform duration-300">
                {analytics?.totalVideos || 0}
              </p>
              <p className="text-green-100 text-xs mt-2">
                {analytics?.videosInProgress || 0} en cours
              </p>
            </div>
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
              <TrendUp size={32} color="white" variant="Bulk" />
            </div>
          </div>
        </div>

        {/* Vidéos Publiées */}
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group cursor-pointer">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <TickCircle size={18} color="white" variant="Bold" />
                <p className="text-red-100 text-sm font-medium">Publiées</p>
              </div>
              <p className="text-4xl font-bold group-hover:scale-110 transition-transform duration-300">
                {analytics?.videosPublished || 0}
              </p>
              <p className="text-red-100 text-xs mt-2">
                {analytics?.videosValidated || 0} validées
              </p>
            </div>
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
              <TickCircle size={32} color="white" variant="Bulk" />
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition des vidéos par statut - Pie Chart */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <VideoIcon size={24} color="#6366F1" variant="Bold" />
            <h2 className="text-xl font-bold text-gray-900">Répartition par Statut</h2>
          </div>
          {videoStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={videoStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, value, percent }) => `${name}: ${value} (${percent ? (percent * 100).toFixed(0) : 0}%)`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {videoStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} vidéos`, 'Nombre']} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <VideoIcon size={48} color="#9CA3AF" className="mx-auto mb-3" variant="Bulk" />
                <p className="text-gray-500">Aucune vidéo dans le système</p>
              </div>
            </div>
          )}
        </div>

        {/* Vidéos complétées sur 7 jours - Line Chart */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <TrendUp size={24} color="#10B981" variant="Bold" />
            <h2 className="text-xl font-bold text-gray-900">Tendance 7 jours</h2>
          </div>
          {videosCompletedData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={videosCompletedData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} vidéos`, 'Complétées']} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#10B981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorCount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <TrendUp size={48} color="#9CA3AF" className="mx-auto mb-3" variant="Bulk" />
                <p className="text-gray-500">Pas de données disponibles</p>
              </div>
            </div>
          )}
        </div>

        {/* Répartition SOURCE vs PUBLICATION - Bar Chart */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Youtube size={24} color="#8B5CF6" variant="Bold" />
            <h2 className="text-xl font-bold text-gray-900">Chaînes par Type</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={channelData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value} chaînes`, 'Total']} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {channelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* État des vidéos - Detailed Stats - Bar Chart */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <TickCircle size={24} color="#EF4444" variant="Bold" />
            <h2 className="text-xl font-bold text-gray-900">État Détaillé</h2>
          </div>
          {videoStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={videoStatusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} vidéos`, 'Total']} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {videoStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <TickCircle size={48} color="#9CA3AF" className="mx-auto mb-3" variant="Bulk" />
                <p className="text-gray-500">Aucune vidéo dans le système</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4 border-b">
          <h2 className="text-2xl font-bold text-white">Métriques de Performance</h2>
          <p className="text-indigo-100 text-sm mt-1">Analyse des performances de l'équipe</p>
        </div>

        <div className="p-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Timer size={20} color="#3B82F6" variant="Bold" />
                <p className="text-gray-700 text-sm font-medium">Temps Moyen</p>
              </div>
              <p className="text-3xl font-bold text-blue-600">
                {analytics?.averageCompletionTime ? `${analytics.averageCompletionTime.toFixed(1)}h` : 'N/A'}
              </p>
              <p className="text-xs text-gray-600 mt-1">par vidéo</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <Timer size={20} color="#EF4444" variant="Bold" />
                <p className="text-gray-700 text-sm font-medium">En Retard</p>
              </div>
              <p className="text-3xl font-bold text-red-600">{analytics?.videosLate || 0}</p>
              <p className="text-xs text-gray-600 mt-1">deadline dépassée</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <TickCircle size={20} color="#10B981" variant="Bold" />
                <p className="text-gray-700 text-sm font-medium">Taux Global</p>
              </div>
              <p className="text-3xl font-bold text-green-600">
                {analytics?.completionRate ? `${analytics.completionRate.toFixed(0)}%` : 'N/A'}
              </p>
              <p className="text-xs text-gray-600 mt-1">complétion</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <User size={20} color="#8B5CF6" variant="Bold" />
                <p className="text-gray-700 text-sm font-medium">Meilleur</p>
              </div>
              <p className="text-xl font-bold text-purple-600 truncate">
                {analytics?.topVideastes?.[0]?.user?.username || 'N/A'}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {analytics?.topVideastes?.[0]?.videosCompleted || 0} vidéos
              </p>
            </div>
          </div>

          {/* Top Vidéastes Performance Chart */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendUp size={24} color="#6366F1" variant="Bold" />
              <h3 className="text-lg font-bold text-gray-900">Top 5 Vidéastes</h3>
            </div>
            {topVideastesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={topVideastesData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip
                    formatter={(value, name) => {
                      if (name === 'vidéos') return [`${value} vidéos`, 'Complétées'];
                      if (name === 'taux') return [`${typeof value === 'number' ? value.toFixed(1) : value}%`, 'Taux'];
                      return value;
                    }}
                  />
                  <Bar dataKey="vidéos" fill="#8B5CF6" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[350px] flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <User size={48} color="#9CA3AF" className="mx-auto mb-3" variant="Bulk" />
                  <p>Aucune donnée de performance disponible</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Vidéos en cours & Communication */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des vidéos en cours */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
            <div className="flex items-center gap-3 text-white">
              <VideoIcon size={24} variant="Bold" />
              <div>
                <h2 className="text-xl font-bold">Vidéos en Cours</h2>
                <p className="text-indigo-100 text-sm">Besoin d'attention</p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
            {videosLoading ? (
              <div className="p-6 text-center">
                <SpinLoader />
              </div>
            ) : recentVideos.length === 0 ? (
              <div className="p-8 text-center">
                <VideoIcon size={48} color="#9CA3AF" className="mx-auto mb-3" variant="Bulk" />
                <p className="text-gray-500">Aucune vidéo en cours</p>
              </div>
            ) : (
              recentVideos.map((video: Video) => (
                <div
                  key={video.id}
                  onClick={() => setSelectedVideoId(video.id)}
                  className={`p-4 hover:bg-indigo-50 cursor-pointer transition-all duration-200 ${
                    selectedVideoId === video.id ? 'bg-indigo-50 border-l-4 border-indigo-600' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Youtube size={16} color="#6366F1" variant="Bold" />
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {video.sourceChannel.username}
                        </p>
                      </div>

                      {video.assignedTo && (
                        <div className="flex items-center gap-2 mb-2">
                          <User size={14} color="#6B7280" />
                          <p className="text-xs text-gray-600">
                            Assigné à {video.assignedTo.username}
                          </p>
                        </div>
                      )}

                      {video.scheduledDate && (
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar size={14} color={video.isLate ? '#EF4444' : '#6B7280'} />
                          <p className={`text-xs ${video.isLate ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                            {format(new Date(video.scheduledDate), 'PPp', { locale: fr })}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center gap-3 mt-2">
                        <span className={`
                          inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                          ${video.isLate ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}
                        `}>
                          <Timer size={12} variant="Bold" />
                          {video.isLate ? 'En retard' : 'En cours'}
                        </span>
                        {video.comments && video.comments.length > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            <MessageText size={12} variant="Bold" />
                            {video.comments.length}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      <Eye
                        size={20}
                        color={selectedVideoId === video.id ? '#6366F1' : '#9CA3AF'}
                        variant={selectedVideoId === video.id ? 'Bold' : 'Outline'}
                        className="transition-colors"
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Panneau de communication (commentaires) */}
        <div className="lg:col-span-2">
          {selectedVideoId && videoData?.video ? (
            <div className="space-y-4">
              {/* Détails de la vidéo */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {videoData.video.title || 'Vidéo sans titre'}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Youtube size={16} color="#FF0000" variant="Bold" />
                        <span>{videoData.video.sourceChannel.username}</span>
                      </div>
                      {videoData.video.assignedTo && (
                        <div className="flex items-center gap-2">
                          <User size={16} color="#6366F1" variant="Bold" />
                          <span>{videoData.video.assignedTo.username}</span>
                        </div>
                      )}
                      {videoData.video.scheduledDate && (
                        <div className="flex items-center gap-2">
                          <Calendar size={16} color="#10B981" variant="Bold" />
                          <span>{format(new Date(videoData.video.scheduledDate), 'PP', { locale: fr })}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => window.open(videoData.video.sourceVideoUrl, '_blank')}
                    className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                  >
                    <Youtube size={18} variant="Bold" />
                    Voir sur YouTube
                  </button>
                </div>

                {videoData.video.description && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {videoData.video.description}
                    </p>
                  </div>
                )}

                {videoData.video.notes && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm font-medium text-yellow-800 mb-1">Notes :</p>
                    <p className="text-yellow-700 text-sm">{videoData.video.notes}</p>
                  </div>
                )}

                {videoData.video.adminFeedback && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-800 mb-1">Feedback Admin :</p>
                    <p className="text-blue-700 text-sm">{videoData.video.adminFeedback}</p>
                  </div>
                )}
              </div>

              {/* Section commentaires */}
              <VideoComments
                videoId={selectedVideoId}
                comments={videoData.video.comments || []}
              />
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center h-full flex items-center justify-center">
              <div>
                <MessageText size={64} color="#9CA3AF" className="mx-auto mb-4" variant="Bulk" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Sélectionnez une vidéo
                </h3>
                <p className="text-gray-600">
                  Choisissez une vidéo dans la liste pour voir les détails et communiquer avec l'équipe
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
