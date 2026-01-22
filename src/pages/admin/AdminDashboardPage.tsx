// src/pages/admin/AdminDashboardPage.tsx
import React from 'react';
import { useQuery } from '@apollo/client/react';
import {
  GET_ADMIN_DASHBOARD_STATS_QUERY,
  GET_SHORTS_STATS_QUERY,
  GET_SHORTS_QUERY
} from '@/lib/graphql';
import SpinLoader from '@/components/SpinLoader';
import type { ShortsStats, Short } from '@/types/graphql';
import { ShortStatus } from '@/types/graphql';
import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';
import { LineChart } from '@mui/x-charts/LineChart';
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';
import {
  User,
  VideoPlay,
  Youtube,
  TrendUp,
} from 'iconsax-react';
import type { SourceChannel, AdminChannel, User as UserType } from '@/types/graphql';

// Composant Gauge Card réutilisable
interface GaugeCardProps {
  title: string;
  value: number;
  maxValue: number;
  color: string;
  icon: React.ReactNode;
  subtitle?: string;
}

const GaugeCard: React.FC<GaugeCardProps> = ({
  title,
  value,
  maxValue,
  color,
  icon,
  subtitle,
}) => (
  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-5 hover:shadow-xl transition-all duration-300">
    <div className="flex items-center gap-2 mb-3">
      {icon}
      <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
    </div>
    <div className="flex items-center justify-center">
      <Gauge
        value={value}
        valueMax={maxValue}
        startAngle={-110}
        endAngle={110}
        width={160}
        height={120}
        sx={{
          [`& .${gaugeClasses.valueText}`]: {
            fontSize: 28,
            fontWeight: 'bold',
            transform: 'translate(0px, 0px)',
          },
          [`& .${gaugeClasses.valueArc}`]: {
            fill: color,
          },
          [`& .${gaugeClasses.referenceArc}`]: {
            fill: '#E5E7EB',
          },
        }}
        text={({ value }) => `${value}`}
      />
    </div>
    {subtitle && (
      <p className="text-xs text-gray-500 text-center mt-1">{subtitle}</p>
    )}
  </div>
);

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
  const { data: shortsStatsData } = useQuery<{ shortsStats: ShortsStats }>(GET_SHORTS_STATS_QUERY);
  const { data: publishedShortsData } = useQuery<{ shorts: Short[] }>(GET_SHORTS_QUERY, {
    variables: {
      filter: {
        status: ShortStatus.PUBLISHED
      }
    }
  });

  // Déplacer toutes les variables et useMemo AVANT le return conditionnel
  const sourceChannels = React.useMemo(() => data?.sourceChannels || [], [data?.sourceChannels]);
  const adminChannels = React.useMemo(() => data?.adminChannels || [], [data?.adminChannels]);
  const publishedShorts = React.useMemo(() => publishedShortsData?.shorts || [], [publishedShortsData?.shorts]);

  // Calcul des statistiques
  const totalChannels = sourceChannels.length + adminChannels.length;
  const totalSourceChannels = sourceChannels.length;
  const totalPublicationChannels = adminChannels.length;
  const totalUsers = data?.users?.totalCount || 0;
  const totalPublishedShorts = shortsStatsData?.shortsStats?.totalPublished || 0;
  const totalVideos = React.useMemo(
    () => adminChannels.reduce((acc, channel) => acc + (channel.totalVideos || 0), 0),
    [adminChannels]
  );

  // Données pour le graphique des chaînes par type (PieChart)
  const channelTypeData = React.useMemo(() => [
    { id: 0, value: totalSourceChannels, label: 'Sources', color: '#3B82F6' },
    { id: 1, value: totalPublicationChannels, label: 'Publication', color: '#8B5CF6' },
  ], [totalSourceChannels, totalPublicationChannels]);

  // Données pour les shorts publiés par chaîne (top 5)
  const publishedShortsChartData = React.useMemo(() => {
    // Compter les shorts publiés par chaîne
    const shortsByChannel = new Map<string, number>();
    publishedShorts.forEach(short => {
      if (short.targetChannel?.id) {
        const count = shortsByChannel.get(short.targetChannel.id) || 0;
        shortsByChannel.set(short.targetChannel.id, count + 1);
      }
    });

    return adminChannels
      .map(channel => ({
        name: channel.channelName.length > 12 ? channel.channelName.substring(0, 12) + '...' : channel.channelName,
        fullName: channel.channelName,
        profileImageUrl: channel.profileImageUrl,
        shorts: shortsByChannel.get(channel.id) || 0,
        videos: channel.totalVideos || 0,
      }))
      .sort((a, b) => b.shorts - a.shorts)
      .slice(0, 5);
  }, [adminChannels, publishedShorts]);

  // Données pour le graphique des vidéos totales par chaîne (top 5)
  const totalVideosData = React.useMemo(() => adminChannels
    .map(channel => ({
      name: channel.channelName.length > 12 ? channel.channelName.substring(0, 12) + '...' : channel.channelName,
      fullName: channel.channelName,
      profileImageUrl: channel.profileImageUrl,
      videos: channel.totalVideos || 0,
    }))
    .filter(d => d.videos > 0)
    .sort((a, b) => b.videos - a.videos)
    .slice(0, 5), [adminChannels]);

  // Données réelles de sorties de shorts sur 30 jours
  const videoReleasesData = React.useMemo(() => {
    // Créer un map pour les 30 derniers jours
    const last30Days = new Map<string, number>();

    // Initialiser les 30 derniers jours avec 0
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0]; // Format YYYY-MM-DD
      last30Days.set(dateKey, 0);
    }

    // Compter les shorts publiés par date
    publishedShorts.forEach(short => {
      if (short.publishedAt) {
        const dateKey = new Date(short.publishedAt).toISOString().split('T')[0];
        if (last30Days.has(dateKey)) {
          last30Days.set(dateKey, (last30Days.get(dateKey) || 0) + 1);
        }
      }
    });

    // Convertir en tableau pour le graphique
    return Array.from(last30Days.entries()).map(([dateKey, count]) => ({
      date: new Date(dateKey).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
      shorts: count,
    }));
  }, [publishedShorts]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <SpinLoader />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Metrics avec Gauge */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GaugeCard
          title="Utilisateurs"
          value={totalUsers}
          maxValue={Math.max(totalUsers * 1.5, 100)}
          color="#3B82F6"
          icon={<User size={18} color="#3B82F6" variant="Bold" />}
          subtitle={`${totalUsers} ${totalUsers > 1 ? 'utilisateurs actifs' : 'utilisateur actif'}`}
        />

        <GaugeCard
          title="Total Chaînes"
          value={totalChannels}
          maxValue={Math.max(totalChannels * 1.5, 50)}
          color="#8B5CF6"
          icon={<Youtube size={18} color="#8B5CF6" variant="Bold" />}
          subtitle={`${totalSourceChannels} sources / ${totalPublicationChannels} publication`}
        />

        <GaugeCard
          title="Vidéos Totales"
          value={totalVideos}
          maxValue={Math.max(totalVideos * 1.2, 1000)}
          color="#10B981"
          icon={<VideoPlay size={18} color="#10B981" variant="Bold" />}
          subtitle="Sur les chaînes de publication"
        />

        <GaugeCard
          title="Shorts Publiés"
          value={totalPublishedShorts}
          maxValue={Math.max(totalPublishedShorts * 1.5, 100)}
          color="#EF4444"
          icon={<TrendUp size={18} color="#EF4444" variant="Bold" />}
          subtitle="Total sur la plateforme"
        />
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
            <div className="h-[300px] flex items-center justify-center">
              <PieChart
                series={[
                  {
                    data: channelTypeData,
                    highlightScope: { fade: 'global', highlight: 'item' },
                    faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                    arcLabel: (item) => `${item.value}`,
                    arcLabelMinAngle: 35,
                    innerRadius: 30,
                    outerRadius: 100,
                    paddingAngle: 2,
                    cornerRadius: 5,
                  },
                ]}
                width={350}
                height={280}
              />
            </div>
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
          {publishedShortsChartData.length > 0 && publishedShortsChartData.some(d => d.shorts > 0) ? (
            <div>
              <div className="h-[240px]">
                <BarChart
                  dataset={publishedShortsChartData}
                  xAxis={[
                    {
                      scaleType: 'band',
                      dataKey: 'name',
                      tickLabelStyle: { fontSize: 0 },
                    },
                  ]}
                  yAxis={[{ label: 'Shorts' }]}
                  series={[
                    {
                      dataKey: 'shorts',
                      label: 'Shorts',
                      color: '#EF4444',
                    },
                  ]}
                  borderRadius={8}
                  height={220}
                  margin={{ top: 20, bottom: 5, left: 45, right: 20 }}
                  hideLegend
                />
              </div>
              {/* Channel images */}
              <div
                className="flex justify-around mt-2"
                style={{
                  marginLeft: 45,
                  marginRight: 20,
                }}
              >
                {publishedShortsChartData.map((channel, index) => (
                  <div key={index} className="flex flex-col items-center">
                    {channel.profileImageUrl ? (
                      <img
                        src={channel.profileImageUrl}
                        alt={channel.fullName}
                        className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                        title={channel.fullName}
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <Youtube size={16} color="#9CA3AF" />
                      </div>
                    )}
                    <span className="text-[10px] text-gray-500 mt-1 text-center" title={channel.fullName}>
                      {channel.shorts}
                    </span>
                  </div>
                ))}
              </div>
            </div>
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
            <div>
              <div className="h-[240px]">
                <BarChart
                  dataset={totalVideosData}
                  xAxis={[
                    {
                      scaleType: 'band',
                      dataKey: 'name',
                      tickLabelStyle: { fontSize: 0 },
                    },
                  ]}
                  yAxis={[{ label: 'Vidéos' }]}
                  series={[
                    {
                      dataKey: 'videos',
                      label: 'Vidéos',
                      color: '#10B981',
                    },
                  ]}
                  borderRadius={8}
                  height={220}
                  margin={{ top: 20, bottom: 5, left: 45, right: 20 }}
                  hideLegend
                />
              </div>
              {/* Channel images */}
              <div
                className="flex justify-around mt-2"
                style={{
                  marginLeft: 45,
                  marginRight: 20,
                }}
              >
                {totalVideosData.map((channel, index) => (
                  <div key={index} className="flex flex-col items-center">
                    {channel.profileImageUrl ? (
                      <img
                        src={channel.profileImageUrl}
                        alt={channel.fullName}
                        className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                        title={channel.fullName}
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <Youtube size={16} color="#9CA3AF" />
                      </div>
                    )}
                    <span className="text-[10px] text-gray-500 mt-1 text-center" title={channel.fullName}>
                      {channel.videos}
                    </span>
                  </div>
                ))}
              </div>
            </div>
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
          <div className="h-[300px]">
            <LineChart
              dataset={videoReleasesData}
              xAxis={[
                {
                  scaleType: 'band',
                  dataKey: 'date',
                  tickLabelStyle: {
                    fontSize: 10,
                    angle: -45,
                    textAnchor: 'end',
                  },
                  tickNumber: 10,
                },
              ]}
              yAxis={[{ label: 'Shorts publiés' }]}
              series={[
                {
                  dataKey: 'shorts',
                  label: 'Shorts publiés',
                  color: '#3B82F6',
                  area: true,
                  showMark: false,
                },
              ]}
              height={280}
              margin={{ top: 20, bottom: 70, left: 50, right: 20 }}
              hideLegend
              sx={{
                '.MuiLineElement-root': {
                  strokeWidth: 3,
                },
                '.MuiAreaElement-root': {
                  fillOpacity: 0.1,
                },
              }}
            />
          </div>
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
                  // Compter les shorts publiés pour cette chaîne
                  const publishedCount = publishedShorts.filter(s => s.targetChannel?.id === channel.id).length;
                  const ratio = channel.totalVideos && channel.totalVideos > 0
                    ? (publishedCount / channel.totalVideos * 100).toFixed(1)
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
                          {publishedCount}
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
