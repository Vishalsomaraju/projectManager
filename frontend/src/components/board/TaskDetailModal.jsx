import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { 
  XMarkIcon, 
  CalendarIcon, 
  TagIcon, 
  UserGroupIcon,
  Bars3BottomLeftIcon,
  TrashIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import CommentSection from './CommentSection';

export default function TaskDetailModal({ isOpen, onClose, task }) {
  if (!task) return null;

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[60]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-3xl bg-gray-900 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-4xl border border-gray-800">
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-gray-800 p-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary-600/10 flex items-center justify-center text-primary-500">
                      <Bars3BottomLeftIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-white">
                        {task.title}
                      </Dialog.Title>
                      <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">
                        Task ID: #{task.id.slice(-6)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="rounded-lg p-2 text-gray-500 hover:bg-gray-800 hover:text-white transition-all"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="flex flex-col lg:flex-row">
                  {/* Main Content */}
                  <div className="flex-1 p-8">
                    <section className="space-y-4">
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Description</h3>
                      <div className="rounded-2xl bg-gray-800/50 p-4 text-gray-300 text-sm leading-relaxed min-h-[120px] border border-gray-800">
                        {task.description || "No description provided. Click to add one."}
                      </div>
                    </section>

                    <CommentSection taskId={task.id} />
                  </div>

                  {/* Sidebar */}
                  <div className="w-full lg:w-72 bg-gray-950/50 p-8 border-l border-gray-800 space-y-8">
                    <div className="space-y-4">
                      <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Actions</h3>
                      <div className="space-y-2">
                        <button className="flex w-full items-center gap-2 rounded-xl bg-gray-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-700 transition-all border border-gray-700">
                          <UserGroupIcon className="h-4 w-4" /> Join Task
                        </button>
                        <button className="flex w-full items-center gap-2 rounded-xl bg-gray-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-700 transition-all border border-gray-700">
                          <TagIcon className="h-4 w-4" /> Labels
                        </button>
                        <button className="flex w-full items-center gap-2 rounded-xl bg-gray-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-700 transition-all border border-gray-700">
                          <CalendarIcon className="h-4 w-4" /> Dates
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4 pt-8 border-t border-gray-800">
                      <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Properties</h3>
                      <div className="space-y-4 text-sm">
                        <div>
                          <p className="text-gray-500 mb-2">Priority</p>
                          <span className="inline-flex items-center rounded-lg bg-red-500/10 px-2.5 py-1 text-xs font-bold text-red-500 border border-red-500/20">
                            High
                          </span>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-2">Assignees</p>
                          <div className="flex -space-x-2">
                            {task.assignees?.map(a => (
                              <div key={a.id} className="h-8 w-8 rounded-full border-2 border-gray-900 bg-gray-800 flex items-center justify-center text-xs font-bold text-white overflow-hidden">
                                {a.displayName.charAt(0)}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-8 border-t border-gray-800">
                      <button className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all">
                        <TrashIcon className="h-4 w-4" /> Delete Task
                      </button>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
