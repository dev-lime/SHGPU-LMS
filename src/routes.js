import {
    Article,
    School,
    Chat as ChatIcon,
    CalendarMonth,
    Pending
} from "@mui/icons-material";
import News from "./pages/news/news";
import Eios from "./pages/eios/eios";
import Messenger from "./pages/messenger/messenger";
import Schedule from "./pages/schedule/schedule";
import More from "./pages/more/more";
import Documents from './pages/more/documents';
import Settings from './pages/more/settings';
import Profile from './pages/more/profile';
import Support from './pages/more/support';
import IDCard from './pages/more/idcard';
import Chat from './pages/messenger/chat';

export const mainTabs = [
    {
        label: "Новости",
        icon: <Article />,
        path: "/news",
        component: <News />,
        index: true
    },
    {
        label: "ЭИОС",
        icon: <School />,
        path: "/eios",
        component: <Eios />
    },
    {
        label: "Мессенджер",
        icon: <ChatIcon />,
        path: "/messenger",
        component: <Messenger />
    },
    {
        label: "Расписание",
        icon: <CalendarMonth />,
        path: "/schedule",
        component: <Schedule />
    },
    {
        label: "Ещё",
        icon: <Pending />,
        path: "/more",
        component: <More />,
        nested: [
            { path: "documents", component: <Documents /> },
            { path: "settings", component: <Settings /> },
            { path: "profile", component: <Profile /> },
            { path: "support", component: <Support /> },
            { path: "idcard", component: <IDCard /> }
        ]
    }
];

export const additionalRoutes = [
    { path: "/chat/:chatId", component: <Chat /> }
];
