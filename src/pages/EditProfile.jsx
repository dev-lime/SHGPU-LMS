import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Avatar,
    IconButton,
    CircularProgress
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db, storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function EditProfile() {
    const navigate = useNavigate();
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [studentGroup, setStudentGroup] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            if (auth.currentUser) {
                const docRef = doc(db, 'users', auth.currentUser.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setFullName(data.fullName || '');
                    setPhone(data.phone || '');
                    setStudentGroup(data.studentGroup || '');
                    setAvatarUrl(data.avatarUrl || auth.currentUser.photoURL || '');
                }
            }
        };

        fetchUserData();
    }, []);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const storageRef = ref(storage, `avatars/${auth.currentUser.uid}`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            setAvatarUrl(url);
        } catch (error) {
            console.error('Error uploading file:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Обновляем данные в Firestore
            await updateDoc(doc(db, 'users', auth.currentUser.uid), {
                fullName,
                phone,
                studentGroup,
                avatarUrl,
                updatedAt: new Date()
            });

            // Обновляем данные в Auth
            await updateProfile(auth.currentUser, {
                displayName: fullName,
                photoURL: avatarUrl
            });

            navigate('/profile');
        } catch (error) {
            console.error('Error updating profile:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <IconButton onClick={() => navigate(-1)}>
                    <ArrowBack />
                </IconButton>
                <Typography variant="h6" sx={{ ml: 1 }}>Редактировать профиль</Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                <Avatar
                    src={avatarUrl}
                    sx={{
                        width: 120,
                        height: 120,
                        mb: 2,
                        fontSize: 48
                    }}
                >
                    {fullName.charAt(0) || 'U'}
                </Avatar>
                <Button
                    variant="outlined"
                    component="label"
                    disabled={uploading}
                >
                    {uploading ? 'Загрузка...' : 'Изменить фото'}
                    <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleFileUpload}
                    />
                </Button>
            </Box>

            <form onSubmit={handleSubmit}>
                <TextField
                    fullWidth
                    label="ФИО"
                    margin="normal"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                />

                <TextField
                    fullWidth
                    label="Телефон"
                    margin="normal"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                />

                <TextField
                    fullWidth
                    label="Группа"
                    margin="normal"
                    value={studentGroup}
                    onChange={(e) => setStudentGroup(e.target.value)}
                />

                <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    sx={{ mt: 3, height: 48 }}
                    disabled={loading}
                >
                    {loading ? <CircularProgress size={24} /> : 'Сохранить изменения'}
                </Button>
            </form>
        </Box>
    );
}
