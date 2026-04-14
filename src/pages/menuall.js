import React from 'react';
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
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import BusinessIcon from '@mui/icons-material/Business';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import HostelIcon from '@mui/icons-material/Hotel';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { List, Typography } from '@mui/material';
import ReceiptLong from '@mui/icons-material/ReceiptLong';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AddTaskIcon from '@mui/icons-material/AddTask';
import AdjustIcon from '@mui/icons-material/Adjust';
import ApprovalIcon from '@mui/icons-material/Approval';
import AutoModeIcon from '@mui/icons-material/AutoMode';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import AutofpsSelectIcon from '@mui/icons-material/AutofpsSelect';
import BackupTableIcon from '@mui/icons-material/BackupTable';
import BathroomIcon from '@mui/icons-material/Bathroom';
import BalconyIcon from '@mui/icons-material/Balcony';
import BarChartIcon from '@mui/icons-material/BarChart';
import AvTimerIcon from '@mui/icons-material/AvTimer';
import Battery4BarIcon from '@mui/icons-material/Battery4Bar';
import BookIcon from '@mui/icons-material/Book';
import BrightnessHighIcon from '@mui/icons-material/BrightnessHigh';
import global1 from './global1';

const getlink = () => {
    return '/eventlistwithcolid/' + global1.colid;
}


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

