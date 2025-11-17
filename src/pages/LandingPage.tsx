// src/pages/LandingPage.tsx
import React from 'react';
import { useNavigate } from 'react-router';
import Button from '@/components/Button';
import Logo from '@/components/ui/logo';
import {
  Youtube,
  VideoPlay,
  User,
  Calendar,
  Notification,
  TickCircle,
  Send2,
  People,
  Task,
  Chart,
  Timer,
  Crown,
  MessageText,
  DocumentText,
  ShieldTick,
  ArrowRight,
  Eye
} from 'iconsax-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const roles = [
    {
      icon: <Crown color="#EF4444" size={48} />,
      title: "Admin",
      color: "red",
      description: "Gérez votre équipe et vos chaînes YouTube",
      features: [
        "Ajouter et gérer les chaînes YouTube",
        "Assigner des shorts aux vidéastes",
        "Valider ou rejeter les shorts soumis",
        "Suivre la progression en temps réel",
        "Gérer les deadlines et le calendrier"
      ]
    },
    {
      icon: <VideoPlay color="#8B5CF6" size={48} />,
      title: "Vidéaste",
      color: "purple",
      description: "Éditez et soumettez vos créations",
      features: [
        "Recevoir les assignations de shorts",
        "Gérer vos shorts en cours",
        "Soumettre vos créations terminées",
        "Recevoir des feedbacks détaillés",
        "Suivre vos deadlines personnelles"
      ]
    },
    {
      icon: <People color="#10B981" size={48} />,
      title: "Assistante",
      color: "green",
      description: "Coordonnez et optimisez les workflows",
      features: [
        "Découvrir et valider les contenus",
        "Coordonner les assignations",
        "Gérer le planning global",
        "Analyser les performances",
        "Optimiser la productivité"
      ]
    }
  ];

  const features = [
    {
      icon: <Notification color="#3B82F6" size={32} />,
      title: "Notifications Multi-canal",
      description: "Recevez des alertes en temps réel via la plateforme, email et WhatsApp pour ne jamais manquer une deadline."
    },
    {
      icon: <Calendar color="#8B5CF6" size={32} />,
      title: "Calendrier Intelligent",
      description: "Visualisez toutes vos deadlines, planifiez vos publications et gérez votre temps efficacement."
    },
    {
      icon: <Task color="#10B981" size={32} />,
      title: "Suivi de Progression",
      description: "Trackez le statut de chaque short : assigné, en cours, complété, validé ou rejeté."
    },
    {
      icon: <MessageText color="#F59E0B" size={32} />,
      title: "Feedback & Validation",
      description: "Système de validation avec feedback détaillé pour améliorer la qualité des créations."
    },
    {
      icon: <Chart color="#EF4444" size={32} />,
      title: "Analytics & Reporting",
      description: "Analysez les performances de votre équipe et optimisez votre workflow de production."
    },
    {
      icon: <ShieldTick color="#06B6D4" size={32} />,
      title: "Gestion des Permissions",
      description: "Contrôle d'accès basé sur les rôles pour une sécurité et une organisation optimales."
    }
  ];

  const workflow = [
    {
      step: "1",
      title: "Découverte de Contenu",
      description: "L'admin ou l'assistante découvre et valide les shorts YouTube depuis les chaînes enregistrées.",
      icon: <Eye color="#3B82F6" size={32} />,
      color: "blue"
    },
    {
      step: "2",
      title: "Assignation",
      description: "Les shorts validés sont assignés aux vidéastes avec une deadline claire.",
      icon: <Send2 color="#8B5CF6" size={32} />,
      color: "purple"
    },
    {
      step: "3",
      title: "Édition & Soumission",
      description: "Le vidéaste édite le short et le soumet pour validation une fois terminé.",
      icon: <VideoPlay color="#10B981" size={32} />,
      color: "green"
    },
    {
      step: "4",
      title: "Validation & Publication",
      description: "L'admin valide ou rejette avec feedback. Les shorts validés sont prêts pour publication.",
      icon: <TickCircle color="#f50bd2ff" size={32} />,
      color: "pink"
    }
  ];

  const stats = [
    { value: "3", label: "Rôles Définis", icon: <People color="#3B82F6" size={24} /> },
    { value: "Multi", label: "Notifications", icon: <Notification color="#10B981" size={24} /> },
    { value: "Real-time", label: "Tracking", icon: <Timer color="#8B5CF6" size={24} /> },
    { value: "100%", label: "Collaborative", icon: <Task color="#F59E0B" size={24} /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Logo />
              <span className="text-xl font-bold text-gray-900">ShortHub</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Fonctionnalités
              </a>
              <a href="#roles" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Rôles
              </a>
              <a href="#workflow" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Comment ça marche
              </a>
              <Button
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Se Connecter
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            {/* Animated Logo */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                <div className="relative bg-white rounded-full p-6 shadow-2xl">
                  <div className="flex items-center justify-center gap-2">
                    <Youtube color="#FF0000" size={60} />
                    <div className="w-1 h-12 bg-gray-300 rounded"></div>
                    <People color="#3B82F6" size={60} />
                  </div>
                </div>
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Plateforme Collaborative
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
                de Gestion de YouTube Shorts
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Coordonnez votre équipe créative avec un workflow optimisé.
              Assignations, notifications, tracking et validation en temps réel.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                <User color="white" size={24} className="mr-2" />
                Commencer Maintenant
              </Button>

              <Button
                onClick={() => document.getElementById('workflow')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-200 px-8 py-4 text-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <DocumentText color="#3B82F6" size={24} className="mr-2" />
                Découvrir le Workflow
              </Button>
            </div>
          </div>

          {/* Demo Preview */}
          <div className="relative max-w-6xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-600 rounded-2xl blur-2xl opacity-10"></div>
            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-300 rounded-full"></div>
                  <div className="w-3 h-3 bg-purple-300 rounded-full"></div>
                  <div className="w-3 h-3 bg-pink-300 rounded-full"></div>
                  <span className="text-white text-sm ml-4 font-medium">ShortHub Dashboard</span>
                </div>
              </div>
              <div className="p-8 bg-gradient-to-br from-gray-50 to-white">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Admin Card */}
                  <div className="bg-white rounded-xl shadow-md border border-red-100 p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-red-100 rounded-full p-2">
                        <Crown color="#EF4444" size={24} />
                      </div>
                      <div>
                        <span className="font-bold text-gray-900 block">Admin</span>
                        <span className="text-xs text-gray-500">Gestion globale</span>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Shorts assignés</span>
                        <span className="font-semibold text-red-600">24</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">En attente</span>
                        <span className="font-semibold text-yellow-600">8</span>
                      </div>
                    </div>
                  </div>

                  {/* Vidéaste Card */}
                  <div className="bg-white rounded-xl shadow-md border border-purple-100 p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-purple-100 rounded-full p-2">
                        <VideoPlay color="#8B5CF6" size={24} />
                      </div>
                      <div>
                        <span className="font-bold text-gray-900 block">Vidéaste</span>
                        <span className="text-xs text-gray-500">Édition créative</span>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Mes shorts</span>
                        <span className="font-semibold text-purple-600">6</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Deadline proche</span>
                        <span className="font-semibold text-red-600">2</span>
                      </div>
                    </div>
                  </div>

                  {/* Notification Card */}
                  <div className="bg-white rounded-xl shadow-md border border-blue-100 p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-blue-100 rounded-full p-2">
                        <Notification color="#3B82F6" size={24} />
                      </div>
                      <div>
                        <span className="font-bold text-gray-900 block">Notifications</span>
                        <span className="text-xs text-gray-500">Temps réel</span>
                      </div>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="bg-green-50 border border-green-200 rounded p-2 text-green-800">
                        ✓ Short validé par l'admin
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded p-2 text-blue-800">
                        📧 Email envoyé à @videaste
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section id="roles" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Trois Rôles,
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Une Équipe</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Chaque membre de votre équipe a des fonctionnalités adaptées à son rôle
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {roles.map((role, index) => (
              <div
                key={index}
                className={`bg-gradient-to-br from-white to-${role.color}-50 rounded-2xl shadow-lg border-2 border-${role.color}-100 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2`}
              >
                <div className={`bg-${role.color}-100 rounded-full w-20 h-20 flex items-center justify-center mb-6 mx-auto`}>
                  {role.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">
                  {role.title}
                </h3>
                <p className="text-gray-600 text-center mb-6">
                  {role.description}
                </p>
                <ul className="space-y-3">
                  {role.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <TickCircle color={`#${role.color === 'red' ? 'EF4444' : role.color === 'purple' ? '8B5CF6' : '10B981'}`} size={20} className="mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Comment ça
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Fonctionne</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Un workflow simple et efficace pour maximiser votre productivité
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {workflow.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 h-full">
                  <div className={`absolute -top-4 -left-4 bg-gradient-to-br from-${step.color}-500 to-${step.color}-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold shadow-lg`}>
                    {step.step}
                  </div>
                  <div className={`bg-${step.color}-100 rounded-full w-16 h-16 flex items-center justify-center mb-6 mx-auto mt-4`}>
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-center text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
                {index < workflow.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight color="#9CA3AF" size={32} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Fonctionnalités
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Avancées</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tous les outils nécessaires pour gérer efficacement vos YouTube Shorts
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group"
              >
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-full w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
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
      <section id="stats" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Une Plateforme
              <span className="text-blue-200"> Complète</span>
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Conçue pour la collaboration et la productivité
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 hover:bg-white/20 transition-colors"
              >
                <div className="flex justify-center mb-4">
                  <div className="bg-white/20 rounded-full p-3">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-blue-100 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-2xl p-12 border-2 border-blue-100">
            <div className="flex justify-center mb-8">
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-full p-6">
                <Crown color="#3B82F6" size={56} />
              </div>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Prêt à Optimiser
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Votre Workflow</span> ?
            </h2>

            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Rejoignez les équipes créatives qui gèrent déjà leurs YouTube Shorts avec ShortHub
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                <User color="white" size={24} className="mr-2" />
                Se Connecter
              </Button>
            </div>

            <p className="text-sm text-gray-500 mt-6">
              Aucune carte de crédit requise • Configuration en 5 minutes
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <Logo />
                <span className="text-xl font-bold text-white">ShortHub</span>
              </div>
              <p className="text-gray-400 max-w-md">
                Plateforme collaborative de gestion de YouTube Shorts.
                Coordonnez votre équipe, suivez vos deadlines et optimisez votre productivité.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Navigation</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#features" className="text-gray-400 hover:text-white transition-colors">
                    Fonctionnalités
                  </a>
                </li>
                <li>
                  <a href="#roles" className="text-gray-400 hover:text-white transition-colors">
                    Rôles
                  </a>
                </li>
                <li>
                  <a href="#workflow" className="text-gray-400 hover:text-white transition-colors">
                    Workflow
                  </a>
                </li>
              </ul>
            </div>

            {/* Account */}
            <div>
              <h4 className="text-white font-semibold mb-4">Compte</h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => navigate('/login')}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Se Connecter
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © 2025 ShortHub. Plateforme collaborative de gestion de YouTube Shorts.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
