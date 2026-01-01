import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTasks } from '../contexts/TaskContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, LayoutGrid, ListTodo, AlertTriangle, LogOut, ExternalLink, Users, Copy, Check, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TaskCard from '../components/TaskCard';
import TaskCreator from '../components/TaskCreator';
import { runDailyAutomation } from '../utils/taskAutomation';
import { useEffect } from 'react';

export default function Dashboard() {
    const { logout, userData, currentUser, switchGroup } = useAuth();
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
                    <h1 style={styles.logo}>Tasker</h1>
                    <div style={styles.headerActions}>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <button
                                onClick={() => setShowGroupInfo(!showGroupInfo)}
                                className="glass"
                                style={styles.headerBtn}
                            >
                                <Users size={20} />
                            </button>

                            <AnimatePresence>
                                {showGroupInfo && (
                                    <>
                                        {/* Invisible backdrop to close on click outside */}
                                        <div
                                            style={{ position: 'fixed', inset: 0, zIndex: 90 }}
                                            onClick={() => setShowGroupInfo(false)}
                                        />
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                            className="glass"
                                            style={styles.groupCard}
                                        >
                                            <div style={styles.groupInfoTitle}>
                                                <Users size={16} color="var(--primary)" />
                                                <span>Group Management</span>
                                            </div>

                                            <div style={{ marginBottom: '0.4rem' }}>
                                                <p style={styles.groupHint}>Switch Active Group</p>
                                                <select
                                                    style={styles.groupSwitcher}
                                                    value={userData?.groupId || ''}
                                                    onChange={(e) => switchGroup(e.target.value)}
                                                >
                                                    {userData?.joinedGroups?.map(gid => (
                                                        <option key={gid} value={gid}>
                                                            {gid.substring(0, 12)}...
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div style={styles.groupCopyBox}>
                                                <code>{userData?.groupId}</code>
                                                <button onClick={copyGroupId} style={styles.copyBtn}>
                                                    {copied ? <Check size={16} color="var(--success)" /> : <Copy size={16} />}
                                                </button>
                                            </div>
                                            <p style={styles.groupHint}>Share this ID to invite partners</p>
                                            <button
                                                onClick={() => {
                                                    setShowGroupInfo(false);
                                                    navigate('/groups');
                                                }}
                                                style={styles.manageGroupsBtn}
                                                className="glass"
                                            >
                                                <Plus size={14} />
                                                <span>Join or Create Another Group</span>
                                            </button>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                        <button onClick={logout} style={styles.headerBtn} className="glass">
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>

                <div style={styles.headerMain}>
                    <div style={styles.greetingSection}>
                        <motion.h2
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                            style={styles.greetingLight}
                        >
                            Hey,
                        </motion.h2>
                        <motion.h2
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            style={styles.greetingBold}
                        >
                            {userData?.displayName?.split(' ')[0]} 👋
                        </motion.h2>
                    </div>
                </div>
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
        marginBottom: '3rem',
    },
    headerTop: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        gap: '1.5rem',
    },
    logo: {
        fontSize: '1.5rem',
        fontWeight: '800',
        letterSpacing: '-0.02em',
        color: 'var(--primary)',
    },
    brand: {
        display: 'flex',
        flexDirection: 'column',
    },
    headerMain: {
        marginTop: '2.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        width: '100%',
    },
    greetingSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.2rem',
    },
    greetingLight: {
        fontSize: '2.5rem',
        fontWeight: '300',
        color: 'var(--text-muted)',
        lineHeight: '1.1',
    },
    greetingBold: {
        fontSize: '3.5rem',
        fontWeight: '800',
        color: 'var(--text-main)',
        lineHeight: '1.1',
        letterSpacing: '-0.03em',
    },
    headerActions: {
        display: 'flex',
        gap: '0.8rem',
        alignItems: 'center',
    },
    headerBtn: {
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--radius-md)',
        color: 'var(--text-main)',
        border: '1px solid var(--glass-border)',
        cursor: 'pointer',
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
    groupCard: {
        position: 'absolute',
        top: 'calc(100% + 12px)',
        right: 0,
        zIndex: 100,
        padding: '1.2rem',
        width: '280px',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.8rem',
        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)',
        transformOrigin: 'top right',
    },
    groupInfoTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        fontSize: '0.8rem',
        fontWeight: '700',
        color: 'var(--text-main)',
        marginBottom: '0.2rem',
    },
    groupCopyBox: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(255, 255, 255, 0.05)',
        padding: '0.6rem 0.8rem',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--glass-border)',
    },
    copyBtn: {
        color: 'var(--text-muted)',
        display: 'flex',
        alignItems: 'center',
    },
    groupHint: {
        fontSize: '0.7rem',
        color: 'var(--text-muted)',
    },
    manageGroupsBtn: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.4rem',
        padding: '0.6rem',
        borderRadius: 'var(--radius-sm)',
        fontSize: '0.75rem',
        fontWeight: '600',
        color: 'var(--primary)',
        marginTop: '0.4rem',
        border: '1px solid var(--glass-border)',
        cursor: 'pointer',
    },
    groupSwitcherContainer: {
        display: 'flex',
        alignItems: 'center',
        marginRight: '1rem',
    },
    groupSwitcher: {
        width: '100%',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid var(--glass-border)',
        color: 'var(--text-main)',
        padding: '0.8rem 1rem',
        borderRadius: 'var(--radius-sm)',
        fontSize: '0.9rem',
        fontWeight: '500',
        outline: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        marginTop: '0.4rem',
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
            marginBottom: '2rem',
        },
        headerTop: {
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '1.5rem',
        },
        headerActions: {
            width: '100%',
            justifyContent: 'space-between',
        },
        userName: {
            fontSize: '1.5rem',
        },
        headerMain: {
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '2rem',
        },
        greetingLight: {
            fontSize: '1.8rem',
        },
        greetingBold: {
            fontSize: '2.5rem',
        },
        grid: {
            gridTemplateColumns: '1fr',
        }
    }
};
