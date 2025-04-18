import React, { useState } from "react";
import { CssBaseline, Paper, BottomNavigation, BottomNavigationAction } from "@mui/material";
import { Article, School, Chat as ChatIcon, CalendarMonth } from "@mui/icons-material"; // Переименовали иконку
import News from "./pages/News";
import Eios from "./pages/Eios";
import ChatPage from "./pages/Chat"; // Изменили название импорта
import Schedule from "./pages/Schedule";
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { label: "Новости", icon: <Article />, component: <News /> },
    { label: "ЭИОС", icon: <School />, component: <Eios /> },
    { label: "Чат", icon: <ChatIcon />, component: <ChatPage /> }, // Используем ChatIcon и ChatPage
    { label: "Расписание", icon: <CalendarMonth />, component: <Schedule /> },
  ];

  return (
    <div style={{ maxWidth: 450, margin: "0 auto", height: "100vh", display: "flex", flexDirection: "column" }}>
      <CssBaseline />
      <Paper elevation={3} style={{ flex: 1, overflow: "auto" }}>
      <ErrorBoundary>
        {tabs[activeTab].component}
      </ErrorBoundary>
      </Paper>
      <BottomNavigation
        value={activeTab}
        onChange={(e, newValue) => setActiveTab(newValue)}
        showLabels
        style={{ position: "sticky", bottom: 0, width: "100%" }}
      >
        {tabs.map((tab, index) => (
          <BottomNavigationAction key={index} label={tab.label} icon={tab.icon} />
        ))}
      </BottomNavigation>
    </div>
  );
}
