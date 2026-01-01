import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/firebase';
import {
    collection,
    addDoc,
    updateDoc,
    doc,
    getDoc,
    arrayUnion
} from 'firebase/firestore';
import { motion } from 'framer-motion';
import { Users, Plus, UserCheck } from 'lucide-react';

export default function GroupSetup() {
    const { currentUser, setUserData } = useAuth();
    const [groupId, setGroupId] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function createGroup() {
        setLoading(true);
        try {
            const groupRef = await addDoc(collection(db, 'groups'), {
                members: [currentUser.uid],
                createdAt: new Date()
            });

            await updateDoc(doc(db, 'users', currentUser.uid), {
                groupId: groupRef.id
            });

            setUserData(prev => ({ ...prev, groupId: groupRef.id }));
        } catch (err) {
            setError('Failed to create group: ' + err.message);
        } finally {
            setLoading(false);
        }
    }

    async function joinGroup(e) {
        e.preventDefault();
        if (!groupId) return;
        setLoading(true);
        try {
            const groupRef = doc(db, 'groups', groupId);
            const groupSnap = await getDoc(groupRef);

            if (groupSnap.exists()) {
                await updateDoc(groupRef, {
                    members: arrayUnion(currentUser.uid)
                });

                await updateDoc(doc(db, 'users', currentUser.uid), {
                    groupId: groupId
                });

                setUserData(prev => ({ ...prev, groupId: groupId }));
            } else {
                setError('Group not found');
            }
        } catch (err) {
            setError('Failed to join group: ' + err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={styles.container}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass"
                style={styles.card}
            >
                <Users size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                <h1>Group Setup</h1>
                <p style={styles.subtitle}>Tasks are shared within a group. Start by creating or joining one.</p>

                <div style={styles.actions}>
                    <button onClick={createGroup} disabled={loading} style={styles.button}>
                        <Plus size={20} />
                        <span>Create New Group</span>
                    </button>

                    <div style={styles.divider}>
                        <span style={styles.dividerLine}></span>
                        <span style={styles.dividerText}>OR</span>
                        <span style={styles.dividerLine}></span>
                    </div>

                    <form onSubmit={joinGroup} style={styles.joinForm}>
                        <input
                            type="text"
                            placeholder="Enter Group ID"
                            style={styles.input}
                            value={groupId}
                            onChange={e => setGroupId(e.target.value)}
                        />
                        <button type="submit" disabled={loading} style={{ ...styles.button, background: 'var(--secondary)' }}>
                            <UserCheck size={20} />
                            <span>Join Group</span>
                        </button>
                    </form>
                </div>

                {error && <p style={styles.error}>{error}</p>}
            </motion.div>
        </div>
    );
}

const styles = {
    container: {
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--spacing-md)',
    },
    card: {
        width: '100%',
        maxWidth: '500px',
        padding: 'var(--spacing-lg)',
        textAlign: 'center',
    },
    subtitle: {
        color: 'var(--text-muted)',
        marginBottom: '2rem',
    },
    actions: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    },
    button: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        padding: '1rem',
        borderRadius: 'var(--radius-md)',
        background: 'var(--primary)',
        color: 'white',
        fontSize: '1rem',
        fontWeight: '600',
        width: '100%',
    },
    divider: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
    },
    dividerLine: {
        flex: 1,
        height: '1px',
        background: 'var(--glass-border)',
    },
    dividerText: {
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
    },
    joinForm: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
    },
    input: {
        width: '100%',
        padding: '1rem',
        borderRadius: 'var(--radius-md)',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid var(--glass-border)',
        color: 'var(--text-main)',
        textAlign: 'center',
        fontSize: '1rem',
        outline: 'none',
    },
    error: {
        color: 'var(--danger)',
        marginTop: '1rem',
        fontSize: '0.9rem',
    }
};
