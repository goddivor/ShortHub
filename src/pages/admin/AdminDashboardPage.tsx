// src/pages/admin/AdminDashboardPage.tsx
import React from 'react';
import { useQuery } from '@apollo/client/react';
import {
  GET_ADMIN_DASHBOARD_STATS_QUERY
} from '@/lib/graphql';
import SpinLoader from '@/components/SpinLoader';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  User,
  VideoPlay,
  Youtube,
  TrendUp,
} from 'iconsax-react';
import type { SourceChannel, AdminChannel, User as UserType } from '@/types/graphql';

// Types pour les données des graphiques
interface ChartDataItem {
  name: string;
  fullName: string;
  profileImageUrl?: string;
  shorts?: number;
  videos?: number;
}

// Types pour les props de Recharts
interface CustomTickProps {
  x?: number;
  y?: number;
  payload?: {
    value: string;
  };
}

// Composant custom pour afficher les images de profil dans l'axe X
const createCustomXAxisTick = (data: ChartDataItem[]) => {
  return (props: CustomTickProps) => {
    const { x, y, payload } = props;

    if (!payload?.value || x === undefined || y === undefined) return null;

    // Extraire l'URL de l'image depuis les données
    const channelData = data.find(d => d.name === payload.value);

    if (!channelData?.profileImageUrl) {
      // Si pas d'image, afficher le texte
      return (
        <g transform={`translate(${x},${y})`}>
          <text
            x={0}
            y={0}
            dy={16}
            textAnchor="middle"
            fill="#666"
            fontSize={12}
          >
            {payload.value}
          </text>
        </g>
      );
    }

    return (
      <g transform={`translate(${x},${y})`}>
        <defs>
          <clipPath id={`clip-${channelData.name}`}>
            <circle cx={15} cy={15} r={15} />
          </clipPath>
        </defs>
        <image
          href={channelData.profileImageUrl}
          x={0}
          y={0}
          height={30}
          width={30}
          clipPath={`url(#clip-${channelData.name})`}
        />
        <title>{channelData.fullName}</title>
      </g>
    );
  };
};

interface DashboardData {
  sourceChannels: SourceChannel[];
  adminChannels: AdminChannel[];
  users: {
    totalCount: number;
    edges: Array<{
      node: UserType;
    }>;
  };
}

