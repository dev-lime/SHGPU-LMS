import React from 'react';
import {
	Typography,
	Button,
	Container,
	Paper
} from '@mui/material';
import { OpenInNew } from '@mui/icons-material';

export default function Eios() {
	const openEios = () => {
		window.open('https://edu.shspu.ru/my/', '_blank');
	};

	return (
		<Container maxWidth="md" sx={{ height: '100%', py: 3 }}>
			<Paper elevation={3} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
				<Typography variant="h5" gutterBottom align="center">
					Электронная информационно-образовательная среда (ЭИОС)
				</Typography>
				<Typography variant="body1" paragraph align="center">
					Для доступа к системе нажмите кнопку ниже
				</Typography>
				<Button
					variant="contained"
					color="primary"
					size="large"
					startIcon={<OpenInNew />}
					onClick={openEios}
					sx={{ mt: 2 }}
				>
					Открыть ЭИОС ШГПУ
				</Button>
			</Paper>
		</Container>
	);
}
