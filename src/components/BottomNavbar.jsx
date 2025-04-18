import { BottomNavigation, BottomNavigationAction, Paper } from "@mui/material";
import { Schedule, School, Notifications } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export const BottomNavbar = () => {
  const [value, setValue] = useState(0);
  const navigate = useNavigate();

  return (
    <Paper sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }} elevation={3}>
      <BottomNavigation
        value={value}
        onChange={(_, newValue) => {
          setValue(newValue);
          switch (newValue) {
            case 0: navigate("/schedule"); break;
            case 1: navigate("/lms"); break;
            case 2: navigate("/notifications"); break;
          }
        }}
      >
        <BottomNavigationAction label="Расписание" icon={<Schedule />} />
        <BottomNavigationAction label="ЭИОС" icon={<School />} />
        <BottomNavigationAction label="Уведомления" icon={<Notifications />} />
      </BottomNavigation>
    </Paper>
  );
};
