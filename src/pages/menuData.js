import React from "react";
import SettingsIcon from "@mui/icons-material/Settings";
import PersonIcon from "@mui/icons-material/Person";
import BusinessIcon from "@mui/icons-material/Business";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AssessmentIcon from "@mui/icons-material/Assessment";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AssignmentIcon from "@mui/icons-material/Assignment";
import SchoolIcon from "@mui/icons-material/School";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import GroupIcon from "@mui/icons-material/Group";
import NoteIcon from "@mui/icons-material/Note";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ErrorIcon from "@mui/icons-material/Error";

export const menuGroups = [
  {
    id: "ai-chatbot",
    title: "AI Chatbot & Config",
    icon: <SettingsIcon />,
    description: "Intelligent assistance and system configurations",
    items: [
      { name: "AI Chatbot", path: "/dashchattest4d", icon: <PersonIcon /> },
      { name: "Config Tables", path: "/dashmtall", icon: <PersonIcon /> },
      { name: "Config Fields", path: "/dashmtfields", icon: <PersonIcon /> },
      { name: "Columns", path: "/dashmtbcolumnsall", icon: <PersonIcon /> },
      { name: "API Configuration", path: "/dashmtblapi", icon: <PersonIcon /> },
    ]
  },
  {
    id: "api-extractor",
    title: "API Data Extractor",
    icon: <DashboardIcon />,
    description: "Automated data retrieval and workflow management",
    items: [
      { name: "API Chatbot", path: "/apichatbot", icon: <PersonIcon /> },
      { name: "AI API Report", path: "/apichatbot1", icon: <PersonIcon /> },
      { name: "Configure API", path: "/apiconfig", icon: <SettingsIcon /> },
      { name: "AI Data Upload API", path: "/aidatamanager", icon: <PersonIcon /> },
      { name: "Configure API Data", path: "/dataconfig", icon: <SettingsIcon /> },
      { name: "Work Flow Chatbot", path: "/workflowchatbotds", icon: <SettingsIcon /> },
      { name: "Work Flow Config", path: "/workflowconfigds", icon: <SettingsIcon /> },
    ]
  },

  {
    id: "profile-page",
    title: "Profile",
    icon: <GroupIcon />,
    description: "Manage yoyr Profile",
    items: [
      { name: "Profile Page", path: "/staffprofileds", icon: <PersonIcon /> }
    ]
  },
  {
    id: "user-management",
    title: "User Management",
    icon: <GroupIcon />,
    description: "Manage institutions, faculty, and student accounts",
    items: [
      { name: "Users (Faculty)", path: "/dashmuser", icon: <PersonIcon /> },
      { name: "Company Users", path: "/dashmcompany", icon: <PersonIcon /> },
      { name: "Students List", path: "/studentlistds", icon: <PersonIcon /> },
      { name: "User Data Management", path: "/usermanagementdsnov17", icon: <PersonIcon /> },
      { name: "Other roles", path: "/dashmroles", icon: <PersonIcon /> },
    ]
  },
  {
    id: "examination",
    title: "Examination",
    icon: <NoteIcon />,
    description: "Schedules, seating, and performance tracking",
    items: [
      { name: "Exam schedule", path: "/dashmexamschedule", icon: <PersonIcon /> },
      { name: "Exam time table", path: "/dashmexamtimetable", icon: <PersonIcon /> },
      { name: "Exam Seat allotment", path: "/dashmexamroom", icon: <PersonIcon /> },
      { name: "Exam registration", path: "/dashmexamadmit", icon: <PersonIcon /> },
      { name: "Exam marks", path: "/dashmexammarksall", icon: <PersonIcon /> },
      { name: "Exam configuration", path: "/examstructurepageds", icon: <PersonIcon /> },
      { name: "Marks entry rubrics", path: "/marksentrypageds", icon: <PersonIcon /> },
      { name: "Tabulation register", path: "/tabulationregisterpageds", icon: <PersonIcon /> },
    ]
  },
  {
    id: "finance",
    title: "Finance & Fees",
    icon: <LocalAtmIcon />,
    description: "Accounts, ledgers, and fee collection",
    items: [
      { name: "Fee configuration", path: "/dashmfees", icon: <PersonIcon /> },
      { name: "Student Ledger", path: "/dashmledgerstud", icon: <PersonIcon /> },
      { name: "Fees collection", path: "/dashmmfeescol", icon: <PersonIcon /> },
      { name: "Journal entry", path: "/mjournal2", icon: <PersonIcon /> },
      { name: "Trial balance", path: "/dashmmtrialbalance2", icon: <PersonIcon /> },
      { name: "Balance Sheet", path: "/dashmmbalancesheet", icon: <PersonIcon /> },
    ]
  },
  {
    id: "cas-data",
    title: "Personal CAS Data",
    icon: <VerifiedUserIcon />,
    description: "Faculty research, publications, and projects",
    items: [
      { name: "Projects", path: "/dashmprojects", icon: <PersonIcon /> },
      { name: "Publications", path: "/dashmpublications", icon: <PersonIcon /> },
      { name: "Patents", path: "/dashmpatents", icon: <PersonIcon /> },
      { name: "Fellowship and awards", path: "/dashmteacherfellow", icon: <PersonIcon /> },
      { name: "Consultancy", path: "/dashmconsultancy", icon: <PersonIcon /> },
      { name: "PhD Guideship", path: "/dashmphdguide", icon: <PersonIcon /> },
    ]
  },
  {
    id: "reports",
    title: "Reports",
    icon: <AssessmentIcon />,
    description: "Academic and administrative performance metrics",
    items: [
      { name: "General Reports", path: "/dashreports", icon: <PersonIcon /> },
      { name: "Admission Report", path: "/admissionreport", icon: <PersonIcon /> },
      { name: "Course-wise Admission", path: "/admissioncoursewisereport", icon: <PersonIcon /> },
    ]
  },
  {
    id: "purchasing",
    title: "Purchasing & Inventory",
    icon: <ShoppingCartIcon />,
    description: "Vendor and product management",
    items: [
      { name: "Vendor management", path: "/vendormanagementds", icon: <PersonIcon /> },
      { name: "Product management", path: "/productmanagementds", icon: <PersonIcon /> },
      { name: "Purchase management", path: "/purchasemanagementds", icon: <PersonIcon /> },
      { name: "Product requisition", path: "/productrequestds", icon: <PersonIcon /> },
      { name: "Request Approval", path: "/role/faculty-request-approval2", icon: <ShoppingCartIcon /> }
    ]
  },
  {
    id: "grievance",
    title: "Grievance Mgmt",
    icon: <ErrorIcon />,
    description: "Support and feedback handling",
    items: [
      { name: "Grievance Categories", path: "/managegrievancecategoriesds", icon: <PersonIcon /> },
      { name: "Grievance Dashboard", path: "/admingrievancedashboardds", icon: <PersonIcon /> },
      { name: "Grievance assignment", path: "/assigneegrievancepageds", icon: <PersonIcon /> },
    ]
  }
];