import { motion, AnimatePresence } from 'framer-motion';
import { router } from '@inertiajs/react';
import { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { CalendarTask } from '@/Pages/Periods/types/period';
import { getStatusColor, getStatusBadgeColor, getPriorityColor, getPriorityBadgeColor } from '@/Pages/Periods/utils';
import { Project } from '@/Pages/Periods/types/period';
import EditorJS from '@editorjs/editorjs';
import { Trash, Save } from 'lucide-react';
import { DEBOUNCE_DELAY, EDITOR_INIT_DELAY, EDITOR_TOOLS_CONFIG, PRIORITY_OPTIONS, STATUS_OPTIONS } from '../../Constants/StatusOption';


interface TaskDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: CalendarTask | null;
    periodId: string;
    isNewTask?: boolean;
}

interface EditorData {
    time?: number;
    blocks: any[];
    version?: string;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const parseEditorData = (notes: string): EditorData => {
    if (!notes || notes.trim() === '') {
        return { blocks: [] };
    }

    try {
        const parsed = JSON.parse(notes);
        if (parsed.blocks && Array.isArray(parsed.blocks)) {
            return parsed;
        }
    } catch (error) {
        return {
            blocks: [{ type: 'paragraph', data: { text: notes } }]
        };
    }

    return { blocks: [] };
};

const getSaveStatusInfo = (status: SaveStatus, isNewTask: boolean) => {
    if (isNewTask) {
        return { text: 'Click "Create Task" to save', color: 'text-blue-600' };
    }

    const statusMap = {
        saving: { text: 'Saving...', color: 'text-yellow-600' },
        saved: { text: 'Saved!', color: 'text-green-600' },
        error: { text: 'Save failed', color: 'text-red-600' },
        idle: { text: 'Auto-saves when you stop typing', color: 'text-gray-500' }
    };

    return statusMap[status];
};


// Motion Section Wrapper
const MotionSection = memo(({ delay, children, className = "" }: {
    delay: number;
    children: React.ReactNode;
    className?: string;
}) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className={className}
    >
        {children}
    </motion.div>
));

