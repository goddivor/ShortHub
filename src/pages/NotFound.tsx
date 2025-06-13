import React from 'react';
import { useNavigate } from 'react-router';
import Button from '@/components/Button';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* YouTube-style 404 illustration */}
        <div className="mb-8">
          <div className="relative">
            {/* Main 404 text */}
            <h1 className="text-8xl font-bold text-[#FF0000] mb-4">404</h1>
            
            {/* YouTube play button style decoration */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-16 h-16 bg-[#FF0000] rounded-full flex items-center justify-center opacity-20">
                <div className="w-0 h-0 border-l-[12px] border-l-white border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ml-1"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Error message */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Page Not Found
          </h2>
          <p className="text-gray-600 leading-relaxed">
            The page you're looking for doesn't exist or has been moved. 
            Let's get you back on track!
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={handleGoHome}
            className="bg-[#FF0000] hover:bg-[#CC0000] text-white px-6 py-3 font-medium transition-colors duration-200"
          >
            Go to Home
          </Button>
          
          <Button
            onClick={handleGoBack}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 font-medium transition-colors duration-200"
          >
            Go Back
          </Button>
        </div>

        {/* Additional help text */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            If you think this is an error, please contact support or try refreshing the page.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;