import { useMemo, useCallback } from 'react';
import { auth, db } from '@src/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import useFirestoreDoc from './useFirestoreDoc';
import {
    School as StudentIcon,
    SupervisorAccount as TeacherIcon,
    AdminPanelSettings as AdminIcon,
    SupportAgent as SupportIcon,
    Person
} from '@mui/icons-material';

export const ACCOUNT_TYPES = {
    student: { value: 'student', label: 'Студент', icon: <StudentIcon color="primary" /> },
    teacher: { value: 'teacher', label: 'Преподаватель', icon: <TeacherIcon color="primary" /> },
    admin: { value: 'admin', label: 'Администратор', icon: <AdminIcon color="primary" /> },
    support: { value: 'support', label: 'Техподдержка', icon: <SupportIcon color="primary" /> }
};

const useProfile = (userId = null) => {
    const targetUserId = userId || auth.currentUser?.uid;
    const { data: docData, loading: docLoading, error: docError } = useFirestoreDoc('users', targetUserId);

    const userData = useMemo(() => {
        if (!docData) return null;
        return {
            ...docData,
            email: docData.email || (targetUserId === auth.currentUser?.uid ? auth.currentUser.email : ''),
            avatarUrl: docData.avatarUrl || (targetUserId === auth.currentUser?.uid ? auth.currentUser.photoURL : '')
        };
    }, [docData, targetUserId]);

    const loading = docLoading;
    const error = docError;

    const updateUserData = useCallback(async (updatedData) => {
        if (!auth.currentUser) throw new Error("Пользователь не авторизован");

        const dataToSave = { ...updatedData, updatedAt: new Date() };
        await updateDoc(doc(db, 'users', auth.currentUser.uid), dataToSave);

        if (updatedData.fullName || updatedData.avatarUrl) {
            await updateProfile(auth.currentUser, {
                displayName: updatedData.fullName,
                photoURL: updatedData.avatarUrl
            });
        }
    }, []);

    const handleLogout = useCallback(async () => {
        await auth.signOut();
    }, []);

    const getAccountTypeIcon = useCallback((type) => {
        return ACCOUNT_TYPES[type]?.icon || <Person color="primary" />;
    }, []);

    const getAccountTypeLabel = useCallback((type) => {
        return ACCOUNT_TYPES[type]?.label || type;
    }, []);

    return {
        userData,
        loading,
        error,
        updateUserData,
        handleLogout,
        getAccountTypeIcon,
        getAccountTypeLabel,
        ACCOUNT_TYPES,
        isOwnProfile: userId ? userId === auth.currentUser?.uid : true
    };
};

export default useProfile;
