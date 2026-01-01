import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../services/firebase';
import {
    collection,
    query,
    where,
    onSnapshot,
    addDoc,
    updateDoc,
    doc,
    deleteDoc,
    orderBy,
    writeBatch,
    getDocs,
    getDoc
} from 'firebase/firestore';
import { useAuth } from './AuthContext';

const TaskContext = createContext();

export function useTasks() {
    return useContext(TaskContext);
}

export function TaskProvider({ children }) {
    const { userData } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userData?.groupId) {
            setTasks([]);
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, 'tasks'),
            where('groupId', '==', userData.groupId),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const tasksData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setTasks(tasksData);
            setLoading(false);
        });

        return unsubscribe;
    }, [userData?.groupId]);

    async function createTask(taskData) {
        if (!userData?.groupId) return;
        return addDoc(collection(db, 'tasks'), {
            ...taskData,
            groupId: userData.groupId,
            createdBy: userData.uid,
            status: taskData.status || 'backlog',
            assignedTo: taskData.assignedTo || null, // Can be null or { uid, displayName, photoURL }
            createdAt: new Date()
        });
    }

    async function fetchGroupMembers(groupId) {
        if (!groupId) return [];
        try {
            const groupRef = doc(db, 'groups', groupId);
            const groupSnap = await getDoc(groupRef);

            if (!groupSnap.exists()) return [];

            const memberIds = groupSnap.data().members || [];
            if (memberIds.length === 0) return [];

            // Fetch profiles for all members
            const membersData = await Promise.all(
                memberIds.map(async (uid) => {
                    const userSnap = await getDoc(doc(db, 'users', uid));
                    return userSnap.exists() ? userSnap.data() : { uid, displayName: 'Unknown User' };
                })
            );

            return membersData;
        } catch (err) {
            console.error("Error fetching group members:", err);
            return [];
        }
    }

    async function updateTask(taskId, updates) {
        return updateDoc(doc(db, 'tasks', taskId), updates);
    }

    async function bulkCreateTasks(tasksJson) {
        if (!userData?.groupId) return;
        const batch = writeBatch(db);

        tasksJson.forEach(task => {
            const docRef = doc(collection(db, 'tasks'));
            batch.set(docRef, {
                ...task,
                groupId: userData.groupId,
                createdBy: userData.uid,
                status: task.status || 'backlog',
                priority: task.priority !== undefined ? parseInt(task.priority) : 1,
                assignedTo: task.assignedTo || null,
                createdAt: new Date()
            });
        });

        return batch.commit();
    }

    async function deleteTask(taskId) {
        return deleteDoc(doc(db, 'tasks', taskId));
    }

    const value = {
        tasks,
        loading,
        createTask,
        updateTask,
        bulkCreateTasks,
        deleteTask,
        fetchGroupMembers
    };

    return (
        <TaskContext.Provider value={value}>
            {children}
        </TaskContext.Provider>
    );
}
