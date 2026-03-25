import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import MuiAccordion from '@mui/material/Accordion';
import MuiAccordionSummary from '@mui/material/AccordionSummary';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import { Link as RouterLink } from 'react-router-dom';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import BusinessIcon from '@mui/icons-material/Business';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import WorkIcon from '@mui/icons-material/Work';
import GroupIcon from '@mui/icons-material/Group';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import LanIcon from '@mui/icons-material/Lan';
import RuleIcon from '@mui/icons-material/Rule';
import PaymentIcon from '@mui/icons-material/Payment';
import DescriptionIcon from '@mui/icons-material/Description';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import AddTaskIcon from '@mui/icons-material/AddTask';
import TaskIcon from '@mui/icons-material/Task';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SecurityIcon from '@mui/icons-material/Security';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import CategoryIcon from '@mui/icons-material/Category';
import ProgramIcon from '@mui/icons-material/School';
import LandingPageIcon from '@mui/icons-material/WebAsset';
import CampaignIcon from '@mui/icons-material/Campaign';
import ApiIcon from '@mui/icons-material/Api';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SourceIcon from '@mui/icons-material/Source';
import EventNoteIcon from '@mui/icons-material/EventNote';
import PhoneIcon from '@mui/icons-material/Phone';
import { List, Typography } from '@mui/material';
import global1 from './global1';

const Accordion = styled((props) => (
    <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    '&:not(:last-child)': {
        borderBottom: 0,
    },
    '&::before': {
        display: 'none',
    },
}));

const AccordionSummary = styled((props) => (
    <MuiAccordionSummary
        expandIcon={<ArrowDropDownIcon />}
        {...props}
    />
))(({ theme }) => ({
    backgroundColor:
        theme.palette.mode === 'dark'
            ? 'rgba(255, 255, 255, .05)'
            : 'rgba(0, 0, 0, .03)',
    flexDirection: 'row-reverse',
    '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
        transform: 'rotate(90deg)',
    },
    '& .MuiAccordionSummary-content': {
        marginLeft: theme.spacing(1),
        display: 'flex',
        alignItems: 'center',
    },
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
    padding: theme.spacing(2),
    borderTop: '1px solid rgba(0, 0, 0, .125)',
}));

export function menuitemshrms() {
    const open = true;

    return (
        <div style={{ overflowY: 'scroll', height: 600, width: 300, fontSize: 10 }}>

            <Accordion>
                <AccordionSummary aria-controls="panel3-content" id="panel3-header">
                    <AccountBoxIcon sx={{ marginRight: 1 }} />
                    {open && <Typography sx={{ fontSize: 14 }}>Profile Page</Typography>}
                </AccordionSummary>
                <AccordionDetails>
                    <ListItem button component={RouterLink} to="/staffprofileds">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Profile" />}
                    </ListItem>
                </AccordionDetails>
            </Accordion>


            <Accordion>
                <AccordionSummary aria-controls="panel3-content" id="panel3-header">
                    <WorkIcon sx={{ marginRight: 1 }} />
                    {open && <Typography sx={{ fontSize: 14 }}>HRMS</Typography>}
                </AccordionSummary>
                <AccordionDetails>

                    <ListItem button component={RouterLink} to="/setuppageds1">
                        <ListItemIcon>
                            <SettingsApplicationsIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Leave Setup" />}
                    </ListItem>


                    <ListItem button component={RouterLink} to="/leavespageds1">
                        <ListItemIcon>
                            <FactCheckIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Apply or Approve" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/ip-management">
                        <ListItemIcon>
                            <LanIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="IP Management" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/attendance-settings">
                        <ListItemIcon>
                            <RuleIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Attendance Settings" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/salary-management">
                        <ListItemIcon>
                            <PaymentIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Salary management" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/salary-slips">
                        <ListItemIcon>
                            <DescriptionIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Salary slip" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/admin-attendance">
                        <ListItemIcon>
                            <AdminPanelSettingsIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Admin Attendance" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/attendance-dashboard">
                        <ListItemIcon>
                            <LeaderboardIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Attendance Dashboard" />}
                    </ListItem>



                </AccordionDetails>
            </Accordion>


            <Accordion>
                <AccordionSummary aria-controls="panel3-content" id="panel3-header">
                    <GroupIcon sx={{ marginRight: 1 }} />
                    {open && <Typography sx={{ fontSize: 14 }}>User Management</Typography>}
                </AccordionSummary>
                <AccordionDetails>
                    <ListItem button component={RouterLink} to="/usermanagementdsnov17">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Profile" />}
                    </ListItem>
                </AccordionDetails>
            </Accordion>

            <Accordion>
                <AccordionSummary aria-controls="panel3-content" id="panel3-header">
                    <AssignmentIndIcon sx={{ marginRight: 1 }} />
                    {open && <Typography sx={{ fontSize: 14 }}>Task assignment</Typography>}
                </AccordionSummary>
                <AccordionDetails>

                    <ListItem button component={RouterLink} to="/taskcreatorpage">
                        <ListItemIcon>
                            <AddTaskIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Create Task" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/assigneetaskpage">
                        <ListItemIcon>
                            <TaskIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="My Tasks" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/approvertaskpage">
                        <ListItemIcon>
                            <FactCheckIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Approve Tasks" />}
                    </ListItem>

                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary aria-controls="panel3-content" id="panel3-header">
                    <SettingsIcon sx={{ marginRight: 1 }} />
                    {open && <Typography sx={{ fontSize: 14 }}>Settings</Typography>}
                </AccordionSummary>
                <AccordionDetails>



                    <ListItem button component={RouterLink} to="/dashmquotanew">
                        <ListItemIcon>
                            <AccountBalanceWalletIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="AI Credits" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/dashawsconfig">
                        <ListItemIcon>
                            <SecurityIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="AWS config" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/dashmpassword">
                        <ListItemIcon>
                            <VpnKeyIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Change password" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/signinpay">
                        <ListItemIcon>
                            <SubscriptionsIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Subscription" />}
                    </ListItem>



                </AccordionDetails>
            </Accordion>

        </div>
    );
}

export function secondaryListItems({ open }) {
    return (
        <div>
            <ListSubheader inset>Saved reports</ListSubheader>
            <ListItem button>
                <ListItemIcon>
                    <AssignmentIcon />
                </ListItemIcon>
                {open && <ListItemText primary="Current month" />}
            </ListItem>
            <ListItem button>
                <ListItemIcon>
                    <AssignmentIcon />
                </ListItemIcon>
                {open && <ListItemText primary="Last quarter" />}
            </ListItem>
            <ListItem button>
                <ListItemIcon>
                    <AssignmentIcon />
                </ListItemIcon>
                {open && <ListItemText primary="Year-end sale" />}
            </ListItem>
        </div>
    );
}