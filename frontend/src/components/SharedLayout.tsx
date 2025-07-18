import React, { useContext, useState, useCallback, memo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Box, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Avatar,
  Divider,
  useMediaQuery,
  useTheme,
  Container
} from '@mui/material';
import {
  Menu as MenuIcon,
  Chat as ChatIcon,
  Group as GroupIcon,
  SportsEsports as GamesIcon,
  Home as HomeIcon,
  ExitToApp as LogoutIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';

interface SharedLayoutProps {
  children: React.ReactNode;
}

// Memoized drawer item component
const DrawerItem = memo(({ 
  text, 
  icon, 
  path, 
  selected, 
  onClick 
}: { 
  text: string;
  icon: React.ReactNode;
  path: string;
  selected: boolean;
  onClick: () => void;
}) => {
  return (
    <ListItem disablePadding>
      <ListItemButton
        component={Link} 
        to={path}
        selected={selected}
        onClick={onClick}
        sx={{
          '&.Mui-selected': {
            backgroundColor: 'rgba(106, 140, 175, 0.12)',
            '&:hover': {
              backgroundColor: 'rgba(106, 140, 175, 0.18)',
            },
          },
          borderRadius: 1,
          mx: 1,
          mb: 0.5
        }}
      >
        <ListItemIcon sx={{ 
          color: selected ? 'primary.main' : 'inherit'
        }}>
          {icon}
        </ListItemIcon>
        <ListItemText 
          primary={text}
          primaryTypographyProps={{
            fontWeight: selected ? 600 : 400
          }}
        />
      </ListItemButton>
    </ListItem>
  );
});

const SharedLayout = memo(({ children }: SharedLayoutProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Memoized handlers
  const toggleDrawer = useCallback(() => {
    setDrawerOpen(prev => !prev);
  }, []);
  
  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  // Navigation items
  const navItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'Chat with Serenity', icon: <ChatIcon />, path: '/chat' },
    { text: 'Community', icon: <GroupIcon />, path: '/community' },
    { text: 'Activities & Games', icon: <GamesIcon />, path: '/games' },
  ];

  // Memoized drawer content
  const drawer = (
    <Box sx={{ width: 250 }} role="presentation">
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <Avatar sx={{ width: 60, height: 60, mb: 1, bgcolor: 'primary.main' }}>
          {user?.username?.charAt(0).toUpperCase() || '?'}
        </Avatar>
        <Typography variant="h6">{user?.username || 'Guest'}</Typography>
        <Typography variant="body2" color="text.secondary">{user?.email || ''}</Typography>
      </Box>
      <Divider />
      <List>
        {navItems.map((item) => (
          <DrawerItem 
            key={item.text}
            text={item.text}
            icon={item.icon}
            path={item.path}
            selected={location.pathname === item.path}
            onClick={closeDrawer}
          />
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{ 
              borderRadius: 1, 
              mx: 1, 
              mt: 1,
              color: theme.palette.error.main
            }}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1, boxShadow: 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={toggleDrawer}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            SerenityBot
          </Typography>
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton color="inherit" component={Link} to="/profile">
                <PersonIcon />
              </IconButton>
              <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
                Logout
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={closeDrawer}
        sx={{
          '& .MuiDrawer-paper': { boxSizing: 'border-box' },
        }}
      >
        {drawer}
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          pt: { xs: 10, sm: 12 },
          bgcolor: 'background.default'
        }}
      >
        <Container maxWidth="lg">
          {children}
        </Container>
      </Box>
    </Box>
  );
});

export default SharedLayout; 