export function menuitemsall() {
    const open = true;
    return (
        <div style={{ overflowY: 'scroll', height: 600, width: 300, fontSize: 10 }}>
            <Accordion>
                <AccordionSummary aria-controls="panel2-content" id="panel2-header">
                    <SettingsIcon sx={{ marginRight: 1 }} />
                    {open && <Typography sx={{ fontSize: 14 }}>AI Chatbot</Typography>}
                </AccordionSummary>
                <AccordionDetails>
                    <ListItem button component={RouterLink} to="/dashchattest4d">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="AI Chatbot" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/dashchattestadmin">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="AI Admin Chatbot" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/apichatbot1">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="AI Report Advanced" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/aidatamanager">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="AI Chat Upload" />}
                    </ListItem>


                    <ListItem button component={RouterLink} to="/workflowchatbotds1">
                        <ListItemIcon>
                            <SettingsIcon />
                        </ListItemIcon>
                        {open && (
                            <ListItemText
                                primaryTypographyProps={{ fontSize: '14px' }}
                                primary="AI Advanced Work Flow Chatbot"
                            />
                        )}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/workflowconfigds1">
                        <ListItemIcon>
                            <SettingsIcon />
                        </ListItemIcon>
                        {open && (
                            <ListItemText
                                primaryTypographyProps={{ fontSize: '14px' }}
                                primary="AI Advanced Work Flow Config"
                            />
                        )}
                    </ListItem>



                    <ListItem button component={RouterLink} to="/workflowchatbotds">
                        <ListItemIcon>
                            <SettingsIcon />
                        </ListItemIcon>
                        {open && (
                            <ListItemText
                                primaryTypographyProps={{ fontSize: '14px' }}
                                primary="AI Work Flow Chatbot"
                            />
                        )}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/workflowconfigds">
                        <ListItemIcon>
                            <SettingsIcon />
                        </ListItemIcon>
                        {open && (
                            <ListItemText
                                primaryTypographyProps={{ fontSize: '14px' }}
                                primary="AI Work Flow Config"
                            />
                        )}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/dataconfig">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="AI Chat Config" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/apiconfig">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="AI API Config" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/dashmtall">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Config Tables" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/dashmtfields">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Config Fields" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/dashmtbcolumnsall">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Columns" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/dashmtblapi">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="API Configuration" />}
                    </ListItem>




                </AccordionDetails>
            </Accordion>

            <Accordion>
                <AccordionSummary aria-controls="panel2-content" id="panel2-header">
                    <SettingsIcon sx={{ marginRight: 1 }} />
                    {open && <Typography sx={{ fontSize: 14 }}>AI Agents</Typography>}
                </AccordionSummary>
                <AccordionDetails>

                    <ListItem button component={RouterLink} to="/dashmtblemitter">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="AI Agents" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/dashmtblerrorlog">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Error Logs" />}
                    </ListItem>

                </AccordionDetails>
            </Accordion>

            <Accordion>
                <AccordionSummary aria-controls="panel3-content" id="panel3-header">
                    <BusinessIcon sx={{ marginRight: 1 }} />
                    {open && <Typography sx={{ fontSize: 14 }}>CRM</Typography>}
                </AccordionSummary>
                <AccordionDetails>
                    <ListItem button component={RouterLink} to="/dashboardcrmds">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="CRM Dashboard" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/oicrmrep2">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="CRM reports 1" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/crmupcommingfollowup">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Upcomming Followups" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/crmds-overdue-leads">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Overdue Leads" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/crmds-counsellor-wise-leads">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Counsellor Wise Leads" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/crmds-pipeline-stage-wise">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Pipeline Stage Wise" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/crmds-source-wise-leads">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Source Wise Leads" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/crmreports2">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="CRM reports 2" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/crm-lead-status-stage-report">
                        <ListItemIcon>
                            <AssignmentIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Lead Status Report" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/crm-counsellor-performance-report">
                        <ListItemIcon>
                            <AssignmentIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Counsellor Performance" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/crm-daily-calling-report">
                        <ListItemIcon>
                            <AssignmentIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Daily Calling Report" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/crm-untouched-leads-report">
                        <ListItemIcon>
                            <AssignmentIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Untouched Lead Report" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/crm-follow-up-due-report">
                        <ListItemIcon>
                            <AssignmentIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Follow-Up Due Report" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/crm-sourcewise-enhanced-report">
                        <ListItemIcon>
                            <AssignmentIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Source Wise Report" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/crm-conversion-report">
                        <ListItemIcon>
                            <AssignmentIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Conversion Report" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/provisionalfeereportds">
                        <ListItemIcon>
                            <AssignmentIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Provisional Fee Report" />}
                    </ListItem>
                </AccordionDetails>
            </Accordion>

            <Accordion>
                <AccordionSummary aria-controls="panel-cms-content" id="panel-cms-header">
                    <AdjustIcon sx={{ marginRight: 1 }} />
                    {open && <Typography sx={{ fontSize: 14 }}>Wiser Website CMS</Typography>}
                </AccordionSummary>
                <AccordionDetails>
                    <ListItem button component={RouterLink} to="/web-builder">
                        <ListItemIcon>
                            <BackupTableIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Page Management" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/web-builder/settings">
                        <ListItemIcon>
                            <SettingsIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Global Settings" />}
                    </ListItem>
                </AccordionDetails>
            </Accordion>


            <Accordion>
                <AccordionSummary aria-controls="panel2-content" id="panel2-header">
                    <SettingsIcon sx={{ marginRight: 1 }} />
                    {open && <Typography sx={{ fontSize: 14 }}>User management</Typography>}
                </AccordionSummary>
                <AccordionDetails>
                    <ListItem button component={RouterLink} to="/usermanagementdsnov17">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="User management 3" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/profileeditconfigds">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Profile edit" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/profileeditlogsds">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Profile edit log" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/dataqualityreportds">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Data quality report" />}
                    </ListItem>
                </AccordionDetails>
            </Accordion>

            <Accordion>
                <AccordionSummary aria-controls="panel3-content" id="panel3-header">
                    <BusinessIcon sx={{ marginRight: 1 }} />
                    {open && <Typography sx={{ fontSize: 14 }}>Admission</Typography>}
                </AccordionSummary>
                <AccordionDetails>

                    <ListItem button component={RouterLink} to="/dashmadmission1">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Form link" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/programcounselords">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Program List" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/dashmappmodel2">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Merit List All" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/dashmappmodel2cat">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Merit List by Category" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/admission/manage">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Manage Applications" />}
                    </ListItem>
                </AccordionDetails>
            </Accordion>

            <Accordion>
                <AccordionSummary aria-controls="panel3-content" id="panel3-header">
                    <BusinessIcon sx={{ marginRight: 1 }} />
                    {open && <Typography sx={{ fontSize: 14 }}>Student Report</Typography>}
                </AccordionSummary>
                <AccordionDetails>

                    <ListItem button component={RouterLink} to="/studentdetailedreportds">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Report" />}
                    </ListItem>


                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary aria-controls="panel3-content" id="panel3-header">
                    <BusinessIcon sx={{ marginRight: 1 }} />
                    {open && <Typography sx={{ fontSize: 14 }}>Student profile</Typography>}
                </AccordionSummary>
                <AccordionDetails>

                    <ListItem button component={RouterLink} to="/dashstudprofileall">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Student profile" />}
                    </ListItem>


                </AccordionDetails>
            </Accordion>

            <Accordion>
                <AccordionSummary aria-controls="panel3-content" id="panel3-header">
                    <BusinessIcon sx={{ marginRight: 1 }} />
                    {open && <Typography sx={{ fontSize: 14 }}>NIRF Data</Typography>}
                </AccordionSummary>
                <AccordionDetails>

                    <ListItem button component={RouterLink} to="/dashmstudgender">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Student by gender" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/dashmstudcategory">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Student by category" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/dashmstudquota">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Student by quota" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/dashnirfplacement">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Placement report" />}
                    </ListItem>


                    <ListItem button component={RouterLink} to="/dashmstudlist">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Student count" />}
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
                    <ListItem button component={RouterLink} to="/dashmledgerstud">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Student Ledger" />}
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

                    <ListItem button component={RouterLink} to="/challan-history">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Challan History" />}
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

                    <ListItem button component={RouterLink} to="/studentwisependingreportds">
                        <ListItemIcon>
                            <ReceiptLong />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: '14px' }} primary="Studentwise Pending" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/programwisependingreportds">
                        <ListItemIcon>
                            <ReceiptLong />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: '14px' }} primary="Programwise Pending" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/ledgerinstallmentpageds">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Installments student ledger" />}
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

                    <ListItem button component={RouterLink} to="/studentledgerwisereportds">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Student Ledger Report New" />}
                    </ListItem>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary aria-controls="panel-budget-content" id="panel-budget-header">
                    <AccountBalanceWalletIcon sx={{ marginRight: 1 }} />
                    {open && <Typography sx={{ fontSize: 14 }}>Budget Management</Typography>}
                </AccordionSummary>
                <AccordionDetails>
                    <ListItem button component={RouterLink} to="/BudgetDashboardds">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Budget Dashboard" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/BudgetApprovalds">
                        <ListItemIcon>
                            <ApprovalIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Budget Approval" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/BudgetTypeds">
                        <ListItemIcon>
                            <SettingsIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Budget Types" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/BudgetApproverds">
                        <ListItemIcon>
                            <SettingsIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Budget Approvers" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/BudgetGroupds">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Budget Grouping" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/GroupWiseBudgetReportds">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Group-wise Budget Report" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/CategoryWiseBudgetReportds">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Category-wise Budget Report" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/DepartmentWiseBudgetReportds">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Department-wise Budget Report" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/BudgetInstitutionCategoryReportds">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Institution Wise Category report" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/BudgetInstitutionGroupCategoryReportds">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Instituion Wise Budget Group report" />}
                    </ListItem>
                </AccordionDetails>
            </Accordion>

            <Accordion>
                <AccordionSummary aria-controls="panel2-content" id="panel2-header">
                    <SettingsIcon sx={{ marginRight: 1 }} />
                    {open && <Typography sx={{ fontSize: 14 }}>Finance and Accounts</Typography>}
                </AccordionSummary>
                <AccordionDetails>

                    <ListItem button component={RouterLink} to="/accountgroup">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Account group" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/mjournal2">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Journal entry" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/dashmmjournal2">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Journal" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/mjournal2reportpage">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Journal reports" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/journalsbygroupds">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Group reports" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/transactionrefds">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Transaction by reference" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/dashmmtrialbalance2">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Trial balance" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/trialbalancepage">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Generate Trial balance" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/dashmmtradinggenerate">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Generate Trading Account" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/dashmmtradingaccount">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Trading Account" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/dashmmplaccount">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Profit and Loss Account" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/dashmmbalancesheet">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Balance Sheet" />}
                    </ListItem>
                </AccordionDetails>
            </Accordion>

            <Accordion>
                <AccordionSummary aria-controls="panelU-content" id="panelU-header">
                    <SettingsIcon sx={{ marginRight: 1 }} />
                    {open && <Typography sx={{ fontSize: 14 }}>Payment Gateway</Typography>}
                </AccordionSummary>
                <AccordionDetails>
                    <ListItem button component={RouterLink} to="/pgmasterconfigds">
                        <ListItemIcon>
                            <SettingsIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Gateway Master" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/easebuzzconfigds">
                        <ListItemIcon>
                            <SettingsIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Easebuzz Settings" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/easebuzztestinitiationds">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Universal Payment Test" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/universalpaymenthistoryds">
                        <ListItemIcon>
                            <ReceiptLong />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Unified Payment History" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/hdfcgatewayconfigds">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="HDFC Payment Gateway Configuration" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/hdfcpaymentinitiationds">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Payment Initiation" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/hdfcpaymentcallbackds">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Payment Callback" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/hdfcpaymenthistoryds">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="HDFC Payment History" />}
                    </ListItem>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary aria-controls="panel3-content" id="panel3-header">
                    <BusinessIcon sx={{ marginRight: 1 }} />
                    {open && <Typography sx={{ fontSize: 14 }}>ID Card Manager</Typography>}
                </AccordionSummary>
                <AccordionDetails>

                    <ListItem button component={RouterLink} to="/idcardmanager">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="ID Card manager" />}
                    </ListItem>

                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary aria-controls="panel3-content" id="panel3-header">
                    <BusinessIcon sx={{ marginRight: 1 }} />
                    {open && <Typography sx={{ fontSize: 14 }}>Certificates</Typography>}
                </AccordionSummary>
                <AccordionDetails>

                    <ListItem button component={RouterLink} to="/createcertificates">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Certificates" />}
                    </ListItem>

                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary aria-controls="panel3-content" id="panel3-header">
                    <BusinessIcon sx={{ marginRight: 1 }} />
                    {open && <Typography sx={{ fontSize: 14 }}>LMS</Typography>}
                </AccordionSummary>
                <AccordionDetails>
                    <ListItem button component={RouterLink} to="/dashmmfaccourses">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="My courses" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/dashmlmsvideos">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="AI Videos" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/dashmmindmaplist">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Mind map list" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/dashmtimeslotsn1">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Time slot" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/dashmworkloadn1">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Work load" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/dashmfacwcal">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Faculty Workload Calendar" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/dashmask1">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="AI NLP Knowledgebase questions" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/facultytopicpageds">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Course Forum" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/classes1">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Breakout rooms" />}
                    </ListItem>
                </AccordionDetails>
            </Accordion>

            <Accordion>
                <AccordionSummary aria-controls="panel3-content" id="panel3-header">
                    <BusinessIcon sx={{ marginRight: 1 }} />
                    {open && <Typography sx={{ fontSize: 14 }}>Class and Attendance</Typography>}
                </AccordionSummary>
                <AccordionDetails>

                    <ListItem button component={RouterLink} to="/classes">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Attendance" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/classesn">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Attendance image" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/swapclasses1">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Swap classes" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/swapclasses2">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Swap classes 2" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/dashmclassnew">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Class schedule" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/dashmclassnewc">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Class by date" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/dashmattpcode">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Attendance report programwise" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/dashmattstud">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Attendance report studentwise" />}
                    </ListItem>

                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary aria-controls="panel2-content" id="panel2-header">
                    <SettingsIcon sx={{ marginRight: 1 }} />
                    {open && <Typography sx={{ fontSize: 14 }}>NEP Subject Select</Typography>}
                </AccordionSummary>
                <AccordionDetails>

                    <ListItem button component={RouterLink} to="/subjectlimitconfig">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Subject limit" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/subjectgroupds">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Subject group" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/subjectApprovalds">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Subject Approval" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/subjectreportds">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Subject Reports" />}
                    </ListItem>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary aria-controls="panel2-content" id="panel2-header">
                    <SettingsIcon sx={{ marginRight: 1 }} />
                    {open && <Typography sx={{ fontSize: 14 }}>Time Table Generation</Typography>}
                </AccordionSummary>
                <AccordionDetails>
                    <ListItem button component={RouterLink} to="/tfacultyform">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Faculty form" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/tsubjectload">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Subject load" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/timeslot">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Time slot" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/timetableview">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Timetable view" />}
                    </ListItem>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary aria-controls="panel2-content" id="panel2-header">
                    <SettingsIcon sx={{ marginRight: 1 }} />
                    {open && <Typography sx={{ fontSize: 14 }}>Question Bank</Typography>}
                </AccordionSummary>
                <AccordionDetails>

                    <ListItem button component={RouterLink} to="/questionbanklistds">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Question Bank" />}
                    </ListItem>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary aria-controls="panel2-content" id="panel2-header">
                    <SettingsIcon sx={{ marginRight: 1 }} />
                    {open && <Typography sx={{ fontSize: 14 }}>Examination CoE</Typography>}
                </AccordionSummary>
                <AccordionDetails>
                    <ListItem button component={RouterLink} to="/dashmexamschedule">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Exam schedule" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/dashmexamtimetable">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Exam time table" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/dashmexamroom">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: '14px' }} primary="Exam Seat allotment" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/seatallocatormds4">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Seat allocation export" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/dashmexamadmit">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Exam registration" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/posttoexamadmit">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Post Exam" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/exammarksmatrix">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Matrix marks entry" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/dashmexammarksall">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Exam marks" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/examstructurepageds">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Exam configuration" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/tabulationregisterpageds">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Tabulation register" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/bulktabulationregisterpageds">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Tabulation register bulk" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/transcriptpageds">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Examination Student Transcript" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/dashboardreevalds">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Reevaluation Dashboard" />}
                    </ListItem>
                </AccordionDetails>
            </Accordion>

            <Accordion>
                <AccordionSummary aria-controls="panel3-content" id="panel3-header">
                    <BusinessIcon sx={{ marginRight: 1 }} />
                    {open && <Typography sx={{ fontSize: 14 }}>Hostel</Typography>}
                </AccordionSummary>
                <AccordionDetails>
                    <ListItem button component={RouterLink} to="/dashboardpagehostel">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Hostel Dashboard" />}
                    </ListItem>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary aria-controls="panel3-content" id="panel3-header">
                    <BusinessIcon sx={{ marginRight: 1 }} />
                    {open && <Typography sx={{ fontSize: 14 }}>Transport</Typography>}
                </AccordionSummary>
                <AccordionDetails>
                    <ListItem button component={RouterLink} to="/route">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Routes and buses" />}
                    </ListItem>
                </AccordionDetails>
            </Accordion>

            <Accordion>
                <AccordionSummary aria-controls="panel3-content" id="panel3-header">
                    <BusinessIcon sx={{ marginRight: 1 }} />
                    {open && <Typography sx={{ fontSize: 14 }}>Library</Typography>}
                </AccordionSummary>
                <AccordionDetails>
                    <ListItem button component={RouterLink} to="/dashlibraryform">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Create library" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/admin/libraries">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Library administration" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/library/:id/issuedbooks">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Issue books" />}
                    </ListItem>
                </AccordionDetails>
            </Accordion>

            <Accordion>
                <AccordionSummary aria-controls="panel3-content" id="panel3-header">
                    <BusinessIcon sx={{ marginRight: 1 }} />
                    {open && <Typography sx={{ fontSize: 14 }}>Indent</Typography>}
                </AccordionSummary>
                <AccordionDetails>
                    <ListItem button component={RouterLink} to="/faculty-create-request2">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Item Requisition" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/faculty-request-status2">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Requisition Status" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/departmentindentds">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Department Indent Config" />}
                    </ListItem>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary aria-controls="panel3-content" id="panel3-header">
                    <BusinessIcon sx={{ marginRight: 1 }} />
                    {open && <Typography sx={{ fontSize: 14 }}>Purchase</Typography>}
                </AccordionSummary>
                <AccordionDetails>
                    <ListItem button component={RouterLink} to="/role/purchase-order-dashboard2">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="PO Dashboard" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/role/PurchaseCellInventoryds2">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Store Inventory" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/role/cash-approval2">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Approve Cash Request" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/role/purchasing-master-data2">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Purchase Master Data" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/role/ApprovalConfigurationds2">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Approval Configuration" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/role/vendor-comparison2">
                        <ListItemIcon><PersonIcon /></ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Vendor Comparison" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/role/ItemCategoryds2">
                        <ListItemIcon><PersonIcon /></ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Item Categories" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/role/ItemTypeds2">
                        <ListItemIcon><PersonIcon /></ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Item Types" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/role/ItemUnitds2">
                        <ListItemIcon><PersonIcon /></ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Item Units" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/role/stock-reportds2">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Stock Report" />}
                    </ListItem>

                </AccordionDetails>
            </Accordion>

            <Accordion>
                <AccordionSummary aria-controls="panel3-content" id="panel3-header">
                    <BusinessIcon sx={{ marginRight: 1 }} />
                    {open && <Typography sx={{ fontSize: 14 }}>Vendor</Typography>}
                </AccordionSummary>
                <AccordionDetails>
                    <ListItem button component={RouterLink} to="/role/vendors-masterds2">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Vendors Master" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/role/vendor-catalogds2">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Vendor Catalog" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/role/vendorpayschdsds">
                        <ListItemIcon><PersonIcon /></ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Vendor Payment Schedule" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/create-rfp">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Create Form" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/rfp-approvals">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Form Responses" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/rfp-ai-analysis">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="AI Comparison Analysis" />}
                    </ListItem>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary aria-controls="panel3-content" id="panel3-header">
                    <BusinessIcon sx={{ marginRight: 1 }} />
                    {open && <Typography sx={{ fontSize: 14 }}>Quality Control</Typography>}
                </AccordionSummary>
                <AccordionDetails>
                    <ListItem button component={RouterLink} to="/role/quality-inspector2">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Quality Inspector" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/role/manual-quality-check2">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Manual Quality Check" />}
                    </ListItem>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary aria-controls="panel3-content" id="panel3-header">
                    <BusinessIcon sx={{ marginRight: 1 }} />
                    {open && <Typography sx={{ fontSize: 14 }}>Security Dashboard</Typography>}
                </AccordionSummary>
                <AccordionDetails>
                    <ListItem button component={RouterLink} to="/role/gateway-security2">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Gateway Security" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/role/store-manual-gate-pass">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Manual Gate Pass" />}
                    </ListItem>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary aria-controls="panel1-content" id="panel1-header">
                    <AccountCircleIcon sx={{ marginRight: 1 }} />
                    {open && <Typography sx={{ fontSize: 14 }}>Forum</Typography>}
                </AccordionSummary>
                <AccordionDetails>

                    <ListItem button component={RouterLink} to="/topiccategorypage1ds">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="All Forum" />}
                    </ListItem>


                </AccordionDetails>
            </Accordion>

            <Accordion>
                <AccordionSummary aria-controls="panel3-content" id="panel3-header">
                    <BusinessIcon sx={{ marginRight: 1 }} />
                    {open && <Typography sx={{ fontSize: 14 }}>Forms</Typography>}
                </AccordionSummary>
                <AccordionDetails>

                    <ListItem button component={RouterLink} to="/forms">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Forms" />}
                    </ListItem>

                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary aria-controls="panel3-content" id="panel3-header">
                    <BusinessIcon sx={{ marginRight: 1 }} />
                    {open && <Typography sx={{ fontSize: 14 }}>Grievance management</Typography>}
                </AccordionSummary>
                <AccordionDetails>

                    <ListItem button component={RouterLink} to="/managegrievancecategoriesds">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Grievance Categories" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/managecategoryassigneeds">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Assign Categories" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/admingrievancedashboardds">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Grievance management" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/creategrievanceds">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Create Grievance" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/assigneegrievancepageds">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Grievance assignment" />}
                    </ListItem>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary aria-controls="panel3-content" id="panel3-header">
                    <BusinessIcon sx={{ marginRight: 1 }} />
                    {open && <Typography sx={{ fontSize: 14 }}>IT Help Desk</Typography>}
                </AccordionSummary>
                <AccordionDetails>

                    <ListItem button component={RouterLink} to="/managegrievancecategoriesds1">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Grievance Categories" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/managecategoryassigneeds1">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Assign Categories" />}
                    </ListItem>


                    <ListItem button component={RouterLink} to="/admingrievancedashboardds1">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Grievance Management" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/geminichatds">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Chat to Solve" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/creategrievanceds1">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Create ticket" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/assigneegrievancepageds1">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Assign ticket" />}
                    </ListItem>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary aria-controls="panel3-content" id="panel3-header">
                    <BusinessIcon sx={{ marginRight: 1 }} />
                    {open && <Typography sx={{ fontSize: 14 }}>HRMS</Typography>}
                </AccordionSummary>
                <AccordionDetails>

                    <ListItem button component={RouterLink} to="/setuppageds1">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Leave Setup" />}
                    </ListItem>


                    <ListItem button component={RouterLink} to="/leavespageds1">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Apply or Approve" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/ip-management">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="IP Management" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/attendance-settings">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Attendance Settings" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/salary-management">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Salary management" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/salary-slips">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Salary slip" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/admin-attendance">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Admin Attendance" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/attendance-dashboard">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Attendance Dashboard" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/ipaddressj">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="IP Address management" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/attendancej">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Attendance" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/allattendancej">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Attendance all" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/salaryj">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Configure Salary" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/salarybysearchj">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Search Salary" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/deductionj">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Salary Deduction" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/salaryslipj">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Salary Slip" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/attendancebyemailj">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Search Attendance" />}
                    </ListItem>

                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary aria-controls="panel3-content" id="panel3-header">
                    <BusinessIcon sx={{ marginRight: 1 }} />
                    {open && <Typography sx={{ fontSize: 14 }}>Recruitment</Typography>}
                </AccordionSummary>
                <AccordionDetails>

                    <ListItem button component={RouterLink} to="/internal/jobmanager">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Recruitment manager" />}
                    </ListItem>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary aria-controls="panel3-content" id="panel3-header">
                    <BusinessIcon sx={{ marginRight: 1 }} />
                    {open && <Typography sx={{ fontSize: 14 }}>Event registration</Typography>}
                </AccordionSummary>
                <AccordionDetails>

                    <ListItem button component={RouterLink} to="/dashmeventsnew1">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="All events" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/dasheventlistpage">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Manage registration" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to={`/eventlistwithcolid/${global1.colid}`}>
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Website registration link" />}
                    </ListItem>

                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary aria-controls="panel3-content" id="panel3-header">
                    <BusinessIcon sx={{ marginRight: 1 }} />
                    {open && <Typography sx={{ fontSize: 14 }}>Accreditation</Typography>}
                </AccordionSummary>
                <AccordionDetails>



                    <ListItem button component={RouterLink} to="/dashmnn11">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="1.1 Outcome based curriculum" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/dashmnn12">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="1.2 Stakeholder participation" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/dashmmvac">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="1.3 Value added courses" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/dashmnn14">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="1.4 Practical and Industry Focus" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/dashmnn15">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="1.5 Practical and Skill Orientation" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/dashmnn17">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="1.7 Curriculum revision" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/dashmnn16">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="1.6 Online and Blended Learning" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/dashmseminar">
                        <ListItemIcon>
                            <AutoModeIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: '14px' }} primary="2.4.2 Seminars participated" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/dashmbfacyear">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="2.4.3 Year wise faculty" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/dashmnn211a">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="2.1 Recruitment committee" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/dashmnn211b">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="2.1 Recruitment faculties" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/dashmnn22">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="2.2 Pay and allowances" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/dashmnn23">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="2.3 Faculty Diversity" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/dashmnn244">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="2.4.4 Faculty participation in MOOC" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/dashmnn25">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="2.5 Faculty Retention" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/dashmnn26">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="2.6 Faculty Student Ratio" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/dashmnn31">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="3.1 Physical Infrastructure" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/dashmnn32">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="3.2 Library as learning resource" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/dashmnn33a">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="3.3 IT Infrastructure" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/dashmnn33b">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="3.3 and 3.4 Labs and Research Facilities" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/dashmnn35">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="3.5 Divyangan Friendly Resources" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/dashmnn36">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="3.6 Innovation Resources" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/dashmbtrialb">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="4.1 4.2 4.3 4.4 4.5 Trial balance" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/dashmnn46">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="4.6 Financial Risks and Controls" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/dashmnn51">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="5.1 Teaching pedagogy" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/dashmnn52">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="5.2 Internship and field projects" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/dashmnn53examdays">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="5.3 Exam days" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/dashmnn53passp">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="5.3 Pass percentage" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/dashmnn53obe">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="5.3 OBE Implementation" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/dashmnn54">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="5.4 Grievance Management" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/dashmnn55">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="5.5 Catering to diversity" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/dashmnn56">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="5.6 LMS" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/dashmbmou">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="5.7 Industry Academia Linkage" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/dashmnn61">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="6.1 Club activities and technical festivals" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/dashmnn62">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="6.2 Hackathon" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/dashmnn6clubs">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="6.3 6.3 6.5 6.6 Club activities" />}
                    </ListItem>


                    <ListItem button component={RouterLink} to="/dashmnn76">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="7.6 IQAC minutes" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/dashmnn781">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="7.8 Inter University Collaboration" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/dashmnn82">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="8.2 Academic Progression" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/dashmnn83">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="8.3 Self Employment and Entrepreneurship" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/dashmnn84">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="8.4 Competitive Exams" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/dashmstudawardsnew">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="8.5 Student awards" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/dashmnn86">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="8.6 Enrollment Percentage" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/dashmnn87">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="8.7 Graduation" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/dashmprojects">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: '14px' }} primary="9.1 Research Grant Projects" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/dashmpublications">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: '14px' }} primary="9.2 Publications" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/dashmpatents">
                        <ListItemIcon>
                            <AcUnitIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: '14px' }} primary="9.3 Research Quality Patents" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/dashmconsultancy">
                        <ListItemIcon>
                            <AddTaskIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: '14px' }} primary="9.3 Research Quality Consultancy" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/dashmphdguide">
                        <ListItemIcon>
                            <AdjustIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: '14px' }} primary="9.4 PhD Awarded" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/dashmteacherfellow">
                        <ListItemIcon>
                            <AccountBalanceWalletIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: '14px' }} primary="9.5 Fellowship and awards" style={{ overflow: 'scroll' }} />}
                    </ListItem>


                    <ListItem button component={RouterLink} to="/dashmnn96">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="9.6 IPR Produced" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/dashmnn97">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="9.7 Research Collaboration" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/dashmnn98">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="9.8 Student Startup" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/dashmscholnew">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Scholarships" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/dashmeventsnew1">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Events list 10.1 2.4.1 and others" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/dashmpolicy">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Generate policies" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/dashmqualitative">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Qualitative" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/dashmhtmleditor">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="HTML template creator" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/dashmgeotagtest">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Check geotag" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/dashmmplacement">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Placement" />}
                    </ListItem>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary aria-controls="panel3-content" id="panel3-header">
                    <BusinessIcon sx={{ marginRight: 1 }} />
                    {open && <Typography sx={{ fontSize: 14 }}>Settings</Typography>}
                </AccordionSummary>
                <AccordionDetails>
                    <ListItem button component={RouterLink} to="/manageapikeyds">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Gemini API Key" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/staffprofileds">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Profile" />}
                    </ListItem>
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
                    <ListItem button component={RouterLink} to="/generateinstitutecode">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Generate code" />}
                    </ListItem>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary aria-controls="panel3-content" id="panel3-header">
                    <BusinessIcon sx={{ marginRight: 1 }} />
                    {open && <Typography sx={{ fontSize: 14 }}>Journal</Typography>}
                </AccordionSummary>
                <AccordionDetails>

                    <ListItem button component={RouterLink} to="/dashmlpublications">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Publications" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/dashmlpublicationspublic">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Public Publications" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/dashmlpubeditions">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Publication editions" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/dashmlpubarticles">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Submit article" />}
                    </ListItem>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary aria-controls="panel3-content" id="panel3-header">
                    <BusinessIcon sx={{ marginRight: 1 }} />
                    {open && <Typography sx={{ fontSize: 14 }}>Placement</Typography>}
                </AccordionSummary>
                <AccordionDetails>

                    <ListItem button component={RouterLink} to="/dashmjobds">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="All jobs" />}
                    </ListItem>
                    <ListItem button component={RouterLink} to="/dashpsectorreport">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Sector wise report" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/dashpappplaced">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Program wise placement" />}
                    </ListItem>

                    <ListItem button component={RouterLink} to="/dashmplaced">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Year wise placement" />}
                    </ListItem>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary aria-controls="panel3-content" id="panel3-header">
                    <BusinessIcon sx={{ marginRight: 1 }} />
                    {open && <Typography sx={{ fontSize: 14 }}>Alumni</Typography>}
                </AccordionSummary>
                <AccordionDetails>

                    <ListItem button component={RouterLink} to="/admin/alumni/dashboard">
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        {open && <ListItemText primaryTypographyProps={{ fontSize: "14px" }} primary="Admin Alumni Dashboard" />}
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
