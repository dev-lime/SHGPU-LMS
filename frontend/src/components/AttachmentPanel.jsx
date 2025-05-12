import React, { useState, useRef, useEffect } from 'react';
import {
	Box,
	Paper,
	Tabs,
	Tab,
	Divider,
	Slide,
	useTheme
} from '@mui/material';
import {
	InsertPhoto,
	InsertDriveFile,
	Poll,
	DragIndicator
} from '@mui/icons-material';

const AttachmentPanel = ({ open, onClose }) => {
	const theme = useTheme();
	const [activeTab, setActiveTab] = useState(0);
	const [panelHeight, setPanelHeight] = useState('40vh');
	const [isDragging, setIsDragging] = useState(false);
	const [startY, setStartY] = useState(0);
	const [startHeight, setStartHeight] = useState(0);
	const panelRef = useRef(null);

	const handleTabChange = (event, newValue) => {
		setActiveTab(newValue);
	};

	const tabs = [
		{ icon: <InsertPhoto fontSize="medium" />, label: 'Медиа' },
		{ icon: <InsertDriveFile fontSize="medium" />, label: 'Файл' },
		{ icon: <Poll fontSize="medium" />, label: 'Опрос' }
	];

	const tabContents = {
		0: <Box sx={{ p: 2, height: '100%', overflow: 'auto' }}>{/* Медиа */}</Box>,
		1: <Box sx={{ p: 2, height: '100%', overflow: 'auto' }}>{/* Файлы */}</Box>,
		2: <Box sx={{ p: 2, height: '100%', overflow: 'auto' }}>{/* Опросы */}</Box>
	};

	const handleDragStart = (e) => {
		setIsDragging(true);
		setStartY(e.clientY || e.touches?.[0]?.clientY);
		setStartHeight(parseInt(panelHeight));
		document.body.style.userSelect = 'none';
	};

	const handleDragMove = (e) => {
		if (!isDragging) return;

		const y = e.clientY || e.touches?.[0]?.clientY;
		const diff = startY - y;
		let newHeight = startHeight + diff / window.innerHeight * 100;

		newHeight = Math.max(30, Math.min(80, newHeight));
		setPanelHeight(`${newHeight}vh`);
	};

	const handleDragEnd = () => {
		if (!isDragging) return;

		setIsDragging(false);
		document.body.style.userSelect = '';

		const height = parseInt(panelHeight);
		if (height < 35) {
			onClose();
			setPanelHeight('40vh');
		}
		else if (height < 50) {
			setPanelHeight('40vh');
		} else {
			setPanelHeight('70vh');
		}
	};

	const handleTouchStart = (e) => {
		setStartY(e.touches[0].clientY);
	};

	const handleTouchMove = (e) => {
		const y = e.touches[0].clientY;
		const diff = y - startY;

		if (diff > 100 && parseInt(panelHeight) <= 40) {
			onClose();
		}
	};

	useEffect(() => {
		if (isDragging) {
			window.addEventListener('mousemove', handleDragMove);
			window.addEventListener('touchmove', handleDragMove);
			window.addEventListener('mouseup', handleDragEnd);
			window.addEventListener('touchend', handleDragEnd);
		}

		return () => {
			window.removeEventListener('mousemove', handleDragMove);
			window.removeEventListener('touchmove', handleDragMove);
			window.removeEventListener('mouseup', handleDragEnd);
			window.removeEventListener('touchend', handleDragEnd);
		};
	}, [isDragging]);

	return (
		<Slide direction="up" in={open} mountOnEnter unmountOnExit>
			<Paper
				ref={panelRef}
				elevation={4}
				sx={{
					position: 'fixed',
					bottom: 0,
					left: 0,
					right: 0,
					width: '100%',
					borderTopLeftRadius: theme.shape.borderRadius * 2,
					borderTopRightRadius: theme.shape.borderRadius * 2,
					borderBottomLeftRadius: 0,
					borderBottomRightRadius: 0,
					zIndex: 1300,
					display: 'flex',
					flexDirection: 'column',
					height: panelHeight,
					maxHeight: '80vh',
					touchAction: 'none'
				}}
				onTouchStart={handleTouchStart}
				onTouchMove={handleTouchMove}
			>
				<Box
					sx={{
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						height: 24,
						cursor: isDragging ? 'grabbing' : 'grab',
						bgcolor: isDragging ? 'action.selected' : 'background.paper',
						transition: 'background-color 0.2s'
					}}
					onMouseDown={handleDragStart}
					onTouchStart={handleDragStart}
				>
					<DragIndicator
						sx={{
							color: 'text.secondary',
							transform: 'rotate(90deg)',
							opacity: 0.7
						}}
					/>
				</Box>
				<Divider />

				<Box sx={{
					flex: 1,
					overflow: 'hidden',
					display: 'flex',
					flexDirection: 'column'
				}}>
					{tabContents[activeTab]}
				</Box>

				<Box sx={{ flexShrink: 0 }}>
					<Tabs
						value={activeTab}
						onChange={handleTabChange}
						variant="fullWidth"
						sx={{
							'& .MuiTabs-indicator': {
								top: 0,
								backgroundColor: 'primary.main',
							}
						}}
					>
						{tabs.map((tab, index) => (
							<Tab
								key={index}
								icon={tab.icon}
								label={tab.label}
								sx={{
									minHeight: 56,
									padding: '6px 12px',
									'&.Mui-selected': {
										color: 'primary.main',
									}
								}}
							/>
						))}
					</Tabs>
				</Box>
			</Paper>
		</Slide>
	);
};

export default React.memo(AttachmentPanel);
