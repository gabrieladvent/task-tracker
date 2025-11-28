import { motion, AnimatePresence } from 'framer-motion';
import { router } from '@inertiajs/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { CalendarTask } from '@/Pages/Periods/types/period';
import { getStatusColor, getStatusBadgeColor, getStatusLabel, getPriorityColor } from '@/Pages/Periods/utils';
import { Project } from '@/Pages/Periods/types/period';

// Import Editor.js
import EditorJS from '@editorjs/editorjs';
import Paragraph from '@editorjs/paragraph';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Checklist from '@editorjs/checklist';
import Quote from '@editorjs/quote';
import CodeTool from '@editorjs/code';
import Delimiter from '@editorjs/delimiter';
import Warning from '@editorjs/warning';
import Marker from '@editorjs/marker';
import InlineCode from '@editorjs/inline-code';

interface TaskDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: CalendarTask | null;
    periodId: string;
}

interface EditorData {
    time?: number;
    blocks: any[];
    version?: string;
}

export default function TaskDetailModal({ isOpen, onClose, task, periodId }: TaskDetailModalProps) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSavingNotes, setIsSavingNotes] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'todo',
        priority: 'low',
        story_points: '',
        project_id: '',
        notes: '',
        link_pull_request: ''
    });

    const editorRef = useRef<EditorJS | null>(null);
    const editorContainerRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // Debug log ketika task berubah
    useEffect(() => {
        if (task) {
            console.log('=== Task Data Debug ===');
            console.log('Task ID:', task.id);
            console.log('Task Title:', task.title);
            console.log('Task Description:', task.description);
            console.log('Task Notes:', task.notes);
            console.log('Task Status:', task.status);
            console.log('Full Task Object:', task);
        }
    }, [task]);

    // Fetch projects ketika modal dibuka
    useEffect(() => {
        if (isOpen && task) {
            fetchProjects();
        }
    }, [isOpen, task]);

    // Reset form data ketika task berubah
    useEffect(() => {
        if (task && isOpen) {
            console.log('Task data received:', task);

            const newFormData = {
                title: task.title || '',
                description: task.description || '',
                status: task.status || 'todo',
                priority: task.priority || 'low',
                story_points: task.story_points?.toString() || '',
                project_id: task.project || '',
                notes: task.notes || '',
                link_pull_request: task.link_pull_request || ''
            };

            console.log('Setting form data:', newFormData);
            setFormData(newFormData);

            // Initialize editor dengan data notes - delay lebih lama untuk memastikan DOM ready
            setTimeout(() => {
                initializeEditor(task.notes || '');
            }, 150);
        }
    }, [task?.id, isOpen]);

    // Initialize Editor.js
    const initializeEditor = useCallback((notes: string) => {
        console.log('Initializing editor with notes:', notes);

        if (editorRef.current) {
            editorRef.current.destroy();
            editorRef.current = null;
        }

        // Clear container dulu
        if (editorContainerRef.current) {
            editorContainerRef.current.innerHTML = '<div id="editorjs"></div>';
        }

        // Wait for DOM update
        setTimeout(() => {
            let initialData: EditorData = {
                blocks: []
            };

            // Parse existing notes jika ada
            if (notes && notes.trim() !== '') {
                try {
                    const parsed = JSON.parse(notes);
                    if (parsed.blocks && Array.isArray(parsed.blocks)) {
                        initialData = parsed;
                        console.log('Parsed notes successfully:', initialData);
                    }
                } catch (error) {
                    console.log('Notes is plain text, converting to Editor.js format');
                    // Jika notes adalah plain text, convert ke format Editor.js
                    initialData = {
                        blocks: [
                            {
                                type: 'paragraph',
                                data: {
                                    text: notes
                                }
                            }
                        ]
                    };
                }
            }

            try {
                editorRef.current = new EditorJS({
                    holder: 'editorjs',
                    tools: {
                        paragraph: {
                            class: Paragraph,
                            inlineToolbar: true,
                            config: {
                                placeholder: 'Start writing here...'
                            }
                        },
                        header: {
                            class: Header,
                            config: {
                                placeholder: 'Enter a header',
                                levels: [2, 3, 4],
                                defaultLevel: 3
                            },
                            inlineToolbar: true,
                        },
                        list: {
                            class: List,
                            inlineToolbar: true,
                        },
                        checklist: {
                            class: Checklist,
                            inlineToolbar: true,
                        },
                        quote: {
                            class: Quote,
                            inlineToolbar: true,
                            config: {
                                quotePlaceholder: 'Enter a quote',
                                captionPlaceholder: 'Quote\'s author',
                            },
                        },
                        code: CodeTool,
                        delimiter: Delimiter,
                        warning: Warning,
                        marker: Marker,
                        inlineCode: InlineCode,
                    },
                    data: initialData,
                    placeholder: 'Start writing your notes...',
                    onReady: () => {
                        console.log('Editor.js is ready with data:', initialData);
                    },
                    onChange: async (api, event) => {
                        console.log('Editor content changed');
                        debouncedSaveNotes();
                    },
                    minHeight: 200,
                });
            } catch (error) {
                console.error('Error initializing Editor.js:', error);
            }
        }, 50);
    }, []);

    // Debounced save untuk notes
    const saveNotes = useCallback(async () => {
        if (!editorRef.current || !task?.id) {
            console.log('Cannot save: editor not ready or no task ID');
            return;
        }

        try {
            setIsSavingNotes(true);
            setSaveStatus('saving');

            console.log('Saving notes...');
            const savedData = await editorRef.current.save();
            const notesJson = JSON.stringify(savedData);

            console.log('Notes to save:', notesJson);
            await handleSaveField('notes', notesJson);

            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        } catch (error) {
            console.error('Error saving notes:', error);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 3000);
        } finally {
            setIsSavingNotes(false);
        }
    }, [task?.id]);

    // Setup debounce untuk auto-save
    const debouncedSaveNotes = useCallback(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(() => {
            saveNotes();
        }, 1500); // Auto-save setelah 1.5 detik idle
    }, [saveNotes]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
            if (editorRef.current) {
                editorRef.current.destroy();
                editorRef.current = null;
            }
        };
    }, []);

    const fetchProjects = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/projects');
            if (response.ok) {
                const data = await response.json();
                setProjects(data);
            }
        } catch (error) {
            console.error('Failed to fetch projects:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateTask = async (updates: Partial<any>) => {
        if (!task?.id) {
            console.error('Task ID is undefined');
            return;
        }

        console.log('Updating task:', updates);

        try {
            await router.put(`/tasks/${task.id}`, updates, {
                preserveScroll: true,
            });

            setFormData(prev => ({ ...prev, ...updates }));
            console.log('Task updated successfully');
        } catch (error) {
            console.error('Update failed:', error);
        }
    };

    const handleSaveField = async (field: string, value: string) => {
        console.log(`Saving field ${field}:`, value);

        const updates: any = { [field]: value };

        if (field === 'story_points') {
            updates[field] = value ? parseInt(value) : null;
        }

        if (field === 'project_id' && value === '') {
            updates[field] = null;
        }

        await handleUpdateTask(updates);
    };

    const handleDeleteTask = () => {
        if (!task?.id) {
            console.error('Task ID is undefined');
            return;
        }

        if (confirm('Are you sure you want to delete this task?')) {
            router.delete(`/tasks/${task.id}`, {
                onSuccess: () => {
                    onClose();
                }
            });
        }
    };

    const statusOptions = [
        { value: 'todo', label: 'Todo' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'on_hold', label: 'On Hold' },
        { value: 'code_review', label: 'Code Review' },
        { value: 'done', label: 'Done' },
        { value: 'cancelled', label: 'Cancelled' }
    ];

    const priorityOptions = [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' }
    ];

    // Komponen Input Field dengan save on blur/enter
    const EditableInput = ({
        value,
        onChange,
        placeholder = "",
        className = "",
        type = "text",
        multiline = false
    }: {
        value: string;
        onChange: (value: string) => void;
        placeholder?: string;
        className?: string;
        type?: string;
        multiline?: boolean;
    }) => {
        const [isEditing, setIsEditing] = useState(false);
        const [localValue, setLocalValue] = useState(value);
        const inputRef = useRef<HTMLInputElement>(null);
        const textareaRef = useRef<HTMLTextAreaElement>(null);

        useEffect(() => {
            setLocalValue(value);
            console.log(`EditableInput updated with value:`, value);
        }, [value]);

        useEffect(() => {
            if (isEditing) {
                if (multiline && textareaRef.current) {
                    textareaRef.current.focus();
                    textareaRef.current.style.height = 'auto';
                    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
                } else if (inputRef.current) {
                    inputRef.current.focus();
                    if (type === 'text') {
                        inputRef.current.select();
                    }
                }
            }
        }, [isEditing, multiline, type]);

        const handleSave = () => {
            if (localValue.trim() !== value.trim()) {
                console.log(`Saving ${type} field:`, localValue);
                onChange(localValue);
            }
            setIsEditing(false);
        };

        const handleBlur = () => {
            handleSave();
        };

        const handleKeyDown = (e: React.KeyboardEvent) => {
            if (e.key === 'Enter' && (!multiline || e.ctrlKey)) {
                e.preventDefault();
                handleSave();
            }
            if (e.key === 'Escape') {
                setLocalValue(value);
                setIsEditing(false);
            }
        };

        if (isEditing) {
            if (multiline) {
                return (
                    <textarea
                        ref={textareaRef}
                        value={localValue}
                        onChange={(e) => setLocalValue(e.target.value)}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        className={`w-full border-2 border-blue-500 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-900 ${className}`}
                        placeholder={placeholder}
                        rows={4}
                    />
                );
            }

            return (
                <input
                    ref={inputRef}
                    type={type}
                    value={localValue}
                    onChange={(e) => setLocalValue(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    className={`w-full border-2 border-blue-500 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${className}`}
                    placeholder={placeholder}
                />
            );
        }

        const displayValue = value || placeholder;
        const displayClass = !value ? 'text-gray-400 italic' : 'text-gray-900';

        if (multiline) {
            return (
                <div
                    onClick={() => setIsEditing(true)}
                    className={`cursor-text hover:bg-gray-50 rounded-lg px-4 py-3 transition-colors whitespace-pre-wrap border-2 border-transparent hover:border-gray-300 min-h-[100px] ${displayClass} ${className}`}
                >
                    {value ? value : (
                        <span className="text-gray-400 italic">Click to add description...</span>
                    )}
                </div>
            );
        }

        return (
            <div
                onClick={() => setIsEditing(true)}
                className={`cursor-text hover:bg-gray-50 rounded-lg px-4 py-3 transition-colors border-2 border-transparent hover:border-gray-300 ${displayClass} ${className}`}
            >
                {displayValue}
            </div>
        );
    };

    const getSaveStatusText = () => {
        switch (saveStatus) {
            case 'saving':
                return 'Saving...';
            case 'saved':
                return 'Saved!';
            case 'error':
                return 'Save failed';
            default:
                return 'Auto-saves when you stop typing';
        }
    };

    const getSaveStatusColor = () => {
        switch (saveStatus) {
            case 'saving':
                return 'text-yellow-600';
            case 'saved':
                return 'text-green-600';
            case 'error':
                return 'text-red-600';
            default:
                return 'text-gray-500';
        }
    };

    if (!task) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 overflow-y-auto"
                    onClick={onClose}
                >
                    <div className="flex min-h-screen items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: "spring", damping: 25 }}
                            className="relative w-full max-w-5xl transform overflow-hidden rounded-lg bg-white shadow-xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="bg-white p-8 max-h-[95vh] overflow-y-auto">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-semibold text-gray-900">
                                        Task Details
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={onClose}
                                            className="text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </motion.button>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    {/* Status & Title */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className={`h-3 w-3 rounded-full ${getStatusColor(formData.status)}`} />
                                            <select
                                                value={formData.status}
                                                onChange={(e) => handleSaveField('status', e.target.value)}
                                                className={`text-sm font-medium px-3 py-2 rounded-lg border ${getStatusBadgeColor(formData.status)
                                                    } border-gray-300 focus:border-blue-500 focus:ring-blue-500 cursor-pointer`}
                                            >
                                                {statusOptions.map(option => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <EditableInput
                                            value={formData.title}
                                            onChange={(value) => handleSaveField('title', value)}
                                            placeholder="Task title"
                                            className="text-2xl font-bold"
                                        />
                                    </motion.div>

                                    {/* Priority & Story Points */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.15 }}
                                        className="grid grid-cols-2 gap-6"
                                    >
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Priority
                                            </label>
                                            <select
                                                value={formData.priority}
                                                onChange={(e) => handleSaveField('priority', e.target.value)}
                                                className={`w-full font-medium border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer ${getPriorityColor(formData.priority)
                                                    }`}
                                            >
                                                {priorityOptions.map(option => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Story Points
                                            </label>
                                            <EditableInput
                                                value={formData.story_points}
                                                onChange={(value) => handleSaveField('story_points', value)}
                                                placeholder="0"
                                                type="number"
                                                className="w-full font-medium border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </motion.div>

                                    {/* Project */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Project
                                        </label>
                                        <select
                                            value={formData.project_id}
                                            onChange={(e) => handleSaveField('project_id', e.target.value)}
                                            className="w-full text-gray-900 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                                            disabled={isLoading}
                                        >
                                            <option value="">Select Project</option>
                                            {projects.map(project => (
                                                <option key={project.id} value={project.id}>
                                                    {project.name}
                                                </option>
                                            ))}
                                        </select>
                                        {isLoading && (
                                            <p className="text-sm text-gray-500 mt-1">Loading projects...</p>
                                        )}
                                    </motion.div>

                                    {/* Description */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.25 }}
                                    >
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Description
                                        </label>
                                        <EditableInput
                                            value={formData.description}
                                            onChange={(value) => handleSaveField('description', value)}
                                            placeholder="Add task description..."
                                            multiline
                                            className="w-full"
                                        />
                                    </motion.div>

                                    {/* Notes dengan Editor.js */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Notes
                                            </label>
                                            <div className="flex items-center gap-3">
                                                <span className={`text-sm ${getSaveStatusColor()}`}>
                                                    {getSaveStatusText()}
                                                </span>
                                                <button
                                                    onClick={saveNotes}
                                                    disabled={isSavingNotes}
                                                    className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    {isSavingNotes ? 'Saving...' : 'Save Now'}
                                                </button>
                                            </div>
                                        </div>
                                        <div
                                            ref={editorContainerRef}
                                            className="border border-gray-300 rounded-lg overflow-hidden min-h-[300px] bg-white [&_.ce-block__content]:max-w-none [&_.ce-toolbar__content]:max-w-none [&_.codex-editor__redactor]:pb-10 [&_.ce-paragraph]:px-4"
                                        >
                                            <div id="editorjs"></div>
                                        </div>
                                    </motion.div>

                                    {/* Link Pull Request */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.35 }}
                                    >
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Link Pull Request
                                        </label>
                                        <EditableInput
                                            value={formData.link_pull_request}
                                            onChange={(value) => handleSaveField('link_pull_request', value)}
                                            placeholder="https://github.com/..."
                                            type="url"
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        {formData.link_pull_request && (
                                            <a
                                                href={formData.link_pull_request}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-2 text-blue-600 hover:text-blue-800 underline break-all text-sm inline-block"
                                            >
                                                Open Link in New Tab
                                            </a>
                                        )}
                                    </motion.div>

                                    {/* Action Buttons */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className="border-t pt-6 mt-6"
                                    >
                                        <div className="flex gap-3">
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleSaveField('status', formData.status === 'done' ? 'todo' : 'done')}
                                                className="flex-1 rounded-lg bg-blue-600 px-6 py-3 text-base font-medium text-white hover:bg-blue-700 transition-colors"
                                            >
                                                {formData.status === 'done' ? 'Mark as Todo' : 'Mark as Done'}
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={handleDeleteTask}
                                                className="rounded-lg bg-red-600 px-6 py-3 text-base font-medium text-white hover:bg-red-700 transition-colors"
                                            >
                                                Delete Task
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
