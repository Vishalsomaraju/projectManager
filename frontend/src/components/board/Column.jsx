import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TaskCard from './TaskCard';
import { 
  EllipsisHorizontalIcon, 
  PlusIcon 
} from '@heroicons/react/24/outline';

export default function Column({ column, tasks, onTaskClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: 'Column',
      column,
    },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="flex h-[calc(100vh-200px)] min-w-[300px] flex-col rounded-2xl border-2 border-primary-500 bg-gray-900/50 opacity-30"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex h-full min-w-[300px] flex-col rounded-2xl bg-gray-900/40 p-3 border border-gray-800/50"
    >
      {/* Column Header */}
      <div
        {...attributes}
        {...listeners}
        className="flex items-center justify-between px-2 pb-4 cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">{column.title}</h3>
          <span className="rounded-md bg-gray-800 px-2 py-0.5 text-[10px] font-bold text-gray-400">
            {tasks.length}
          </span>
        </div>
        <button className="rounded-lg p-1 text-gray-500 hover:bg-gray-800 hover:text-white transition-all">
          <EllipsisHorizontalIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Task List */}
      <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-1">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={onTaskClick} />
          ))}
        </SortableContext>
      </div>

      {/* Column Footer */}
      <button className="mt-4 flex w-full items-center gap-2 rounded-xl border border-dashed border-gray-800 p-3 text-sm font-medium text-gray-500 hover:border-primary-500/50 hover:bg-primary-500/5 hover:text-primary-400 transition-all">
        <PlusIcon className="h-4 w-4" />
        Add Task
      </button>
    </div>
  );
}
