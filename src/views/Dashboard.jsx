import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTasks } from '../contexts/TaskContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, LayoutGrid, ListTodo, AlertTriangle, LogOut, ExternalLink, Users, Copy, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TaskCard from '../components/TaskCard';
import TaskCreator from '../components/TaskCreator';
import { runDailyAutomation } from '../utils/taskAutomation';
import { useEffect } from 'react';

export default function Dashboard() {
    const { logout, userData, currentUser } = useAuth();
    const { tasks, updateTask } = useTasks();
    const navigate = useNavigate();

    useEffect(() => {
        if (userData?.groupId && currentUser?.uid) {
            runDailyAutomation(currentUser.uid, userData.groupId);
        }
    }, [userData?.groupId, currentUser?.uid]);
    const [isCreatorOpen, setIsCreatorOpen] = useState(false);
    const [showGroupInfo, setShowGroupInfo] = useState(false);
    const [copied, setCopied] = useState(false);

    const todayStr = new Date().toISOString().split('T')[0];

    const todayTasks = tasks.filter(t =>
        (t.status === 'in-progress' || t.status === 'completed') &&
        t.datePlanned === todayStr
    );
    const overspillTasks = tasks.filter(t => t.status === 'overspill');
    const backlogTasks = tasks.filter(t => t.status === 'backlog');

    const copyGroupId = () => {
        navigator.clipboard.writeText(userData.groupId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <div style={styles.headerTop}>
                    <div style={styles.brand}>
                        <h1 style={styles.logo}>Tasker</h1>
                        <p style={styles.userName}>Hey, {userData?.displayName?.split(' ')[0]} 👋</p>
                    </div>
                    <div style={styles.headerActions}>
                        <button
                            onClick={() => setShowGroupInfo(!showGroupInfo)}
                            className="glass"
                            style={styles.headerBtn}
                        >
                            <Users size={20} />
                        </button>
                        <button onClick={logout} style={styles.headerBtn} className="glass">
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {showGroupInfo && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="glass"
                            style={styles.groupCard}
                        >
                            <div style={styles.groupInfoTitle}>
                                <Users size={16} color="var(--primary)" />
                                <span>Group Management</span>
                            </div>
                            <div style={styles.groupCopyBox}>
                                <code>{userData?.groupId}</code>
                                <button onClick={copyGroupId} style={styles.copyBtn}>
                                    {copied ? <Check size={16} color="var(--success)" /> : <Copy size={16} />}
                                </button>
                            </div>
                            <p style={styles.groupHint}>Share this ID to invite partners</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            <main style={styles.main}>
                {/* Huge Overspill Warning */}
                <AnimatePresence>
                    {overspillTasks.length > 0 && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            style={styles.overspillBanner}
                        >
                            <div style={styles.warningContent}>
                                <AlertTriangle size={32} />
                                <div>
                                    <h3>OVERSPILLED TASKS DETECTED</h3>
                                    <p>You have {overspillTasks.length} tasks that weren't completed yesterday. Address them now!</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <section style={styles.section}>
                    <div style={styles.sectionHeader}>
                        <div style={styles.sectionTitle}>
                            <LayoutGrid size={20} color="var(--primary)" />
                            <h2>Today's Focus</h2>
                        </div>
                        <span style={styles.countBadge}>
                            {todayTasks.filter(t => t.status === 'completed').length}/{todayTasks.length}
                        </span>
                    </div>

                    <div style={styles.grid}>
                        {todayTasks.length > 0 ? (
                            todayTasks.map(task => (
                                <TaskCard key={task.id} task={task} onUpdate={updateTask} />
                            ))
                        ) : (
                            <div className="glass" style={styles.emptyState}>
                                <p>No tasks planned for today yet.</p>
                            </div>
                        )}
                    </div>
                </section>

                {overspillTasks.length > 0 && (
                    <section style={styles.section}>
                        <div style={styles.sectionHeader}>
                            <div style={styles.sectionTitle}>
                                <AlertTriangle size={20} color="var(--danger)" />
                                <h2 style={{ color: 'var(--danger)' }}>Overspill</h2>
                            </div>
                        </div>
                        <div style={styles.grid}>
                            {overspillTasks.map(task => (
                                <TaskCard key={task.id} task={task} onUpdate={updateTask} />
                            ))}
                        </div>
                    </section>
                )}

                <section style={styles.section}>
                    <div style={styles.sectionHeader}>
                        <div style={styles.sectionTitle}>
                            <ListTodo size={20} color="var(--secondary)" />
                            <h2>Backlog</h2>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <button
                                onClick={() => navigate('/all-tasks')}
                                style={styles.viewAllBtn}
                            >
                                View All
                            </button>
                            <span style={styles.countBadge}>{backlogTasks.length}</span>
                        </div>
                    </div>
                    <div style={styles.grid}>
                        {backlogTasks.map(task => (
                            <TaskCard key={task.id} task={task} onUpdate={updateTask} />
                        ))}
                        {backlogTasks.length === 0 && (
                            <div className="glass" style={styles.emptyState}>
                                <p>Backlog is empty. Add some tasks!</p>
                            </div>
                        )}
                    </div>
                </section>
            </main>

            <button
                style={styles.fab}
                onClick={() => setIsCreatorOpen(true)}
                className="animate-fade-in"
            >
                <Plus size={32} />
            </button>

            <TaskCreator
                isOpen={isCreatorOpen}
                onClose={() => setIsCreatorOpen(false)}
            />
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        padding: 'var(--spacing-lg)',
        maxWidth: '1200px',
        margin: '0 auto',
        paddingBottom: '100px',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '3rem',
    },
    logo: {
        fontSize: '1.5rem',
        fontWeight: '800',
        letterSpacing: '-0.02em',
        color: 'var(--primary)',
    },
    userName: {
        fontSize: '2rem',
        fontWeight: '700',
        marginTop: '0.5rem',
    },
    headerActions: {
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
    },
    groupBadge: {
        padding: '0.6rem 1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
    },
    dot: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: 'var(--success)',
        boxShadow: '0 0 10px var(--success)',
    },
    logoutBtn: {
        padding: '0.6rem',
        color: 'var(--text-muted)',
        borderRadius: 'var(--radius-md)',
        background: 'var(--glass)',
        border: '1px solid var(--glass-border)',
    },
    main: {
        display: 'flex',
        flexDirection: 'column',
        gap: '3rem',
    },
    overspillBanner: {
        background: 'linear-gradient(45deg, var(--danger), #ff4d4d)',
        borderRadius: 'var(--radius-md)',
        padding: '1.5rem',
        color: 'white',
        boxShadow: '0 10px 40px -10px hsla(0, 85%, 60%, 0.5)',
        overflow: 'hidden',
    },
    warningContent: {
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
    },
    section: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    },
    sectionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sectionTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.8rem',
    },
    countBadge: {
        background: 'var(--glass)',
        padding: '0.2rem 0.6rem',
        borderRadius: '10px',
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
        border: '1px solid var(--glass-border)',
    },
    viewAllBtn: {
        fontSize: '0.8rem',
        color: 'var(--primary)',
        fontWeight: '600',
        background: 'var(--glass)',
        padding: '0.3rem 0.8rem',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--glass-border)',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1.5rem',
    },
    emptyState: {
        gridColumn: '1 / -1',
        padding: '3rem',
        textAlign: 'center',
        color: 'var(--text-muted)',
        borderStyle: 'dashed',
    },
    fab: {
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        background: 'var(--primary)',
        color: 'white',
        boxShadow: '0 10px 30px -10px var(--primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        transition: 'transform 0.2s',
    },
    '@media (max-width: 768px)': {
        container: {
            padding: 'var(--spacing-md)',
        },
        header: {
            flexDirection: 'column',
            gap: '1rem',
        },
        grid: {
            gridTemplateColumns: '1fr',
        }
    }
};
