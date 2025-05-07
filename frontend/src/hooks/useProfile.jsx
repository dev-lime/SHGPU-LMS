import { useState, useEffect, useCallback } from 'react';
import { auth, db } from '@src/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import {
    School as StudentIcon,
    SupervisorAccount as TeacherIcon,
    AdminPanelSettings as AdminIcon,
    SupportAgent as SupportIcon
} from '@mui/icons-material';

export const ACCOUNT_TYPES = {
    student: {
        value: 'student',
        label: 'Студент',
        icon: <StudentIcon color="primary" />
    },
    teacher: {
        value: 'teacher',
        label: 'Преподаватель',
        icon: <TeacherIcon color="primary" />
    },
    admin: {
        value: 'admin',
        label: 'Администратор',
        icon: <AdminIcon color="primary" />
    },
    support: {
        value: 'support',
        label: 'Техподдержка',
        icon: <SupportIcon color="primary" />
    }
};

const useProfile = (userId = null) => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Получение данных пользователя
    const fetchUserData = useCallback(async (uid) => {
        try {
            setLoading(true);
            setError(null);

            const docRef = doc(db, 'users', uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                const userProfile = {
                    id: docSnap.id,
                    ...data,
                    email: data.email || (uid === auth.currentUser?.uid ? auth.currentUser.email : ''),
                    avatarUrl: data.avatarUrl || (uid === auth.currentUser?.uid ? auth.currentUser.photoURL : '')
                };
                setUserData(userProfile);
            } else {
                setError("Профиль не найден");
            }
        } catch (err) {
            console.error("Ошибка загрузки данных:", err);
            setError("Не удалось загрузить данные профиля");
        } finally {
            setLoading(false);
        }
    }, []);

    // Обновление профиля (только для текущего пользователя)
    const updateUserData = useCallback(async (updatedData) => {
        try {
            if (!auth.currentUser) {
                throw new Error("Пользователь не авторизован");
            }

            setLoading(true);
            setError(null);

            // Форматируем данные перед сохранением
            const dataToSave = {
                ...updatedData,
                updatedAt: new Date()
            };

            // Обновляем в Firestore
            await updateDoc(doc(db, 'users', auth.currentUser.uid), dataToSave);

            // Обновляем данные аутентификации, если нужно
            if (updatedData.fullName || updatedData.avatarUrl) {
                await updateProfile(auth.currentUser, {
                    displayName: updatedData.fullName,
                    photoURL: updatedData.avatarUrl
                });
            }

            // Обновляем локальное состояние
            setUserData(prev => ({
                ...prev,
                ...dataToSave,
                avatarUrl: updatedData.avatarUrl || prev.avatarUrl
            }));
        } catch (err) {
            console.error("Ошибка сохранения:", err);
            setError("Не удалось сохранить изменения");
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Выход из системы
    const handleLogout = useCallback(async () => {
        try {
            await auth.signOut();
            setUserData(null);
        } catch (err) {
            console.error("Ошибка выхода:", err);
            setError("Не удалось выйти из аккаунта");
        }
    }, []);

    // Получение иконки для типа аккаунта
    const getAccountTypeIcon = useCallback((type) => {
        return ACCOUNT_TYPES[type]?.icon || <Person color="primary" />;
    }, []);

    // Получение названия для типа аккаунта
    const getAccountTypeLabel = useCallback((type) => {
        return ACCOUNT_TYPES[type]?.label || type;
    }, []);

    // Загрузка данных при изменении userId или аутентификации
    useEffect(() => {
        const loadData = async () => {
            const targetUserId = userId || auth.currentUser?.uid;
            if (targetUserId) {
                await fetchUserData(targetUserId);
            } else {
                setUserData(null);
                setLoading(false);
            }
        };

        const unsubscribe = auth.onAuthStateChanged(() => {
            loadData();
        });

        return unsubscribe;
    }, [userId, fetchUserData]);

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
