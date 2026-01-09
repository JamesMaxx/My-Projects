import React, { useEffect, useState } from 'react';
import { getCurrentUser, getProfileByUserId, createProfile, updateProfile } from '../lib/api';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import PostAddIcon from '@mui/icons-material/PostAdd';

const drawerWidth = 260;

export default function Dashboard() {
  const [profileId, setProfileId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [github, setGithub] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const user = await getCurrentUser();
      if (!user) return;
      const p = await getProfileByUserId(user.$id || user.id);
      if (p) {
        setProfileId(p.$id || p.id);
        setName(p.name || '');
        setBio(p.bio || '');
        setLocation(p.location || '');
        setGithub(p.githubUsername || '');
      }
    }
    load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setStatus('Saving...');
    try {
      const user = await getCurrentUser();
      const payload = { name, bio, location, githubUsername: github, userId: user?.$id || user?.id };
      if (profileId) {
        await updateProfile(profileId, payload);
      } else {
        await createProfile(payload);
      }
      setStatus('Profile saved.');
    } catch (err: any) {
      setStatus(err?.message || 'Failed to save');
    }
  }

  // Simple placeholder metrics (could be fetched from API)
  const metrics = [
    { title: 'Total Posts', value: 42, color: '#1976d2' },
    { title: 'Active Developers', value: 128, color: '#9c27b0' },
    { title: 'Comments Today', value: 312, color: '#2e7d32' },
    { title: 'Likes', value: 2_184, color: '#ef6c00' },
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar position="fixed" elevation={1} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar sx={{ gap: 2 }}>
          <Typography variant="h6" noWrap component="div">
            GitConnect — Dashboard
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Avatar sx={{ bgcolor: '#0ea5a4' }}>G</Avatar>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', bgcolor: '#0f172a', color: '#e6eef8' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            <ListItem>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#1e293b' }}>{name ? name[0] : 'U'}</Avatar>
                <Box>
                  <Typography variant="subtitle1">{name || 'Your name'}</Typography>
                  <Typography variant="caption" color="#9ca3af">{location || 'Unknown'}</Typography>
                </Box>
              </Box>
            </ListItem>
            <Divider sx={{ bgcolor: '#213547', my: 1 }} />
            <ListItem button>
              <ListItemIcon sx={{ color: '#9fb7d6' }}><DashboardIcon /></ListItemIcon>
              <ListItemText primary="Overview" />
            </ListItem>
            <ListItem button>
              <ListItemIcon sx={{ color: '#9fb7d6' }}><PersonIcon /></ListItemIcon>
              <ListItemText primary="Profile" />
            </ListItem>
            <ListItem button>
              <ListItemIcon sx={{ color: '#9fb7d6' }}><PostAddIcon /></ListItemIcon>
              <ListItemText primary="Posts" />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />

        <Grid container spacing={3}>
          {/* Metrics row */}
          {metrics.map((m) => (
            <Grid item xs={12} sm={6} md={3} key={m.title}>
              <Card elevation={3} sx={{ borderLeft: `6px solid ${m.color}` }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary">{m.title}</Typography>
                  <Typography variant="h5" sx={{ mt: 1, fontWeight: 700 }}>{m.value.toLocaleString()}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}

          {/* Large panels (Kibana-like) */}
          <Grid item xs={12} md={8}>
            <Paper elevation={2} sx={{ p: 2, minHeight: 300 }}>
              <Typography variant="h6">Activity Stream</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Recent posts, likes and comments across the community.</Typography>
              <Box sx={{ display: 'grid', gap: 1 }}>
                <Paper sx={{ p: 2, bgcolor: '#0b1220', color: '#dbeafe' }}>No recent activity found — this is a placeholder stream. Connect Appwrite and run seed data to populate.</Paper>
                <Paper sx={{ p: 2 }}>Placeholder event: <strong>Jane</strong> commented on <em>How to use Appwrite</em></Paper>
                <Paper sx={{ p: 2 }}>Placeholder event: <strong>Mike</strong> liked <em>Build a Next.js app</em></Paper>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 2, minHeight: 300 }}>
              <Typography variant="h6">Your profile</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Manage how you appear to other developers.</Typography>

              <Box component="form" onSubmit={handleSave} sx={{ display: 'grid', gap: 2 }}>
                <TextField label="Full name" value={name} onChange={(e) => setName(e.target.value)} size="small" fullWidth />
                <TextField label="Location" value={location} onChange={(e) => setLocation(e.target.value)} size="small" fullWidth />
                <TextField label="GitHub username" value={github} onChange={(e) => setGithub(e.target.value)} size="small" fullWidth />
                <TextField label="Short bio" value={bio} onChange={(e) => setBio(e.target.value)} size="small" multiline minRows={3} fullWidth />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button type="submit" variant="contained" color="primary">Save profile</Button>
                  <Button variant="outlined">Preview</Button>
                </Box>
                {status && <Typography variant="caption" color="success.main">{status}</Typography>}
              </Box>
            </Paper>
          </Grid>

          {/* Footer analytics panels */}
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6">Analytics</Typography>
              <Typography variant="body2" color="text.secondary">A Kibana-like dashboard would place charts here — use Appwrite Functions or an analytics pipeline to feed real charts.</Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                <Paper sx={{ flex: '1 1 200px', p: 2 }}>Panel: Posts over time (placeholder)</Paper>
                <Paper sx={{ flex: '1 1 200px', p: 2 }}>Panel: New users (placeholder)</Paper>
                <Paper sx={{ flex: '1 1 200px', p: 2 }}>Panel: Comments heatmap (placeholder)</Paper>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
