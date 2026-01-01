import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Tag as TagIcon, ChevronDown, Briefcase, Home, GraduationCap, Heart, Zap, Coffee } from 'lucide-react';
import { useTasks } from '../contexts/TaskContext';

const PREDEFINED_LABELS = [
    { name: 'Work', icon: Briefcase, color: '#3b82f6' },
    { name: 'Personal', icon: Heart, color: '#ec4899' },
    { name: 'Home', icon: Home, color: '#10b981' },
    { name: 'Leisure', icon: Coffee, color: '#f59e0b' },
    { name: 'Urgent', icon: Zap, color: '#ef4444' },
    { name: 'Learning', icon: GraduationCap, color: '#8b5cf6' },
];

export default function TaskCreator({ isOpen, onClose }) {
    const { createTask, bulkCreateTasks } = useTasks();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState(1);
    const [selectedLabels, setSelectedLabels] = useState([]);
    const [customLabel, setCustomLabel] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!title) return;

        setLoading(true);
        try {
            const finalLabels = [...selectedLabels];
            if (customLabel.trim()) finalLabels.push(customLabel.trim());

            await createTask({
                title,
                description,
                priority: parseInt(priority),
                labels: finalLabels,
            });
            resetForm();
            onClose();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setPriority(1);
        setSelectedLabels([]);
        setCustomLabel('');
    };

    const toggleLabel = (labelName) => {
        setSelectedLabels(prev =>
            prev.includes(labelName)
                ? prev.filter(l => l !== labelName)
                : [...prev, labelName]
        );
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div style={styles.overlay}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="glass"
                        style={styles.modal}
                    >
                        <div style={styles.header}>
                            <h2>Create New Task</h2>
                            <button onClick={onClose} style={styles.closeBtn}><X size={24} /></button>
                        </div>

                        <form onSubmit={handleSubmit} style={styles.form}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Title</label>
                                <input
                                    autoFocus
                                    style={styles.input}
                                    placeholder="What needs to be done?"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    required
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Priority</label>
                                <div style={styles.priorityGrid}>
                                    {[0, 1, 2].map((p) => (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setPriority(p)}
                                            style={{
                                                ...styles.priorityBtn,
                                                borderColor: priority == p ? 'var(--primary)' : 'var(--glass-border)',
                                                background: priority == p ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                            }}
                                        >
                                            {p === 0 ? 'High' : p === 1 ? 'Medium' : 'Low'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Choose Labels</label>
                                <div style={styles.labelGrid}>
                                    {PREDEFINED_LABELS.map((l) => {
                                        const Icon = l.icon;
                                        const isActive = selectedLabels.includes(l.name);
                                        return (
                                            <button
                                                key={l.name}
                                                type="button"
                                                onClick={() => toggleLabel(l.name)}
                                                style={{
                                                    ...styles.token,
                                                    borderColor: isActive ? l.color : 'var(--glass-border)',
                                                    background: isActive ? `${l.color}22` : 'var(--glass)',
                                                    color: isActive ? l.color : 'var(--text-muted)',
                                                }}
                                            >
                                                <Icon size={14} />
                                                <span>{l.name}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                                <input
                                    style={{ ...styles.input, marginTop: '0.5rem' }}
                                    placeholder="Or type a custom label..."
                                    value={customLabel}
                                    onChange={e => setCustomLabel(e.target.value)}
                                />
                            </div>

                            <div style={styles.divider}>
                                <span style={styles.dividerLine}></span>
                                <span style={styles.dividerText}>BONUS DETAILS</span>
                                <span style={styles.dividerLine}></span>
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Description (Optional)</label>
                                <textarea
                                    style={{ ...styles.input, minHeight: '60px', resize: 'none' }}
                                    placeholder="Add details..."
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                />
                            </div>

                            <div style={styles.divider}>
                                <span style={styles.dividerLine}></span>
                                <span style={styles.dividerText}>QUICK ACTIONS</span>
                                <span style={styles.dividerLine}></span>
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Bulk Upload (.json)</label>
                                <input
                                    type="file"
                                    accept=".json"
                                    style={styles.fileInput}
                                    onChange={async (e) => {
                                        const file = e.target.files[0];
                                        if (!file) return;
                                        setLoading(true);
                                        try {
                                            const text = await file.text();
                                            const json = JSON.parse(text);
                                            if (Array.isArray(json)) {
                                                await bulkCreateTasks(json);
                                                onClose();
                                            }
                                        } catch (err) {
                                            alert("Error: " + err.message);
                                        } finally {
                                            setLoading(false);
                                        }
                                    }}
                                />
                            </div>

                            <button type="submit" disabled={loading} style={styles.submitBtn}>
                                <Plus size={20} />
                                <span>{loading ? 'Adding...' : 'Create Task'}</span>
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

const styles = {
    overlay: {
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
        backdropFilter: 'blur(8px)',
    },
    modal: {
        width: '100%',
        maxWidth: '500px',
        padding: 'var(--spacing-lg)',
        overflowY: 'auto',
        maxHeight: '90vh',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.2rem',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem',
    },
    label: {
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
    },
    input: {
        width: '100%',
        padding: '0.8rem 1rem',
        borderRadius: 'var(--radius-md)',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid var(--glass-border)',
        color: 'var(--text-main)',
        fontSize: '1rem',
        outline: 'none',
    },
    priorityGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '0.5rem',
    },
    priorityBtn: {
        padding: '0.6rem',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid',
        fontSize: '0.8rem',
        fontWeight: '600',
        color: 'var(--text-main)',
    },
    labelGrid: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
    },
    token: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.4rem 0.8rem',
        borderRadius: '20px',
        border: '1px solid',
        fontSize: '0.75rem',
        fontWeight: '600',
    },
    divider: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        margin: '0.5rem 0',
    },
    dividerLine: {
        flex: 1,
        height: '1px',
        background: 'var(--glass-border)',
    },
    dividerText: {
        fontSize: '0.6rem',
        color: 'var(--text-muted)',
        fontWeight: '800',
    },
    fileInput: {
        width: '100%',
        padding: '0.6rem',
        borderRadius: 'var(--radius-md)',
        border: '1px dashed var(--glass-border)',
        background: 'rgba(255, 255, 255, 0.02)',
        color: 'var(--text-muted)',
        fontSize: '0.8rem',
    },
    submitBtn: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        padding: '1.2rem',
        borderRadius: 'var(--radius-md)',
        background: 'var(--primary)',
        color: 'white',
        fontSize: '1rem',
        fontWeight: '700',
        marginTop: '0.5rem',
        boxShadow: '0 8px 20px -5px var(--primary)',
    },
    closeBtn: {
        color: 'var(--text-muted)',
    }
};
