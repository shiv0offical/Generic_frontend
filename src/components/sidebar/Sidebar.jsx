import React from 'react';

const Sidebar = () => {
  return (
    <div className="w-24 bg-gray-800 text-white flex flex-col items-center py-4">
      {/* Logo or brand */}
      <div className="mb-8">
        <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
          <span className="text-xl font-bold">L</span>
        </div>
      </div>
      
      {/* Navigation items */}
      <nav className="flex flex-col space-y-4">
        <button className="p-3 rounded-lg hover:bg-gray-700 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          </svg>
        </button>
        
        <button className="p-3 rounded-lg hover:bg-gray-700 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2V7a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2-2V3a2 2 0 00-2-2z" />
          </svg>
        </button>
        
        <button className="p-3 rounded-lg hover:bg-gray-700 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;
