// src/pages/videaste/VideasteCalendarPage.tsx
import React, { useState, useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_MY_SHORTS_QUERY } from '@/lib/graphql';
import { Short, ShortStatus, ShortFilterInput } from '@/types/graphql';
import { useAuth } from '@/hooks/useAuth';
import ShortDetailsModal from '@/components/videaste/ShortDetailsModal';
import SpinLoader from '@/components/SpinLoader';
import {
  Calendar,
  ArrowLeft2,
  ArrowRight2,
  VideoPlay,
  TickCircle,
  Play,
  CloseCircle
} from 'iconsax-react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
  isPast
} from 'date-fns';
import { fr } from 'date-fns/locale';

const VideasteCalendarPage: React.FC = () => {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedShort, setSelectedShort] = useState<Short | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Fetch shorts
  const filter: ShortFilterInput = {
    assignedToId: user?.id,
  };

  const { data, loading } = useQuery<{ shorts: Short[] }>(GET_MY_SHORTS_QUERY, {
    variables: { filter },
    skip: !user,
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const shorts: Short[] = data?.shorts || [];

  // Group shorts by date
  const shortsByDate = useMemo(() => {
    const grouped = new Map<string, Short[]>();

    shorts.forEach((short) => {
      if (short.deadline) {
        const dateKey = format(new Date(short.deadline), 'yyyy-MM-dd');
        if (!grouped.has(dateKey)) {
          grouped.set(dateKey, []);
        }
        grouped.get(dateKey)!.push(short);
      }
    });

    return grouped;
  }, [shorts]);

  // Get calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Start on Monday
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleShortClick = (short: Short) => {
    setSelectedShort(short);
    setModalOpen(true);
  };

  const getShortsForDate = (date: Date): Short[] => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return shortsByDate.get(dateKey) || [];
  };

  const getStatusColor = (status: ShortStatus) => {
    switch (status) {
      case ShortStatus.ASSIGNED:
        return 'bg-blue-500';
      case ShortStatus.IN_PROGRESS:
        return 'bg-yellow-500';
      case ShortStatus.COMPLETED:
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: ShortStatus) => {
    switch (status) {
      case ShortStatus.ASSIGNED:
        return <VideoPlay size={12} color="white" variant="Bold" />;
      case ShortStatus.IN_PROGRESS:
        return <Play size={12} color="white" variant="Bold" />;
      case ShortStatus.COMPLETED:
        return <TickCircle size={12} color="white" variant="Bold" />;
      default:
        return null;
    }
  };

  // Stats for current month
  const monthStats = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    const monthShorts = shorts.filter((short) => {
      if (!short.deadline) return false;
      const deadline = new Date(short.deadline);
      return deadline >= monthStart && deadline <= monthEnd;
    });

    return {
      total: monthShorts.length,
      assigned: monthShorts.filter((s) => s.status === ShortStatus.ASSIGNED).length,
      inProgress: monthShorts.filter((s) => s.status === ShortStatus.IN_PROGRESS).length,
      completed: monthShorts.filter((s) => s.status === ShortStatus.COMPLETED).length,
      late: monthShorts.filter((s) => {
        if (!s.deadline) return false;
        // Statuts où le travail est terminé
        const completedStatuses = [ShortStatus.COMPLETED, ShortStatus.VALIDATED, ShortStatus.PUBLISHED];
        if (completedStatuses.includes(s.status)) return false;
        return isPast(new Date(s.deadline));
      }).length,
    };
  }, [shorts, currentMonth]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Calendrier</h1>
            <p className="text-purple-100 text-lg">
              Visualisez vos deadlines et planifiez votre travail
            </p>
          </div>
          <div className="hidden md:block">
            <Calendar size={64} color="white" className="opacity-20" variant="Bold" />
          </div>
        </div>
      </div>

      {/* Month Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Ce mois</span>
            <Calendar size={20} color="#8B5CF6" variant="Bold" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{monthStats.total}</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Assignés</span>
            <VideoPlay size={20} color="#3B82F6" variant="Bold" />
          </div>
          <p className="text-2xl font-bold text-blue-600">{monthStats.assigned}</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">En cours</span>
            <Play size={20} color="#F59E0B" variant="Bold" />
          </div>
          <p className="text-2xl font-bold text-yellow-600">{monthStats.inProgress}</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Terminés</span>
            <TickCircle size={20} color="#10B981" variant="Bold" />
          </div>
          <p className="text-2xl font-bold text-green-600">{monthStats.completed}</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">En retard</span>
            <CloseCircle size={20} color="#EF4444" variant="Bold" />
          </div>
          <p className="text-2xl font-bold text-red-600">{monthStats.late}</p>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Calendar Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 p-6">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePreviousMonth}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ArrowLeft2 size={24} color="white" variant="Bold" />
            </button>

            <h2 className="text-2xl font-bold text-white">
              {format(currentMonth, 'MMMM yyyy', { locale: fr })}
            </h2>

            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ArrowRight2 size={24} color="white" variant="Bold" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <SpinLoader />
          </div>
        ) : (
          <div className="p-6">
            {/* Week days header */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {weekDays.map((day) => (
                <div key={day} className="text-center font-semibold text-gray-700 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day) => {
                const dayShorts = getShortsForDate(day);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isTodayDate = isToday(day);

                return (
                  <div
                    key={day.toISOString()}
                    onClick={() => handleDateClick(day)}
                    className={`
                      min-h-24 p-2 border rounded-lg cursor-pointer transition-all
                      ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                      ${isSelected ? 'ring-2 ring-purple-500 border-purple-500' : 'border-gray-200'}
                      ${isTodayDate ? 'bg-blue-50 border-blue-300' : ''}
                      hover:shadow-md hover:border-purple-300
                    `}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`
                          text-sm font-semibold
                          ${!isCurrentMonth ? 'text-gray-400' : isTodayDate ? 'text-blue-600' : 'text-gray-900'}
                        `}
                      >
                        {format(day, 'd')}
                      </span>
                      {dayShorts.length > 0 && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-semibold">
                          {dayShorts.length}
                        </span>
                      )}
                    </div>

                    {/* Shorts for this day */}
                    <div className="space-y-1">
                      {dayShorts.slice(0, 3).map((short) => {
                        // Statuts où le travail est terminé
                        const completedStatuses = [ShortStatus.COMPLETED, ShortStatus.VALIDATED, ShortStatus.PUBLISHED];
                        const isCompleted = completedStatuses.includes(short.status);
                        const isLate = !isCompleted && isPast(new Date(short.deadline!));
                        return (
                          <div
                            key={short.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShortClick(short);
                            }}
                            className={`
                              px-2 py-1 rounded text-xs font-medium truncate flex items-center gap-1
                              ${isLate ? 'bg-red-100 text-red-800 border border-red-300' : ''}
                              ${!isLate && short.status === ShortStatus.COMPLETED ? 'bg-green-100 text-green-800' : ''}
                              ${!isLate && short.status === ShortStatus.IN_PROGRESS ? 'bg-yellow-100 text-yellow-800' : ''}
                              ${!isLate && short.status === ShortStatus.ASSIGNED ? 'bg-blue-100 text-blue-800' : ''}
                              hover:opacity-80 transition-opacity
                            `}
                          >
                            <div className={`w-3 h-3 rounded-full flex items-center justify-center ${getStatusColor(short.status)}`}>
                              {getStatusIcon(short.status)}
                            </div>
                            <span className="truncate">
                              {short.title || short.sourceChannel.channelName}
                            </span>
                          </div>
                        );
                      })}
                      {dayShorts.length > 3 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{dayShorts.length - 3} autres
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Selected Date Details */}
      {selectedDate && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Shorts pour le {format(selectedDate, 'PPP', { locale: fr })}
          </h3>

          {getShortsForDate(selectedDate).length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucun short pour cette date</p>
          ) : (
            <div className="space-y-3">
              {getShortsForDate(selectedDate).map((short) => {
                // Statuts où le travail est terminé
                const completedStatuses = [ShortStatus.COMPLETED, ShortStatus.VALIDATED, ShortStatus.PUBLISHED];
                const isCompleted = completedStatuses.includes(short.status);
                const isLate = !isCompleted && isPast(new Date(short.deadline!));
                return (
                  <div
                    key={short.id}
                    onClick={() => handleShortClick(short)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">
                        {short.title || 'Titre non disponible'}
                      </h4>
                      {isLate && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                          <CloseCircle size={14} color="#B91C1C" variant="Bold" />
                          En retard
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Source: {short.sourceChannel.channelName}</span>
                      <span>•</span>
                      <span>Deadline: {format(new Date(short.deadline!), 'HH:mm')}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Details Modal */}
      <ShortDetailsModal
        isOpen={modalOpen}
        short={selectedShort}
        onClose={() => {
          setModalOpen(false);
          setSelectedShort(null);
        }}
      />
    </div>
  );
};

export default VideasteCalendarPage;
