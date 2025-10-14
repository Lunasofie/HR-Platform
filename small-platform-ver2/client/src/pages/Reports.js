import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  TableSortLabel,
  Drawer,
  Toolbar,
  Avatar,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  AppBar,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Badge,
  Tooltip,
  Divider,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import { Link, useNavigate, useLocation } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AssessmentIcon from "@mui/icons-material/Assessment";
import LogoutIcon from "@mui/icons-material/Logout";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import SearchIcon from "@mui/icons-material/Search";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import WorkIcon from "@mui/icons-material/Work";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SettingsIcon from "@mui/icons-material/Settings";
import FilterListIcon from "@mui/icons-material/FilterList";
import GetAppIcon from "@mui/icons-material/GetApp";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import TableChartIcon from "@mui/icons-material/TableChart";
import GroupIcon from "@mui/icons-material/Group";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

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

export default function Reports({ me, token, onLogout }) {
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [orderBy, setOrderBy] = useState("name");
  const [order, setOrder] = useState("asc");
  const navigate = useNavigate();
  const location = useLocation();
  const [downloading, setDownloading] = useState({ csv: false, pdf: false });

  useEffect(() => {
    if (!me || !token) {
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);

    (async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API || "http://localhost:4000"}/api/users`,
          { headers: { Authorization: "Bearer " + token } }
        );
        if (!res.ok) throw new Error(`Fetch failed with status ${res.status}`);
        const data = await res.json();
        if (mounted) {
          setRows(data);
          setFilteredRows(data);
        }
      } catch (e) {
        console.error("Fetch error:", e);
        if (mounted) setError("Failed to load users.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [me, token]);

  useEffect(() => {
    const filtered = rows.filter(
      (row) =>
        row.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.role.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredRows(filtered);
  }, [searchQuery, rows]);

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);

    const sorted = [...filteredRows].sort((a, b) => {
      if (property === "last_login") {
        const dateA = a[property] ? new Date(a[property]) : new Date(0);
        const dateB = b[property] ? new Date(b[property]) : new Date(0);
        return isAsc ? dateA - dateB : dateB - dateA;
      }
      return isAsc
        ? a[property].localeCompare(b[property])
        : b[property].localeCompare(a[property]);
    });
    setFilteredRows(sorted);
  };

  const handleLogout = () => {
    if (onLogout) onLogout();
    navigate("/login");
  };

  const handleDashboardClick = () => {
    navigate("/", { replace: true });
  };

  const downloadFile = async (endpoint, filename, type) => {
    if (!token) return;

    setDownloading((prev) => ({ ...prev, [type]: true }));

    try {
      const res = await fetch(
        `${process.env.REACT_APP_API || "http://localhost:4000"}${endpoint}`,
        {
          headers: { Authorization: "Bearer " + token },
        }
      );

      if (!res.ok) throw new Error(`Download failed with status ${res.status}`);

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      // Success notification (optional - you can add a snackbar here)
      console.log(`✅ ${type.toUpperCase()} downloaded successfully!`);
    } catch (e) {
      console.error("Download failed:", e);
      alert(`Failed to download ${type.toUpperCase()}. Please try again.`);
    } finally {
      setDownloading((prev) => ({ ...prev, [type]: false }));
    }
  };

  if (!me) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <Paper
          elevation={24}
          sx={{ p: 4, borderRadius: 4, textAlign: "center" }}
        >
          <CircularProgress size={60} thickness={4} sx={{ mb: 2 }} />
          <Typography variant="h6" sx={{ color: "#666" }}>
            Loading user data...
          </Typography>
        </Paper>
      </Box>
    );
  }

  const adminCount = rows.filter((u) => u.role === "admin").length;
  const employeeCount = rows.filter((u) => u.role === "employee").length;
  const recentLoginCount = rows.filter((u) => u.last_login).length;

  return (
    <Box
      sx={{ display: "flex", backgroundColor: "#f0f4f8", minHeight: "100vh" }}
    >
      {/* Enhanced Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            background:
              "linear-gradient(180deg, #1a1f3a 0%, #2d3561 50%, #1a1f3a 100%)",
            color: "white",
            borderRight: "none",
            boxShadow: "4px 0 24px rgba(0,0,0,0.12)",
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
          }}
        >
          <Box sx={{ position: "relative", mb: 2 }}>
            <Avatar
              sx={{
                width: 90,
                height: 90,
                bgcolor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                fontSize: 36,
                fontWeight: "bold",
                boxShadow: "0 8px 24px rgba(102, 126, 234, 0.4)",
                border: "4px solid rgba(255,255,255,0.2)",
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
                bgcolor: "#10b981",
                border: "3px solid #1a1f3a",
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
            icon={<AdminPanelSettingsIcon />}
            sx={{
              bgcolor: "rgba(251, 191, 36, 0.9)",
              color: "#fff",
              fontWeight: 700,
              fontSize: "0.75rem",
              px: 1,
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
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
                  bgcolor: "rgba(102, 126, 234, 0.2)",
                  transform: "translateX(4px)",
                },
              }}
            >
              <ListItemIcon sx={{ color: "white", minWidth: 44 }}>
                <DashboardIcon sx={{ fontSize: 24 }} />
              </ListItemIcon>
              <ListItemText
                primary="Dashboard"
                primaryTypographyProps={{
                  fontWeight: 600,
                  fontSize: "0.95rem",
                }}
              />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding sx={{ mb: 1.5 }}>
            <ListItemButton
              component={Link}
              to="/reports"
              sx={{
                borderRadius: 2,
                py: 1.5,
                transition: "all 0.3s ease",
                "&:hover": {
                  bgcolor: "rgba(102, 126, 234, 0.2)",
                  transform: "translateX(4px)",
                },
                bgcolor: "rgba(102, 126, 234, 0.3)",
              }}
            >
              <ListItemIcon sx={{ color: "white", minWidth: 44 }}>
                <AssessmentIcon sx={{ fontSize: 24 }} />
              </ListItemIcon>
              <ListItemText
                primary="Reports"
                primaryTypographyProps={{
                  fontWeight: 600,
                  fontSize: "0.95rem",
                }}
              />
            </ListItemButton>
          </ListItem>

          <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.1)" }} />

          <ListItem disablePadding>
            <ListItemButton
              onClick={handleLogout}
              sx={{
                borderRadius: 2,
                py: 1.5,
                transition: "all 0.3s ease",
                "&:hover": {
                  bgcolor: "rgba(239, 68, 68, 0.2)",
                  transform: "translateX(4px)",
                },
              }}
            >
              <ListItemIcon sx={{ color: "#ef4444", minWidth: 44 }}>
                <LogoutIcon sx={{ fontSize: 24 }} />
              </ListItemIcon>
              <ListItemText
                primary="Logout"
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
            © 2025 MyApp Platform
          </Typography>
          <Typography
            variant="caption"
            sx={{ display: "block", color: "rgba(255,255,255,0.3)", mt: 0.5 }}
          >
            v1.0.0
          </Typography>
        </Box>
      </Drawer>

      {/* Main content */}
      <Box component="main" sx={{ flexGrow: 1, minHeight: "100vh" }}>
        {/* Enhanced Header */}
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            borderBottom: "1px solid rgba(0,0,0,0.08)",
          }}
        >
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography
                variant="h5"
                sx={{ fontWeight: 800, color: "#1e293b", mr: 2 }}
              >
                {getGreeting()} {getTimeBasedEmoji()}
              </Typography>
              <Typography
                variant="h6"
                sx={{ fontWeight: 400, color: "#64748b" }}
              >
                {me.name?.split(" ")[0] || me.email}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography
                variant="body2"
                sx={{
                  color: "#64748b",
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
                  <Badge badgeContent={3} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </Tooltip>

              <Tooltip title="Settings">
                <IconButton>
                  <SettingsIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Toolbar>
        </AppBar>

        <Toolbar />

        <Container maxWidth="xl" sx={{ mt: 4, mb: 4, px: 3 }}>
          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 500,
                flexDirection: "column",
              }}
            >
              <CircularProgress size={70} thickness={4} sx={{ mb: 3 }} />
              <Typography variant="h6" sx={{ color: "#64748b" }}>
                Loading employee reports...
              </Typography>
            </Box>
          ) : error ? (
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 4,
                textAlign: "center",
                border: "1px solid #fecaca",
              }}
            >
              <Typography color="error" variant="h6">
                {error}
              </Typography>
            </Paper>
          ) : (
            <Box>
              {/* Stats Overview */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card
                    elevation={0}
                    sx={{
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      color: "white",
                      borderRadius: 4,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: "0 12px 24px rgba(102, 126, 234, 0.3)",
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{ opacity: 0.9, mb: 0.5, fontWeight: 500 }}
                          >
                            Total Users
                          </Typography>
                          <Typography variant="h3" sx={{ fontWeight: 800 }}>
                            {rows.length}
                          </Typography>
                        </Box>
                        <Avatar
                          sx={{
                            bgcolor: "rgba(255,255,255,0.2)",
                            width: 56,
                            height: 56,
                          }}
                        >
                          <GroupIcon sx={{ fontSize: 28 }} />
                        </Avatar>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card
                    elevation={0}
                    sx={{
                      background:
                        "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                      color: "white",
                      borderRadius: 4,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: "0 12px 24px rgba(240, 147, 251, 0.3)",
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{ opacity: 0.9, mb: 0.5, fontWeight: 500 }}
                          >
                            Admins
                          </Typography>
                          <Typography variant="h3" sx={{ fontWeight: 800 }}>
                            {adminCount}
                          </Typography>
                        </Box>
                        <Avatar
                          sx={{
                            bgcolor: "rgba(255,255,255,0.2)",
                            width: 56,
                            height: 56,
                          }}
                        >
                          <AdminPanelSettingsIcon sx={{ fontSize: 28 }} />
                        </Avatar>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card
                    elevation={0}
                    sx={{
                      background:
                        "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                      color: "white",
                      borderRadius: 4,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: "0 12px 24px rgba(79, 172, 254, 0.3)",
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{ opacity: 0.9, mb: 0.5, fontWeight: 500 }}
                          >
                            Employees
                          </Typography>
                          <Typography variant="h3" sx={{ fontWeight: 800 }}>
                            {employeeCount}
                          </Typography>
                        </Box>
                        <Avatar
                          sx={{
                            bgcolor: "rgba(255,255,255,0.2)",
                            width: 56,
                            height: 56,
                          }}
                        >
                          <WorkIcon sx={{ fontSize: 28 }} />
                        </Avatar>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card
                    elevation={0}
                    sx={{
                      background:
                        "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                      color: "white",
                      borderRadius: 4,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: "0 12px 24px rgba(67, 233, 123, 0.3)",
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{ opacity: 0.9, mb: 0.5, fontWeight: 500 }}
                          >
                            Active
                          </Typography>
                          <Typography variant="h3" sx={{ fontWeight: 800 }}>
                            {recentLoginCount}
                          </Typography>
                        </Box>
                        <Avatar
                          sx={{
                            bgcolor: "rgba(255,255,255,0.2)",
                            width: 56,
                            height: 56,
                          }}
                        >
                          <TrendingUpIcon sx={{ fontSize: 28 }} />
                        </Avatar>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Main Reports Table */}
              <Paper
                elevation={0}
                sx={{ borderRadius: 4, p: 3, border: "1px solid #e2e8f0" }}
              >
                {/* Header with Search and Export */}
                <Box sx={{ mb: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 3,
                    }}
                  >
                    <Box>
                      <Typography
                        variant="h5"
                        sx={{ fontWeight: 800, color: "#1e293b", mb: 0.5 }}
                      >
                        Employee Directory
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#64748b" }}>
                        Complete list of all users • {filteredRows.length}{" "}
                        results
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1.5}>
                      <Button
                        variant="outlined"
                        onClick={() =>
                          downloadFile(
                            "/api/reports/employees.csv",
                            `employees_report_${
                              new Date().toISOString().split("T")[0]
                            }.csv`,
                            "csv"
                          )
                        }
                        disabled={downloading.csv}
                        startIcon={
                          downloading.csv ? (
                            <CircularProgress size={20} />
                          ) : (
                            <TableChartIcon />
                          )
                        }
                        sx={{
                          borderColor: "#667eea",
                          color: "#667eea",
                          "&:hover": {
                            borderColor: "#5568d3",
                            bgcolor: "#f0f4ff",
                          },
                          "&:disabled": {
                            borderColor: "#cbd5e1",
                          },
                          textTransform: "none",
                          fontWeight: 700,
                          borderRadius: 2,
                          px: 3,
                        }}
                      >
                        {downloading.csv ? "Downloading..." : "CSV"}
                      </Button>
                      <Button
                        variant="contained"
                        onClick={() =>
                          downloadFile(
                            "/api/reports/employees.pdf",
                            `employees_report_${
                              new Date().toISOString().split("T")[0]
                            }.pdf`,
                            "pdf"
                          )
                        }
                        disabled={downloading.pdf}
                        startIcon={
                          downloading.pdf ? (
                            <CircularProgress
                              size={20}
                              sx={{ color: "white" }}
                            />
                          ) : (
                            <PictureAsPdfIcon />
                          )
                        }
                        sx={{
                          textTransform: "none",
                          fontWeight: 700,
                          borderRadius: 2,
                          px: 3,
                          background:
                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          "&:hover": {
                            background:
                              "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
                          },
                          "&:disabled": {
                            background: "#cbd5e1",
                          },
                        }}
                      >
                        {downloading.pdf ? "Downloading..." : "PDF"}
                      </Button>
                    </Stack>
                  </Box>

                  <TextField
                    fullWidth
                    placeholder="Search by name, email, or role..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: "#94a3b8" }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                        bgcolor: "#f8fafc",
                        "& fieldset": {
                          borderColor: "#e2e8f0",
                        },
                        "&:hover fieldset": {
                          borderColor: "#cbd5e1",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#667eea",
                        },
                      },
                    }}
                  />
                </Box>

                {/* Enhanced Table */}
                <TableContainer>
                  <Table
                    sx={{ borderCollapse: "separate", borderSpacing: "0 8px" }}
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell sx={headerCellStyle}>
                          <TableSortLabel
                            active={orderBy === "name"}
                            direction={orderBy === "name" ? order : "asc"}
                            onClick={() => handleSort("name")}
                            sx={{ fontWeight: 700 }}
                          >
                            Employee
                          </TableSortLabel>
                        </TableCell>
                        <TableCell sx={headerCellStyle}>Contact</TableCell>
                        <TableCell sx={headerCellStyle}>
                          <TableSortLabel
                            active={orderBy === "role"}
                            direction={orderBy === "role" ? order : "asc"}
                            onClick={() => handleSort("role")}
                            sx={{ fontWeight: 700 }}
                          >
                            Role
                          </TableSortLabel>
                        </TableCell>
                        <TableCell sx={headerCellStyle}>
                          <TableSortLabel
                            active={orderBy === "last_login"}
                            direction={orderBy === "last_login" ? order : "asc"}
                            onClick={() => handleSort("last_login")}
                            sx={{ fontWeight: 700 }}
                          >
                            Last Login
                          </TableSortLabel>
                        </TableCell>
                        <TableCell sx={headerCellStyle}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredRows.length > 0 ? (
                        filteredRows.map((row) => (
                          <TableRow
                            key={row._id || row.id}
                            sx={{
                              bgcolor: "white",
                              transition: "all 0.2s ease",
                              "&:hover": {
                                transform: "translateY(-2px)",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                              },
                            }}
                          >
                            <TableCell sx={bodyCellStyle}>
                              <Box
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                <Box sx={{ position: "relative" }}>
                                  <Avatar
                                    sx={{
                                      width: 44,
                                      height: 44,
                                      mr: 2,
                                      background:
                                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                      fontSize: "1rem",
                                      fontWeight: 700,
                                    }}
                                  >
                                    {getInitial(row.name, row.email)}
                                  </Avatar>
                                  {row.last_login && (
                                    <Box
                                      sx={{
                                        position: "absolute",
                                        bottom: 0,
                                        right: 16,
                                        width: 12,
                                        height: 12,
                                        borderRadius: "50%",
                                        bgcolor: "#10b981",
                                        border: "2px solid white",
                                      }}
                                    />
                                  )}
                                </Box>
                                <Typography
                                  sx={{ fontWeight: 700, color: "#1e293b" }}
                                >
                                  {row.name}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell sx={bodyCellStyle}>
                              <Typography
                                sx={{ color: "#64748b", fontSize: "0.875rem" }}
                              >
                                {row.email}
                              </Typography>
                            </TableCell>
                            <TableCell sx={bodyCellStyle}>
                              <Chip
                                label={row.role}
                                size="small"
                                icon={
                                  row.role === "admin" ? (
                                    <AdminPanelSettingsIcon />
                                  ) : (
                                    <WorkIcon />
                                  )
                                }
                                sx={{
                                  bgcolor:
                                    row.role === "admin"
                                      ? "#fef3c7"
                                      : "#dbeafe",
                                  color:
                                    row.role === "admin"
                                      ? "#92400e"
                                      : "#1e40af",
                                  fontWeight: 700,
                                  fontSize: "0.75rem",
                                }}
                              />
                            </TableCell>
                            <TableCell sx={bodyCellStyle}>
                              <Typography
                                sx={{ color: "#64748b", fontSize: "0.875rem" }}
                              >
                                {row.last_login
                                  ? new Date(row.last_login).toLocaleString()
                                  : "Never"}
                              </Typography>
                            </TableCell>
                            <TableCell sx={bodyCellStyle}>
                              <Chip
                                label={row.last_login ? "Active" : "Inactive"}
                                size="small"
                                sx={{
                                  bgcolor: row.last_login
                                    ? "#d1fae5"
                                    : "#fee2e2",
                                  color: row.last_login ? "#065f46" : "#991b1b",
                                  fontWeight: 700,
                                  fontSize: "0.7rem",
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            align="center"
                            sx={{ py: 8, border: "none" }}
                          >
                            <SearchIcon
                              sx={{ fontSize: 64, color: "#cbd5e1", mb: 2 }}
                            />
                            <Typography
                              variant="h6"
                              sx={{ color: "#94a3b8", mb: 1 }}
                            >
                              No users found
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ color: "#cbd5e1" }}
                            >
                              Try adjusting your search query
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Box>
          )}
        </Container>
      </Box>
    </Box>
  );
}

const headerCellStyle = {
  fontWeight: 700,
  color: "#64748b",
  backgroundColor: "#f8fafc",
  borderBottom: "none",
  py: 2,
  px: 3,
  fontSize: "0.75rem",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
};

const bodyCellStyle = {
  borderBottom: "none",
  py: 2.5,
  px: 3,
  backgroundColor: "inherit",
};
