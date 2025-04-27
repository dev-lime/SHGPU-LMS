import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import {
    School as StudentIcon,
    SupervisorAccount as TeacherIcon,
    AdminPanelSettings as AdminIcon,
    SupportAgent as SupportIcon,
    Person as DefaultIcon
} from '@mui/icons-material';

export const ROLE_ICONS = {
    student: StudentIcon,
    teacher: TeacherIcon,
    admin: AdminIcon,
    support: SupportIcon,
    default: DefaultIcon
};

export const ROLE_LABELS = {
    student: 'Студент',
    teacher: 'Преподаватель',
    admin: 'Администратор',
    support: 'Техподдержка',
    default: 'Пользователь'
};

const useProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Функция для получения иконки роли
    const getRoleIcon = (role) => {
        const IconComponent = ROLE_ICONS[role] || ROLE_ICONS.default;
        return <IconComponent color="primary" fontSize="small" />;
    };

    // Функция для получения текста роли
    const getRoleLabel = (role) => {
        return ROLE_LABELS[role] || ROLE_LABELS.default;
    };

    // Загрузка профиля из localStorage или Firebase
    const loadProfile = async () => {
        try {
            setLoading(true);

            const localProfile = localStorage.getItem('userProfile');

            if (localProfile) {
                setProfile(JSON.parse(localProfile));
            }

            if (auth.currentUser) {
                const docRef = doc(db, 'users', auth.currentUser.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const serverProfile = docSnap.data();
                    setProfile(serverProfile);
                    localStorage.setItem('userProfile', JSON.stringify(serverProfile));
                }
            }
        } catch (err) {
            console.error("Ошибка загрузки профиля:", err);
            setError("Не удалось загрузить профиль");
        } finally {
            setLoading(false);
        }
    };

    // Обновление профиля
    const updateProfileData = async (updatedData) => {
        try {
            setLoading(true);

            if (auth.currentUser) {
                // Обновляем в Firebase
                await updateDoc(doc(db, 'users', auth.currentUser.uid), updatedData);

                // Обновляем данные аутентификации, если нужно
                if (updatedData.fullName || updatedData.avatarUrl) {
                    await updateProfile(auth.currentUser, {
                        displayName: updatedData.fullName,
                        photoURL: updatedData.avatarUrl
                    });
                }

                // Обновляем локальные данные
                const newProfile = { ...profile, ...updatedData };
                setProfile(newProfile);
                localStorage.setItem('userProfile', JSON.stringify(newProfile));
            }
        } catch (err) {
            console.error("Ошибка обновления профиля:", err);
            setError("Не удалось обновить профиль");
        } finally {
            setLoading(false);
        }
    };

    // Очистка профиля при выходе
    const clearProfile = () => {
        localStorage.removeItem('userProfile');
        setProfile(null);
    };

    useEffect(() => {
        loadProfile();

        // Подписка на изменения аутентификации
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                loadProfile();
            } else {
                clearProfile();
            }
        });

        return unsubscribe;
    }, []);

    return {
        profile,
        loading,
        error,
        updateProfileData,
        clearProfile,
        getRoleIcon,
        getRoleLabel
    };
};

export default useProfile;
