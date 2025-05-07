import React, { useState } from 'react';
import {
	Typography,
	Button,
	Paper,
	Box,
	useTheme,
	useMediaQuery,
	Fade,
	TextField,
	Checkbox,
	FormControlLabel,
	FormGroup,
	Collapse,
	Divider
} from '@mui/material';
import { OpenInNew, School } from '@mui/icons-material';
import { motion } from 'framer-motion';

export default function Eios() {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [autoLogin, setAutoLogin] = useState(false);
	const [error, setError] = useState('');

	const openEios = () => {
		if (autoLogin && (!username || !password)) {
			setError('Для автовхода введите логин и пароль');
			return;
		}

		window.open('https://edu.shspu.ru/my/', '_blank');
	};

	const handleAutoLoginChange = (event) => {
		setAutoLogin(event.target.checked);
		if (!event.target.checked) {
			setError('');
		}
	};

	return (
		<Box
			sx={{
				width: '100%',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				p: isMobile ? 2 : 3
			}}
		>
			<Fade in timeout={500}>
				<Paper
					elevation={0}
					sx={{
						p: 4,
						width: '100%',
						maxWidth: 600,
						borderRadius: 4,
						background: theme.palette.mode === 'dark'
							? `linear-gradient(145deg, ${theme.palette.tones[3]} 0%, ${theme.palette.tones[1]} 100%)`
							: `linear-gradient(145deg, ${theme.palette.tones[11]} 0%, ${theme.palette.tones[9]} 100%)`,
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						textAlign: 'center',
						position: 'relative',
						overflow: 'hidden',
						'&::before': {
							content: '""',
							position: 'absolute',
							top: -50,
							right: -50,
							width: 200,
							height: 200,
							borderRadius: '50%',
							background: theme.palette.tones[5],
							opacity: 0.2
						}
					}}
				>
					<Box
						component={motion.div}
						initial={{ scale: 0.7 }}
						animate={{ scale: 1 }}
						transition={{ duration: 0.5 }}
						sx={{
							bgcolor: theme.palette.tones[5],
							width: 80,
							height: 80,
							borderRadius: '50%',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							mb: 3,
							color: theme.palette.getContrastText(theme.palette.tones[5])
						}}
					>
						<School fontSize="large" />
					</Box>

					<Typography
						variant={isMobile ? 'h5' : 'h4'}
						gutterBottom
						sx={{
							fontWeight: 700,
							mb: 2,
							color: theme.palette.mode === 'dark' ? theme.palette.tones[7] : theme.palette.tones[3]
						}}
					>
						ЭИОС ШГПУ
					</Typography>

					<Typography
						variant="body1"
						sx={{
							mb: 4,
							color: 'text.secondary',
							maxWidth: '80%'
						}}
					>
						Электронная информационно-образовательная среда
					</Typography>

					<Button
						component={motion.button}
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						variant="contained"
						color="primary"
						size="large"
						startIcon={<OpenInNew />}
						onClick={openEios}
						sx={{
							px: 4,
							py: 1.5,
							borderRadius: 50,
							fontSize: isMobile ? '0.875rem' : '1rem',
							textTransform: 'none',
							fontWeight: 600,
							boxShadow: theme.shadows[4],
							backgroundColor: theme.palette.tones[5],
							'&:hover': {
								boxShadow: theme.shadows[8],
								backgroundColor: theme.palette.tones[6]
							},
							'&.Mui-selected': {
								outline: 'none'
							},
							'&:focus': {
								outline: 'none'
							}
						}}
					>
						Перейти в ЭИОС
					</Button>

					<Typography
						variant="caption"
						sx={{
							mt: 3,
							display: 'block',
							color: 'text.disabled'
						}}
					>
						Откроется в новом окне
					</Typography>

					{/* Блок автовхода внутри основной карточки */}
					<Box sx={{ width: '100%', mt: 4 }}>
						<Divider sx={{
							mb: 3,
							borderColor: theme.palette.mode === 'dark' ? theme.palette.tones[5] : theme.palette.tones[7],
							opacity: 0.5
						}} />

						<FormGroup sx={{ width: '100%' }}>
							<FormControlLabel
								control={
									<Checkbox
										checked={autoLogin}
										onChange={handleAutoLoginChange}
										color="primary"
										sx={{
											color: theme.palette.mode === 'dark' ? theme.palette.tones[7] : theme.palette.tones[3]
										}}
									/>
								}
								label={
									<Typography
										variant="body1"
										sx={{
											color: theme.palette.mode === 'dark' ? theme.palette.tones[7] : theme.palette.tones[3]
										}}
									>
										Автоматический вход (в разработке)
									</Typography>
								}
								sx={{
									mb: autoLogin ? 2 : 0,
									alignSelf: 'flex-start'
								}}
							/>

							<Collapse in={autoLogin} timeout="auto" unmountOnExit>
								<Box
									component={motion.div}
									initial={{ opacity: 0, y: -10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.3 }}
									sx={{ width: '100%', mt: 1 }}
								>
									<TextField
										label="Логин"
										variant="outlined"
										fullWidth
										value={username}
										onChange={(e) => setUsername(e.target.value)}
										sx={{
											mb: 2,
											'& .MuiOutlinedInput-root': {
												'& fieldset': {
													borderColor: theme.palette.mode === 'dark' ? theme.palette.tones[5] : theme.palette.tones[7],
												},
											}
										}}
									/>
									<TextField
										label="Пароль"
										type="password"
										variant="outlined"
										fullWidth
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										sx={{
											'& .MuiOutlinedInput-root': {
												'& fieldset': {
													borderColor: theme.palette.mode === 'dark' ? theme.palette.tones[5] : theme.palette.tones[7],
												},
											}
										}}
									/>
									{error && (
										<Typography color="error" variant="body2" sx={{ mt: 1 }}>
											{error}
										</Typography>
									)}
								</Box>
							</Collapse>
						</FormGroup>
					</Box>
				</Paper>
			</Fade>
		</Box>
	);
}
