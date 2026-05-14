import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  ChatBubbleLeftRightIcon, 
  PaperClipIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function TaskCard({ task, onClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'Task',
      task,
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
        className="h-[120px] min-h-[120px] w-full cursor-grabbing rounded-xl border-2 border-primary-500 bg-gray-900 opacity-30"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick?.(task)}
      className="group relative flex flex-col gap-3 rounded-xl border border-gray-800 bg-gray-900 p-4 shadow-sm transition-all hover:border-gray-700 hover:shadow-md cursor-grab active:cursor-grabbing"
    >
      {/* Labels */}
      <div className="flex flex-wrap gap-1">
        {task.labels?.map((label) => (
          <span
            key={label.id}
            className="h-1.5 w-8 rounded-full"
            style={{ backgroundColor: label.color }}
          />
        ))}
      </div>

      <h4 className="text-sm font-medium text-white group-hover:text-primary-400 transition-colors">
        {task.title}
      </h4>

      {/* Meta Info */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {task._count?.comments > 0 && (
            <div className="flex items-center gap-1">
              <ChatBubbleLeftRightIcon className="h-4 w-4" />
              {task._count.comments}
            </div>
          )}
          {task.attachments?.length > 0 && (
            <div className="flex items-center gap-1">
              <PaperClipIcon className="h-4 w-4" />
              {task.attachments.length}
            </div>
          )}
        </div>

        <div className="flex -space-x-2">
          {task.assignees?.map((assignee) => (
            <div
              key={assignee.id}
              className="h-6 w-6 rounded-full border-2 border-gray-900 bg-gray-800 flex items-center justify-center text-[10px] font-bold text-white overflow-hidden"
              title={assignee.displayName}
            >
              {assignee.avatarUrl ? (
                <img src={assignee.avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                assignee.displayName.charAt(0).toUpperCase()
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
