import { Shuffle } from 'iconsax-react';
import { SourceChannel } from '@/types/graphql';

interface RandomButtonProps {
  filteredChannels: SourceChannel[];
  onRandomSelect: (channel: SourceChannel) => void;
}

export default function RandomButton({ filteredChannels, onRandomSelect }: RandomButtonProps) {
  const handleRandomClick = () => {
    if (filteredChannels.length === 0) return;

    // Sélectionner une chaîne au hasard
    const randomIndex = Math.floor(Math.random() * filteredChannels.length);
    const randomChannel = filteredChannels[randomIndex];

    // Appeler le callback avec la chaîne sélectionnée
    onRandomSelect(randomChannel);
  };

  const isDisabled = filteredChannels.length === 0;

  return (
    <div className="fixed bottom-14 right-55 z-50">
      <button
        onClick={handleRandomClick}
        disabled={isDisabled}
        className={`relative flex items-center gap-3 px-6 py-4 rounded-full shadow-2xl font-semibold transition-all duration-300 transform ${
          isDisabled
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:scale-105 hover:from-orange-600 hover:to-red-700'
        }`}
        title={isDisabled ? 'Aucune chaîne disponible' : 'Sélectionner une chaîne aléatoire'}
      >
        <Shuffle
          size={24}
          color="white"
          variant="Bold"
          className={isDisabled ? 'opacity-50' : 'animate-pulse'}
        />
        <span>Random</span>
      </button>
    </div>
  );
}
