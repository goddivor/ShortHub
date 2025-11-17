import { useState, useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_SHORTS_QUERY } from '@/lib/graphql';
import { Short, ShortStatus } from '@/types/graphql';
import SpinLoader from '@/components/SpinLoader';
import { Calendar as CalendarIcon, ArrowLeft, ArrowRight, Chart, Clock } from 'iconsax-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, isToday, isPast } from 'date-fns';
import { fr } from 'date-fns/locale';
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

// Couleurs pour les statuts
const STATUS_COLORS: Record<ShortStatus, string> = {
  [ShortStatus.ROLLED]: '#6366F1',
  [ShortStatus.RETAINED]: '#10B981',
  [ShortStatus.REJECTED]: '#EF4444',
  [ShortStatus.ASSIGNED]: '#F59E0B',
  [ShortStatus.IN_PROGRESS]: '#3B82F6',
  [ShortStatus.COMPLETED]: '#8B5CF6',
  [ShortStatus.VALIDATED]: '#EC4899',
  [ShortStatus.PUBLISHED]: '#14B8A6',
};

const STATUS_LABELS: Record<ShortStatus, string> = {
  [ShortStatus.ROLLED]: 'Généré',
  [ShortStatus.RETAINED]: 'Retenu',
  [ShortStatus.REJECTED]: 'Ignoré',
  [ShortStatus.ASSIGNED]: 'Assigné',
  [ShortStatus.IN_PROGRESS]: 'En cours',
  [ShortStatus.COMPLETED]: 'Complété',
  [ShortStatus.VALIDATED]: 'Validé',
  [ShortStatus.PUBLISHED]: 'Publié',
};

