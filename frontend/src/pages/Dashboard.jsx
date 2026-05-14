import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { 
  PlusIcon, 
  FolderIcon, 
  UserGroupIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

export default function Dashboard() {
  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get('/api/projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    }
  });

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">Your Projects</h1>
              <p className="mt-2 text-sm text-gray-400">
                Manage your workspaces and track progress across teams.
              </p>
            </div>
            <button className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-500 transition-all shadow-lg shadow-primary-900/20">
              <PlusIcon className="h-5 w-5" />
              New Project
            </button>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 animate-pulse rounded-2xl bg-gray-900 border border-gray-800" />
              ))}
            </div>
          ) : projects?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-gray-800 rounded-3xl">
              <FolderIcon className="h-12 w-12 text-gray-700" />
              <h3 className="mt-4 text-lg font-medium text-white">No projects found</h3>
              <p className="mt-2 text-sm text-gray-500 max-w-xs">
                You haven't been added to any projects yet. Create one or ask for an invite.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects?.map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-gray-900 border border-gray-800 p-6 transition-all hover:border-primary-500/50 hover:bg-gray-800/50 hover:shadow-2xl hover:shadow-primary-900/10"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="h-10 w-10 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center text-primary-500 font-bold group-hover:bg-primary-500 group-hover:text-white transition-all">
                        {project.title.charAt(0).toUpperCase()}
                      </div>
                      <span className="inline-flex items-center rounded-full bg-primary-500/10 px-2 py-1 text-xs font-medium text-primary-500 ring-1 ring-inset ring-primary-500/20">
                        {project._count?.tasks || 0} tasks
                      </span>
                    </div>
                    
                    <h3 className="mt-6 text-xl font-bold text-white group-hover:text-primary-400 transition-colors">
                      {project.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-gray-400">
                      {project.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="mt-8 flex items-center justify-between border-t border-gray-800 pt-4">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <UserGroupIcon className="h-4 w-4" />
                        {project._count?.members || 0} members
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ClockIcon className="h-4 w-4" />
                        Updated 2d ago
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