const StatusSelector = memo(({
    value,
    onChange,
    options,
    getColor,
    getBadgeColor
}: {
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    getColor: (value: string) => string;
    getBadgeColor: (value: string) => string;
}) => (
    <div className="flex items-center gap-3 mb-3">
        <span className={`h-3 w-3 rounded-full ${getColor(value)}`} />
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`text-sm font-medium px-2 py-1 rounded-lg border ${getBadgeColor(value)} border-none focus:border-blue-500 focus:ring-blue-500 cursor-pointer`}
        >
            {options.map(option => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    </div>
));

const EditableInput = memo(({
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
    const [tempValue, setTempValue] = useState(value);
    const inputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleEdit = useCallback(() => {
        setTempValue(value);
        setIsEditing(true);
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

    const handleSave = useCallback(() => {
        if (tempValue !== value) {
            onChange(tempValue);
        }
        setIsEditing(false);
    }, [tempValue, value, onChange]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && (!multiline || e.ctrlKey)) {
            e.preventDefault();
            handleSave();
        }
        if (e.key === 'Escape') {
            setTempValue(value);
            setIsEditing(false);
        }
    }, [multiline, handleSave, value]);

    if (isEditing) {
        const commonProps = {
            value: tempValue,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setTempValue(e.target.value),
            onBlur: handleSave,
            onKeyDown: handleKeyDown,
            className: `w-full border-2 border-blue-500 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${className}`,
            placeholder
        };

        if (multiline) {
            return (
                <textarea
                    ref={textareaRef}
                    {...commonProps}
                    className={`${commonProps.className} resize-none`}
                    rows={4}
                />
            );
        }

        return (
            <input
                ref={inputRef}
                type={type}
                {...commonProps}
            />
        );
    }

    const displayValue = value || placeholder;
    const displayClass = !value ? 'text-gray-400 italic' : 'text-gray-900';
    const baseClass = `cursor-text hover:bg-gray-50 rounded-lg px-4 py-3 transition-colors border-2 border-transparent hover:border-gray-300 ${displayClass} ${className}`;

    if (multiline) {
        return (
            <div
                onClick={handleEdit}
                className={`${baseClass} whitespace-pre-wrap min-h-[100px]`}
            >
                {value || <span className="text-gray-400 italic">Click to add description...</span>}
            </div>
        );
    }

    return (
        <div onClick={handleEdit} className={baseClass}>
            {displayValue}
        </div>
    );
});

// ==================== MAIN COMPONENT ====================
export default function TaskDetailModal({
    isOpen,
    onClose,
    task,
    periodId,
    isNewTask = false
}: TaskDetailModalProps) {
    // ==================== STATE ====================
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSavingNotes, setIsSavingNotes] = useState(false);
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'todo',
        priority: 'low',
        story_points: '',
        project_id: '',
        notes: '',
        link_pull_request: '',
        task_date: ''
    });

    // ==================== REFS ====================
    const editorRef = useRef<EditorJS | null>(null);
    const editorContainerRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // ==================== MEMOIZED VALUES ====================
    const saveStatusInfo = useMemo(() =>
        getSaveStatusInfo(saveStatus, isNewTask),
        [saveStatus, isNewTask]
    );

    const editorConfig = useMemo(() => ({
        holder: 'editorjs',
        tools: EDITOR_TOOLS_CONFIG,
        placeholder: 'Start writing your notes...',
        minHeight: 200,
    }), []);

    // ==================== CALLBACKS ====================
    const fetchProjects = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/projects');
            if (response.ok) {
                const data = await response.json();
                setProjects(data);
            }
        } catch (error) {
            console.error('Failed to fetch projects:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const initializeEditor = useCallback((notes: string) => {
        if (editorRef.current) {
            editorRef.current.destroy();
            editorRef.current = null;
        }

        if (editorContainerRef.current) {
            editorContainerRef.current.innerHTML = '<div id="editorjs"></div>';
        }

        setTimeout(() => {
            const initialData = parseEditorData(notes);

            try {
                editorRef.current = new EditorJS({
                    ...editorConfig,
                    data: initialData,
                    onChange: async () => {
                        if (!isNewTask) {
                            debouncedSaveNotes();
                        }
                    },
                });
            } catch (error) {
                console.error('Error initializing Editor.js:', error);
            }
        }, 50);
    }, [editorConfig, isNewTask]);

    const saveNotes = useCallback(async () => {
        if (!editorRef.current || !task?.id || isNewTask) return;

        try {
            setIsSavingNotes(true);
            setSaveStatus('saving');

            const savedData = await editorRef.current.save();
            const notesJson = JSON.stringify(savedData);

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
    }, [task?.id, isNewTask]);

    const debouncedSaveNotes = useCallback(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(() => {
            saveNotes();
        }, DEBOUNCE_DELAY);
    }, [saveNotes]);

    const handleUpdateTask = useCallback(async (updates: Partial<any>) => {
        if (!task?.id || isNewTask) return;

        try {
            await router.put(`/tasks/${task.id}`, updates, {
                preserveScroll: true,
            });

            setFormData(prev => ({ ...prev, ...updates }));
        } catch (error) {
            console.error('Update failed:', error);
        }
    }, [task?.id, isNewTask]);

    const handleSaveField = useCallback(async (field: string, value: string) => {
        if (isNewTask) {
            setFormData(prev => ({ ...prev, [field]: value }));
            return;
        }

        let processedValue: any = value;

        if (field === 'story_points') {
            processedValue = value ? parseInt(value) : null;
        } else if (field === 'project_id' && value === '') {
            processedValue = null;
        }

        await handleUpdateTask({ [field]: processedValue });
    }, [isNewTask, handleUpdateTask]);

    const handleCreateTask = useCallback(async () => {
        if (!formData.title.trim()) {
            alert('Please enter a task title');
            return;
        }

        try {
            let notesJson = '';
            if (editorRef.current) {
                const savedData = await editorRef.current.save();
                notesJson = JSON.stringify(savedData);
            }

            router.post(`/periods/${periodId}/tasks`, {
                task_date: formData.task_date,
                title: formData.title,
                description: formData.description,
                status: formData.status,
                priority: formData.priority,
                story_points: formData.story_points ? parseInt(formData.story_points) : null,
                project_id: formData.project_id || null,
                notes: notesJson,
                link_pull_request: formData.link_pull_request,
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    onClose();
                }
            });
        } catch (error) {
            console.error('Create failed:', error);
        }
    }, [formData, periodId, onClose]);

    const handleDeleteTask = useCallback(() => {
        if (!task?.id || isNewTask) return;

        if (confirm('Are you sure you want to delete this task?')) {
            router.delete(`/tasks/${task.id}`, {
                onSuccess: () => {
                    onClose();
                }
            });
        }
    }, [task?.id, isNewTask, onClose]);

    const toggleTaskStatus = useCallback(() => {
        const newStatus = formData.status === 'done' ? 'todo' : 'done';
        handleSaveField('status', newStatus);
    }, [formData.status, handleSaveField]);

    // ==================== EFFECTS ====================
    useEffect(() => {
        if (!isOpen || !task) return;

        fetchProjects();

        const newFormData = {
            title: task.title || '',
            description: task.description || '',
            status: task.status || 'todo',
            priority: task.priority || 'low',
            story_points: task.story_points?.toString() || '',
            project_id: task.project_id || '',
            notes: task.notes || '',
            link_pull_request: task.link_pull_request || '',
            task_date: task.task_date || ''
        };

        setFormData(newFormData);

        const editorTimer = setTimeout(() => {
            initializeEditor(task.notes || '');
        }, EDITOR_INIT_DELAY);

        return () => {
            clearTimeout(editorTimer);
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
            if (editorRef.current) {
                editorRef.current.destroy();
                editorRef.current = null;
            }
        };
    }, [isOpen, task?.id, fetchProjects, initializeEditor]);

    // ==================== RENDER ====================
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
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: "spring", damping: 25 }}
                            className="relative w-full max-w-5xl transform overflow-hidden rounded-lg bg-white shadow-xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="bg-white p-8 max-h-[95vh] overflow-y-auto">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-semibold text-gray-900">
                                        {isNewTask ? 'Create New Task' : 'Task Details'}
                                    </h3>
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

                                <div className="space-y-8">
                                    {/* Status & Priority & Title */}
                                    <MotionSection delay={0.1}>
                                        <div className="flex items-center justify-self-start gap-4">
                                            <StatusSelector
                                                value={formData.status}
                                                onChange={(value) => handleSaveField('status', value)}
                                                options={STATUS_OPTIONS}
                                                getColor={getStatusColor}
                                                getBadgeColor={getStatusBadgeColor}
                                            />
                                            <StatusSelector
                                                value={formData.priority}
                                                onChange={(value) => handleSaveField('priority', value)}
                                                options={PRIORITY_OPTIONS}
                                                getColor={getPriorityColor}
                                                getBadgeColor={getPriorityBadgeColor}
                                            />
                                        </div>

                                        <EditableInput
                                            value={formData.title}
                                            onChange={(value) => handleSaveField('title', value)}
                                            placeholder="Task title"
                                            className="text-2xl font-bold"
                                        />
                                    </MotionSection>

                                    {/* Project & Story Points */}
                                    <MotionSection delay={0.15} className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Project
                                            </label>
                                            <select
                                                value={formData.project_id}
                                                onChange={(e) => handleSaveField('project_id', e.target.value)}
                                                className="w-full text-gray-900 border border-gray-300 rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                                                disabled={isLoading}
                                            >
                                                <option value="">Select Project</option>
                                                {projects.map(project => (
                                                    <option key={project.id} value={project.id}>
                                                        {project.name}
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
                                                className="w-full font-medium border border-gray-400 rounded-lg px-1 py-1"
                                            />
                                        </div>
                                    </MotionSection>

                                    {/* Description */}
                                    <MotionSection delay={0.25}>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Description Task
                                        </label>
                                        <EditableInput
                                            value={formData.description}
                                            onChange={(value) => handleSaveField('description', value)}
                                            placeholder="Add task description..."
                                            multiline
                                            className="border border-gray-300 rounded-lg overflow-hidden min-h-[150px] bg-white"
                                        />
                                    </MotionSection>

                                    <hr className="my-4" />

                                    {/* Notes */}
                                    <MotionSection delay={0.3}>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Notes
                                            </label>
                                            <div className="flex items-center gap-3">
                                                <span className={`text-sm ${saveStatusInfo.color}`}>
                                                    {saveStatusInfo.text}
                                                </span>
                                                {!isNewTask && (
                                                    <button
                                                        onClick={saveNotes}
                                                        disabled={isSavingNotes}
                                                        className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                    >
                                                        {isSavingNotes ? 'Saving...' : 'Save Now'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div
                                            ref={editorContainerRef}
                                            className="border border-gray-300 rounded-lg overflow-hidden min-h-[300px] bg-white"
                                        >
                                            <div className="editor-container h-full">
                                                <div id="editorjs" className="h-full"></div>
                                            </div>
                                        </div>
                                    </MotionSection>

                                    {/* Link Pull Request */}
                                    <MotionSection delay={0.35}>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Link Pull Request
                                        </label>
                                        <EditableInput
                                            value={formData.link_pull_request}
                                            onChange={(value) => handleSaveField('link_pull_request', value)}
                                            placeholder="https://github.com/..."
                                            type="url"
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
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
                                    </MotionSection>

                                    {/* Action Buttons */}
                                    <MotionSection delay={0.4} className="border-t pt-6 mt-6">
                                        {isNewTask ? (
                                            <div className="flex gap-3">
                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={handleCreateTask}
                                                    className="flex-1 rounded-lg bg-blue-600 px-6 py-3 text-base font-medium text-white hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <Save size={18} />
                                                    Create Task
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={onClose}
                                                    className="rounded-lg bg-gray-200 px-6 py-3 text-base font-medium text-gray-700 hover:bg-gray-300 transition-colors"
                                                >
                                                    Cancel
                                                </motion.button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-3">
                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={toggleTaskStatus}
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
                                                    <Trash size={18} />
                                                </motion.button>
                                            </div>
                                        )}
                                    </MotionSection>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