const AdminDashboardPage: React.FC = () => {
  const { data, loading } = useQuery<DashboardData>(GET_ADMIN_DASHBOARD_STATS_QUERY);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <SpinLoader />
      </div>
    );
  }

  const sourceChannels = data?.sourceChannels || [];
  const adminChannels = data?.adminChannels || [];

  // Calcul des statistiques
  const totalChannels = sourceChannels.length + adminChannels.length;
  const totalSourceChannels = sourceChannels.length;
  const totalPublicationChannels = adminChannels.length;
  const totalUsers = data?.users?.totalCount || 0;
  const totalPublishedShorts = adminChannels.reduce((acc, channel) => acc + (channel.shortsAssigned?.length || 0), 0);
  const totalVideos = adminChannels.reduce((acc, channel) => acc + (channel.totalVideos || 0), 0);

  // Données pour le graphique des chaînes par type
  const channelTypeData = [
    { name: 'Sources', value: totalSourceChannels, fill: '#3B82F6' },
    { name: 'Publication', value: totalPublicationChannels, fill: '#8B5CF6' },
  ];

  // Données pour les shorts publiés par chaîne (top 5)
  const publishedShortsData = adminChannels
    .map(channel => ({
      name: channel.channelName.length > 15 ? channel.channelName.substring(0, 15) + '...' : channel.channelName,
      fullName: channel.channelName,
      profileImageUrl: channel.profileImageUrl,
      shorts: channel.shortsAssigned?.length || 0,
      videos: channel.totalVideos || 0,
    }))
    .sort((a, b) => b.shorts - a.shorts)
    .slice(0, 5);

  // Données pour le graphique des vidéos totales par chaîne (top 5)
  const totalVideosData = adminChannels
    .map(channel => ({
      name: channel.channelName.length > 15 ? channel.channelName.substring(0, 15) + '...' : channel.channelName,
      fullName: channel.channelName,
      profileImageUrl: channel.profileImageUrl,
      videos: channel.totalVideos || 0,
    }))
    .filter(d => d.videos > 0)
    .sort((a, b) => b.videos - a.videos)
    .slice(0, 5);

  // Simulation de données de sorties de vidéos sur 30 jours (à remplacer par de vraies données)
  const videoReleasesData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
      shorts: Math.floor(Math.random() * 10), // Simulation - à remplacer par vraies données
    };
  });

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord Admin</h1>
        <p className="text-gray-600 mt-2">Vue d'ensemble de la plateforme ShortHub</p>
      </div>

      {/* KPI Cards */}
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
                {totalUsers}
              </p>
              <p className="text-blue-100 text-xs mt-2">
                {totalUsers} {totalUsers > 1 ? 'utilisateurs actifs' : 'utilisateur actif'}
              </p>
            </div>
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
              <User size={32} color="white" variant="Bulk" />
            </div>
          </div>
        </div>

        {/* Chaînes (Sources / Publication) */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group cursor-pointer">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Youtube size={18} color="white" variant="Bold" />
                <p className="text-purple-100 text-sm font-medium">Chaînes</p>
              </div>
              <p className="text-4xl font-bold group-hover:scale-110 transition-transform duration-300">
                {totalSourceChannels} / {totalPublicationChannels}
              </p>
              <p className="text-purple-100 text-xs mt-2">Sources / Publication</p>
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
                <VideoPlay size={18} color="white" variant="Bold" />
                <p className="text-green-100 text-sm font-medium">Vidéos Totales</p>
              </div>
              <p className="text-4xl font-bold group-hover:scale-110 transition-transform duration-300">
                {totalVideos}
              </p>
              <p className="text-green-100 text-xs mt-2">Sur les chaînes pub</p>
            </div>
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
              <TrendUp size={32} color="white" variant="Bulk" />
            </div>
          </div>
        </div>

        {/* Shorts Publiés */}
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group cursor-pointer">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Youtube size={18} color="white" variant="Bold" />
                <p className="text-red-100 text-sm font-medium">Shorts Publiés</p>
              </div>
              <p className="text-4xl font-bold group-hover:scale-110 transition-transform duration-300">
                {totalPublishedShorts}
              </p>
              <p className="text-red-100 text-xs mt-2">Total sur plateforme</p>
            </div>
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
              <Youtube size={32} color="white" variant="Bulk" />
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition des chaînes - Pie Chart */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Youtube size={24} color="#8B5CF6" variant="Bold" />
            <h2 className="text-xl font-bold text-gray-900">Répartition des Chaînes</h2>
          </div>
          {totalChannels > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={channelTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, value, percent }) => `${name}: ${value} (${percent ? (percent * 100).toFixed(0) : 0}%)`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {channelTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} chaînes`, 'Total']} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <Youtube size={48} color="#9CA3AF" className="mx-auto mb-3" variant="Bulk" />
                <p className="text-gray-500">Aucune chaîne dans le système</p>
              </div>
            </div>
          )}
        </div>

        {/* Top 5 Chaînes par Shorts Publiés */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <TrendUp size={24} color="#EF4444" variant="Bold" />
            <h2 className="text-xl font-bold text-gray-900">Top Chaînes - Shorts Publiés</h2>
          </div>
          {publishedShortsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={publishedShortsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  height={60}
                  tick={createCustomXAxisTick(publishedShortsData)}
                />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === 'shorts') return [`${value} shorts`, 'Publiés'];
                    return value;
                  }}
                  labelFormatter={(label) => {
                    const channel = publishedShortsData.find(d => d.name === label);
                    return channel?.fullName || label;
                  }}
                />
                <Bar dataKey="shorts" fill="#EF4444" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <Youtube size={48} color="#9CA3AF" className="mx-auto mb-3" variant="Bulk" />
                <p className="text-gray-500">Aucun short publié</p>
              </div>
            </div>
          )}
        </div>

        {/* Top 5 Chaînes par Vidéos Totales */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <VideoPlay size={24} color="#10B981" variant="Bold" />
            <h2 className="text-xl font-bold text-gray-900">Top Chaînes - Vidéos Totales</h2>
          </div>
          {totalVideosData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={totalVideosData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  height={60}
                  tick={createCustomXAxisTick(totalVideosData)}
                />
                <YAxis />
                <Tooltip
                  formatter={(value) => [`${value} vidéos`, 'Total']}
                  labelFormatter={(label) => {
                    const channel = totalVideosData.find(d => d.name === label);
                    return channel?.fullName || label;
                  }}
                />
                <Bar dataKey="videos" fill="#10B981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <VideoPlay size={48} color="#9CA3AF" className="mx-auto mb-3" variant="Bulk" />
                <p className="text-gray-500">Aucune vidéo dans le système</p>
              </div>
            </div>
          )}
        </div>

        {/* Sorties de Vidéos sur 30 Jours - Line Chart */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <TrendUp size={24} color="#3B82F6" variant="Bold" />
            <h2 className="text-xl font-bold text-gray-900">Sorties de Shorts (30j)</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={videoReleasesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 10 }}
              />
              <YAxis />
              <Tooltip formatter={(value) => [`${value} shorts`, 'Publiés']} />
              <Legend />
              <Line
                type="monotone"
                dataKey="shorts"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ fill: '#3B82F6', r: 4 }}
                activeDot={{ r: 6 }}
                name="Shorts publiés"
              />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-500 mt-4 text-center">
            * Données simulées - À remplacer par les vraies statistiques de publication
          </p>
        </div>
      </div>

      {/* Détails des Chaînes de Publication */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 border-b">
          <h2 className="text-2xl font-bold text-white">Chaînes de Publication</h2>
          <p className="text-purple-100 text-sm mt-1">Détails des performances par chaîne</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Chaîne</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Vidéos Totales</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Shorts Publiés</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Ratio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {adminChannels.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center">
                    <Youtube size={48} color="#9CA3AF" className="mx-auto mb-3" variant="Bulk" />
                    <p className="text-gray-500 font-medium">Aucune chaîne de publication</p>
                  </td>
                </tr>
              ) : (
                adminChannels.map((channel) => {
                  const ratio = channel.totalVideos && channel.totalVideos > 0
                    ? ((channel.shortsAssigned?.length || 0) / channel.totalVideos * 100).toFixed(1)
                    : '0.0';

                  return (
                    <tr key={channel.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {channel.profileImageUrl && (
                            <img
                              src={channel.profileImageUrl}
                              alt={channel.channelName}
                              className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                            />
                          )}
                          <div>
                            <p className="font-semibold text-gray-900">{channel.channelName}</p>
                            <p className="text-xs text-gray-500 font-mono">{channel.channelId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-gray-900 font-medium">
                          {channel.totalVideos?.toLocaleString() || '-'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700">
                          {channel.shortsAssigned?.length || 0}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-gray-900 font-medium">{ratio}%</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
