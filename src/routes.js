import {
    Article,
    School,
    Chat as ChatIcon,
    CalendarMonth,
    Pending
} from "@mui/icons-material";
import News from "@pages/news/News";
import Eios from "@pages/eios/EIOS";
import Messenger from "@pages/messenger/Messenger";
import Schedule from "@pages/schedule/Schedule";
import More from "@pages/more/More";
import Documents from '@pages/more/Documents';
import Settings from '@pages/more/Settings';
import Profile from '@pages/more/Profile';
import Support from '@pages/more/Support';
import IDCard from '@pages/more/IDCard';
import Chat from '@pages/messenger/Chat';

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
