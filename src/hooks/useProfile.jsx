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

const useProfile = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Получение данных пользователя
    const fetchUserData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            if (auth.currentUser) {
                const docRef = doc(db, 'users', auth.currentUser.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setUserData({
                        ...data,
                        // Добавляем email из auth, если его нет в профиле
                        email: data.email || auth.currentUser.email,
                        // Добавляем photoURL из auth, если его нет в профиле
                        avatarUrl: data.avatarUrl || auth.currentUser.photoURL || ''
                    });
                } else {
                    setError("Профиль не найден");
                }
            }
        } catch (err) {
            console.error("Ошибка загрузки данных:", err);
            setError("Не удалось загрузить данные профиля");
        } finally {
            setLoading(false);
        }
    }, []);

    // Обновление профиля
    const updateUserData = useCallback(async (updatedData) => {
        try {
            setLoading(true);
            setError(null);

            if (auth.currentUser) {
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
            }
        } catch (err) {
            console.error("Ошибка сохранения:", err);
            setError("Не удалось сохранить изменения");
            throw err; // Пробрасываем ошибку для обработки в компоненте
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
        return ACCOUNT_TYPES[type]?.icon || ACCOUNT_TYPES.default.icon;
    }, []);

    // Получение названия для типа аккаунта
    const getAccountTypeLabel = useCallback((type) => {
        return ACCOUNT_TYPES[type]?.label || ACCOUNT_TYPES.default.label;
    }, []);
    // Подписка на изменения аутентификации
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                fetchUserData();
            } else {
                setUserData(null);
            }
        });

        return unsubscribe;
    }, [fetchUserData]);

    return {
        userData,
        loading,
        error,
        updateUserData,
        handleLogout,
        getAccountTypeIcon,
        getAccountTypeLabel,
        ACCOUNT_TYPES
    };
};

export default useProfile;
