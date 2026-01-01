import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle, Circle, AlertCircle, Clock, Tag, Zap,
    AlertTriangle, Info, X, Briefcase, Heart, Home,
    Coffee, GraduationCap, ChevronRight, User
} from 'lucide-react';

const priorityColors = {
    0: '#ef4444', // High - Red
    1: '#f59e0b', // Medium - Amber
    2: '#10b981'  // Low - Emerald
};

const priorityLabels = {
    0: 'High',
    1: 'Medium',
    2: 'Low'
};

const labelIcons = {
    'Work': Briefcase,
    'Personal': Heart,
    'Home': Home,
    'Leisure': Coffee,
    'Urgent': Zap,
    'Learning': GraduationCap,
};

const PriorityIcon = ({ priority, size = 14 }) => {
    if (priority === 0) return <Zap size={size} />;
    if (priority === 1) return <AlertTriangle size={size} />;
    return <Info size={size} />;
};

export default function TaskCard({ task, onUpdate }) {
    const [showFullDesc, setShowFullDesc] = useState(false);
    const isCompleted = task.status === 'completed';
    const isOverspill = task.status === 'overspill';

    const toggleComplete = (e) => {
        e.stopPropagation();
        onUpdate(task.id, {
            status: isCompleted ? 'in-progress' : 'completed',
            dateCompleted: isCompleted ? null : new Date().toISOString()
        });
    };

    const getLabelIcon = (label) => {
        const Icon = labelIcons[label] || Tag;
        return <Icon size={12} />;
    };

    return (
        <>
            <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass"
                onClick={() => setShowFullDesc(true)}
                style={{
                    ...styles.card,
                    borderColor: isOverspill ? 'var(--danger)' : 'var(--glass-border)',
                    background: isCompleted ? 'rgba(16, 185, 129, 0.05)' : 'var(--glass)',
                    opacity: isCompleted ? 0.8 : 1,
                    cursor: 'pointer'
                }}
            >
                <div style={styles.header}>
                    <div style={{
                        ...styles.priorityBadge,
                        color: priorityColors[task.priority],
                        background: `${priorityColors[task.priority]}15`
                    }}>
                        <PriorityIcon priority={task.priority} />
                        <span>{priorityLabels[task.priority]}</span>
                    </div>
                    <button onClick={toggleComplete} style={styles.completeBtn}>
                        {isCompleted ? (
                            <CheckCircle size={24} color="var(--success)" />
                        ) : (
                            <Circle size={24} color="var(--text-muted)" />
                        )}
                    </button>
                </div>

                <div style={styles.content}>
                    <h3 style={{
                        ...styles.title,
                        textDecoration: isCompleted ? 'line-through' : 'none'
                    }}>
                        {task.title}
                    </h3>
                    {task.description && (
                        <p style={styles.desc}>
                            {task.description}
                        </p>
                    )}
                </div>

                <div style={styles.footer}>
                    <div style={styles.labelContainer}>
                        {task.labels?.slice(0, 2).map((label, idx) => (
                            <div key={idx} style={styles.metaLabel}>
                                {getLabelIcon(label)}
                                <span>{label}</span>
                            </div>
                        ))}
                        {task.labels?.length > 2 && (
                            <span style={styles.moreLabels}>+{task.labels.length - 2}</span>
                        )}
                    </div>
                    {task.assignedTo && (
                        <div style={styles.assigneeMini} title={`Assigned to ${task.assignedTo.displayName}`}>
                            {task.assignedTo.photoURL ? (
                                <img src={task.assignedTo.photoURL} alt={task.assignedTo.displayName} style={styles.assigneeAvatarMini} />
                            ) : (
                                <div style={styles.assigneeInitialMini}>
                                    {task.assignedTo.displayName?.charAt(0)}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>

            <AnimatePresence>
                {showFullDesc && (
                    <div style={styles.overlay} onClick={() => setShowFullDesc(false)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="glass"
                            onClick={e => e.stopPropagation()}
                            style={styles.modal}
                        >
                            <div style={styles.modalHeader}>
                                <div style={{
                                    ...styles.priorityBadge,
                                    color: priorityColors[task.priority],
                                    background: `${priorityColors[task.priority]}15`
                                }}>
                                    <PriorityIcon priority={task.priority} />
                                    <span>{priorityLabels[task.priority]} Priority</span>
                                </div>
                                <button onClick={() => setShowFullDesc(false)} style={styles.closeBtn}>
                                    <X size={20} />
                                </button>
                            </div>

                            <h2 style={styles.modalTitle}>{task.title}</h2>

                            <div style={styles.modalBody}>
                                <label style={styles.modalLabel}>Description</label>
                                <p style={styles.modalDesc}>
                                    {task.description || "No description provided."}
                                </p>

                                <label style={styles.modalLabel}>Labels</label>
                                <div style={styles.modalLabelList}>
                                    {task.labels?.map((label, idx) => (
                                        <div key={idx} style={styles.modalTag}>
                                            {getLabelIcon(label)}
                                            <span>{label}</span>
                                        </div>
                                    ))}
                                </div>

                                {task.assignedTo && (
                                    <div style={styles.modalAssignee}>
                                        <label style={styles.modalLabel}>Assignee</label>
                                        <div style={styles.assigneeProfile}>
                                            {task.assignedTo.photoURL ? (
                                                <img src={task.assignedTo.photoURL} alt={task.assignedTo.displayName} style={styles.assigneeAvatarLarge} />
                                            ) : (
                                                <div style={styles.assigneeInitialLarge}>
                                                    {task.assignedTo.displayName?.charAt(0)}
                                                </div>
                                            )}
                                            <div style={styles.assigneeDetails}>
                                                <p style={styles.assigneeName}>{task.assignedTo.displayName}</p>
                                                <p style={styles.assigneeRole}>Group Member</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div style={styles.modalMeta}>
                                    <div style={styles.metaItem}>
                                        <Clock size={14} />
                                        <span>Planned: {task.datePlanned || 'Not scheduled'}</span>
                                    </div>
                                    {isOverspill && (
                                        <div style={{ ...styles.metaItem, color: 'var(--danger)' }}>
                                            <AlertCircle size={14} />
                                            <span>Overspilled Task</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={toggleComplete}
                                style={{
                                    ...styles.modalAction,
                                    background: isCompleted ? 'var(--glass)' : 'var(--primary)'
                                }}
                            >
                                {isCompleted ? 'Mark as In-Progress' : 'Mark as Completed'}
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}

const styles = {
    card: {
        padding: '1.2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.8rem',
        minWidth: '300px',
        transition: 'all 0.2s ease',
        position: 'relative',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    priorityBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.3rem 0.6rem',
        borderRadius: '20px',
        fontSize: '0.7rem',
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    completeBtn: {
        padding: '4px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: '1.2rem',
        fontWeight: '700',
        color: 'var(--text-main)',
        marginBottom: '0.4rem',
    },
    desc: {
        fontSize: '0.9rem',
        color: 'var(--text-muted)',
        lineHeight: '1.4',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
    },
    footer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '0.5rem',
        paddingTop: '0.8rem',
        borderTop: '1px solid var(--glass-border)',
    },
    labelContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        flexWrap: 'wrap',
    },
    metaLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.3rem',
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        background: 'rgba(255,255,255,0.05)',
        padding: '0.2rem 0.6rem',
        borderRadius: '12px',
    },
    moreLabels: {
        fontSize: '0.7rem',
        color: 'var(--primary)',
        fontWeight: '700',
    },
    overlay: {
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '1.5rem',
    },
    modal: {
        width: '100%',
        maxWidth: '500px',
        padding: '2rem',
        borderRadius: 'var(--radius-lg)',
        maxHeight: '80vh',
        overflowY: 'auto',
    },
    modalHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        color: 'var(--text-muted)',
        cursor: 'pointer',
    },
    modalTitle: {
        fontSize: '1.8rem',
        fontWeight: '800',
        color: 'var(--text-main)',
        marginBottom: '1.5rem',
        lineHeight: '1.2',
    },
    modalBody: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    },
    modalLabel: {
        fontSize: '0.75rem',
        fontWeight: '800',
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
    },
    modalDesc: {
        fontSize: '1.05rem',
        lineHeight: '1.6',
        color: 'var(--text-main)',
    },
    modalLabelList: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.6rem',
    },
    modalTag: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.4rem 0.8rem',
        borderRadius: '20px',
        border: '1px solid var(--glass-border)',
        fontSize: '0.85rem',
        color: 'var(--text-main)',
    },
    modalMeta: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.8rem',
        padding: '1.2rem',
        background: 'rgba(0,0,0,0.1)',
        borderRadius: 'var(--radius-md)',
    },
    metaItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        fontSize: '0.9rem',
        color: 'var(--text-muted)',
    },
    modalAction: {
        width: '100%',
        padding: '1.2rem',
        marginTop: '2rem',
        borderRadius: 'var(--radius-md)',
        color: 'white',
        fontSize: '1rem',
        fontWeight: '700',
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 8px 16px -4px rgba(0,0,0,0.3)',
    },
    assigneeMini: {
        display: 'flex',
        alignItems: 'center',
    },
    assigneeAvatarMini: {
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        border: '1px solid var(--glass-border)',
    },
    assigneeInitialMini: {
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        background: 'var(--primary)',
        color: 'white',
        fontSize: '0.6rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
    },
    modalAssignee: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.8rem',
    },
    assigneeProfile: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1rem',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 'var(--radius-md)',
    },
    assigneeAvatarLarge: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
    },
    assigneeInitialLarge: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: 'var(--primary)',
        color: 'white',
        fontSize: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
    },
    assigneeDetails: {
        display: 'flex',
        flexDirection: 'column',
    },
    assigneeName: {
        fontSize: '1rem',
        fontWeight: '700',
        color: 'var(--text-main)',
    },
    assigneeRole: {
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
    }
};
