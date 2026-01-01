import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    onAuthStateChanged,
    signInWithPopup,
    signOut
} from 'firebase/auth';
import { auth, db, googleProvider } from '../services/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    async function loginWithGoogle() {
        const res = await signInWithPopup(auth, googleProvider);
        const user = res.user;

        // Check if user exists, if not, create doc
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            const initialData = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                groupId: null,
                joinedGroups: [], // Track all joined groups
                lastLoginDate: null,
                createdAt: new Date()
            };
            await setDoc(docRef, initialData);
            setUserData(initialData);
        } else {
            const data = docSnap.data();
            // Migrate old users if they don't have joinedGroups
            if (!data.joinedGroups) {
                const updatedData = {
                    ...data,
                    joinedGroups: data.groupId ? [data.groupId] : []
                };
                await updateDoc(docRef, updatedData);
                setUserData(updatedData);
            } else {
                setUserData(data);
            }
        }

        return res;
    }

    async function switchGroup(groupId) {
        if (!currentUser || !userData?.joinedGroups.includes(groupId)) return;

        const docRef = doc(db, 'users', currentUser.uid);
        await updateDoc(docRef, { groupId });
        setUserData(prev => ({ ...prev, groupId }));
    }

    function logout() {
        return signOut(auth);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                const docRef = doc(db, 'users', user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    // Migrate old users if they don't have joinedGroups
                    if (!data.joinedGroups) {
                        const updatedData = {
                            ...data,
                            joinedGroups: data.groupId ? [data.groupId] : []
                        };
                        // Note: Not strictly necessary to update immediately here if login handles it,
                        // but good for consistency.
                        setUserData(updatedData);
                    } else {
                        setUserData(data);
                    }
                }
            } else {
                setUserData(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        userData,
        setUserData,
        loginWithGoogle,
        switchGroup,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
