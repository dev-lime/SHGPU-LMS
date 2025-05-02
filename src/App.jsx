import { useState, useEffect } from 'react';
import {
	CssBaseline,
	Paper,
	BottomNavigation,
	BottomNavigationAction,
	CircularProgress,
	Box
} from "@mui/material";
import {
	Article,
	School,
	Chat as ChatIcon,
	CalendarMonth,
	Pending
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeProvider } from "@mui/material/styles";
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import News from "@pages/news/News";
import Eios from "@pages/eios/EIOS";
import ChatsPage from '@pages/messenger/ChatsPage';
import UsersPage from '@pages/messenger/UsersPage';
import Chat from '@pages/messenger/Chat';
import Schedule from "@pages/schedule/Schedule";
import More from "@pages/more/More";
import Settings from '@pages/more/Settings';
import Documents from '@pages/more/Documents';
import Support from '@pages/more/Support';
import IDCard from '@pages/more/IDCard';
import UserProfile from '@pages/UserProfile';
import Auth from "@components/Auth";
import { createAppTheme, getSystemTheme } from './theme';

const MainLayout = ({
	children,
	activeTab,
	setActiveTab,
	tabs,
	tabLabelsMode = 'showAll'
}) => {
	const navigate = useNavigate();
	const location = useLocation();

	const handleTabChange = (e, newValue) => {
		setActiveTab(newValue);
		localStorage.setItem('lastActiveTab', newValue);

		if (location.pathname !== '/') {
			navigate('/');
		}
	};

	return (
		<Box sx={{
			maxWidth: 450,
			margin: '0 auto',
			height: '100dvh',
			display: 'flex',
			flexDirection: 'column',
			bgcolor: 'background.default'
		}}>
			<Paper elevation={0} sx={{
				flex: 1,
				overflow: 'auto',
				borderRadius: 0,
				position: 'relative',
				bgcolor: 'background.default'
			}}>
				<AnimatePresence mode="wait">
					<motion.div
						key={location.pathname}
						initial={{ opacity: 0, x: 10 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -10 }}
						transition={{ duration: 0.3 }}
						style={{ height: '100%' }}
					>
						{children}
					</motion.div>
				</AnimatePresence>
			</Paper>

			<BottomNavigation
				value={activeTab}
				onChange={handleTabChange}
				showLabels={tabLabelsMode !== 'hideAll'}
				sx={{
					position: 'sticky',
					bottom: 0,
					width: '100%',
					bgcolor: 'background.paper',
					borderTop: '1px solid',
					borderColor: 'divider',
				}}
			>
				{tabs.map((tab, index) => (
					<BottomNavigationAction
						key={index}
						label={
							tabLabelsMode === 'showAll' ||
								(tabLabelsMode === 'currentOnly' && activeTab === index) ? (
								<AnimatePresence mode="wait">
									{(tabLabelsMode === 'showAll' ||
										(tabLabelsMode === 'currentOnly' && activeTab === index)) && (
											<motion.div
												key="label"
												initial={{ opacity: 0, y: 5 }}
												animate={{ opacity: 1, y: 0 }}
												exit={{ opacity: 0, y: -5 }}
												transition={{ duration: 0.3 }}
											>
												{tab.label}
											</motion.div>
										)}
								</AnimatePresence>
							) : null
						}
						icon={tab.icon}
						sx={{
							minWidth: 'auto',
							'&.Mui-selected': {
								color: 'primary.main',
								outline: 'none',
							},
							'&:focus': {
								outline: 'none',
							},
						}}
					/>
				))}
			</BottomNavigation>
		</Box>
	);
};

