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
import CategoryIcon from '@mui/icons-material/Category';
import LeadsIcon from '@mui/icons-material/Leaderboard';
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

export function menuitemsfees() {
    const open = true;

    return (
        <div style={{ overflowY: 'scroll', height: 600, width: 300, fontSize: 10 }}>

            <Accordion>
                <AccordionSummary aria-controls="panel3-content" id="panel3-header">
                    <BusinessIcon sx={{ marginRight: 1 }} />
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
                <AccordionSummary aria-controls="panel2-content" id="panel2-header">
                    <SettingsIcon sx={{ marginRight: 1 }} />
                    {open && <Typography sx={{ fontSize: 14 }}>Fees</Typography>}
                </AccordionSummary>
                <AccordionDetails>





                    <ListItem button component={RouterLink} to="/dashmfees">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Fee configuration" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/feesprovds">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Provisional Fee Master" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/dashfeeapplicationds">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Application Fee Master" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/dashmledgerstud">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Student Ledger" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/dashmmfeescol">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Fees collection" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/dashmfeespay">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Fees payment" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/dashmfeespayl">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Counter Fees payment" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/challan-payment">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Challan Payment" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/challan-config">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Challan Config" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/feesummaryreport">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Fee Summary report" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/studentledgerreport">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Studentwise Ledger report" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/programfeereport">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Programwise fee received" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/dashmmfeescolbydate">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Fees Datewise" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/dashfeescolaggr">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Fees Datewise Total" />}
                    </ListItem>


                    <ListItem button component={RouterLink} to="/studentledgerreportds">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Studentwise Pending" />}
                    </ListItem>


                    <ListItem button component={RouterLink} to="/collegerepledgerreportds">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Programwise Pending" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/ledgerstudpageds">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Installments" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/ledgerinstallmentpageds">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Installments student ledger" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/dailyfeesreport1">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Daily Collection Report 2" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/feesgenerationds">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Student Fees" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/studentledgerdaterangereportds">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Student Ledger by Paymode" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/feesstructurereportds">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Fees Structure Report" />}
                    </ListItem>


                    <ListItem button component={RouterLink} to="/programwisecashbookreportds">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Program wise Cash Book" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/dcrreportds">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="DCR Reports 2" />}
                    </ListItem>


                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary aria-controls="panel3-content" id="panel3-header">
                    <BusinessIcon sx={{ marginRight: 1 }} />
                    {open && <Typography sx={{ fontSize: 14 }}>Task assignment</Typography>}
                </AccordionSummary>
                <AccordionDetails>

                    <ListItem button component={RouterLink} to="/taskcreatorpage">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Create Task" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/assigneetaskpage">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="My Tasks" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/approvertaskpage">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Approve Tasks" />}
                    </ListItem>

                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary aria-controls="panel3-content" id="panel3-header">
                    <BusinessIcon sx={{ marginRight: 1 }} />
                    {open && <Typography sx={{ fontSize: 14 }}>Settings</Typography>}
                </AccordionSummary>
                <AccordionDetails>



                    <ListItem button component={RouterLink} to="/dashmquotanew">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="AI Credits" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/dashawsconfig">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="AWS config" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/dashmpassword">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Change password" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/signinpay">
                        <ListItemIcon>
                            <PersonIcon />
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