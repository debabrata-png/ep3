import React from 'react';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { Link as RouterLink } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import List from '@mui/material/List';

export function menucrmconfig() {
    return (
        <List>
            <ListItem button component={RouterLink} to="/pipelinestageag">
                <ListItemIcon>
                    <PersonIcon />
                </ListItemIcon>
                <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Pipeline Stage Config" />
            </ListItem>

            <ListItem button component={RouterLink} to="/outcomeag">
                <ListItemIcon>
                    <AssignmentTurnedInIcon />
                </ListItemIcon>
                <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Outcome Config" />
            </ListItem>
        </List>
    );
}
