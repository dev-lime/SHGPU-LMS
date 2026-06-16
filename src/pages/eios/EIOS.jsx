import {
	Typography,
	Button,
	Paper,
	Box,
	useTheme,
	useMediaQuery,
	Fade,
	Stack
} from '@mui/material';
import { OpenInNew, School, Extension } from '@mui/icons-material';
import { motion } from 'framer-motion';

export default function Eios() {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

	const openEios = () => {
		window.open('https://edu.shspu.ru/my/', '_blank');
	};

	const openGithubRepo = () => {
		window.open('https://github.com/dev-lime/SHGPU-Extension', '_blank');
	};

	return (
		<Box
			sx={{
				width: '100%',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				p: isMobile ? 2 : 3
			}}
		>
			<Fade in timeout={500}>
				<Stack spacing={3} alignItems="center" sx={{ width: '100%', maxWidth: 600 }}>
					{/* Основная карточка */}
					<Paper
						elevation={0}
						sx={{
							p: 4,
							width: '100%',
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
					</Paper>

					{/* Карточка расширения */}
					<Paper
						elevation={0}
						sx={{
							p: 3,
							width: '100%',
							borderRadius: 4,
							background: theme.palette.mode === 'dark'
								? `linear-gradient(145deg, ${theme.palette.tones[1]} 0%, ${theme.palette.tones[4]} 100%)`
								: `linear-gradient(145deg, ${theme.palette.tones[9]} 0%, ${theme.palette.tones[11]} 100%)`,
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							textAlign: 'center',
							position: 'relative',
							overflow: 'hidden',
							'&::before': {
								content: '""',
								position: 'absolute',
								top: -30,
								right: -30,
								width: 120,
								height: 120,
								borderRadius: '50%',
								background: theme.palette.tones[8],
								opacity: 0.1
							}
						}}
					>
						<Typography
							variant={isMobile ? 'h6' : 'h5'}
							gutterBottom
							sx={{
								fontWeight: 700,
								mb: 1,
								color: theme.palette.mode === 'dark' ? theme.palette.tones[7] : theme.palette.tones[3]
							}}
						>
							Расширение для ЭИОС
						</Typography>

						<Typography
							variant="body2"
							sx={{
								mb: 3,
								color: 'text.secondary',
								maxWidth: '90%'
							}}
						>
							Упрощает навигацию, добавляет полезные функции в ЭИОС ШГПУ и обновляет его до версии 2.1
						</Typography>

						<Button
							component={motion.button}
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							variant="contained"
							size={isMobile ? 'medium' : 'large'}
							startIcon={<Extension />}
							onClick={openGithubRepo}
							sx={{
								px: 4,
								py: 1,
								borderRadius: 50,
								fontSize: isMobile ? '0.875rem' : '1rem',
								textTransform: 'none',
								fontWeight: 600,
								boxShadow: theme.shadows[2],
								backgroundColor: theme.palette.tones[5],
								color: theme.palette.getContrastText(theme.palette.tones[5]),
								'&:hover': {
									boxShadow: theme.shadows[4],
									backgroundColor: theme.palette.tones[6]
								}
							}}
						>
							Установить расширение
						</Button>

						<Typography
							variant="caption"
							sx={{
								mt: 2,
								display: 'block',
								color: 'text.disabled'
							}}
						>
							Доступно в GitHub
						</Typography>
					</Paper>
				</Stack>
			</Fade>
		</Box>
	);
}
