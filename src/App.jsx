import React, { useState, useEffect } from "react";
import {
	CssBaseline,
	Paper,
	BottomNavigation,
	BottomNavigationAction,
	ThemeProvider
} from "@mui/material";
import {
	Article,
	School,
	Chat as ChatIcon,
	CalendarMonth,
	Settings
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import News from "./pages/News";
import Eios from "./pages/Eios";
import ChatPage from "./pages/Chat";
import Schedule from "./pages/Schedule";
import More from "./pages/More";
import ErrorBoundary from './components/ErrorBoundary';
import { createAppTheme } from './theme';

export default function App() {
	const [activeTab, setActiveTab] = useState(0);
	const [themeConfig, setThemeConfig] = useState({
		color: 'green',
		mode: 'light'
	});

	useEffect(() => {
		const savedColor = localStorage.getItem('primaryColor') || 'green';
		const savedMode = localStorage.getItem('themeMode') || 'light';
		setThemeConfig({ color: savedColor, mode: savedMode });
	}, []);

	const handleThemeChange = (newConfig) => {
		setThemeConfig(newConfig);
		localStorage.setItem('primaryColor', newConfig.color);
		localStorage.setItem('themeMode', newConfig.mode);
	};

	const theme = createAppTheme(themeConfig.color, themeConfig.mode);

	const tabs = [
		{ label: "Новости", icon: <Article />, component: <News /> },
		{ label: "ЭИОС", icon: <School />, component: <Eios /> },
		{ label: "Чат", icon: <ChatIcon />, component: <ChatPage /> },
		{ label: "Расписание", icon: <CalendarMonth />, component: <Schedule /> },
		{
			label: "Ещё",
			icon: <Settings />,
			component: <More
				themeConfig={themeConfig}
				onThemeChange={handleThemeChange}
			/>
		}
	];

	return (
		<ThemeProvider theme={theme}>
			<div style={{
				maxWidth: 450,
				margin: "0 auto",
				height: "100vh",
				display: "flex",
				flexDirection: "column",
				borderRadius: 0
			}}>
				<CssBaseline />
				<Paper
					elevation={3}
					sx={{
						flex: 1,
						overflow: "auto",
						borderRadius: 0,
						'&.MuiPaper-rounded': {
							borderRadius: 0
						}
					}}
				>
					<ErrorBoundary>
						<AnimatePresence mode="wait">
							<motion.div
								key={activeTab}
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.25 }}
								style={{
									flex: 1,
									overflow: "auto",
									borderRadius: 0
								}}
							>
								{tabs[activeTab].component}
							</motion.div>
						</AnimatePresence>
					</ErrorBoundary>
				</Paper>
				<BottomNavigation
					value={activeTab}
					onChange={(e, newValue) => setActiveTab(newValue)}
					showLabels
					sx={{
						position: "sticky",
						bottom: 0,
						width: "100%",
						borderRadius: 0
					}}
				>
					{tabs.map((tab, index) => (
						<BottomNavigationAction
							key={index}
							label={tab.label}
							icon={tab.icon}
							sx={{
								'&.Mui-selected': {
									outline: 'none'
								},
								'&:focus': {
									outline: 'none'
								},
								borderRadius: 0
							}}
						/>
					))}
				</BottomNavigation>
			</div>
		</ThemeProvider>
	);
}
