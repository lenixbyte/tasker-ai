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
import { useNavigate } from 'react-router-dom';
import { Users, Plus, UserCheck, ArrowLeft } from 'lucide-react';

export default function GroupSetup() {
    const { currentUser, userData, setUserData, switchGroup } = useAuth();
    const navigate = useNavigate();
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
                groupId: groupRef.id,
                joinedGroups: arrayUnion(groupRef.id)
            });

            setUserData(prev => ({
                ...prev,
                groupId: groupRef.id,
                joinedGroups: [...(prev.joinedGroups || []), groupRef.id]
            }));
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
                    groupId: groupId,
                    joinedGroups: arrayUnion(groupId)
                });

                setUserData(prev => ({
                    ...prev,
                    groupId: groupId,
                    joinedGroups: prev.joinedGroups?.includes(groupId)
                        ? prev.joinedGroups
                        : [...(prev.joinedGroups || []), groupId]
                }));
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
                {userData?.groupId && (
                    <button
                        onClick={() => navigate('/')}
                        style={styles.backBtn}
                    >
                        <ArrowLeft size={16} />
                        <span>Back</span>
                    </button>
                )}
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

                {userData?.joinedGroups?.length > 0 && (
                    <div style={styles.joinedGroupsSection}>
                        <div style={styles.divider}>
                            <span style={styles.dividerLine}></span>
                            <span style={styles.dividerText}>YOUR GROUPS</span>
                            <span style={styles.dividerLine}></span>
                        </div>
                        <div style={styles.groupList}>
                            {userData.joinedGroups.map(gid => (
                                <div
                                    key={gid}
                                    style={{
                                        ...styles.groupItem,
                                        borderColor: gid === userData.groupId ? 'var(--primary)' : 'var(--glass-border)',
                                        background: gid === userData.groupId ? 'rgba(59, 130, 246, 0.05)' : 'rgba(255, 255, 255, 0.02)'
                                    }}
                                    onClick={() => switchGroup(gid)}
                                >
                                    <div style={styles.groupItemInfo}>
                                        <Users size={16} color={gid === userData.groupId ? 'var(--primary)' : 'var(--text-muted)'} />
                                        <span style={{ color: gid === userData.groupId ? 'var(--text-main)' : 'var(--text-muted)' }}>
                                            {gid.substring(0, 12)}...
                                        </span>
                                    </div>
                                    {gid === userData.groupId && <div style={styles.activeIndicator} />}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

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
        position: 'relative',
    },
    backBtn: {
        position: 'absolute',
        top: '1rem',
        left: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
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
    },
    joinedGroupsSection: {
        marginTop: '2rem',
        width: '100%',
        textAlign: 'left',
    },
    groupList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.8rem',
        marginTop: '1rem',
    },
    groupItem: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    },
    groupItemInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.8rem',
    },
    activeIndicator: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: 'var(--primary)',
        boxShadow: '0 0 10px var(--primary)',
    }
};
