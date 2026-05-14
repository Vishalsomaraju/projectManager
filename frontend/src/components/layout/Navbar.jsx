import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  BellIcon, 
  UserCircleIcon, 
  ArrowLeftOnRectangleIcon 
} from '@heroicons/react/24/outline';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="h-16 border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-50">
      <div className="mx-auto h-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-full items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center font-bold text-white shadow-lg shadow-primary-900/20">
                P
              </div>
              <span className="text-xl font-bold tracking-tight text-white">ProMan</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-400">
              <Link to="/dashboard" className="hover:text-white transition-colors">Projects</Link>
              <Link to="/dashboard" className="hover:text-white transition-colors">My Tasks</Link>
              <Link to="/dashboard" className="hover:text-white transition-colors">Team</Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-all">
              <BellIcon className="h-6 w-6" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border-2 border-gray-900" />
            </button>
            
            <div className="h-8 w-px bg-gray-800 mx-2" />

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white">{user?.displayName}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role?.toLowerCase()}</p>
              </div>
              
              <div className="group relative">
                <button className="h-9 w-9 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center overflow-hidden hover:border-primary-500 transition-all">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <UserCircleIcon className="h-6 w-6 text-gray-400" />
                  )}
                </button>
                
                <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl bg-gray-900 border border-gray-800 p-1 shadow-2xl invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all">
                  <button
                    onClick={logout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <ArrowLeftOnRectangleIcon className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
