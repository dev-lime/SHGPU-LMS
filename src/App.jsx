import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App

/*
import { Routes, Route } from "react-router-dom";
import { BottomNavbar } from "./components/BottomNavbar";
import { SchedulePage, LMSPage, NotificationsPage } from "./pages";

export default function App() {
  return (
    <div style={{ paddingBottom: "70px" }}> {} //Отступ для BottomNavbar
    <Routes>
    <Route path="/" element={<SchedulePage />} />
    <Route path="/schedule" element={<SchedulePage />} />
    <Route path="/lms" element={<LMSPage />} />
    <Route path="/notifications" element={<NotificationsPage />} />
  </Routes>
  <BottomNavbar />
</div>
);
}
*/