export default function AdminCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Récupérer tous les shorts assignés avec deadline
  const { data, loading } = useQuery<{ shorts: Short[] }>(GET_SHORTS_QUERY, {
    variables: {
      filter: {
        status: ShortStatus.ASSIGNED,
      },
    },
  });

  // Récupérer tous les shorts pour les statistiques
  const { data: allShortsData } = useQuery<{ shorts: Short[] }>(GET_SHORTS_QUERY);

  // Générer les jours du mois
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Grouper les shorts par date
  const shortsByDate = useMemo(() => {
    if (!data?.shorts) return new Map<string, Short[]>();

    const map = new Map<string, Short[]>();
    data.shorts.forEach((short) => {
      if (short.deadline) {
        const dateKey = format(new Date(short.deadline), 'yyyy-MM-dd');
        if (!map.has(dateKey)) {
          map.set(dateKey, []);
        }
        map.get(dateKey)!.push(short);
      }
    });
    return map;
  }, [data]);

  // Shorts du jour sélectionné
  const selectedDayShorts = useMemo(() => {
    if (!selectedDate) return [];
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    return shortsByDate.get(dateKey) || [];
  }, [selectedDate, shortsByDate]);

  // Statistiques pour les charts
  const statsData = useMemo(() => {
    if (!allShortsData?.shorts) return [];

    const statusCounts: Record<string, number> = {};
    Object.values(ShortStatus).forEach((status) => {
      statusCounts[status] = 0;
    });

    allShortsData.shorts.forEach((short) => {
      statusCounts[short.status]++;
    });

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: STATUS_LABELS[status as ShortStatus],
      value: count,
      count,
      color: STATUS_COLORS[status as ShortStatus],
    }));
  }, [allShortsData]);

  // Données pour le graphique de timeline
  const timelineData = useMemo(() => {
    if (!allShortsData?.shorts) return [];

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: format(date, 'dd MMM', { locale: fr }),
        assigned: 0,
        completed: 0,
        published: 0,
      };
    });

    allShortsData.shorts.forEach((short) => {
      const assignedDate = short.assignedAt ? new Date(short.assignedAt) : null;
      const completedDate = short.completedAt ? new Date(short.completedAt) : null;
      const publishedDate = short.publishedAt ? new Date(short.publishedAt) : null;

      last7Days.forEach((day, index) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - index));

        if (assignedDate && isSameDay(assignedDate, date)) {
          day.assigned++;
        }
        if (completedDate && isSameDay(completedDate, date)) {
          day.completed++;
        }
        if (publishedDate && isSameDay(publishedDate, date)) {
          day.published++;
        }
      });
    });

    return last7Days;
  }, [allShortsData]);

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
    setSelectedDate(null);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const getShortsCountForDate = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return shortsByDate.get(dateKey)?.length || 0;
  };

  const getDateClassName = (date: Date) => {
    const baseClass = 'min-h-24 p-2 border border-gray-200 cursor-pointer transition-all hover:bg-gray-50';
    const count = getShortsCountForDate(date);
    const hasShorts = count > 0;
    const isSelected = selectedDate && isSameDay(date, selectedDate);
    const isCurrentMonth = isSameMonth(date, currentDate);
    const isTodayDate = isToday(date);
    const isPastDate = isPast(date) && !isTodayDate;

    let classes = baseClass;

    if (!isCurrentMonth) {
      classes += ' bg-gray-50 text-gray-400';
    } else if (isSelected) {
      classes += ' bg-indigo-100 border-indigo-500 ring-2 ring-indigo-300';
    } else if (isTodayDate) {
      classes += ' bg-blue-50 border-blue-500';
    } else if (isPastDate && hasShorts) {
      classes += ' bg-red-50';
    } else if (hasShorts) {
      classes += ' bg-green-50';
    }

    return classes;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <SpinLoader />
          <p className="text-gray-600 mt-4">Chargement du calendrier...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-white/20 rounded-xl p-3">
            <CalendarIcon size={32} color="white" variant="Bold" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Calendrier d'Assignation</h1>
            <p className="text-purple-100 text-sm mt-1">
              Planification et suivi des shorts assignés
            </p>
          </div>
        </div>
      </div>

      {/* Stats Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart - Répartition par statut */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Chart size={20} color="#6366F1" variant="Bold" />
            Répartition par Statut
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statsData.filter(s => s.value > 0)}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={40}
                paddingAngle={2}
                label={false}
              >
                {statsData.filter(s => s.value > 0).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [`${value} short${value > 1 ? 's' : ''}`, name]}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '8px 12px'
                }}
              />
              <Legend
                layout="vertical"
                align="right"
                verticalAlign="middle"
                iconType="circle"
                iconSize={10}
                formatter={(value: string, entry: any) => `${value} (${entry.payload?.value ?? 0})`}
                wrapperStyle={{ paddingLeft: '20px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart - Timeline 7 derniers jours */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock size={20} color="#F59E0B" variant="Bold" />
            Activité des 7 Derniers Jours
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="assigned" stroke="#F59E0B" name="Assignés" strokeWidth={2} />
              <Line type="monotone" dataKey="completed" stroke="#8B5CF6" name="Complétés" strokeWidth={2} />
              <Line type="monotone" dataKey="published" stroke="#14B8A6" name="Publiés" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} color="#374151" />
          </button>
          <h2 className="text-2xl font-bold text-gray-900">
            {format(currentDate, 'MMMM yyyy', { locale: fr })}
          </h2>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowRight size={24} color="#374151" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Days of week header */}
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
            <div key={day} className="text-center font-semibold text-gray-600 p-2">
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {/* Padding for days before month starts */}
          {Array.from({ length: (monthStart.getDay() + 6) % 7 }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-24 p-2 bg-gray-50" />
          ))}

          {/* Month days */}
          {daysInMonth.map((date) => {
            const count = getShortsCountForDate(date);
            return (
              <div
                key={date.toISOString()}
                onClick={() => handleDateClick(date)}
                className={getDateClassName(date)}
              >
                <div className="font-semibold text-gray-900">{format(date, 'd')}</div>
                {count > 0 && (
                  <div className="mt-1">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {count} short{count > 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Details */}
      {selectedDate && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Shorts pour le {format(selectedDate, 'dd MMMM yyyy', { locale: fr })}
          </h3>

          {selectedDayShorts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucun short assigné pour cette date</p>
          ) : (
            <div className="space-y-4">
              {selectedDayShorts.map((short) => (
                <div
                  key={short.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{short.title || 'Sans titre'}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Chaîne source: {short.sourceChannel.channelName}
                      </p>
                      {short.assignedTo && (
                        <p className="text-sm text-gray-600">
                          Assigné à: {short.assignedTo.username}
                        </p>
                      )}
                      {short.targetChannel && (
                        <p className="text-sm text-gray-600">
                          Chaîne cible: {short.targetChannel.channelName}
                        </p>
                      )}
                      {short.notes && (
                        <p className="text-sm text-gray-500 mt-2 italic">{short.notes}</p>
                      )}
                    </div>
                    <div className="ml-4">
                      <span
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `${STATUS_COLORS[short.status]}20`,
                          color: STATUS_COLORS[short.status],
                        }}
                      >
                        {STATUS_LABELS[short.status]}
                      </span>
                    </div>
                  </div>
                  <a
                    href={short.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-600 hover:underline mt-2 inline-block"
                  >
                    Voir la vidéo →
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
