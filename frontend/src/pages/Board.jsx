import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useSocket } from '../hooks/useSocket';
import { 
  DndContext, 
  DragOverlay, 
  PointerSensor, 
  useSensor, 
  useSensors,
  closestCorners
} from '@dnd-kit/core';
import { arrayMove, SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import Navbar from '../components/layout/Navbar';
import Column from '../components/board/Column';
import TaskCard from '../components/board/TaskCard';
import TaskDetailModal from '../components/board/TaskDetailModal';
import { 
  UserPlusIcon, 
  AdjustmentsHorizontalIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

export default function Board() {
  const { projectId } = useParams();
  const queryClient = useQueryClient();
  const [activeTask, setActiveTask] = useState(null);
  const [activeColumn, setActiveColumn] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Real-time integration
  useSocket(projectId);

  // Fetch Project Data
  const { data: project, isLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`/api/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    }
  });

  // Fetch Columns & Tasks
  const { data: boardData } = useQuery({
    queryKey: ['board', projectId],
    queryFn: async () => {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`/api/projects/${projectId}/columns`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data; // Array of columns with tasks
    },
    enabled: !!project
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const moveTaskMutation = useMutation({
    mutationFn: async ({ taskId, columnId, order }) => {
      const token = localStorage.getItem('accessToken');
      return axios.patch(`/api/tasks/${taskId}/move`, { columnId, order }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['board', projectId]);
    }
  });

  const onDragStart = (event) => {
    if (event.active.data.current?.type === 'Column') {
      setActiveColumn(event.active.data.current.column);
      return;
    }
    if (event.active.data.current?.type === 'Task') {
      setActiveTask(event.active.data.current.task);
    }
  };

  const onDragEnd = (event) => {
    setActiveColumn(null);
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    // Handle Task Reordering/Moving
    if (active.data.current?.type === 'Task') {
      const activeTask = active.data.current.task;
      const overType = over.data.current?.type;
      
      let newColumnId = activeTask.columnId;
      let newOrder = 0;

      if (overType === 'Column') {
        newColumnId = overId;
        newOrder = boardData.find(c => c.id === overId).tasks.length;
      } else if (overType === 'Task') {
        const overTask = over.data.current.task;
        newColumnId = overTask.columnId;
        newOrder = overTask.order;
      }

      moveTaskMutation.mutate({ 
        taskId: activeId, 
        columnId: newColumnId, 
        order: newOrder 
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navbar />
        <div className="flex h-[calc(100vh-64px)] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <Navbar />
      
      {/* Board Header */}
      <div className="h-14 border-b border-gray-800 bg-gray-900/30 px-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h2 className="text-lg font-bold text-white">{project?.title}</h2>
          <div className="h-4 w-px bg-gray-800" />
          <div className="flex -space-x-2">
            {project?.members?.slice(0, 5).map((member) => (
              <div key={member.id} className="h-7 w-7 rounded-full border-2 border-gray-900 bg-gray-800 flex items-center justify-center text-[10px] font-bold text-white overflow-hidden">
                {member.user.displayName.charAt(0)}
              </div>
            ))}
            {project?.members?.length > 5 && (
              <div className="h-7 w-7 rounded-full border-2 border-gray-900 bg-gray-800 flex items-center justify-center text-[10px] font-bold text-gray-400">
                +{project.members.length - 5}
              </div>
            )}
            <button className="h-7 w-7 rounded-full border-2 border-dashed border-gray-700 flex items-center justify-center text-gray-500 hover:border-primary-500 hover:text-primary-500 transition-all ml-2">
              <UserPlusIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              className="bg-gray-800 border-none rounded-lg pl-9 pr-3 py-1.5 text-sm text-white placeholder-gray-500 focus:ring-1 focus:ring-primary-500 w-64"
            />
          </div>
          <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all">
            <AdjustmentsHorizontalIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Board Content */}
      <main className="flex-1 overflow-x-auto overflow-y-hidden p-6 custom-scrollbar bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary-900/10 via-transparent to-transparent">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        >
          <div className="flex h-full gap-6">
            <SortableContext items={boardData?.map(c => c.id) || []} strategy={horizontalListSortingStrategy}>
              {boardData?.map((column) => (
                <Column 
                  key={column.id} 
                  column={column} 
                  tasks={column.tasks || []} 
                  onTaskClick={(task) => {
                    setSelectedTask(task);
                    setIsModalOpen(true);
                  }}
                />
              ))}
            </SortableContext>
            
            {/* Add Column Button */}
            <button className="flex h-fit min-w-[300px] items-center gap-2 rounded-2xl border-2 border-dashed border-gray-800 p-4 text-gray-500 hover:border-gray-700 hover:bg-gray-900/50 hover:text-gray-400 transition-all">
              <PlusIcon className="h-5 w-5" />
              <span className="font-medium">Add another column</span>
            </button>
          </div>

          <DragOverlay>
            {activeColumn && <Column column={activeColumn} tasks={activeColumn.tasks || []} />}
            {activeTask && <TaskCard task={activeTask} />}
          </DragOverlay>
        </DndContext>
      </main>

      <TaskDetailModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTask(null);
        }} 
        task={selectedTask}
      />
    </div>
  );
}
