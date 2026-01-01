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
    writeBatch
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
            status: 'backlog',
            createdAt: new Date()
        });
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
        deleteTask
    };

    return (
        <TaskContext.Provider value={value}>
            {children}
        </TaskContext.Provider>
    );
}
