import React, { useState } from 'react';
import { useTasks } from '../contexts/TaskContext';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Search, Filter, ArrowLeft, MoreVertical, CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TaskCard from '../components/TaskCard';

export default function AllTasks() {
    const { tasks, updateTask } = useTasks();
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredTasks = tasks.filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
            (t.description && t.description.toLowerCase().includes(search.toLowerCase()));
        const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <button onClick={() => navigate('/')} style={styles.backBtn}>
                    <ArrowLeft size={24} />
                </button>
                <h1 style={styles.title}>All Group Tasks</h1>
            </header>

            <div style={styles.controls} className="glass">
                <div style={styles.searchBox}>
                    <Search size={18} style={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        style={styles.searchInput}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div style={styles.filterGroup}>
                    <Filter size={18} style={styles.filterIcon} />
                    <select
                        style={styles.select}
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="in-progress">In Progress</option>
                        <option value="backlog">Backlog</option>
                        <option value="overspill">Overspill</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
            </div>

            <div style={styles.grid}>
                {filteredTasks.length > 0 ? (
                    filteredTasks.map(task => (
                        <TaskCard key={task.id} task={task} onUpdate={updateTask} />
                    ))
                ) : (
                    <div style={styles.emptyState}>
                        <p>No tasks found matching your filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    container: {
        padding: 'var(--spacing-lg)',
        maxWidth: '1200px',
        margin: '0 auto',
        minHeight: '100vh',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '2rem',
    },
    backBtn: {
        padding: '0.5rem',
        borderRadius: 'var(--radius-md)',
        background: 'var(--glass)',
        color: 'var(--text-main)',
    },
    title: {
        fontSize: '2rem',
        fontWeight: '700',
    },
    controls: {
        display: 'flex',
        gap: '1rem',
        padding: '1rem',
        marginBottom: '2rem',
        flexWrap: 'wrap',
    },
    searchBox: {
        position: 'relative',
        flex: 2,
        minWidth: '250px',
    },
    searchIcon: {
        position: 'absolute',
        left: '1rem',
        top: '50%',
        transform: 'translateY(-50%)',
        color: 'var(--text-muted)',
    },
    searchInput: {
        width: '100%',
        padding: '0.8rem 1rem 0.8rem 3rem',
        borderRadius: 'var(--radius-md)',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid var(--glass-border)',
        color: 'var(--text-main)',
        outline: 'none',
    },
    filterGroup: {
        position: 'relative',
        flex: 1,
        minWidth: '150px',
    },
    filterIcon: {
        position: 'absolute',
        left: '1rem',
        top: '50%',
        transform: 'translateY(-50%)',
        color: 'var(--text-muted)',
        pointerEvents: 'none',
    },
    select: {
        width: '100%',
        padding: '0.8rem 1rem 0.8rem 3.5rem',
        borderRadius: 'var(--radius-md)',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid var(--glass-border)',
        color: 'var(--text-main)',
        outline: 'none',
        appearance: 'none',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1.5rem',
    },
    emptyState: {
        gridColumn: '1 / -1',
        padding: '4rem',
        textAlign: 'center',
        color: 'var(--text-muted)',
        border: '1px dashed var(--glass-border)',
        borderRadius: 'var(--radius-lg)',
    }
};
