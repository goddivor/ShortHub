// src/pages/DashboardPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ChannelService, ShortsService, type Channel } from '@/lib/supabase';
import Button from '@/components/Button';
import SpinLoader from '@/components/SpinLoader';
import { 
  Youtube, 
  VideoPlay, 
  User, 
  TrendUp, 
  Chart, 
  Add, 
  Play,
  TickCircle,
  Timer,
  Crown,
  ArrowRight,
  Refresh
} from 'iconsax-react';

interface DashboardStats {
  totalChannels: number;
  totalShortsRolled: number;
  validatedShorts: number;
  pendingShorts: number;
  totalSubscribers: number;
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalChannels: 0,
    totalShortsRolled: 0,
    validatedShorts: 0,
    pendingShorts: 0,
    totalSubscribers: 0
  });
  const [recentChannels, setRecentChannels] = useState<Channel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load channels
      const channels = await ChannelService.getChannels();
      
      // Load shorts data
      const shorts = await ShortsService.getShortsRolls();
      
      // Calculate stats
      const totalSubscribers = channels.reduce((sum, ch) => sum + ch.subscriber_count, 0);
      const validatedShorts = shorts.filter(s => s.validated).length;
      const pendingShorts = shorts.filter(s => !s.validated).length;
      
      setStats({
        totalChannels: channels.length,
        totalShortsRolled: shorts.length,
        validatedShorts,
        pendingShorts,
        totalSubscribers
      });
      
      // Get 5 most recent channels
      setRecentChannels(channels.slice(0, 5));
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const statsCards = [
    {
      title: 'Chaînes Totales',
      value: stats.totalChannels,
      icon: <Youtube color="#FF0000" size={24} className="text-red-600" />,
      color: 'red',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600'
    },
    {
      title: 'Shorts Validés',
      value: stats.validatedShorts,
      icon: <TickCircle color="#10B981" size={24} className="text-green-600" />,
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'En Attente',
      value: stats.pendingShorts,
      icon: <Timer color="#F59E0B" size={24} className="text-yellow-600" />,
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Abonnés Cumulés',
      value: formatNumber(stats.totalSubscribers),
      icon: <TrendUp color="#8B5CF6" size={24} className="text-purple-600" />,
      color: 'purple',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    }
  ];

  const quickActions = [
    {
      title: 'Ajouter une Chaîne',
      description: 'Enregistrer une nouvelle chaîne YouTube',
      icon: <Add color="#FF0000" size={24} className="text-red-600" />,
      color: 'red',
      path: '/dashboard/add-channel'
    },
    {
      title: 'Générer des Shorts',
      description: 'Commencer le rolling et la validation',
      icon: <VideoPlay color="#10B981" size={24} className="text-green-600" />,
      color: 'green',
      path: '/dashboard/roll-shorts'
    }
  ];

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="text-center">
          <SpinLoader />
          <p className="mt-4 text-gray-600">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Bienvenue sur ShortHub</h1>
            <p className="text-red-100 text-lg">
              Gérez vos chaînes YouTube et optimisez votre workflow de validation des Shorts
            </p>
          </div>
          <div className="hidden md:block">
            <Crown color="white" size={64} className="text-white opacity-20" />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quickActions.map((action, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-gray-50 rounded-lg p-3">
                {action.icon}
              </div>
              <ArrowRight color="#6B7280" size={20} className="text-gray-400" />
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
            <p className="text-gray-600 mb-4">{action.description}</p>
            
            <Button
              onClick={() => navigate(action.path)}
              className={`
                w-full py-3 px-4 font-medium rounded-lg transition-all flex items-center justify-center gap-2
                ${action.color === 'red' 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
                }
              `}
            >
              Commencer
            </Button>
          </div>
        ))}
      </div>

      {/* Recent Channels */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Chaînes Récentes</h2>
            <Button
              onClick={() => navigate('/dashboard/add-channel')}
              className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Voir toutes
            </Button>
          </div>
        </div>
        
        <div className="p-6">
          {recentChannels.length === 0 ? (
            <div className="text-center py-12">
              <Youtube color="#9CA3AF" size={48} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune chaîne enregistrée</h3>
              <p className="text-gray-600 mb-4">Commencez par ajouter votre première chaîne YouTube</p>
              <Button
                onClick={() => navigate('/dashboard/add-channel')}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 font-medium rounded-lg"
              >
                Ajouter une chaîne
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentChannels.map((channel) => (
                <div key={channel.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-red-100 rounded-full p-2">
                      <User color="#FF0000" size={16} className="text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{channel.username}</h4>
                      <p className="text-sm text-gray-600">{formatNumber(channel.subscriber_count)} abonnés</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`
                      px-2 py-1 rounded text-xs font-medium
                      ${channel.tag === 'VF' ? 'bg-red-100 text-red-800' :
                        channel.tag === 'VOSTFR' ? 'bg-blue-100 text-blue-800' :
                        channel.tag === 'VA' ? 'bg-yellow-100 text-yellow-800' :
                        channel.tag === 'VOSTA' ? 'bg-purple-100 text-purple-800' :
                        'bg-green-100 text-green-800'
                      }
                    `}>
                      {channel.tag}
                    </span>
                    
                    <span className={`
                      px-2 py-1 rounded text-xs font-medium
                      ${channel.type === 'Mix' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                      }
                    `}>
                      {channel.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Activity Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité Récente</h3>
          <div className="space-y-3">
            {stats.totalChannels === 0 ? (
              <p className="text-gray-500 text-center py-4">Aucune activité récente</p>
            ) : (
              <>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">{stats.validatedShorts} shorts validés</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-gray-600">{stats.pendingShorts} shorts en attente</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600">{stats.totalChannels} chaînes enregistrées</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Actions Rapides</h3>
            <Button
              onClick={loadDashboardData}
              className="text-gray-500 hover:text-gray-700 p-2"
              title="Actualiser"
            >
              <Refresh color="#6B7280" size={16} className="text-gray-500" />
            </Button>
          </div>
          
          <div className="space-y-3">
            <Button
              onClick={() => navigate('/dashboard/roll-shorts')}
              className="w-full flex items-center justify-between p-3 text-left bg-red-50 hover:bg-red-100 rounded-lg border border-red-200"
            >
              <div className="flex items-center gap-2">
                <Play color="#FF0000" size={16} className="text-red-600" />
                <span className="text-red-900 font-medium">Générer un Short</span>
              </div>
              <ArrowRight color="#FF0000" size={16} className="text-red-600" />
            </Button>
            
            <Button
              onClick={() => navigate('/dashboard/add-channel')}
              className="w-full flex items-center justify-between p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200"
            >
              <div className="flex items-center gap-2">
                <Add color="#3B82F6" size={16} className="text-blue-600" />
                <span className="text-blue-900 font-medium">Nouvelle chaîne</span>
              </div>
              <ArrowRight color="#3B82F6" size={16} className="text-blue-600" />
            </Button>
            
            <Button
              onClick={() => navigate('/dashboard/debug')}
              className="w-full flex items-center justify-between p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200"
            >
              <div className="flex items-center gap-2">
                <Chart color="#6B7280" size={16} className="text-gray-600" />
                <span className="text-gray-900 font-medium">Vérifier config</span>
              </div>
              <ArrowRight color="#6B7280" size={16} className="text-gray-600" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;