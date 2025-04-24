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
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, useParams } from 'react-router-dom';
import News from "./pages/News";
import Eios from "./pages/Eios";
import Messenger from "./pages/Messenger";
import Schedule from "./pages/Schedule";
import More from "./pages/More";
import Auth from "./components/Auth";
import Settings from './pages/Settings';
import Documents from './pages/Documents';
import Profile from './pages/Profile';
import Support from './pages/Support';
import IDCard from './pages/IDCard';
import Chat from './pages/Chat';
import { createAppTheme } from './theme';

const MainLayout = ({ children, activeTab, setActiveTab, tabs, hideTabLabels = false }) => {
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
		<Box
			sx={{
				maxWidth: 450,
				margin: '0 auto',
				height: '100vh',
				display: 'flex',
				flexDirection: 'column',
				bgcolor: 'background.default',
			}}
		>
			<Paper
				elevation={0}
				sx={{
					flex: 1,
					overflow: 'auto',
					borderRadius: 0,
					position: 'relative'
				}}
			>
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
				showLabels={!hideTabLabels}
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
						label={hideTabLabels ? null : tab.label}
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
		return savedTab ? parseInt(savedTab) : 0;
	});
	const [themeConfig, setThemeConfig] = useState({
		color: 'green',
		mode: 'light'
	});
	const [hideTabLabels, setHideTabLabels] = useState(
		localStorage.getItem('hideTabLabels') === 'true'
	);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			setUser(user);
			setLoading(false);
		});
		return unsubscribe;
	}, []);

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

	const handleHideTabLabelsChange = (hide) => {
		setHideTabLabels(hide);
		localStorage.setItem('hideTabLabels', hide);
	};

	const handleLogout = async () => {
		try {
			await signOut(auth);
			localStorage.removeItem('lastActiveTab');
		} catch (error) {
			console.error('Ошибка при выходе:', error);
		}
	};

	const theme = createAppTheme(themeConfig.color, themeConfig.mode);

	const tabs = [
		{ label: "Новости", icon: <Article />, path: "/news", component: <News /> },
		{ label: "ЭИОС", icon: <School />, path: "/eios", component: <Eios /> },
		{ label: "Мессенджер", icon: <ChatIcon />, path: "/messenger", component: <Messenger /> },
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
								hideTabLabels={hideTabLabels}
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
									hideTabLabels={hideTabLabels}
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
								hideTabLabels={hideTabLabels}
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
								hideTabLabels={hideTabLabels}
							>
								<Settings
									themeConfig={themeConfig}
									onThemeChange={handleThemeChange}
									onHideTabLabelsChange={handleHideTabLabelsChange}
									user={user}
									onLogout={handleLogout}
								/>
							</MainLayout>
						}
					/>

					<Route
						path="/profile"
						element={
							<MainLayout
								activeTab={activeTab}
								setActiveTab={setActiveTab}
								tabs={tabs}
								hideTabLabels={hideTabLabels}
							>
								<Profile user={user} />
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
								hideTabLabels={hideTabLabels}
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
								hideTabLabels={hideTabLabels}
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
								hideTabLabels={hideTabLabels}
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
