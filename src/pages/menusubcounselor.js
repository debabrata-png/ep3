import React from 'react';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LeadsIcon from '@mui/icons-material/Leaderboard';
import { Link as RouterLink } from 'react-router-dom';

export function menuitemssubcounselor() {
  const open = true;

  return (
    <div>
      {/* Dashboard Section */}
      <ListItem button component={RouterLink} to="/dashdashfacnew">
        <ListItemIcon>
          <DashboardIcon />
        </ListItemIcon>
        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Dashboard" />}
      </ListItem>

      {/* CRM Section */}
      <ListItem button component={RouterLink} to="/leadsds">
        <ListItemIcon>
          <LeadsIcon />
        </ListItemIcon>
        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Leads" />}
      </ListItem>
    </div>
  );
}