export default function App() {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState(() => {
		const savedTab = localStorage.getItem('lastActiveTab');
		return savedTab ? Number(savedTab) : 0;
	});
	const [themeConfig, setThemeConfig] = useState(() => {
		const savedColor = localStorage.getItem('primaryColor') || 'green';
		const savedMode = localStorage.getItem('themeMode') || 'light';
		const borderRadiusItem = localStorage.getItem('borderRadius');
		const savedBorderRadius = borderRadiusItem !== null ? Number(borderRadiusItem) : 16;

		return {
			color: savedColor,
			mode: savedMode,
			borderRadius: savedBorderRadius
		};
	});
	const [tabLabelsMode, setTabLabelsMode] = useState(
		localStorage.getItem('tabLabelsMode') || 'showAll'
	);
	const [systemTheme, setSystemTheme] = useState(getSystemTheme());

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			setUser(user);
			setLoading(false);
		});
		return unsubscribe;
	}, []);

	useEffect(() => {
		const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

		const handleSystemThemeChange = (e) => {
			const newSystemTheme = e.matches ? 'dark' : 'light';
			setSystemTheme(newSystemTheme);

			if (themeConfig.mode === 'system') {
				const theme = createAppTheme(themeConfig.color, 'system', themeConfig.borderRadius);
			}
		};

		setSystemTheme(getSystemTheme());
		darkModeMediaQuery.addEventListener('change', handleSystemThemeChange);

		return () => {
			darkModeMediaQuery.removeEventListener('change', handleSystemThemeChange);
		};
	}, [themeConfig.mode]);

	const handleThemeChange = (newConfig) => {
		setThemeConfig(newConfig);
		localStorage.setItem('primaryColor', newConfig.color);
		localStorage.setItem('themeMode', newConfig.mode);
		localStorage.setItem('borderRadius', newConfig.borderRadius);
	};

	const handleTabLabelsModeChange = (mode) => {
		setTabLabelsMode(mode);
		localStorage.setItem('tabLabelsMode', mode);
	};

	const handleLogout = async () => {
		try {
			await signOut(auth);
			localStorage.removeItem('lastActiveTab');
		} catch (error) {
			console.error('Ошибка при выходе:', error);
		}
	};

	const theme = createAppTheme(themeConfig.color, themeConfig.mode, themeConfig.borderRadius);

	const tabs = [
		{ label: "Новости", icon: <Article />, path: "/news", component: <News /> },
		{ label: "ЭИОС", icon: <School />, path: "/eios", component: <Eios /> },
		{ label: "Чаты", icon: <ChatIcon />, path: "/chats", component: <ChatsPage /> },
		{ label: "Расписание", icon: <CalendarMonth />, path: "/schedule", component: <Schedule /> },
		{ label: "Ещё", icon: <Pending />, path: "/more", component: <More user={user} onLogout={handleLogout} /> }
	];

	if (loading) {
		return (
			<ThemeProvider theme={theme}>
				<Box sx={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					height: '100vh'
				}}>
					<CircularProgress size={60} />
				</Box>
			</ThemeProvider>
		);
	}

	if (!user) {
		return (
			<ThemeProvider theme={theme}>
				<Auth />
			</ThemeProvider>
		);
	}

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<Router>
				<Routes>
					<Route
						path="/"
						element={
							<MainLayout
								activeTab={activeTab}
								setActiveTab={setActiveTab}
								tabs={tabs}
								tabLabelsMode={tabLabelsMode}
							>
								<AnimatePresence mode="wait">
									<motion.div
										key={activeTab}
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										exit={{ opacity: 0 }}
										transition={{ duration: 0.25 }}
										style={{
											flex: 1,
											overflow: 'auto',
										}}
									>
										{tabs[activeTab].component}
									</motion.div>
								</AnimatePresence>
							</MainLayout>
						}
					/>

					{tabs.map((tab, index) => (
						<Route
							key={index}
							path={tab.path}
							element={
								<MainLayout
									activeTab={activeTab}
									setActiveTab={setActiveTab}
									tabs={tabs}
									tabLabelsMode={tabLabelsMode}
								>
									{tab.component}
								</MainLayout>
							}
						/>
					))}

					<Route
						path="/documents"
						element={
							<MainLayout
								activeTab={activeTab}
								setActiveTab={setActiveTab}
								tabs={tabs}
								tabLabelsMode={tabLabelsMode}
							>
								<Documents />
							</MainLayout>
						}
					/>

					<Route
						path="/settings"
						element={
							<MainLayout
								activeTab={activeTab}
								setActiveTab={setActiveTab}
								tabs={tabs}
								tabLabelsMode={tabLabelsMode}
							>
								<Settings
									themeConfig={themeConfig}
									onThemeChange={handleThemeChange}
									tabLabelsMode={tabLabelsMode}
									onTabLabelsModeChange={handleTabLabelsModeChange}
									borderRadius={themeConfig.borderRadius}
									onBorderRadiusChange={(newValue) => {
										handleThemeChange({
											...themeConfig,
											borderRadius: newValue
										});
									}}
								/>
							</MainLayout>
						}
					/>

					<Route
						path="/users"
						element={
							<MainLayout
								activeTab={activeTab}
								setActiveTab={setActiveTab}
								tabs={tabs}
								tabLabelsMode={tabLabelsMode}
							>
								<UsersPage />
							</MainLayout>
						}
					/>

					<Route
						path="/user/:userId"
						element={
							<MainLayout
								activeTab={activeTab}
								setActiveTab={setActiveTab}
								tabs={tabs}
								tabLabelsMode={tabLabelsMode}
							>
								<UserProfile />
							</MainLayout>
						}
					/>

					<Route
						path="/support"
						element={
							<MainLayout
								activeTab={activeTab}
								setActiveTab={setActiveTab}
								tabs={tabs}
								tabLabelsMode={tabLabelsMode}
							>
								<Support />
							</MainLayout>
						}
					/>

					<Route
						path="/idcard"
						element={
							<MainLayout
								activeTab={activeTab}
								setActiveTab={setActiveTab}
								tabs={tabs}
								tabLabelsMode={tabLabelsMode}
							>
								<IDCard />
							</MainLayout>
						}
					/>

					<Route
						path="/chat/:chatId"
						element={
							<MainLayout
								activeTab={activeTab}
								setActiveTab={setActiveTab}
								tabs={tabs}
								tabLabelsMode={tabLabelsMode}
							>
								<Chat />
							</MainLayout>
						}
					/>
				</Routes>
			</Router>
		</ThemeProvider>
	);
}
