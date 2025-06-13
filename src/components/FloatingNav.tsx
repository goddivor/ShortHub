// src/components/FloatingNav.tsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Home, User, VideoPlay, Setting2, ArrowUp2, ArrowDown2 } from 'iconsax-react';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}

const FloatingNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);

  const navItems: NavItem[] = [
    {
      path: '/',
      label: 'Home',
      icon: <Home color="#FF0000" size={20} className="text-red-600" />,
      color: 'hover:bg-red-50'
    },
    {
      path: '/add-channel',
      label: 'Add Channel',
      icon: <User color="#FF0000" size={20} className="text-red-600" />,
      color: 'hover:bg-red-50'
    },
    {
      path: '/roll-shorts',
      label: 'Roll Shorts',
      icon: <VideoPlay color="#FF0000" size={20} className="text-red-600" />,
      color: 'hover:bg-red-50'
    },
    {
      path: '/debug',
      label: 'Debug',
      icon: <Setting2 color="#6B7280" size={20} className="text-gray-500" />,
      color: 'hover:bg-gray-50'
    }
  ];

  const currentPath = location.pathname;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Expand/Collapse Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-4 flex items-center justify-center hover:bg-gray-50 transition-colors border-b border-gray-100"
        >
          {isExpanded ? (
            <ArrowDown2 color="#6B7280" size={20} className="text-gray-500" />
          ) : (
            <ArrowUp2 color="#6B7280" size={20} className="text-gray-500" />
          )}
        </button>

        {/* Navigation Items */}
        <div className={`transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden`}>
          {navItems.map((item) => {
            const isActive = currentPath === item.path;
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`
                  w-full p-4 flex items-center gap-3 transition-all duration-200
                  ${isActive 
                    ? 'bg-red-50 border-r-4 border-red-600' 
                    : item.color
                  }
                `}
              >
                <div className={`
                  p-2 rounded-lg transition-all duration-200
                  ${isActive 
                    ? 'bg-red-100' 
                    : 'bg-gray-100'
                  }
                `}>
                  {item.icon}
                </div>
                <span className={`
                  font-medium text-sm
                  ${isActive 
                    ? 'text-red-900' 
                    : 'text-gray-700'
                  }
                `}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FloatingNav;