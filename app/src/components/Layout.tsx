import { Outlet } from 'react-router-dom';
import { ClublyLogo } from './ClublyLogo';

export function Layout() {
  return (
    <div className="min-h-screen bg-[#F6F6F2]">
      {/* Grain overlay */}
      <div className="grain-overlay" />
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#F6F6F2]/95 backdrop-blur-sm border-b border-gray-200/50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <ClublyLogo />
        </div>
      </header>
      
      {/* Main content */}
      <main>
        <Outlet />
      </main>
      
      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-gray-200/50">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-[#6F6F6F]">
          <p>© {new Date().getFullYear()} Clubly. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
