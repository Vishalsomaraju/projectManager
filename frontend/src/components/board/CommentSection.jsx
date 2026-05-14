import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { 
  PaperAirplaneIcon, 
  UserCircleIcon,
  FaceSmileIcon
} from '@heroicons/react/24/outline';

export default function CommentSection({ taskId }) {
  const [content, setContent] = useState('');
  const queryClient = useQueryClient();

  const { data: comments, isLoading } = useQuery({
    queryKey: ['comments', taskId],
    queryFn: async () => {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`/api/tasks/${taskId}/comments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    }
  });

  const addCommentMutation = useMutation({
    mutationFn: async (newComment) => {
      const token = localStorage.getItem('accessToken');
      return axios.post(`/api/tasks/${taskId}/comments`, newComment, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      setContent('');
      queryClient.invalidateQueries(['comments', taskId]);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    addCommentMutation.mutate({ content });
  };

  return (
    <div className="mt-8 space-y-6">
      <h3 className="text-lg font-bold text-white flex items-center gap-2">
        Activity
        <span className="text-xs font-normal text-gray-500">
          ({comments?.length || 0} comments)
        </span>
      </h3>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="flex gap-4">
        <div className="h-9 w-9 rounded-full bg-gray-800 flex items-center justify-center shrink-0">
          <UserCircleIcon className="h-6 w-6 text-gray-400" />
        </div>
        <div className="flex-1 relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a comment..."
            className="w-full rounded-xl bg-gray-800 border-none px-4 py-3 text-sm text-white placeholder-gray-500 focus:ring-1 focus:ring-primary-500 resize-none min-h-[80px]"
          />
          <div className="absolute right-2 bottom-2 flex items-center gap-2">
            <button type="button" className="p-1.5 text-gray-500 hover:text-white transition-colors">
              <FaceSmileIcon className="h-5 w-5" />
            </button>
            <button
              type="submit"
              disabled={!content.trim() || addCommentMutation.isPending}
              className="rounded-lg bg-primary-600 p-1.5 text-white hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </form>

      {/* Comment List */}
      <div className="space-y-6">
        {isLoading ? (
          [1, 2].map(i => <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-900" />)
        ) : (
          comments?.map((comment) => (
            <div key={comment.id} className="flex gap-4 group">
              <div className="h-9 w-9 rounded-full bg-gray-800 flex items-center justify-center shrink-0 border border-gray-700">
                {comment.author.avatarUrl ? (
                  <img src={comment.author.avatarUrl} alt="" className="h-full w-full object-cover rounded-full" />
                ) : (
                  <span className="text-xs font-bold text-gray-400">
                    {comment.author.displayName.charAt(0)}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{comment.author.displayName}</span>
                  <span className="text-[10px] text-gray-500">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <div className="mt-1 rounded-2xl bg-gray-900 p-3 text-sm text-gray-300 border border-gray-800/50">
                  {comment.content}
                </div>
                <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                  <button className="hover:text-primary-400">Reply</button>
                  <button className="hover:text-primary-400">Edit</button>
                  <button className="hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">Delete</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
