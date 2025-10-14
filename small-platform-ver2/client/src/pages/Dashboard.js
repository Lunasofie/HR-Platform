import React, { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Avatar,
  CircularProgress,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Divider,
  IconButton,
  Badge,
  Tooltip,
} from "@mui/material";
import { Link, useNavigate, useLocation } from "react-router-dom";
import GroupIcon from "@mui/icons-material/Group";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AssessmentIcon from "@mui/icons-material/Assessment";
import LogoutIcon from "@mui/icons-material/Logout";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import WorkIcon from "@mui/icons-material/Work";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SettingsIcon from "@mui/icons-material/Settings";
import PersonIcon from "@mui/icons-material/Person";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import BarChartIcon from "@mui/icons-material/BarChart";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import TimelineIcon from "@mui/icons-material/Timeline";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import CloudIcon from "@mui/icons-material/Cloud";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import ThunderstormIcon from "@mui/icons-material/Thunderstorm";
import AirIcon from "@mui/icons-material/Air";

const drawerWidth = 280;

function getInitial(name, email) {
  if (name && name.length > 0) return name[0].toUpperCase();
  if (email && email.length > 0) return email[0].toUpperCase();
  return "?";
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

function getTimeBasedEmoji() {
  const hour = new Date().getHours();
  if (hour < 12) return "☀️";
  if (hour < 18) return "🌤️";
  return "🌙";
}

export default function Dashboard({ me, onLogout }) {
  const [counts, setCounts] = useState({
    totalEmployees: 0,
    recentLogins: [],
    adminCount: 0,
    employeeCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              const response = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weathercode,windspeed_10m&timezone=auto`
              );
              const data = await response.json();
              setWeather({
                temp: Math.round(data.current.temperature_2m),
                code: data.current.weathercode,
                windSpeed: data.current.windspeed_10m,
              });
              setWeatherLoading(false);
            },
            () => {
              setWeatherLoading(false);
            }
          );
        } else {
          setWeatherLoading(false);
        }
      } catch (error) {
        console.error("Weather fetch error:", error);
        setWeatherLoading(false);
      }
    };

    fetchWeather();
  }, []);

  useEffect(() => {
    (async () => {
      if (!me) {
        setLoading(false);
        return;
      }

      if (me.role === "admin") {
        setLoading(true);
        try {
          const res = await fetch(
            (process.env.REACT_APP_API || "http://localhost:4000") +
              "/api/users",
            {
              headers: {
                Authorization: "Bearer " + localStorage.getItem("token"),
              },
            }
          );
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          const json = await res.json();

          const adminCount = json.filter((u) => u.role === "admin").length;
          const employeeCount = json.filter(
            (u) => u.role === "employee"
          ).length;

          setCounts({
            totalEmployees: json.length,
            adminCount,
            employeeCount,
            recentLogins: json
              .filter((user) => user.last_login)
              .sort((a, b) => new Date(b.last_login) - new Date(a.last_login))
              .slice(0, 6),
          });
        } catch (e) {
          console.error("Failed to fetch user data:", e);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    })();
  }, [me]);

  const handleLogout = () => {
    if (onLogout) onLogout();
    navigate("/login");
  };

  const handleDashboardClick = () => {
    if (location.pathname !== "/") {
      navigate("/", { replace: true });
    } else {
      window.scrollTo(0, 0);
    }
  };

  const getWeatherIcon = (code) => {
    if (code === 0) return <WbSunnyIcon sx={{ fontSize: 48 }} />;
    if (code <= 3) return <CloudIcon sx={{ fontSize: 48 }} />;
    if (code <= 67) return <ThunderstormIcon sx={{ fontSize: 48 }} />;
    if (code <= 77) return <AcUnitIcon sx={{ fontSize: 48 }} />;
    return <CloudIcon sx={{ fontSize: 48 }} />;
  };

  const getWeatherEmoji = (code) => {
    if (code === 0) return "☀️";
    if (code <= 3) return "☁️";
    if (code <= 67) return "⛈️";
    if (code <= 77) return "❄️";
    return "🌤️";
  };

  const getWeatherDescription = (code) => {
    if (code === 0) return "Clear Sky";
    if (code <= 3) return "Partly Cloudy";
    if (code <= 67) return "Rainy";
    if (code <= 77) return "Snowy";
    return "Cloudy";
  };

  if (!me) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #FFEDFA 0%, #FFB8E0 50%, #EC7FA9 100%)",
        }}
      >
        <Paper
          elevation={24}
          sx={{ p: 4, borderRadius: 4, textAlign: "center" }}
        >
          <CircularProgress size={60} thickness={4} sx={{ mb: 2, color: "#EC7FA9" }} />
          <Typography variant="h6" sx={{ color: "#BE5985" }}>
            Loading your dashboard... ✨
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={{ display: "flex", backgroundColor: "#FBFBFB", minHeight: "100vh" }}
    >
      {/* Dreamy Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            background:
              "linear-gradient(180deg, #BE5985 0%, #EC7FA9 50%, #BE5985 100%)",
            color: "white",
            borderRight: "none",
            boxShadow: "4px 0 24px rgba(236, 127, 169, 0.2)",
          },
        }}
      >
        <Toolbar />

        {/* User Profile Section */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mb: 2,
            mt: 3,
            px: 3,
            position: "relative",
          }}
        >
          <Box sx={{ position: "relative", mb: 2 }}>
            <Avatar
              sx={{
                width: 90,
                height: 90,
                bgcolor: "#FFEDFA",
                fontSize: 36,
                fontWeight: "bold",
                boxShadow: "0 8px 24px rgba(255, 184, 224, 0.4)",
                border: "4px solid rgba(255,255,255,0.3)",
                color: "#BE5985",
              }}
            >
              {getInitial(me.name, me.email)}
            </Avatar>
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: 24,
                height: 24,
                borderRadius: "50%",
                bgcolor: "#AAB99A",
                border: "3px solid #BE5985",
              }}
            />
          </Box>

          <Typography
            variant="h6"
            sx={{ fontWeight: 700, textAlign: "center", mb: 0.5 }}
          >
            {me.name}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: "rgba(255,255,255,0.7)", mb: 1.5 }}
          >
            {me.email}
          </Typography>

          <Chip
            label={me.role}
            size="small"
            icon={
              me.role === "admin" ? <AdminPanelSettingsIcon /> : <WorkIcon />
            }
            sx={{
              bgcolor:
                me.role === "admin"
                  ? "rgba(255, 207, 179, 0.9)"
                  : "rgba(196, 217, 255, 0.9)",
              color: me.role === "admin" ? "#BE5985" : "#3674B5",
              fontWeight: 700,
              fontSize: "0.75rem",
              px: 1,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          />
        </Box>

        <Divider sx={{ mx: 2, my: 2, borderColor: "rgba(255,255,255,0.1)" }} />

        {/* Navigation Menu */}
        <List sx={{ px: 2 }}>
          <ListItem disablePadding sx={{ mb: 1.5 }}>
            <ListItemButton
              onClick={handleDashboardClick}
              sx={{
                borderRadius: 2,
                py: 1.5,
                transition: "all 0.3s ease",
                "&:hover": {
                  bgcolor: "rgba(255, 237, 250, 0.2)",
                  transform: "translateX(4px)",
                },
                bgcolor:
                  location.pathname === "/"
                    ? "rgba(255, 237, 250, 0.3)"
                    : "transparent",
              }}
            >
              <ListItemIcon sx={{ color: "white", minWidth: 44 }}>
                <DashboardIcon sx={{ fontSize: 24 }} />
              </ListItemIcon>
              <ListItemText
                primary="Dashboard 📊"
                primaryTypographyProps={{
                  fontWeight: 600,
                  fontSize: "0.95rem",
                }}
              />
            </ListItemButton>
          </ListItem>

          {me.role === "admin" && (
            <ListItem disablePadding sx={{ mb: 1.5 }}>
              <ListItemButton
                component={Link}
                to="/reports"
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    bgcolor: "rgba(255, 237, 250, 0.2)",
                    transform: "translateX(4px)",
                  },
                  bgcolor:
                    location.pathname === "/reports"
                      ? "rgba(255, 237, 250, 0.3)"
                      : "transparent",
                }}
              >
                <ListItemIcon sx={{ color: "white", minWidth: 44 }}>
                  <AssessmentIcon sx={{ fontSize: 24 }} />
                </ListItemIcon>
                <ListItemText
                  primary="Reports 📈"
                  primaryTypographyProps={{
                    fontWeight: 600,
                    fontSize: "0.95rem",
                  }}
                />
              </ListItemButton>
            </ListItem>
          )}

          <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.1)" }} />

          <ListItem disablePadding>
            <ListItemButton
              onClick={handleLogout}
              sx={{
                borderRadius: 2,
                py: 1.5,
                transition: "all 0.3s ease",
                "&:hover": {
                  bgcolor: "rgba(255, 184, 224, 0.2)",
                  transform: "translateX(4px)",
                },
              }}
            >
              <ListItemIcon sx={{ color: "#FFEDFA", minWidth: 44 }}>
                <LogoutIcon sx={{ fontSize: 24 }} />
              </ListItemIcon>
              <ListItemText
                primary="Logout 👋"
                primaryTypographyProps={{
                  fontWeight: 600,
                  fontSize: "0.95rem",
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>

        {/* Footer */}
        <Box sx={{ mt: "auto", p: 3, textAlign: "center" }}>
          <Divider sx={{ mb: 2, borderColor: "rgba(255,255,255,0.1)" }} />
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>
            © 2025 MyApp Platform ✨
          </Typography>
          <Typography
            variant="caption"
            sx={{ display: "block", color: "rgba(255,255,255,0.3)", mt: 0.5 }}
          >
            v1.0.0 💫
          </Typography>
        </Box>
      </Drawer>

      {/* Main content */}
      <Box component="main" sx={{ flexGrow: 1, minHeight: "100vh" }}>>
        {/* Dreamy Header */}
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            borderBottom: "1px solid rgba(236, 127, 169, 0.1)",
          }}
        >
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography
                variant="h5"
                sx={{ fontWeight: 800, color: "#BE5985", mr: 2 }}
              >
                {getGreeting()} {getTimeBasedEmoji()}
              </Typography>
              <Typography
                variant="h6"
                sx={{ fontWeight: 400, color: "#727D73" }}
              >
                {me.name?.split(" ")[0] || me.email}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography
                variant="body2"
                sx={{
                  color: "#727D73",
                  mr: 2,
                  display: { xs: "none", md: "block" },
                }}
              >
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
              </Typography>

              <Tooltip title="Notifications">
                <IconButton>
                  <Badge badgeContent={3} sx={{ "& .MuiBadge-badge": { bgcolor: "#EC7FA9" } }}>
                    <NotificationsIcon sx={{ color: "#BE5985" }} />
                  </Badge>
                </IconButton>
              </Tooltip>

              <Tooltip title="Settings">
                <IconButton>
                  <SettingsIcon sx={{ color: "#BE5985" }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Toolbar>
        </AppBar>

        <Toolbar />

        {/* Dashboard Content */}
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4, px: 3 }}>
          {me.role === "admin" ? (
            loading ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: 500,
                  flexDirection: "column",
                }}
              >
                <CircularProgress size={70} thickness={4} sx={{ mb: 3, color: "#EC7FA9" }} />
                <Typography variant="h6" sx={{ color: "#727D73" }}>
                  Loading dashboard analytics... ✨
                </Typography>
              </Box>
            ) : (
              <Box>
                {/* Welcome Banner */}
                <Paper
                  elevation={0}
                  sx={{
                    background:
                      "linear-gradient(135deg, #FFB8E0 0%, #EC7FA9 100%)",
                    borderRadius: 4,
                    p: 4,
                    mb: 4,
                    color: "white",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <Box sx={{ position: "relative", zIndex: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Typography variant="h3" sx={{ mr: 2 }}>👋</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        Welcome back, {me.name?.split(" ")[0]}!
                      </Typography>
                    </Box>
                    <Typography
                      variant="body1"
                      sx={{ opacity: 0.95, maxWidth: 600 }}
                    >
                      ✨ Here's what's happening with your team today. You have{" "}
                      {counts.totalEmployees} total users and{" "}
                      {counts.recentLogins.length} recent activities. 💼
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      position: "absolute",
                      top: -50,
                      right: -50,
                      width: 200,
                      height: 200,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.15)",
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: -30,
                      right: 100,
                      width: 150,
                      height: 150,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.08)",
                    }}
                  />
                </Paper>

                {/* Enhanced Stats Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  {/* Total Users */}
                  <Grid item xs={12} sm={6} lg={3}>
                    <Card
                      elevation={0}
                      sx={{
                        background:
                          "linear-gradient(135deg, #C5BAFF 0%, #C4D9FF 100%)",
                        color: "#3674B5",
                        borderRadius: 4,
                        overflow: "hidden",
                        position: "relative",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-8px)",
                          boxShadow: "0 12px 24px rgba(197, 186, 255, 0.3)",
                        },
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            mb: 2,
                          }}
                        >
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{ opacity: 0.9, mb: 0.5, fontWeight: 500 }}
                            >
                              Total Users 👥
                            </Typography>
                            <Typography variant="h3" sx={{ fontWeight: 800 }}>
                              {counts.totalEmployees}
                            </Typography>
                          </Box>
                          <Avatar
                            sx={{
                              bgcolor: "rgba(255,255,255,0.4)",
                              width: 56,
                              height: 56,
                            }}
                          >
                            <GroupIcon sx={{ fontSize: 28, color: "#3674B5" }} />
                          </Avatar>
                        </Box>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 600 }}>
                            📊 {counts.employeeCount} Employees, {counts.adminCount} Admins
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Active Sessions */}
                  <Grid item xs={12} sm={6} lg={3}>
                    <Card
                      elevation={0}
                      sx={{
                        background:
                          "linear-gradient(135deg, #FAD0C4 0%, #E6B2BA 100%)",
                        color: "#BE5985",
                        borderRadius: 4,
                        overflow: "hidden",
                        position: "relative",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-8px)",
                          boxShadow: "0 12px 24px rgba(250, 208, 196, 0.3)",
                        },
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            mb: 2,
                          }}
                        >
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{ opacity: 0.9, mb: 0.5, fontWeight: 500 }}
                            >
                              Recent Activities 🎯
                            </Typography>
                            <Typography variant="h3" sx={{ fontWeight: 800 }}>
                              {counts.recentLogins.length}
                            </Typography>
                          </Box>
                          <Avatar
                            sx={{
                              bgcolor: "rgba(255,255,255,0.4)",
                              width: 56,
                              height: 56,
                            }}
                          >
                            <AccessTimeIcon sx={{ fontSize: 28, color: "#BE5985" }} />
                          </Avatar>
                        </Box>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 600 }}>
                            ⏰ Last 24 hours
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Engagement Rate */}
                  <Grid item xs={12} sm={6} lg={3}>
                    <Card
                      elevation={0}
                      sx={{
                        background:
                          "linear-gradient(135deg, #E8F9FF 0%, #C4D9FF 100%)",
                        color: "#3674B5",
                        borderRadius: 4,
                        overflow: "hidden",
                        position: "relative",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-8px)",
                          boxShadow: "0 12px 24px rgba(232, 249, 255, 0.3)",
                        },
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            mb: 2,
                          }}
                        >
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              variant="body2"
                              sx={{ opacity: 0.9, mb: 0.5, fontWeight: 500 }}
                            >
                              Engagement Rate 📈
                            </Typography>
                            <Typography
                              variant="h3"
                              sx={{ fontWeight: 800, mb: 1 }}
                            >
                              {Math.round(
                                (counts.recentLogins.length /
                                  counts.totalEmployees) *
                                  100
                              ) || 0}
                              %
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={
                                Math.round(
                                  (counts.recentLogins.length /
                                    counts.totalEmployees) *
                                    100
                                ) || 0
                              }
                              sx={{
                                height: 8,
                                borderRadius: 4,
                                bgcolor: "rgba(54, 116, 181, 0.2)",
                                "& .MuiLinearProgress-bar": {
                                  bgcolor: "#3674B5",
                                  borderRadius: 4,
                                },
                              }}
                            />
                          </Box>
                          <Avatar
                            sx={{
                              bgcolor: "rgba(54, 116, 181, 0.2)",
                              width: 56,
                              height: 56,
                              ml: 2,
                            }}
                          >
                            <BarChartIcon sx={{ fontSize: 28, color: "#3674B5" }} />
                          </Avatar>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Team Performance */}
                  <Grid item xs={12} sm={6} lg={3}>
                    <Card
                      elevation={0}
                      sx={{
                        background:
                          "linear-gradient(135deg, #AAB99A 0%, #727D73 100%)",
                        color: "white",
                        borderRadius: 4,
                        overflow: "hidden",
                        position: "relative",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-8px)",
                          boxShadow: "0 12px 24px rgba(170, 185, 154, 0.3)",
                        },
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            mb: 2,
                          }}
                        >
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{ opacity: 0.9, mb: 0.5, fontWeight: 500 }}
                            >
                              Team Score 🌟
                            </Typography>
                            <Typography variant="h3" sx={{ fontWeight: 800 }}>
                              9.2
                            </Typography>
                          </Box>
                          <Avatar
                            sx={{
                              bgcolor: "rgba(255,255,255,0.2)",
                              width: 56,
                              height: 56,
                            }}
                          >
                            <TimelineIcon sx={{ fontSize: 28 }} />
                          </Avatar>
                        </Box>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 600 }}>
                            📊 +12% from last week
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                <Grid container spacing={3}>
                  {/* Recent Activity */}
                  <Grid item xs={12} lg={8}>
                    <Paper
                      elevation={0}
                      sx={{
                        borderRadius: 4,
                        p: 3,
                        border: "1px solid #FFEDFA",
                        background: "white",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          mb: 3,
                        }}
                      >
                        <Box>
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 700, color: "#BE5985", mb: 0.5 }}
                          >
                            Recent Employee Activity 👥
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: "#727D73" }}
                          >
                            Latest login activities from your team ✨
                          </Typography>
                        </Box>
                        <Chip
                          label={`${counts.recentLogins.length} Active 🟢`}
                          size="small"
                          sx={{
                            bgcolor: "#E8F9FF",
                            color: "#3674B5",
                            fontWeight: 600,
                          }}
                        />
                      </Box>

                      {counts.recentLogins.length > 0 ? (
                        <Box>
                                                  {counts.recentLogins.map((user, index) => (
                            <Box
                              key={user.id || user.email}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                py: 2.5,
                                px: 2,
                                mb: 1,
                                borderRadius: 3,
                                transition: "all 0.2s ease",
                                "&:hover": {
                                  bgcolor: "#FFEDFA",
                                  transform: "translateX(8px)",
                                  boxShadow: "0 4px 12px rgba(236, 127, 169, 0.1)",
                                },
                                borderBottom:
                                  index < counts.recentLogins.length - 1
                                    ? "1px solid #FFEDFA"
                                    : "none",
                              }}
                            >
                              <Box sx={{ position: "relative" }}>
                                <Avatar
                                  sx={{
                                    width: 52,
                                    height: 52,
                                    mr: 2.5,
                                    background:
                                      "linear-gradient(135deg, #FFB8E0 0%, #EC7FA9 100%)",
                                    fontWeight: 700,
                                    fontSize: "1.1rem",
                                  }}
                                >
                                  {getInitial(user.name, user.email)}
                                </Avatar>
                                <Box
                                  sx={{
                                    position: "absolute",
                                    bottom: 2,
                                    right: 22,
                                    width: 14,
                                    height: 14,
                                    borderRadius: "50%",
                                    bgcolor: "#AAB99A",
                                    border: "2px solid white",
                                  }}
                                />
                              </Box>

                              <Box sx={{ flexGrow: 1 }}>
                                <Typography
                                  variant="body1"
                                  sx={{
                                    fontWeight: 700,
                                    color: "#BE5985",
                                    mb: 0.5,
                                  }}
                                >
                                  {user.name || user.email}
                                </Typography>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  <Chip
                                    label={user.role === "admin" ? "Admin 👑" : "Employee 💼"}
                                    size="small"
                                    icon={
                                      user.role === "admin" ? (
                                        <AdminPanelSettingsIcon />
                                      ) : (
                                        <WorkIcon />
                                      )
                                    }
                                    sx={{
                                      height: 20,
                                      fontSize: "0.7rem",
                                      bgcolor:
                                        user.role === "admin"
                                          ? "#FFCFB3"
                                          : "#C4D9FF",
                                      color:
                                        user.role === "admin"
                                          ? "#BE5985"
                                          : "#3674B5",
                                      fontWeight: 600,
                                    }}
                                  />
                                  <Typography
                                    variant="caption"
                                    sx={{ color: "#727D73" }}
                                  >
                                    •{" "}
                                    {user.last_login
                                      ? new Date(
                                          user.last_login
                                        ).toLocaleString()
                                      : "Never"}
                                  </Typography>
                                </Box>
                              </Box>

                              <Chip
                                label="Online ✨"
                                size="small"
                                sx={{
                                  bgcolor: "#E8F9FF",
                                  color: "#3674B5",
                                  fontWeight: 700,
                                  fontSize: "0.7rem",
                                }}
                              />
                            </Box>
                          ))}
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            textAlign: "center",
                            py: 8,
                            color: "#727D73",
                          }}
                        >
                          <Typography variant="h2" sx={{ mb: 2 }}>
                            👥
                          </Typography>
                          <Typography variant="h6" sx={{ mb: 1 }}>
                            No Recent Activity
                          </Typography>
                          <Typography variant="body2">
                            No employee logins recorded yet 💤
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  </Grid>

                  {/* Quick Stats Sidebar */}
                  <Grid item xs={12} lg={4}>
                    {/* Weather Card */}
                    {!weatherLoading && weather && (
                      <Paper
                        elevation={0}
                        sx={{
                          borderRadius: 4,
                          p: 3,
                          mb: 3,
                          background:
                            "linear-gradient(135deg, #C4D9FF 0%, #E8F9FF 100%)",
                          color: "#3674B5",
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        <Box sx={{ position: "relative", zIndex: 1 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              mb: 2,
                            }}
                          >
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                              Weather {getWeatherEmoji(weather.code)}
                            </Typography>
                            {getWeatherIcon(weather.code)}
                          </Box>
                          <Typography variant="h2" sx={{ fontWeight: 800, mb: 1 }}>
                            {weather.temp}°C
                          </Typography>
                          <Typography variant="body1" sx={{ opacity: 0.9, mb: 2, fontWeight: 600 }}>
                            {getWeatherDescription(weather.code)}
                          </Typography>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <AirIcon sx={{ fontSize: 20 }} />
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>
                              Wind: {weather.windSpeed} km/h 💨
                            </Typography>
                          </Box>
                        </Box>
                        <Box
                          sx={{
                            position: "absolute",
                            bottom: -30,
                            right: -30,
                            width: 120,
                            height: 120,
                            borderRadius: "50%",
                            background: "rgba(255,255,255,0.3)",
                          }}
                        />
                      </Paper>
                    )}

                    <Paper
                      elevation={0}
                      sx={{
                        borderRadius: 4,
                        p: 3,
                        border: "1px solid #FFEDFA",
                        background: "white",
                        mb: 3,
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, color: "#BE5985", mb: 3 }}
                      >
                        Quick Overview 📊
                      </Typography>

                      <Box sx={{ mb: 3 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 1,
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ color: "#727D73", fontWeight: 600 }}
                          >
                            Admins 👑
                          </Typography>
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 700, color: "#BE5985" }}
                          >
                            {counts.adminCount}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={
                            (counts.adminCount / counts.totalEmployees) * 100
                          }
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: "#FFEDFA",
                            "& .MuiLinearProgress-bar": {
                              bgcolor: "#FFCFB3",
                              borderRadius: 4,
                            },
                          }}
                        />
                      </Box>

                      <Box sx={{ mb: 3 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 1,
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ color: "#727D73", fontWeight: 600 }}
                          >
                            Employees 💼
                          </Typography>
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 700, color: "#3674B5" }}
                          >
                            {counts.employeeCount}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={
                            (counts.employeeCount / counts.totalEmployees) * 100
                          }
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: "#E8F9FF",
                            "& .MuiLinearProgress-bar": {
                              bgcolor: "#C4D9FF",
                              borderRadius: 4,
                            },
                          }}
                        />
                      </Box>

                      <Box sx={{ mb: 3 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 1,
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ color: "#727D73", fontWeight: 600 }}
                          >
                            Active Now ⚡
                          </Typography>
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 700, color: "#AAB99A" }}
                          >
                            {counts.recentLogins.length}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={
                            (counts.recentLogins.length /
                              counts.totalEmployees) *
                            100
                          }
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: "#FBFBFB",
                            "& .MuiLinearProgress-bar": {
                              bgcolor: "#AAB99A",
                              borderRadius: 4,
                            },
                          }}
                        />
                      </Box>

                      <Divider sx={{ my: 3 }} />

                      <Box>
                        <Typography
                          variant="caption"
                          sx={{ color: "#727D73", display: "block", mb: 2 }}
                        >
                          System Status 🔧
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            mb: 2,
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                bgcolor: "#AAB99A",
                                mr: 1.5,
                              }}
                            />
                            <Typography
                              variant="body2"
                              sx={{ color: "#727D73" }}
                            >
                              All Systems Operational ✅
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Paper>

                    {/* Calendar Widget */}
                    <Paper
                      elevation={0}
                      sx={{
                        borderRadius: 4,
                        p: 3,
                        background:
                          "linear-gradient(135deg, #FFB8E0 0%, #EC7FA9 100%)",
                        color: "white",
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 2 }}
                      >
                        <Typography variant="h3" sx={{ mr: 1.5 }}>📅</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          Today's Date
                        </Typography>
                      </Box>
                      <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                        {new Date().getDate()}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        {new Date().toLocaleDateString("en-US", {
                          month: "long",
                          year: "numeric",
                        })}
                      </Typography>
                      <Divider
                        sx={{ my: 2, borderColor: "rgba(255,255,255,0.2)" }}
                      />
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        {new Date().toLocaleDateString("en-US", {
                          weekday: "long",
                        })} ✨
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            )
          ) : (
            /* Employee Dashboard */
            <Box>
              {/* Welcome Banner for Employee */}
              <Paper
                elevation={0}
                sx={{
                  background:
                    "linear-gradient(135deg, #C5BAFF 0%, #C4D9FF 100%)",
                  borderRadius: 4,
                  p: 4,
                  mb: 4,
                  color: "#3674B5",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <Box sx={{ position: "relative", zIndex: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Typography variant="h3" sx={{ mr: 2 }}>👋</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      Welcome back, {me.name}!
                    </Typography>
                  </Box>
                  <Typography
                    variant="body1"
                    sx={{ opacity: 0.95, maxWidth: 600 }}
                  >
                    Hope you're having a productive day. Your profile is all set
                    up and ready to go. ✨💼
                  </Typography>
                </Box>

                <Box
                  sx={{
                    position: "absolute",
                    top: -50,
                    right: -50,
                    width: 200,
                    height: 200,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.15)",
                  }}
                />
              </Paper>

              {/* Employee Profile Cards */}
              <Grid container spacing={3}>
                {/* Weather Card for Employee */}
                {!weatherLoading && weather && (
                  <Grid item xs={12} md={4}>
                    <Card
                      elevation={0}
                      sx={{
                        borderRadius: 4,
                        background:
                          "linear-gradient(135deg, #C4D9FF 0%, #E8F9FF 100%)",
                        color: "#3674B5",
                        p: 3,
                        height: "100%",
                        position: "relative",
                        overflow: "hidden",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-8px)",
                          boxShadow: "0 12px 24px rgba(196, 217, 255, 0.3)",
                        },
                      }}
                    >
                      <Box sx={{ position: "relative", zIndex: 1 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            mb: 2,
                          }}
                        >
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            Weather {getWeatherEmoji(weather.code)}
                          </Typography>
                          {getWeatherIcon(weather.code)}
                        </Box>
                        <Typography variant="h2" sx={{ fontWeight: 800, mb: 1 }}>
                          {weather.temp}°C
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9, mb: 2, fontWeight: 600 }}>
                          {getWeatherDescription(weather.code)}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <AirIcon sx={{ fontSize: 20 }} />
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            Wind: {weather.windSpeed} km/h 💨
                          </Typography>
                        </Box>
                      </Box>
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: -30,
                          right: -30,
                          width: 120,
                          height: 120,
                          borderRadius: "50%",
                          background: "rgba(255,255,255,0.3)",
                        }}
                      />
                    </Card>
                  </Grid>
                )}

                <Grid item xs={12} md={weatherLoading || !weather ? 4 : 4}>
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: 4,
                      border: "1px solid #FFEDFA",
                      textAlign: "center",
                      p: 4,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: "0 12px 24px rgba(255, 184, 224, 0.2)",
                      },
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 100,
                        height: 100,
                        margin: "0 auto",
                        mb: 2,
                        background:
                          "linear-gradient(135deg, #FFB8E0 0%, #EC7FA9 100%)",
                        fontSize: 42,
                        fontWeight: 700,
                      }}
                    >
                      {getInitial(me.name, me.email)}
                    </Avatar>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 700, color: "#BE5985", mb: 1 }}
                    >
                      {me.name}
                    </Typography>
                    <Chip
                      label={`${me.role} 💼`}
                      icon={<WorkIcon />}
                      sx={{
                        bgcolor: "#C4D9FF",
                        color: "#3674B5",
                        fontWeight: 600,
                      }}
                    />
                  </Card>
                </Grid>

                <Grid item xs={12} md={weatherLoading || !weather ? 8 : 4}>
                  <Paper
                    elevation={0}
                    sx={{
                      borderRadius: 4,
                      border: "1px solid #FFEDFA",
                      p: 4,
                      height: "100%",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, color: "#BE5985", mb: 3 }}
                    >
                      Profile Information 📋
                    </Typography>

                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <Box
                          sx={{
                            p: 2.5,
                            bgcolor: "#FFEDFA",
                            borderRadius: 3,
                            border: "1px solid #FFB8E0",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 1,
                            }}
                          >
                            <Typography variant="h5" sx={{ mr: 1 }}>👤</Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: "#727D73", fontWeight: 600 }}
                            >
                              Full Name
                            </Typography>
                          </Box>
                          <Typography
                            variant="body1"
                            sx={{ fontWeight: 700, color: "#BE5985" }}
                          >
                            {me.name}
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Box
                          sx={{
                            p: 2.5,
                            bgcolor: "#E8F9FF",
                            borderRadius: 3,
                            border: "1px solid #C4D9FF",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 1,
                            }}
                          >
                            <Typography variant="h5" sx={{ mr: 1 }}>💼</Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: "#727D73", fontWeight: 600 }}
                            >
                              Role
                            </Typography>
                          </Box>
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: 700,
                              color: "#3674B5",
                              textTransform: "capitalize",
                            }}
                          >
                            {me.role}
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid item xs={12}>
                        <Box
                          sx={{
                            p: 2.5,
                            bgcolor: "#FFEDFA",
                            borderRadius: 3,
                            border: "1px solid #FFB8E0",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 1,
                            }}
                          >
                            <Typography variant="h5" sx={{ mr: 1 }}>📧</Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: "#727D73", fontWeight: 600 }}
                            >
                              Email Address
                            </Typography>
                          </Box>
                          <Typography
                            variant="body1"
                            sx={{ fontWeight: 700, color: "#BE5985" }}
                          >
                            {me.email}
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid item xs={12}>
                        <Box
                          sx={{
                            p: 2.5,
                            bgcolor: "#E8F9FF",
                            borderRadius: 3,
                            border: "1px solid #C4D9FF",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 1,
                            }}
                          >
                            <Typography variant="h5" sx={{ mr: 1 }}>⏰</Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: "#727D73", fontWeight: 600 }}
                            >
                              Last Login
                            </Typography>
                          </Box>
                          <Typography
                            variant="body1"
                            sx={{ fontWeight: 700, color: "#3674B5" }}
                          >
                            {me.last_login
                              ? new Date(me.last_login).toLocaleString()
                              : "First time login 🎉"}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                {/* Additional Employee Cards */}
                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      background:
                        "linear-gradient(135deg, #FAD0C4 0%, #E6B2BA 100%)",
                      borderRadius: 4,
                      p: 3,
                      color: "#BE5985",
                      height: "100%",
                    }}
                  >
                    <Typography variant="h2" sx={{ mb: 2 }}>✅</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                      Account Status
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 2, fontWeight: 500 }}>
                      Your account is active and all systems are operational. ✨
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          bgcolor: "#AAB99A",
                          mr: 1,
                        }}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Active 🟢
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      background:
                        "linear-gradient(135deg, #C5BAFF 0%, #C4D9FF 100%)",
                      borderRadius: 4,
                      p: 3,
                      color: "#3674B5",
                      height: "100%",
                    }}
                  >
                    <Typography variant="h2" sx={{ mb: 2 }}>📅</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                      Today's Date
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                      {new Date().toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
                      {new Date().toLocaleDateString("en-US", {
                        weekday: "long",
                      })} ✨
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
        </Container>
      </Box>
    </Box>
  );
}