import React from 'react';
import {
	Typography,
	Button,
	Container,
	Paper,
	Box,
	useTheme,
	useMediaQuery,
	Fade
} from '@mui/material';
import { OpenInNew, School } from '@mui/icons-material';
import { motion } from 'framer-motion';

export default function Eios() {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

	const openEios = () => {
		window.open('https://edu.shspu.ru/my/', '_blank');
	};

	return (
		<Container
			maxWidth="md"
			sx={{
				height: '100%',
				py: 3,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center'
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
							? 'linear-gradient(145deg, #1E3A1E 0%, #0D1F0D 100%)'
							: 'linear-gradient(145deg, #E8F5E9 0%, #C8E6C9 100%)',
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
							background: theme.palette.primary.light,
							opacity: 0.2
						}
					}}
				>
					<Box
						component={motion.div}
						initial={{ scale: 0.9 }}
						animate={{ scale: 1 }}
						transition={{ duration: 0.5 }}
						sx={{
							bgcolor: 'primary.main',
							width: 80,
							height: 80,
							borderRadius: '50%',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							mb: 3,
							color: 'primary.contrastText'
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
							color: theme.palette.mode === 'dark' ? 'primary.light' : 'primary.dark'
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
							'&:hover': {
								boxShadow: theme.shadows[8]
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
			</Fade>
		</Container>
	);
}
