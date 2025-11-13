// src/pages/LandingPage.tsx
import React from 'react';
import { useNavigate } from 'react-router';
import Button from '@/components/Button';
import Logo from '@/components/ui/logo';
import {
  Youtube,
  VideoPlay,
  TrendUp,
  User,
  Play,
  TickCircle,
  Chart,
  Timer,
  Crown
} from 'iconsax-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <VideoPlay color="#FF0000" size={32} className="text-red-600" />,
      title: "Génération Automatique",
      description: "Générez automatiquement des liens YouTube Shorts depuis vos chaînes préférées avec un simple clic."
    },
    {
      icon: <TickCircle color="#10B981" size={32} className="text-green-600" />,
      title: "Validation Intelligente",
      description: "Validez ou rejetez les Shorts générés. Les vidéos validées ne seront plus proposées."
    },
    {
      icon: <Chart color="#F59E0B" size={32} className="text-yellow-600" />,
      title: "Statistiques Détaillées",
      description: "Suivez vos statistiques de validation et optimisez votre flux de travail."
    },
    {
      icon: <Youtube color="#8B5CF6" size={32} className="text-purple-600" />,
      title: "Gestion Multi-Chaînes",
      description: "Organisez vos chaînes par langue (FR, EN, ES...) et suivez les statistiques de chacune."
    }
  ];

  const stats = [
    { value: "1000+", label: "Shorts Traités", icon: <Play color="#FF0000" size={24} className="text-red-600" /> },
    { value: "50+", label: "Chaînes Supportées", icon: <Youtube color="#FF0000" size={24} className="text-red-600" /> },
    { value: "95%", label: "Taux de Validation", icon: <TrendUp color="#10B981" size={24} className="text-green-600" /> },
    { value: "24/7", label: "Disponibilité", icon: <Timer color="#3B82F6" size={24} className="text-blue-600" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-red-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Logo />
              <span className="text-xl font-bold text-gray-900">ShortHub</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-700 hover:text-red-600 font-medium transition-colors">
                Fonctionnalités
              </a>
              <a href="#stats" className="text-gray-700 hover:text-red-600 font-medium transition-colors">
                Statistiques
              </a>
              <Button
                onClick={() => navigate('/dashboard')}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Commencer
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            {/* Animated YouTube Logo */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-red-600 rounded-full blur-xl opacity-20 animate-pulse"></div>
                <div className="relative bg-white rounded-full p-6 shadow-2xl">
                  <Youtube color="#FF0000" size={80} className="text-red-600" />
                </div>
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              YouTube Shorts
              <span className="text-red-600 block">Processor</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Automatisez la découverte et la validation de contenus YouTube Shorts. 
              Gérez vos chaînes préférées et optimisez votre flux de travail créatif.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={() => navigate('dashboard/add-channel')}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg font-semibold transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                <User color="white" size={24} className="text-white mr-2" />
                Ajouter une Chaîne
              </Button>
              
              <Button
                onClick={() => navigate('dashboard/roll-shorts')}
                className="bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-200 px-8 py-4 text-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <VideoPlay color="#FF0000" size={24} className="text-red-600 mr-2" />
                Générer des Shorts
              </Button>
            </div>
          </div>

          {/* Demo Preview */}
          <div className="relative max-w-5xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-600 rounded-2xl blur-2xl opacity-10"></div>
            <div className="relative bg-white rounded-2xl shadow-2xl border border-red-100 overflow-hidden">
              <div className="bg-gradient-to-r from-red-600 to-red-700 p-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-300 rounded-full"></div>
                  <div className="w-3 h-3 bg-red-300 rounded-full"></div>
                  <div className="w-3 h-3 bg-red-300 rounded-full"></div>
                  <span className="text-red-100 text-sm ml-4">ShortHub Dashboard</span>
                </div>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Youtube color="#FF0000" size={24} className="text-red-600" />
                      <span className="font-semibold">@TechReviewChannel</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>125K abonnés</span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded">VF</span>
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-blue-900">Short généré:</span>
                      <Play color="#3B82F6" size={16} className="text-blue-600" />
                    </div>
                    <div className="text-xs text-blue-800 bg-blue-100 p-2 rounded font-mono">
                      youtube.com/shorts/dQw4w9...
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Fonctionnalités
              <span className="text-red-600"> Puissantes</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez tous les outils dont vous avez besoin pour optimiser votre workflow YouTube Shorts
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group"
              >
                <div className="bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-red-600 to-red-700">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Statistiques
              <span className="text-red-200"> Impressionnantes</span>
            </h2>
            <p className="text-xl text-red-100 max-w-3xl mx-auto">
              Des chiffres qui parlent d'eux-mêmes
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20"
              >
                <div className="flex justify-center mb-4">
                  <div className="bg-white/20 rounded-full p-3">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-red-100 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-2xl p-12 border border-red-100">
            <div className="flex justify-center mb-8">
              <div className="bg-red-100 rounded-full p-4">
                <Crown color="#FF0000" size={48} className="text-red-600" />
              </div>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Prêt à 
              <span className="text-red-600"> Commencer</span> ?
            </h2>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Rejoignez les créateurs qui optimisent déjà leur workflow YouTube Shorts avec ShortHub
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate('dashboard/add-channel')}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg font-semibold transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                <User color="white" size={24} className="text-white mr-2" />
                Ajouter ma Première Chaîne
              </Button>

              <Button
                onClick={() => navigate('dashboard/roll-shorts')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-4 text-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <VideoPlay color="white" size={24} className="text-white mr-2" />
                Générer des Shorts
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <Logo />
              <span className="text-xl font-bold text-white">ShortHub</span>
            </div>
            
            <div className="flex items-center gap-6">
              <a href="dashboard/add-channel" className="text-gray-400 hover:text-white transition-colors">
                Ajouter Chaîne
              </a>
              <a href="dashboard/roll-shorts" className="text-gray-400 hover:text-white transition-colors">
                Générer Shorts
              </a>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2025 ShortHub. Optimisez votre workflow YouTube Shorts.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;