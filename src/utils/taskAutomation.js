import { db } from '../services/firebase';
import {
    collection,
    query,
    where,
    getDocs,
    updateDoc,
    doc,
    orderBy,
    limit,
    writeBatch,
    getDoc
} from 'firebase/firestore';
import { analyzeTaskUrgency, smartPickTasks } from '../services/ai';

/**
 * Handles the "Morning Login" automation.
 * @param {string} userId - Current user's ID
 * @param {string} groupId - Group ID for shared tasks
 */
export async function runDailyAutomation(userId, groupId) {
    if (!groupId) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) return;

    const userData = userSnap.data();
    if (userData.lastLoginDate === todayStr) {
        return;
    }

    const batch = writeBatch(db);

    // 1. Overspill Logic with AI Urgency
    const inProgressQuery = query(
        collection(db, 'tasks'),
        where('groupId', '==', groupId),
        where('status', '==', 'in-progress'),
        where('datePlanned', '<', todayStr)
    );

    const inProgressDocs = await getDocs(inProgressQuery);
    for (const d of inProgressDocs.docs) {
        const taskData = d.data();
        const urgencyScore = await analyzeTaskUrgency({ id: d.id, ...taskData });

        batch.update(d.ref, {
            status: 'overspill',
            urgencyScore: urgencyScore
        });
    }

    // 2. Selection Logic with AI Smart Pick
    const todayTasksQuery = query(
        collection(db, 'tasks'),
        where('groupId', '==', groupId),
        where('status', '==', 'in-progress'),
        where('datePlanned', '==', todayStr)
    );

    const todayTasks = await getDocs(todayTasksQuery);

    if (todayTasks.empty) {
        const backlogQuery = query(
            collection(db, 'tasks'),
            where('groupId', '==', groupId),
            where('status', '==', 'backlog')
        );

        const backlogDocs = await getDocs(backlogQuery);
        const backlog = backlogDocs.docs.map(d => ({ id: d.id, ...d.data() }));

        if (backlog.length > 0) {
            const selectedIds = await smartPickTasks(backlog);

            backlogDocs.forEach(d => {
                if (selectedIds.includes(d.id)) {
                    batch.update(d.ref, {
                        status: 'in-progress',
                        datePlanned: todayStr
                    });
                }
            });
        }
    }

    batch.update(userRef, { lastLoginDate: todayStr });
    await batch.commit();
}
