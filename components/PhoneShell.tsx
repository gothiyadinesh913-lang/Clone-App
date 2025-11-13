

import React from 'react';
import BottomNav from './BottomNav';

interface PhoneShellProps {
  children: React.ReactNode;
  showNav: boolean;
}

const PhoneShell: React.FC<PhoneShellProps> = ({ children, showNav }) => {
  return (
    <div className="w-full max-w-[420px] h-[95vh] max-h-[850px] bg-black rounded-[40px] shadow-2xl p-2.5 border-4 border-gray-800 overflow-hidden">
      <div className="w-full h-full bg-phone-bg-light dark:bg-phone-bg-dark rounded-[30px] flex flex-col overflow-hidden relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-lg z-20 flex justify-center items-center">
            <div className="w-1.5 h-1.5 bg-gray-700 rounded-full mr-2"></div>
            <div className="w-10 h-1.5 bg-gray-700 rounded-full"></div>
        </div>
        
        <main className={`flex-grow overflow-y-auto pt-8 transition-all duration-300 ${showNav ? 'pb-16' : 'pb-4'}`}>
          {children}
        </main>
        {showNav && <BottomNav />}
      </div>
    </div>
  );
};

export default PhoneShell;
