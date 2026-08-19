import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TransactionModal from './TransactionModal';

export default function TopBar({ userAvatarUrl }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header className="fixed top-0 w-full md:left-72 md:w-[calc(100%-18rem)] z-30 bg-surface dark:bg-surface-dim shadow-[0px_4px_20px_rgba(0,0,0,0.04)]">
        <div className="flex justify-between items-center px-md py-sm w-full max-w-container-max mx-auto">
          <div className="flex items-center gap-sm md:hidden">
            <span className="font-headline-md text-headline-md text-primary dark:text-primary-fixed-dim font-extrabold tracking-tight">
              ExpenseFlow
            </span>
          </div>
          <div className="flex-1 md:flex-none" />
          <div className="flex items-center gap-md relative">
            <button onClick={() => setIsModalOpen(true)} className="bg-primary text-on-primary font-label-md text-label-md px-md py-sm rounded-lg hover:bg-primary-container hover:text-on-primary-container active:scale-95 transition-transform">
              + Add Transaction
            </button>
            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="focus:outline-none rounded-full ring-2 ring-transparent hover:ring-primary/20 transition-all">
                <img
                  className="w-10 h-10 rounded-full object-cover border border-outline-variant"
                  src={user?.profile_photo || userAvatarUrl || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random`}
                  alt="User avatar"
                />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.1)] py-2 border border-outline-variant z-50">
                  <div className="px-4 py-3 border-b border-outline-variant">
                    <p className="text-body-sm text-on-surface-variant">Signed in as</p>
                    <p className="text-body-md font-label-lg text-on-surface truncate">{user?.name}</p>
                    <p className="text-body-sm text-on-surface-variant truncate">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <Link to="/profile" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-body-md text-on-surface hover:bg-surface-container-low transition-colors">
                      My Profile
                    </Link>
                    <Link to="/settings" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-body-md text-on-surface hover:bg-surface-container-low transition-colors">
                      Settings
                    </Link>
                  </div>
                  <div className="py-1 border-t border-outline-variant">
                    <button 
                      onClick={() => {
                        setIsDropdownOpen(false);
                        logout();
                      }} 
                      className="block w-full text-left px-4 py-2 text-body-md text-error hover:bg-error-container hover:text-on-error-container transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => {
          // Ideally this triggers a global re-fetch or state update.
          // For now, reloading the page ensures all components get fresh data.
          window.location.reload();
        }}
      />
    </>
  )
}
