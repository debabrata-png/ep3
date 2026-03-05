import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Container, Box, Typography, Grid, Card, CardContent, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, LinearProgress, Divider, Tooltip, Skeleton,
  Snackbar, Alert,
} from "@mui/material";
import {
  People as PeopleIcon, Whatshot as HotIcon, AcUnit as ColdIcon,
  Thermostat as WarmIcon, CalendarMonth as CalendarIcon,
  CheckCircle as CheckIcon, Timeline as TimelineIcon,
  ArrowBack as ArrowBackIcon, LocationOn as LocationIcon,
  Visibility as VisitIcon,
  Download as DownloadIcon, Refresh as RefreshIcon,
  ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon,
  FirstPage as FirstPageIcon, LastPage as LastPageIcon,
  Print as PrintIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
  FunnelChart as RFunnelChart, Funnel, LabelList,
} from "recharts";
import { useNavigate } from "react-router-dom";
import global1 from "./global1";
import ep1 from "../api/ep1";
import * as XLSX from "xlsx";
import { menuitemscrm } from "./menucrm";


const styleId = "crmh-dash-v6";
if (!document.getElementById(styleId)) {
  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');

    * { box-sizing: border-box; }

    .crmh-root {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: #f0f6ff;
      min-height: 100vh;
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(24px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes shimmer {
      0%   { background-position: -600px 0; }
      100% { background-position: 600px 0; }
    }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
    @keyframes countUp {
      from { opacity: 0; transform: scale(0.7); }
      to   { opacity: 1; transform: scale(1); }
    }
    @keyframes headerGlow {
      0%, 100% { box-shadow: 0 8px 48px rgba(37,99,235,0.35); }
      50%       { box-shadow: 0 8px 64px rgba(37,99,235,0.55); }
    }
    @keyframes dotFloat {
      0%, 100% { transform: translateY(0px) scale(1); }
      50%       { transform: translateY(-12px) scale(1.08); }
    }
    @keyframes pageSlide {
      from { opacity: 0; transform: translateX(8px); }
      to   { opacity: 1; transform: translateX(0); }
    }

    .crmh-slide-up { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }
    .crmh-fade     { animation: fadeIn 0.5s ease both; }
    .page-animate  { animation: pageSlide 0.22s ease both; }

    .stat-card {
      border-radius: 20px !important;
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s !important;
      cursor: default;
    }
    .stat-card:hover { transform: translateY(-8px) !important; }

    .data-row { transition: background 0.15s ease !important; }
    .data-row:hover td { background: rgba(219,234,254,0.5) !important; }

    .nav-btn { transition: all 0.2s !important; }
    .nav-btn:hover { transform: scale(1.1) !important; }

    .pg-btn { transition: all 0.18s cubic-bezier(0.34,1.56,0.64,1) !important; }
    .pg-btn:hover:not(:disabled) { transform: scale(1.15) !important; }

    .progress-bar .MuiLinearProgress-bar {
      transition: transform 1.2s cubic-bezier(0.16,1,0.3,1) !important;
    }

    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: #f0f6ff; border-radius: 99px; }
    ::-webkit-scrollbar-thumb { background: #bfdbfe; border-radius: 99px; }
    ::-webkit-scrollbar-thumb:hover { background: #60a5fa; }

    .shimmer-bg {
      background: linear-gradient(90deg, #e0eeff 25%, #c7d9fa 50%, #e0eeff 75%);
      background-size: 600px 100%;
      animation: shimmer 1.4s ease infinite;
    }

    .section-card {
      border-radius: 20px !important;
      border: 1px solid rgba(219,234,254,0.8) !important;
      background: #ffffff !important;
      box-shadow: 0 1px 20px rgba(37,99,235,0.06) !important;
      transition: box-shadow 0.3s !important;
    }
    .section-card:hover { box-shadow: 0 4px 32px rgba(37,99,235,0.12) !important; }

    .temp-badge {
      font-family: 'DM Mono', monospace !important;
      font-size: 0.7rem !important;
      font-weight: 500 !important;
      letter-spacing: 0.04em !important;
    }

    .print-only { display: none !important; }

    @media print {
      @page { size: A4 landscape; margin: 10mm 10mm 10mm 10mm; }

      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
        animation: none !important;
        transition: none !important;
      }

      html, body {
        background: #ffffff !important;
        font-family: 'Plus Jakarta Sans', Arial, sans-serif !important;
        font-size: 9pt !important;
        width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
      }

      .crmh-root { background: #ffffff !important; min-height: unset !important; }

      .no-print,
      .crmh-header-bar,
      .pg-controls,
      .MuiSnackbar-root,
      .MuiTooltip-popper,
      .MuiTooltip-root { display: none !important; }

      .print-only  { display: block !important; }
      .screen-only { display: none !important; }
      div.print-only:first-of-type { display: flex !important; }
      .print-only[style] { display: flex !important; }
      .print-only > table { display: table !important; }

      .MuiContainer-root { max-width: 100% !important; width: 100% !important; padding-left: 0 !important; padding-right: 0 !important; padding-bottom: 0 !important; }

      .MuiGrid-container { display: flex !important; flex-wrap: wrap !important; width: 100% !important; margin: 0 !important; gap: 0 !important; }
      .MuiGrid-item { padding: 4px !important; }

      .section-card {
        border-radius: 6px !important;
        border: 1px solid #dbeafe !important;
        box-shadow: none !important;
        page-break-inside: avoid;
        break-inside: avoid;
        margin-bottom: 10px !important;
        padding: 8px 10px !important;
        background: #ffffff !important;
        width: 100% !important;
      }

      .stat-card {
        border-radius: 8px !important;
        box-shadow: none !important;
        page-break-inside: avoid;
        break-inside: avoid;
        min-height: unset !important;
      }
      .stat-card .MuiCardContent-root { padding: 10px 12px !important; }
      .stat-card .MuiTypography-root { color: #ffffff !important; }

      .print-table {
        width: 100% !important;
        border-collapse: collapse !important;
        font-size: 7pt !important;
        font-family: 'Plus Jakarta Sans', Arial, sans-serif !important;
        page-break-inside: auto;
      }
      .print-table thead { display: table-header-group; }
      .print-table tr { page-break-inside: avoid; break-inside: avoid; }
      .print-table th {
        background: #eff6ff !important;
        color: #1d4ed8 !important;
        font-size: 6pt !important;
        font-weight: 700 !important;
        text-transform: uppercase !important;
        letter-spacing: 0.05em !important;
        padding: 4px 5px !important;
        border-bottom: 1.5px solid #bfdbfe !important;
        border-right: 1px solid #dbeafe !important;
        text-align: left !important;
        white-space: nowrap !important;
      }
      .print-table td {
        font-size: 7pt !important;
        padding: 3px 5px !important;
        border-bottom: 1px solid #eff6ff !important;
        border-right: 1px solid #f1f5f9 !important;
        color: #1e293b !important;
        vertical-align: middle !important;
      }
      .print-table tr:nth-child(even) td { background: #f8faff !important; }

      .p-pill { display: inline-block !important; padding: 1px 5px !important; border-radius: 99px !important; font-size: 6pt !important; font-weight: 700 !important; line-height: 1.4 !important; }
      .p-hot   { color: #dc2626 !important; background: #fef2f2 !important; }
      .p-warm  { color: #d97706 !important; background: #fffbeb !important; }
      .p-cold  { color: #1d4ed8 !important; background: #eff6ff !important; }
      .p-conv  { color: #16a34a !important; background: #dcfce7 !important; }
      .p-lost  { color: #dc2626 !important; background: #fef2f2 !important; }
      .p-actv  { color: #1d4ed8 !important; background: #eff6ff !important; }
      .p-stage { color: #1d4ed8 !important; background: #eff6ff !important; }

      .p-track { background: #dbeafe !important; border-radius: 99px; height: 7px; width: 100%; display: block; }
      .p-fill  { background: #2563eb !important; border-radius: 99px; height: 7px; display: block; }

      .print-header {
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
        padding: 6px 0 8px !important;
        border-bottom: 2px solid #1d4ed8 !important;
        margin-bottom: 10px !important;
      }

      .MuiDivider-root { border-color: #dbeafe !important; margin-bottom: 6px !important; margin-top: 0 !important; }

      .section-card .MuiTypography-root[style*="fontWeight: 800"],
      .section-card .MuiTypography-root { font-size: 8.5pt !important; }

      .temp-summary-box {
        border-radius: 8px !important;
        padding: 8px 12px !important;
        text-align: center !important;
        box-shadow: none !important;
        page-break-inside: avoid;
        break-inside: avoid;
        margin: 4px !important;
      }
      .temp-summary-box * { color: #ffffff !important; }

      .MuiTableContainer-root { overflow: visible !important; max-height: none !important; }
      .print-page-break { page-break-before: always; break-before: page; }
      .MuiIconButton-root.nav-btn { display: none !important; }
      ::-webkit-scrollbar { display: none !important; }
    }
  `;
  document.head.appendChild(style);
}

/* ── Color palette ──────────────────────────────────────────────────────── */
const C = {
  blue900: "#1e3a8a", blue800: "#1e40af", blue700: "#1d4ed8",
  blue600: "#2563eb", blue500: "#3b82f6", blue400: "#60a5fa",
  blue300: "#93c5fd", blue200: "#bfdbfe", blue100: "#dbeafe",
  blue50: "#eff6ff", white: "#ffffff", gray50: "#f8fafc",
  gray100: "#f1f5f9", gray200: "#e2e8f0", gray400: "#94a3b8",
  gray600: "#475569", gray800: "#1e293b",
};

const PAGE_SIZE = 5;

/* ── Helpers ────────────────────────────────────────────────────────────── */
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—");
const fmtNow = () => new Date().toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
const tempPillClass = (t) => `p-pill ${t === "Hot" ? "p-hot" : t === "Warm" ? "p-warm" : "p-cold"}`;
const statusPillClass = (s) => `p-pill ${s === "Converted" ? "p-conv" : s === "Lost" ? "p-lost" : "p-actv"}`;

const buildQuery = (extra = {}) => {
  const base = `colid=${global1.colid}&user=${encodeURIComponent(global1.user)}&role=${encodeURIComponent(global1.role || "")}`;
  const extras = Object.entries(extra).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");
  return extras ? `${base}&${extras}` : base;
};

/* Safely parse a pagination object out of any server response */
const parsePagination = (resData, currentPage) => {
  if (resData.pagination && resData.pagination.totalCount != null) return resData.pagination;
  const total = resData.count || 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  return { totalCount: total, totalPages, currentPage, pageSize: PAGE_SIZE, hasNextPage: currentPage < totalPages, hasPrevPage: currentPage > 1 };
};

/* Build a pagination object for client-side sliced data */
const localPagObj = (total, page) => {
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  return { totalCount: total, totalPages, currentPage: page, pageSize: PAGE_SIZE, hasNextPage: page < totalPages, hasPrevPage: page > 1 };
};

/* ══════════════════════════════════════════════════════════════════════════
   useServerPage — fires API GET on every page change
   ══════════════════════════════════════════════════════════════════════════ */
function useServerPage(endpoint, extraParams = {}) {
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([]);
  const [pagn, setPagn] = useState(localPagObj(0, 1));
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);
  const extraStr = JSON.stringify(extraParams);

  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);

  const doFetch = useCallback(async (p) => {
    setLoading(true);
    try {
      const extra = JSON.parse(extraStr);
      const res = await ep1.get(`${endpoint}?${buildQuery({ ...extra, page: p })}`);
      if (!mountedRef.current) return;
      if (res.data.success) {
        setRows(Array.isArray(res.data.data) ? res.data.data : []);
        setPagn(parsePagination(res.data, p));
      }
    } catch (_) { }
    finally { if (mountedRef.current) setLoading(false); }
  }, [endpoint, extraStr]);

  useEffect(() => { doFetch(page); }, [page, doFetch]);

  const goTo = useCallback((p) => setPage(p), []);
  return { rows, pagn, loading, page, goTo };
}


function useLocalPage(data = []) {
  const [page, setPage] = useState(1);
  const prevLen = useRef(data.length);
  useEffect(() => {
    if (data.length !== prevLen.current) { setPage(1); prevLen.current = data.length; }
  }, [data.length]);
  const pagn = localPagObj(data.length, page);
  const slice = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const goTo = useCallback((p) => setPage(p), []);
  return { slice, pagn, page, goTo };
}


const PaginationBar = ({ pagn, goTo }) => {
  const { totalCount, totalPages, currentPage, pageSize } = pagn;
  if (!totalPages || totalPages <= 1) return null;

  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalCount);
  const btnSx = (dis) => ({
    width: 30, height: 30, borderRadius: "8px",
    bgcolor: dis ? C.gray100 : C.blue50,
    color: dis ? C.gray400 : C.blue600,
    border: `1px solid ${dis ? C.gray200 : C.blue100}`,
    "&:hover:not(:disabled)": { bgcolor: C.blue100 },
  });

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
    .reduce((acc, p, idx, arr) => {
      if (idx > 0 && arr[idx - 1] !== p - 1) acc.push("…");
      acc.push(p);
      return acc;
    }, []);

  return (
    <Box className="pg-controls" sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 2, pt: 2, borderTop: `1px solid ${C.blue100}`, flexWrap: "wrap", gap: 1 }}>
      <Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: "0.72rem", color: C.gray400, fontWeight: 500 }}>
        {from}–{to} of {totalCount} records
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <Tooltip title="First page" arrow><span>
          <IconButton className="pg-btn" size="small" disabled={currentPage === 1} onClick={() => goTo(1)} sx={btnSx(currentPage === 1)}>
            <FirstPageIcon sx={{ fontSize: 15 }} />
          </IconButton>
        </span></Tooltip>
        <Tooltip title="Previous" arrow><span>
          <IconButton className="pg-btn" size="small" disabled={currentPage === 1} onClick={() => goTo(currentPage - 1)} sx={btnSx(currentPage === 1)}>
            <ChevronLeftIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </span></Tooltip>
        {pages.map((p, i) =>
          p === "…"
            ? <Typography key={`d${i}`} sx={{ fontFamily: "'DM Mono', monospace", fontSize: "0.72rem", color: C.gray400, px: 0.5 }}>…</Typography>
            : <IconButton key={p} className="pg-btn" size="small" onClick={() => goTo(p)}
              sx={{ width: 30, height: 30, borderRadius: "8px", fontFamily: "'DM Mono', monospace", fontWeight: p === currentPage ? 800 : 500, fontSize: "0.72rem", bgcolor: p === currentPage ? C.blue600 : C.blue50, color: p === currentPage ? C.white : C.blue600, border: `1px solid ${p === currentPage ? C.blue600 : C.blue100}`, "&:hover": { bgcolor: p === currentPage ? C.blue700 : C.blue100 } }}>
              {p}
            </IconButton>
        )}
        <Tooltip title="Next" arrow><span>
          <IconButton className="pg-btn" size="small" disabled={currentPage === totalPages} onClick={() => goTo(currentPage + 1)} sx={btnSx(currentPage === totalPages)}>
            <ChevronRightIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </span></Tooltip>
        <Tooltip title="Last page" arrow><span>
          <IconButton className="pg-btn" size="small" disabled={currentPage === totalPages} onClick={() => goTo(totalPages)} sx={btnSx(currentPage === totalPages)}>
            <LastPageIcon sx={{ fontSize: 15 }} />
          </IconButton>
        </span></Tooltip>
      </Box>
    </Box>
  );
};


const LoadingStripe = ({ loading }) =>
  loading ? (
    <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 20, borderRadius: "12px 12px 0 0", overflow: "hidden" }}>
      <LinearProgress sx={{ height: 3, bgcolor: C.blue100, "& .MuiLinearProgress-bar": { bgcolor: C.blue500 } }} />
    </Box>
  ) : null;


const StatCard = ({ title, value, icon, accent, delay = 0 }) => (
  <Card className="stat-card crmh-slide-up" elevation={0}
    sx={{ background: accent, color: C.white, animationDelay: `${delay}ms`, boxShadow: "0 8px 32px rgba(37,99,235,0.22)" }}>
    <CardContent sx={{ p: "32px !important" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box>
          <Typography sx={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.82rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.75, mb: 1.5 }}>{title}</Typography>
          <Typography sx={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "3rem", fontWeight: 900, lineHeight: 1, animation: "countUp 0.6s ease both", animationDelay: `${delay + 200}ms` }}>{value}</Typography>
        </Box>
        <Box sx={{ width: 60, height: 60, borderRadius: "16px", background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)" }}>
          {React.cloneElement(icon, { sx: { fontSize: 30, color: C.white } })}
        </Box>
      </Box>
    </CardContent>
  </Card>
);


const TempChip = ({ temp }) => {
  const cfg = {
    Hot: { color: "#dc2626", bg: "#fef2f2", dot: "#f87171" },
    Warm: { color: "#d97706", bg: "#fffbeb", dot: "#fbbf24" },
    Cold: { color: C.blue700, bg: C.blue50, dot: C.blue400 },
  };
  const c = cfg[temp] || cfg.Cold;
  return (
    <Box component="span" className="temp-badge"
      sx={{ display: "inline-flex", alignItems: "center", gap: "5px", px: "8px", py: "3px", borderRadius: "99px", bgcolor: c.bg, color: c.color }}>
      <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: c.dot, flexShrink: 0 }} />
      {temp}
    </Box>
  );
};


const SectionCard = ({ children, delay = 0, sx = {} }) => (
  <Paper className="section-card crmh-slide-up" elevation={0} sx={{ p: 3, ...sx, animationDelay: `${delay}ms` }}>
    {children}
  </Paper>
);


const SectionHeader = ({ icon, title, count, onDownload, downloading }) => (
  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <Box sx={{ width: 36, height: 36, borderRadius: "10px", background: C.blue50, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {React.cloneElement(icon, { sx: { fontSize: 18, color: C.blue600 } })}
      </Box>
      <Typography sx={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "1rem", color: C.gray800 }}>
        {title}
        {count != null && (
          <Box component="span" sx={{ ml: 1, fontSize: "0.72rem", fontWeight: 700, color: C.blue600, bgcolor: C.blue100, px: 1, py: 0.25, borderRadius: "99px" }}>
            {count}
          </Box>
        )}
      </Typography>
    </Box>
    {onDownload && global1.role === 'Admin' && (
      <Tooltip title="Download Excel" arrow>
        <IconButton className="nav-btn no-print" onClick={onDownload} disabled={downloading} size="small"
          sx={{ bgcolor: C.blue50, color: C.blue600, border: `1px solid ${C.blue100}`, "&:hover": { bgcolor: C.blue100 } }}>
          <DownloadIcon sx={{ fontSize: 17, ...(downloading ? { animation: "pulse 1s infinite" } : {}) }} />
        </IconButton>
      </Tooltip>
    )}
  </Box>
);


const TH = ({ children }) => (
  <TableCell sx={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "0.67rem", textTransform: "uppercase", letterSpacing: "0.08em", color: C.blue700, bgcolor: C.blue50, borderBottom: `2px solid ${C.blue100}`, whiteSpace: "nowrap", py: 1.5 }}>
    {children}
  </TableCell>
);
const TD = ({ children, sx = {} }) => (
  <TableCell sx={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.8rem", color: C.gray600, borderBottom: `1px solid ${C.blue50}`, py: 1.25, ...sx }}>
    {children}
  </TableCell>
);


const LoadingView = () => (
  <Box className="crmh-root">
    <Box sx={{ background: `linear-gradient(135deg, ${C.blue800} 0%, ${C.blue600} 100%)`, py: 5, px: 4, mb: 4 }}>
      <Box sx={{ width: '100%' }}>
        <Skeleton variant="text" width={260} height={44} sx={{ bgcolor: "rgba(255,255,255,0.15)" }} />
        <Skeleton variant="text" width={360} height={22} sx={{ bgcolor: "rgba(255,255,255,0.08)", mt: 1 }} />
      </Box>
    </Box>
    <Box sx={{ width: '100%', px: 3 }}>
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {[...Array(6)].map((_, i) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={i}>
            <Box className="shimmer-bg" sx={{ height: 110, borderRadius: "20px" }} />
          </Grid>
        ))}
      </Grid>
      {[...Array(3)].map((_, i) => <Box key={i} className="shimmer-bg" sx={{ height: 200, borderRadius: "20px", mb: 3 }} />)}
    </Box>
  </Box>
);


const AllLeadsTable = ({ printData }) => {
  const { rows, pagn, loading, page, goTo } = useServerPage("/api/v2/getallleadsag");
  const headers = ["S/N", "Name", "Phone", "Email", "Edu. Qual.", "Category", "Course", "Source", "State", "City", "Stage", "Status", "Temp", "Score", "Assigned To", "Created"];

  return (
    <>
      <div className="screen-only">
        <Box sx={{ position: "relative" }}>
          <LoadingStripe loading={loading} />
          <TableContainer className="page-animate"
            sx={{ borderRadius: "12px", border: `1px solid ${C.blue100}`, opacity: loading ? 0.6 : 1, transition: "opacity 0.2s" }}>
            <Table stickyHeader size="small">
              <TableHead><TableRow>{headers.map(h => <TH key={h}>{h}</TH>)}</TableRow></TableHead>
              <TableBody>
                {rows.length === 0 && !loading ? (
                  <TableRow>
                    <TableCell colSpan={headers.length} sx={{ textAlign: "center", py: 6, color: C.gray400, fontSize: "0.875rem" }}>
                      <PeopleIcon sx={{ fontSize: 40, mb: 1, opacity: 0.3, display: "block", mx: "auto" }} />
                      No leads found
                    </TableCell>
                  </TableRow>
                ) : rows.map((lead, i) => {
                  const idx = (page - 1) * PAGE_SIZE + i + 1;
                  const s = lead.leadstatus;
                  const sc = s === "Converted" ? { bg: "#dcfce7", color: "#16a34a" }
                    : s === "Lost" ? { bg: "#fef2f2", color: "#dc2626" }
                      : { bg: C.blue50, color: C.blue700 };
                  return (
                    <TableRow key={lead._id || i} className="data-row">
                      <TD sx={{ color: C.gray400, fontFamily: "'DM Mono', monospace", fontSize: "0.72rem" }}>{idx}</TD>
                      <TD sx={{ fontWeight: 700, color: C.gray800, whiteSpace: "nowrap" }}>{lead.name || "—"}</TD>
                      <TD>{lead.phone || "—"}</TD>
                      <TD>{lead.email || "—"}</TD>
                      <TD>
                        {lead.education_qualification ? (
                          <Box component="span" sx={{ px: 1.5, py: 0.4, borderRadius: "99px", bgcolor: "#f0f9ff", color: "#0369a1", fontSize: "0.68rem", fontWeight: 700, whiteSpace: "nowrap" }}>
                            {lead.education_qualification}
                          </Box>
                        ) : "—"}
                      </TD>
                      <TD>{lead.category || "—"}</TD>
                      <TD>{lead.course_interested || "—"}</TD>
                      <TD sx={{ maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lead.source || "—"}</TD>
                      <TD>{lead.state || "—"}</TD>
                      <TD>{lead.city || "—"}</TD>
                      <TD>
                        <Box component="span" sx={{ px: 1.5, py: 0.4, borderRadius: "99px", bgcolor: C.blue50, color: C.blue700, fontSize: "0.68rem", fontWeight: 700, whiteSpace: "nowrap" }}>
                          {lead.pipeline_stage || "New Lead"}
                        </Box>
                      </TD>
                      <TD>
                        <Box component="span" sx={{ px: 1.5, py: 0.4, borderRadius: "99px", bgcolor: sc.bg, color: sc.color, fontSize: "0.68rem", fontWeight: 700 }}>
                          {s || "Active"}
                        </Box>
                      </TD>
                      <TD><TempChip temp={lead.lead_temperature || "Cold"} /></TD>
                      <TD sx={{ fontWeight: 800, color: C.blue700, fontFamily: "'DM Mono', monospace", textAlign: "center" }}>{lead.lead_score || 0}</TD>
                      <TD>{lead.assignedto || "—"}</TD>
                      <TD sx={{ whiteSpace: "nowrap", fontFamily: "'DM Mono', monospace", fontSize: "0.72rem" }}>{fmtDate(lead.createdAt)}</TD>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        <PaginationBar pagn={pagn} goTo={goTo} />
      </div>
      <div className="print-only">
        <table className="print-table">
          <thead><tr>{headers.map(h => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {(printData || rows).map((lead, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td style={{ fontWeight: 700 }}>{lead.name || "—"}</td>
                <td>{lead.phone || "—"}</td>
                <td>{lead.email || "—"}</td>
                <td>{lead.education_qualification || "—"}</td>
                <td>{lead.category || "—"}</td>
                <td>{lead.course_interested || "—"}</td>
                <td>{lead.source || "—"}</td>
                <td>{lead.state || "—"}</td>
                <td>{lead.city || "—"}</td>
                <td><span className="p-pill p-stage">{lead.pipeline_stage || "New Lead"}</span></td>
                <td><span className={statusPillClass(lead.leadstatus)}>{lead.leadstatus || "Active"}</span></td>
                <td><span className={tempPillClass(lead.lead_temperature || "Cold")}>{lead.lead_temperature || "Cold"}</span></td>
                <td style={{ fontWeight: 700, textAlign: "center" }}>{lead.lead_score || 0}</td>
                <td>{lead.assignedto || "—"}</td>
                <td>{fmtDate(lead.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};




const UpcomingFollowupsTable = ({ data }) => {
  const { slice, pagn, goTo } = useLocalPage(data || []);
  const headers = ["Name", "Phone", "Email", "Follow-up Date", "Stage", "Assigned To", "Temp"];

  return (
    <>
      <div className="screen-only">
        <TableContainer className="page-animate" sx={{ borderRadius: "12px", border: `1px solid ${C.blue100}` }}>
          <Table stickyHeader size="small">
            <TableHead><TableRow>{headers.map(h => <TH key={h}>{h}</TH>)}</TableRow></TableHead>
            <TableBody>
              {slice.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={headers.length} sx={{ textAlign: "center", py: 5, color: C.gray400, fontSize: "0.875rem" }}>
                    No upcoming follow-ups
                  </TableCell>
                </TableRow>
              ) : slice.map((lead, i) => (
                <TableRow key={i} className="data-row">
                  <TD sx={{ fontWeight: 700, color: C.gray800 }}>{lead.name || "—"}</TD>
                  <TD>{lead.phone || "—"}</TD>
                  <TD>{lead.email || "—"}</TD>
                  <TD>
                    <Box component="span" sx={{ px: 1.5, py: 0.4, borderRadius: "99px", bgcolor: C.blue50, color: C.blue700, fontSize: "0.68rem", fontWeight: 700, fontFamily: "'DM Mono', monospace", whiteSpace: "nowrap" }}>
                      {fmtDate(lead.next_followup_date)}
                    </Box>
                  </TD>
                  <TD>{lead.pipeline_stage || "—"}</TD>
                  <TD>{lead.assignedto || "—"}</TD>
                  <TD><TempChip temp={lead.lead_temperature || "Cold"} /></TD>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <PaginationBar pagn={pagn} goTo={goTo} />
      </div>
      <div className="print-only">
        <table className="print-table">
          <thead><tr>{headers.map(h => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {(data || []).map((lead, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 700 }}>{lead.name || "—"}</td>
                <td>{lead.phone || "—"}</td>
                <td>{lead.email || "—"}</td>
                <td>{fmtDate(lead.next_followup_date)}</td>
                <td>{lead.pipeline_stage || "—"}</td>
                <td>{lead.assignedto || "—"}</td>
                <td><span className={tempPillClass(lead.lead_temperature || "Cold")}>{lead.lead_temperature || "Cold"}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};


const OverdueFollowupsTable = ({ data }) => {
  const { slice, pagn, goTo } = useLocalPage(data || []);
  const headers = ["Name", "Phone", "Email", "Due Date", "Stage", "Assigned To", "Temp"];

  return (
    <>
      <div className="screen-only">
        <TableContainer className="page-animate" sx={{ borderRadius: "12px", border: `1px solid ${C.blue100}` }}>
          <Table stickyHeader size="small">
            <TableHead><TableRow>{headers.map(h => <TH key={h}>{h}</TH>)}</TableRow></TableHead>
            <TableBody>
              {slice.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={headers.length} sx={{ textAlign: "center", py: 5, color: C.gray400, fontSize: "0.875rem" }}>
                    No overdue follow-ups
                  </TableCell>
                </TableRow>
              ) : slice.map((lead, i) => (
                <TableRow key={i} className="data-row">
                  <TD sx={{ fontWeight: 700, color: C.gray800 }}>{lead.name || "—"}</TD>
                  <TD>{lead.phone || "—"}</TD>
                  <TD>{lead.email || "—"}</TD>
                  <TD>
                    <Box component="span" sx={{ px: 1.5, py: 0.4, borderRadius: "99px", bgcolor: "#fef2f2", color: "#dc2626", fontSize: "0.68rem", fontWeight: 700, fontFamily: "'DM Mono', monospace", whiteSpace: "nowrap" }}>
                      {fmtDate(lead.next_followup_date)}
                    </Box>
                  </TD>
                  <TD>{lead.pipeline_stage || "—"}</TD>
                  <TD>{lead.assignedto || "—"}</TD>
                  <TD><TempChip temp={lead.lead_temperature || "Cold"} /></TD>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <PaginationBar pagn={pagn} goTo={goTo} />
      </div>
      <div className="print-only">
        <table className="print-table">
          <thead><tr>{headers.map(h => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {(data || []).map((lead, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 700 }}>{lead.name || "—"}</td>
                <td>{lead.phone || "—"}</td>
                <td>{lead.email || "—"}</td>
                <td>{fmtDate(lead.next_followup_date)}</td>
                <td>{lead.pipeline_stage || "—"}</td>
                <td>{lead.assignedto || "—"}</td>
                <td><span className={tempPillClass(lead.lead_temperature || "Cold")}>{lead.lead_temperature || "Cold"}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

/* ── Campus Visits (local) ──────────────────────────────────────────────── */
const CampusVisitsTable = ({ data }) => {
  const { slice, pagn, goTo } = useLocalPage(data || []);
  const headers = ["Name", "Phone", "Email", "Visit Date", "Completed", "Stage"];

  return (
    <>
      <div className="screen-only">
        <TableContainer className="page-animate" sx={{ borderRadius: "12px", border: `1px solid ${C.blue100}` }}>
          <Table stickyHeader size="small">
            <TableHead><TableRow>{headers.map(h => <TH key={h}>{h}</TH>)}</TableRow></TableHead>
            <TableBody>
              {slice.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={headers.length} sx={{ textAlign: "center", py: 6, color: C.gray400, fontSize: "0.875rem" }}>
                    <LocationIcon sx={{ fontSize: 36, mb: 1, opacity: 0.3, display: "block", mx: "auto" }} />
                    No campus visit records
                  </TableCell>
                </TableRow>
              ) : slice.map((lead, i) => (
                <TableRow key={i} className="data-row">
                  <TD sx={{ fontWeight: 700, color: C.gray800 }}>{lead.name || "—"}</TD>
                  <TD>{lead.phone || "—"}</TD>
                  <TD>{lead.email || "—"}</TD>
                  <TD>
                    <Box component="span" sx={{ px: 1.5, py: 0.4, borderRadius: "99px", bgcolor: "#dcfce7", color: "#16a34a", fontSize: "0.68rem", fontWeight: 700, fontFamily: "'DM Mono', monospace", whiteSpace: "nowrap" }}>
                      {fmtDate(lead.campus_visit_date)}
                    </Box>
                  </TD>
                  <TD>
                    <Box component="span" sx={{ px: 1.5, py: 0.4, borderRadius: "99px", bgcolor: lead.campus_visit_completed === "Yes" ? "#dcfce7" : "#fef2f2", color: lead.campus_visit_completed === "Yes" ? "#16a34a" : "#dc2626", fontSize: "0.68rem", fontWeight: 800 }}>
                      {lead.campus_visit_completed || "No"}
                    </Box>
                  </TD>
                  <TD>{lead.pipeline_stage || "—"}</TD>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <PaginationBar pagn={pagn} goTo={goTo} />
      </div>
      <div className="print-only">
        <table className="print-table">
          <thead><tr>{headers.map(h => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {(data || []).map((lead, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 700 }}>{lead.name || "—"}</td>
                <td>{lead.phone || "—"}</td>
                <td>{lead.email || "—"}</td>
                <td>{fmtDate(lead.campus_visit_date)}</td>
                <td>
                  <span style={{ padding: "1px 6px", borderRadius: "99px", fontSize: "6.5pt", fontWeight: 700, background: lead.campus_visit_completed === "Yes" ? "#dcfce7" : "#fef2f2", color: lead.campus_visit_completed === "Yes" ? "#16a34a" : "#dc2626" }}>
                    {lead.campus_visit_completed || "No"}
                  </span>
                </td>
                <td>{lead.pipeline_stage || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

/* ── Pipeline Stage Change Log (local) ──────────────────────────────────── */
const StageChangeTable = ({ data }) => {
  const { slice, pagn, goTo } = useLocalPage(data || []);
  const headers = ["Date", "Performed By", "Notes"];

  return (
    <>
      <div className="screen-only">
        <TableContainer className="page-animate" sx={{ borderRadius: "12px", border: `1px solid ${C.blue100}` }}>
          <Table stickyHeader size="small">
            <TableHead><TableRow>{headers.map(h => <TH key={h}>{h}</TH>)}</TableRow></TableHead>
            <TableBody>
              {slice.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={headers.length} sx={{ textAlign: "center", py: 5, color: C.gray400, fontSize: "0.875rem" }}>No stage change records</TableCell>
                </TableRow>
              ) : slice.map((log, i) => (
                <TableRow key={i} className="data-row">
                  <TD sx={{ whiteSpace: "nowrap", fontFamily: "'DM Mono', monospace", fontSize: "0.72rem" }}>{fmtDate(log.activity_date)}</TD>
                  <TD sx={{ fontWeight: 600, color: C.gray800 }}>{log.performed_by || "—"}</TD>
                  <TD sx={{ maxWidth: 340, color: C.gray600 }}>{log.notes}</TD>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <PaginationBar pagn={pagn} goTo={goTo} />
      </div>
      <div className="print-only">
        <table className="print-table">
          <thead><tr>{headers.map(h => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {(data || []).map((log, i) => (
              <tr key={i}>
                <td style={{ whiteSpace: "nowrap" }}>{fmtDate(log.activity_date)}</td>
                <td style={{ fontWeight: 600 }}>{log.performed_by || "—"}</td>
                <td>{log.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

/* ── Pipeline Stage Breakdown (local) ───────────────────────────────────── */
const PipelineBreakdown = ({ data }) => {
  const { slice, pagn, page, goTo } = useLocalPage(data || []);
  const maxCount = (data || []).length > 0 ? Math.max(...(data || []).map(s => s.count)) : 1;
  const gradients = [
    "linear-gradient(90deg,#3b82f6,#1d4ed8)", "linear-gradient(90deg,#0ea5e9,#0284c7)",
    "linear-gradient(90deg,#6366f1,#4338ca)", "linear-gradient(90deg,#8b5cf6,#7c3aed)",
    "linear-gradient(90deg,#06b6d4,#0891b2)", "linear-gradient(90deg,#10b981,#059669)",
    "linear-gradient(90deg,#f59e0b,#d97706)", "linear-gradient(90deg,#f97316,#ea580c)",
    "linear-gradient(90deg,#ec4899,#be185d)",
  ];

  if (!data || data.length === 0) {
    return <Typography sx={{ textAlign: "center", py: 3, color: C.gray400, fontSize: "0.875rem" }}>No data available</Typography>;
  }

  return (
    <>
      <div className="screen-only">
        <Box className="page-animate" sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {slice.map((stage, i) => {
            const absIdx = (page - 1) * PAGE_SIZE + i;
            return (
              <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 2, p: "10px 14px", borderRadius: "12px", transition: "background 0.2s", "&:hover": { bgcolor: C.blue50 } }}>
                <Typography sx={{ minWidth: 190, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: "0.82rem", color: C.gray800 }} noWrap>
                  {stage._id || "Unknown"}
                </Typography>
                <Box sx={{ flex: 1 }}>
                  <LinearProgress className="progress-bar" variant="determinate" value={(stage.count / maxCount) * 100}
                    sx={{ height: 10, borderRadius: "99px", bgcolor: C.blue100, "& .MuiLinearProgress-bar": { borderRadius: "99px", background: gradients[absIdx % gradients.length] } }} />
                </Box>
                <Box sx={{ minWidth: 40, textAlign: "center", fontFamily: "'DM Mono', monospace", fontWeight: 700, fontSize: "0.8rem", color: C.blue700 }}>
                  {stage.count}
                </Box>
                <Typography sx={{ color: C.gray400, fontSize: "0.72rem", minWidth: 88, textAlign: "right", fontFamily: "'DM Mono', monospace" }}>
                  {fmtDate(stage.lastChanged)}
                </Typography>
              </Box>
            );
          })}
        </Box>
        <PaginationBar pagn={pagn} goTo={goTo} />
      </div>
      <div className="print-only">
        <table className="print-table">
          <thead><tr>{["Stage", "Count", "Progress", "Last Changed"].map(h => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {(data || []).map((stage, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 600 }}>{stage._id || "Unknown"}</td>
                <td style={{ fontWeight: 700, textAlign: "center", color: "#1d4ed8" }}>{stage.count}</td>
                <td style={{ width: "45%" }}>
                  <div className="p-track">
                    <div className="p-fill" style={{ width: `${(stage.count / maxCount) * 100}%` }} />
                  </div>
                </td>
                <td style={{ color: "#94a3b8" }}>{fmtDate(stage.lastChanged)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

/* ════════════════════════════════════════════════════════════════════════════
   Main Dashboard Component
   ════════════════════════════════════════════════════════════════════════════ */
export default function CrmhDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [downloading, setDownloading] = useState({});
  const [toast, setToast] = useState({ open: false, msg: "", severity: "success" });

  // Guard: redirect to login if user session is not available
  useEffect(() => {
    if (!global1.user || !global1.colid) {
      navigate('/');
    }
  }, [navigate]);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await ep1.get(`/api/v2/getcrmhdashboard?${buildQuery()}`);
      if (res.data.success) setData(res.data.data);
      else setError(res.data.message || "Failed to load dashboard");
    } catch {
      setError("Network error — please check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const handleRefresh = async () => {
    setSpinning(true);
    await fetchDashboard();
    setTimeout(() => setSpinning(false), 700);
  };

  // ── Client-side Excel download from dashboard data already in state ──
  const fmtXlDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

  const downloadExcel = (rows, sheetName, filename) => {
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, filename);
  };

  const handleDownload = (key) => {
    if (!data) return;
    setDownloading(p => ({ ...p, [key]: true }));
    try {
      let rows = [];
      let filename = 'CRMH_Report.xlsx';
      let sheetName = 'Report';

      switch (key) {
        case 'all': {
          filename = 'CRMH_All_Leads.xlsx'; sheetName = 'All Leads';
          rows = (data.allLeads || []).map(l => ({
            Name: l.name || '', Phone: l.phone || '', Email: l.email || '',
            Category: l.category || '', Course: l.course_interested || '',
            Source: l.source || '', Stage: l.pipeline_stage || '',
            Status: l.leadstatus || '', Temperature: l.lead_temperature || '',
            Score: l.lead_score || 0, 'Assigned To': l.assignedto || '',
            City: l.city || '', State: l.state || '',
            'Next Followup': fmtXlDate(l.next_followup_date),
            'Campus Visit': fmtXlDate(l.campus_visit_date),
            Created: fmtXlDate(l.createdAt),
          }));
          break;
        }
        case 'followups': {
          filename = 'CRMH_Followups.xlsx'; sheetName = 'Follow-ups';
          const up = (data.upcomingFollowups || []).map(l => ({
            Type: 'Upcoming', Name: l.name || '', Phone: l.phone || '', Email: l.email || '',
            'Followup Date': fmtXlDate(l.next_followup_date), Stage: l.pipeline_stage || '',
            'Assigned To': l.assignedto || '', Temperature: l.lead_temperature || '',
          }));
          const ov = (data.lastFollowupDates || []).map(l => ({
            Type: 'Overdue', Name: l.name || '', Phone: l.phone || '', Email: l.email || '',
            'Followup Date': fmtXlDate(l.followupdate), Stage: l.pipeline_stage || '',
            'Assigned To': l.assignedto || '', Temperature: l.lead_temperature || '',
          }));
          rows = [...up, ...ov];
          break;
        }
        case 'followups2': {
          filename = 'CRMH_Overdue_Followups.xlsx'; sheetName = 'Overdue';
          rows = (data.lastFollowupDates || []).map(l => ({
            Name: l.name || '', Phone: l.phone || '', Email: l.email || '',
            'Last Followup': fmtXlDate(l.followupdate), Stage: l.pipeline_stage || '',
            'Assigned To': l.assignedto || '', Temperature: l.lead_temperature || '',
          }));
          break;
        }
        case 'campus': {
          filename = 'CRMH_Campus_Visits.xlsx'; sheetName = 'Campus Visits';
          rows = (data.campusVisits || []).map(l => ({
            Name: l.name || '', Phone: l.phone || '', Email: l.email || '',
            'Visit Date': fmtXlDate(l.campus_visit_date),
            Completed: l.campus_visit_completed || 'No',
            Stage: l.pipeline_stage || '',
          }));
          break;
        }
        case 'pipeline': {
          filename = 'CRMH_Pipeline_Summary.xlsx'; sheetName = 'Pipeline';
          rows = (data.pipelineStageBreakdown || []).map(s => ({
            'Pipeline Stage': s._id || 'Unknown', Count: s.count,
            'Last Updated': fmtXlDate(s.lastChanged),
          }));
          break;
        }
        case 'temperature': {
          filename = 'CRMH_Temperature_Report.xlsx'; sheetName = 'Temperature';
          const total = data.totalLeads || 1;
          rows = [
            { Temperature: 'Hot', Count: data.leadsByTemperature?.hot || 0, Percentage: ((data.leadsByTemperature?.hot || 0) / total * 100).toFixed(1) + '%' },
            { Temperature: 'Warm', Count: data.leadsByTemperature?.warm || 0, Percentage: ((data.leadsByTemperature?.warm || 0) / total * 100).toFixed(1) + '%' },
            { Temperature: 'Cold', Count: data.leadsByTemperature?.cold || 0, Percentage: ((data.leadsByTemperature?.cold || 0) / total * 100).toFixed(1) + '%' },
          ];
          break;
        }
        case 'activities': {
          filename = 'CRMH_Stage_Changes.xlsx'; sheetName = 'Stage Changes';
          rows = (data.pipelineStageChanges || []).map(log => ({
            Date: fmtXlDate(log.activity_date), 'Performed By': log.performed_by || '',
            Notes: log.notes || '',
          }));
          break;
        }
        default: break;
      }

      if (rows.length === 0) {
        setToast({ open: true, msg: 'No data available to download.', severity: 'warning' });
        return;
      }
      downloadExcel(rows, sheetName, filename);
      setToast({ open: true, msg: `${filename} downloaded!`, severity: 'success' });
    } catch {
      setToast({ open: true, msg: 'Download failed.', severity: 'error' });
    } finally {
      setDownloading(p => ({ ...p, [key]: false }));
    }
  };

  if (loading) return <LoadingView />;

  if (error) return (
    <Box className="crmh-root" sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <Box sx={{ textAlign: "center", bgcolor: C.white, borderRadius: "24px", p: 6, border: `1px solid ${C.blue100}`, boxShadow: "0 8px 40px rgba(37,99,235,0.1)" }}>
        <Box sx={{ fontSize: 48, mb: 2 }}>⚠️</Box>
        <Typography sx={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "1.2rem", color: C.gray800, mb: 1 }}>{error}</Typography>
        <Typography sx={{ color: C.gray400, fontSize: "0.875rem" }}>Please check your connection and try again.</Typography>
      </Box>
    </Box>
  );

  const {
    totalLeads, leadsByTemperature, pipelineStageBreakdown,
    upcomingFollowups, lastFollowupDates, campusVisits,
    campusVisitCompletedCount, lastVisitCount,
    pipelineStageChanges, allLeads = [],
    timeBasedLeads, applicationsSubmittedCount, confirmedAdmissionsCount,
    closeLeadCount, followUpAging, sourcePerformance, courseWiseAdmissions,
    programPerformance = [], counsellorPerformance = [], landingPageStats = {},
    totalFeesCollected = 0, funnelData = [], leadsByCity = [],
    overdueFollowupsCount = 0, targetVsAchieved = {}
  } = data;

  const conversionPct = totalLeads > 0 ? ((confirmedAdmissionsCount / totalLeads) * 100).toFixed(1) + "%" : "0%";
  const tvaLabel = `${targetVsAchieved.achieved || 0}/${targetVsAchieved.target || 0} (${targetVsAchieved.percentage || 0}%)`;
  const statCards = [
    { title: "Total Leads (T/M/Y)", value: `${timeBasedLeads?.today || 0}/${timeBasedLeads?.month || 0}/${timeBasedLeads?.year || 0}`, icon: <PeopleIcon />, accent: `linear-gradient(135deg, ${C.blue700} 0%, ${C.blue900} 100%)`, delay: 0 },
    { title: "Applications", value: applicationsSubmittedCount || 0, icon: <CheckIcon />, accent: "linear-gradient(135deg, #059669 0%, #065f46 100%)", delay: 60 },
    { title: "Confirmed / Closed", value: `${confirmedAdmissionsCount || 0} / ${closeLeadCount || 0}`, icon: <CheckIcon />, accent: "linear-gradient(135deg, #059669 0%, #065f46 100%)", delay: 120 },
    { title: "Conversion %", value: conversionPct, icon: <TimelineIcon />, accent: `linear-gradient(135deg, ${C.blue600} 0%, #0c4a6e 100%)`, delay: 180 },
    { title: "Fees Collected", value: `₹${totalFeesCollected.toLocaleString('en-IN')}`, icon: <MoneyIcon />, accent: "linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)", delay: 240 },
    { title: "Pending Follow-ups", value: followUpAging?.pending3Days || 0, icon: <CalendarIcon />, accent: "linear-gradient(135deg, #d97706 0%, #92400e 100%)", delay: 300 },
    { title: "Overdue Follow-ups", value: overdueFollowupsCount, icon: <CalendarIcon />, accent: "linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%)", delay: 360 },
    { title: "Target vs Achieved", value: tvaLabel, icon: <TrendingUpIcon />, accent: `linear-gradient(135deg, ${C.blue500} 0%, ${C.blue700} 100%)`, delay: 420 },
  ];

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f1f5f9" }}>
      {/* ══ Left Sidebar Menu ══ */}
      <Box className="no-print" sx={{
        width: 300, minWidth: 300, flexShrink: 0,
        bgcolor: "#fff", borderRight: "1px solid #e2e8f0",
        overflowY: "auto", height: "100vh", position: "sticky", top: 0,
        boxShadow: "2px 0 8px rgba(0,0,0,0.06)"
      }}>
        {menuitemscrm()}
      </Box>

      {/* ══ Main Dashboard Content ══ */}
      <Box sx={{ flex: 1, overflowY: "auto" }}>
        <Box className="crmh-root">

          {/* ══ Screen-only gradient hero header ════════════════════════════ */}
          <Box className="crmh-header-bar no-print" sx={{
            background: `linear-gradient(135deg, ${C.blue900} 0%, ${C.blue700} 60%, ${C.blue500} 100%)`,
            py: 5, px: 3, mb: 5, borderRadius: "0 0 36px 36px",
            position: "relative", overflow: "hidden", animation: "headerGlow 4s ease infinite",
          }}>
            {[{ size: 280, top: -100, right: -60, delay: 0 }, { size: 160, top: 20, right: 200, delay: 1 }, { size: 100, bottom: -40, left: 80, delay: 2 }].map((d, i) => (
              <Box key={i} sx={{ position: "absolute", width: d.size, height: d.size, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.08)", top: d.top, bottom: d.bottom, left: d.left, right: d.right, animation: `dotFloat ${4 + i}s ease-in-out infinite`, animationDelay: `${d.delay}s` }} />
            ))}
            <Box sx={{ position: "absolute", width: 500, height: 300, background: "radial-gradient(circle at 60% 50%, rgba(147,197,253,0.15) 0%, transparent 70%)", top: 0, left: "10%", pointerEvents: "none" }} />
            <Box sx={{ position: "relative", zIndex: 1, px: 4 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <IconButton className="nav-btn" onClick={() => navigate("/dashboard")}
                    sx={{ color: C.white, width: 40, height: 40, bgcolor: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(8px)", "&:hover": { bgcolor: "rgba(255,255,255,0.22)" } }}>
                    <ArrowBackIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                  <Box>
                    <Typography sx={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: C.white, fontWeight: 900, fontSize: "1.75rem", lineHeight: 1.2, letterSpacing: "-0.03em" }}>
                      {global1.role === 'Admin' ? 'Management Dashboard' : 'Personal Performance Report'}
                    </Typography>
                    <Typography sx={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.6)", fontSize: "0.82rem", mt: 0.5, fontWeight: 500 }}>
                      Lead metrics · Follow-ups · Campus visits · Pipeline
                    </Typography>
                    <Typography sx={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: C.white, fontSize: "0.9rem", mt: 1, fontWeight: 800 }}>
                      Name: {global1.name || global1.user || "User"} &nbsp;·&nbsp; Role: {global1.role || "Role"}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box sx={{ px: 2, py: 1, borderRadius: "10px", bgcolor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}>
                    <Typography sx={{ fontFamily: "'DM Mono', monospace", color: "rgba(255,255,255,0.7)", fontSize: "0.72rem", fontWeight: 500 }}>{fmtNow()}</Typography>
                  </Box>
                  <Tooltip title="Refresh all data" arrow>
                    <IconButton className="nav-btn" onClick={handleRefresh}
                      sx={{ color: C.white, bgcolor: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(8px)", "&:hover": { bgcolor: "rgba(255,255,255,0.22)" }, ...(spinning ? { animation: "spin 0.7s linear" } : {}) }}>
                      <RefreshIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Print Report" arrow>
                    <IconButton className="nav-btn" onClick={() => window.print()}
                      sx={{ color: C.white, bgcolor: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(8px)", "&:hover": { bgcolor: "rgba(255,255,255,0.22)" } }}>
                      <PrintIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                  {global1.role === 'Admin' && (
                    <Tooltip title="Download All Leads (Excel)" arrow>
                      <IconButton className="nav-btn"
                        onClick={() => handleDownload("all")}
                        disabled={downloading.all}
                        sx={{ color: C.white, bgcolor: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(8px)", "&:hover": { bgcolor: "rgba(255,255,255,0.22)" } }}>
                        <DownloadIcon sx={{ fontSize: 18, ...(downloading.all ? { animation: "pulse 1s infinite" } : {}) }} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </Box>
            </Box>
          </Box>

          {/* ══ Print-only header ════════════════════════════════════════════ */}
          <div className="print-only" style={{
            display: "none",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "6px 0 8px",
            borderBottom: "2.5px solid #1d4ed8",
            marginBottom: "10px",
            fontFamily: "'Plus Jakarta Sans', Arial, sans-serif",
          }}>
            <div>
              <div style={{ fontSize: "14pt", fontWeight: 900, color: "#1e3a8a", margin: 0, lineHeight: 1.2 }}>CRMH Dashboard Report</div>
              <div style={{ fontSize: "7.5pt", color: "#64748b", marginTop: "3px" }}>
                {global1.name || global1.user} &nbsp;·&nbsp; {global1.role} &nbsp;·&nbsp; Printed: {fmtNow()}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ margin: 0, fontSize: "8.5pt", fontWeight: 700, color: "#1e3a8a" }}>Total Leads: {totalLeads}</div>
              <div style={{ marginTop: "3px", fontSize: "7.5pt" }}>
                <span style={{ color: "#dc2626", fontWeight: 700 }}>● Hot: {leadsByTemperature.hot}</span>
                &nbsp;&nbsp;
                <span style={{ color: "#d97706", fontWeight: 700 }}>● Warm: {leadsByTemperature.warm}</span>
                &nbsp;&nbsp;
                <span style={{ color: "#1d4ed8", fontWeight: 700 }}>● Cold: {leadsByTemperature.cold}</span>
              </div>
              <div style={{ marginTop: "3px", fontSize: "7pt", color: "#64748b" }}>
                Visits Completed: {campusVisitCompletedCount} &nbsp;·&nbsp; Total Visits: {lastVisitCount}
              </div>
            </div>
          </div>

          <Box sx={{ width: '100%', px: 3, pb: 8 }}>

            {/* ══ Stat Cards ══════════════════════════════════════════════════ */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {statCards.map((s, i) => (
                <Grid item xs={12} sm={6} md={4} lg={4} key={i}>
                  <StatCard {...s} />
                </Grid>
              ))}
            </Grid>

            {/* ══ All Leads ═══════════════════════════════════════════════════ */}
            <SectionCard delay={360} sx={{ mb: 3 }}>
              <SectionHeader icon={<PeopleIcon />} title="All Leads" count={totalLeads}
                onDownload={() => handleDownload("all")}
                downloading={downloading.all} />
              <Divider sx={{ borderColor: C.blue50, mb: 2 }} />
              <AllLeadsTable printData={allLeads} />
            </SectionCard>

            {/* ══ Follow-up & Aging Dashboard ═════════════════════════════════ */}
            <SectionCard delay={400} sx={{ mb: 3 }}>
              <SectionHeader icon={<CalendarIcon />} title="Follow-up & Aging Tracking" />
              <Divider sx={{ borderColor: C.blue50, mb: 3 }} />
              <Grid container spacing={3}>
                {[
                  { label: "Not contacted in 24 hrs", count: followUpAging?.notContacted24h || 0, color: "#dc2626", bg: "#fef2f2" },
                  { label: "Leads pending > 3 days", count: followUpAging?.pending3Days || 0, color: "#d97706", bg: "#fffbeb" },
                  { label: "Hot leads pending", count: followUpAging?.hotPending || 0, color: "#dc2626", bg: "#fef2f2" },
                  { label: "Inactive leads (7+ days)", count: followUpAging?.inactive7Days || 0, color: "#64748b", bg: "#f1f5f9" },
                ].map((t, i) => (
                  <Grid item xs={12} sm={6} md={3} key={i}>
                    <Box sx={{ p: 3, borderRadius: "16px", border: `1px solid ${C.blue100}`, textAlign: "center", bgcolor: t.bg }}>
                      <Typography sx={{ fontSize: "2.2rem", fontWeight: 800, color: t.color }}>{t.count}</Typography>
                      <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: C.gray600, mt: 1 }}>{t.label}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </SectionCard>

            {/* ══ Visual Charts Section — all 4 in one row ══════════════════════════════ */}
            <Grid container spacing={3} sx={{ mb: 3 }}>

              {/* Lead Funnel — 25% */}

              <SectionCard delay={430} sx={{ height: "100%", width: '100%' }}>
                <SectionHeader icon={<TimelineIcon />} title="Lead Funnel" count={funnelData?.length}
                  onDownload={() => handleDownload("pipeline")}
                  downloading={downloading.pipeline} />
                <Divider sx={{ borderColor: C.blue50, mb: 2 }} />
                <Box sx={{ width: '100%', height: 360 }}>
                  <ResponsiveContainer>
                    <BarChart data={funnelData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={C.blue100} />
                      <XAxis type="number" tick={{ fontSize: 11, fill: C.gray600 }} />
                      <YAxis dataKey="stage" type="category" width={90} tick={{ fontSize: 11, fill: C.gray800, fontWeight: 600 }} />
                      <RTooltip contentStyle={{ borderRadius: 12, border: `1px solid ${C.blue100}`, fontFamily: "'Plus Jakarta Sans', sans-serif" }} />
                      <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                        {(funnelData || []).map((_, i) => (
                          <Cell key={i} fill={[C.blue600, '#0ea5e9', '#6366f1', '#8b5cf6', '#10b981', '#dc2626'][i % 6]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </SectionCard>


              {/* Source Performance — 25% */}

              <SectionCard delay={460} sx={{ height: "100%", width: '100%' }}>
                <SectionHeader icon={<TimelineIcon />} title="Source Performance" count={sourcePerformance?.length} />
                <Divider sx={{ borderColor: C.blue50, mb: 2 }} />
                <Box sx={{ width: '100%', height: 360 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={(sourcePerformance || []).map(s => ({
                          name: s._id || 'Unknown',
                          value: s.count
                        }))}
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        innerRadius={60}
                        paddingAngle={3}
                        dataKey="value"

                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}

                        labelLine={{ stroke: C.gray400, strokeWidth: 1 }}


                        labelStyle={{
                          fontSize: 14,
                          fontWeight: 600,
                          fill: "#1f2937"
                        }}
                      >
                        {(sourcePerformance || []).map((_, i) => (
                          <Cell
                            key={i}
                            fill={[
                              '#3b82f6', '#0ea5e9', '#6366f1', '#8b5cf6',
                              '#06b6d4', '#10b981', '#f59e0b', '#f97316',
                              '#ec4899', '#14b8a6'
                            ][i % 10]}
                          />
                        ))}
                      </Pie>


                      <RTooltip
                        contentStyle={{
                          borderRadius: 12,
                          border: `1px solid ${C.blue100}`,
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontSize: 14
                        }}
                        itemStyle={{
                          fontSize: 14
                        }}
                        labelStyle={{
                          fontSize: 14,
                          fontWeight: 600
                        }}
                      />

                      <Legend
                        wrapperStyle={{
                          fontSize: 14,
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontWeight: 500
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </SectionCard>


              {/* Course-wise Admissions — 25% */}

              <SectionCard delay={490} sx={{ height: "100%", width: '100%' }}>
                <SectionHeader icon={<CheckIcon />} title="Course-wise Admissions" count={courseWiseAdmissions?.length} />
                <Divider sx={{ borderColor: C.blue50, mb: 2 }} />
                <Box sx={{ width: '100%', height: 360 }}>
                  <ResponsiveContainer>
                    <BarChart data={(courseWiseAdmissions || []).slice(0, 10).map(c => ({ name: c._id || 'Unknown', count: c.count }))} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={C.blue100} />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: C.gray600, fontWeight: 500 }} angle={-35} textAnchor="end" interval={0} />
                      <YAxis tick={{ fontSize: 11, fill: C.gray600 }} />
                      <RTooltip contentStyle={{ borderRadius: 12, border: `1px solid ${C.blue100}`, fontFamily: "'Plus Jakarta Sans', sans-serif" }} />
                      <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                        {(courseWiseAdmissions || []).slice(0, 10).map((_, i) => (
                          <Cell key={i} fill={['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#3b82f6', '#60a5fa', '#0ea5e9', '#06b6d4', '#10b981', '#34d399'][i % 10]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </SectionCard>


              {/* City-wise Leads — 25% */}

              <SectionCard delay={520} sx={{ height: "100%", width: '100%' }}>
                <SectionHeader icon={<LocationIcon />} title="City-wise Leads" count={leadsByCity?.length} />
                <Divider sx={{ borderColor: C.blue50, mb: 2 }} />
                {leadsByCity && leadsByCity.length > 0 ? (
                  <Box sx={{ width: '100%', height: 360 }}>
                    <ResponsiveContainer>
                      <BarChart data={leadsByCity.map(c => ({ name: c._id || 'Unknown', count: c.count }))} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={C.blue100} />
                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: C.gray600, fontWeight: 500 }} angle={-35} textAnchor="end" interval={0} />
                        <YAxis tick={{ fontSize: 11, fill: C.gray600 }} />
                        <RTooltip contentStyle={{ borderRadius: 12, border: `1px solid ${C.blue100}`, fontFamily: "'Plus Jakarta Sans', sans-serif" }} />
                        <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                          {leadsByCity.map((_, i) => (
                            <Cell key={i} fill={['#0ea5e9', '#06b6d4', '#14b8a6', '#10b981', '#22c55e', '#84cc16', '#eab308', '#f59e0b', '#f97316', '#ef4444', '#ec4899', '#a855f7', '#6366f1', '#3b82f6', '#0284c7'][i % 15]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                ) : (
                  <Typography sx={{ textAlign: "center", py: 3, color: C.gray400, fontSize: "0.875rem" }}>No city data available</Typography>
                )}
              </SectionCard>


            </Grid>

            {/* ══ Pipeline Stage Breakdown (original bar breakdown, kept) ═══════ */}
            <SectionCard delay={540} sx={{ mb: 3 }}>
              <SectionHeader icon={<TimelineIcon />} title="Pipeline Stage Breakdown" count={pipelineStageBreakdown?.length} />
              <Divider sx={{ borderColor: C.blue50, mb: 3 }} />
              <PipelineBreakdown data={pipelineStageBreakdown} />
            </SectionCard>

            {/* ══ Follow-ups row ══════════════════════════════════════════════ */}
            {/* FIX: prop renamed from printData → data, passing dashboard arrays directly */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} lg={6}>
                <SectionCard delay={500} sx={{ height: "100%" }}>
                  <SectionHeader icon={<CalendarIcon />} title="Upcoming Follow-ups" count={upcomingFollowups?.length}
                    onDownload={() => handleDownload("followups")}
                    downloading={downloading.followups} />
                  <Divider sx={{ borderColor: C.blue50, mb: 2 }} />
                  <UpcomingFollowupsTable data={upcomingFollowups} />
                </SectionCard>
              </Grid>
              <Grid item xs={12} lg={6}>
                <SectionCard delay={570} sx={{ height: "100%" }}>
                  <SectionHeader icon={<CalendarIcon />} title="Overdue Follow-ups" count={lastFollowupDates?.length}
                    onDownload={() => handleDownload("followups2")}
                    downloading={downloading.followups2} />
                  <Divider sx={{ borderColor: C.blue50, mb: 2 }} />
                  <OverdueFollowupsTable data={lastFollowupDates} />
                </SectionCard>
              </Grid>
            </Grid>

            {/* ══ Campus Visits ═══════════════════════════════════════════════ */}
            <SectionCard delay={640} sx={{ mb: 3 }}>
              <SectionHeader icon={<LocationIcon />} title="Campus Visits" count={campusVisits?.length}
                onDownload={() => handleDownload("campus")}
                downloading={downloading.campus} />
              <Divider sx={{ borderColor: C.blue50, mb: 2 }} />
              <CampusVisitsTable data={campusVisits} />
            </SectionCard>

            {/* ══ Pipeline Stage Change Log ════════════════════════════════════ */}
            {/* <SectionCard delay={790} sx={{ mb: 3 }}>
          <SectionHeader icon={<TimelineIcon />} title="Pipeline Stage Change Log" count={pipelineStageChanges?.length}
            onDownload={() => handleDownload("activities")}
            downloading={downloading.activities} />
          <Divider sx={{ borderColor: C.blue50, mb: 2 }} />
          <StageChangeTable data={pipelineStageChanges} />
        </SectionCard> */}

            {/* ══ Program Performance Table (Dynamic from ProgramCounselords) ══ */}
            {programPerformance.length > 0 && (
              <SectionCard delay={550} sx={{ mb: 3 }}>
                <SectionHeader icon={<CheckIcon />} title="Program-wise Performance" count={programPerformance.length} />
                <Divider sx={{ borderColor: C.blue50, mb: 2 }} />
                <TableContainer sx={{ borderRadius: "12px", border: `1px solid ${C.blue100}` }}>
                  <Table size="small">
                    <TableHead><TableRow>
                      {["Course", "Code", "Category", "Counsellor", "Total Seats", "Leads", "Seat Fill %", "Fee (₹)"].map(h => <TH key={h}>{h}</TH>)}
                    </TableRow></TableHead>
                    <TableBody>
                      {programPerformance.map((prog, i) => (
                        <TableRow key={i} className="data-row">
                          <TD sx={{ fontWeight: 700, color: C.gray800 }}>{prog.course_name || "—"}</TD>
                          <TD sx={{ fontFamily: "'DM Mono', monospace", fontSize: "0.72rem" }}>{prog.course_code || "—"}</TD>
                          <TD>{prog.category || "—"}</TD>
                          <TD>{prog.counsellor_name || "Unassigned"}</TD>
                          <TD sx={{ textAlign: "center", fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>{prog.total_seats}</TD>
                          <TD sx={{ textAlign: "center", fontWeight: 800, color: C.blue700, fontFamily: "'DM Mono', monospace" }}>{prog.leads_count}</TD>
                          <TD>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <LinearProgress variant="determinate" value={Math.min(prog.seat_utilization, 100)}
                                sx={{ flex: 1, height: 8, borderRadius: "99px", bgcolor: C.blue100, "& .MuiLinearProgress-bar": { borderRadius: "99px", bgcolor: prog.seat_utilization >= 80 ? "#dc2626" : prog.seat_utilization >= 50 ? "#d97706" : C.blue600 } }} />
                              <Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: "0.72rem", color: C.gray600, minWidth: 36 }}>{prog.seat_utilization}%</Typography>
                            </Box>
                          </TD>
                          <TD sx={{ fontFamily: "'DM Mono', monospace" }}>{prog.total_fee > 0 ? `₹${prog.total_fee.toLocaleString('en-IN')}` : "—"}</TD>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </SectionCard>
            )}

            {/* ══ Counsellor Performance Table (Dynamic from lead data) ══ */}
            {counsellorPerformance.length > 0 && (
              <SectionCard delay={580} sx={{ mb: 3 }}>
                <SectionHeader icon={<PeopleIcon />} title="Counsellor Performance" count={counsellorPerformance.length} />
                <Divider sx={{ borderColor: C.blue50, mb: 2 }} />
                <TableContainer sx={{ borderRadius: "12px", border: `1px solid ${C.blue100}` }}>
                  <Table size="small">
                    <TableHead><TableRow>
                      {["Counsellor", "Total Leads", "Hot Leads", "Conversions", "Conv. Rate"].map(h => <TH key={h}>{h}</TH>)}
                    </TableRow></TableHead>
                    <TableBody>
                      {counsellorPerformance.map((c, i) => (
                        <TableRow key={i} className="data-row">
                          <TD sx={{ fontWeight: 700, color: C.gray800 }}>{c._id || "Unassigned"}</TD>
                          <TD sx={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, textAlign: "center" }}>{c.leadsCount}</TD>
                          <TD><Box component="span" sx={{ px: 1.5, py: 0.4, borderRadius: "99px", bgcolor: "#fef2f2", color: "#dc2626", fontSize: "0.68rem", fontWeight: 700 }}>{c.hotLeads}</Box></TD>
                          <TD><Box component="span" sx={{ px: 1.5, py: 0.4, borderRadius: "99px", bgcolor: "#dcfce7", color: "#16a34a", fontSize: "0.68rem", fontWeight: 700 }}>{c.conversions}</Box></TD>
                          <TD sx={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, color: C.blue700 }}>
                            {c.leadsCount > 0 ? ((c.conversions / c.leadsCount) * 100).toFixed(1) + "%" : "0%"}
                          </TD>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </SectionCard>
            )}

            {/* ══ Landing Page Stats (Dynamic from unifiedlandingpageds) ══ */}
            {landingPageStats.total > 0 && (
              <SectionCard delay={610} sx={{ mb: 3 }}>
                <SectionHeader icon={<VisitIcon />} title="Landing Page Performance" count={landingPageStats.total} />
                <Divider sx={{ borderColor: C.blue50, mb: 3 }} />
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  {[
                    { label: "Total Pages", value: landingPageStats.total || 0, color: C.blue700, bg: C.blue50 },
                    { label: "Total Visits", value: landingPageStats.totalVisits || 0, color: "#059669", bg: "#dcfce7" },
                    { label: "Total Conversions", value: landingPageStats.totalConversions || 0, color: "#d97706", bg: "#fffbeb" },
                    { label: "Conversion Rate", value: `${landingPageStats.conversionRate || 0}%`, color: "#7c3aed", bg: "#f5f3ff" },
                  ].map((m, i) => (
                    <Grid item xs={6} sm={3} key={i}>
                      <Box sx={{ p: 2.5, borderRadius: "14px", border: `1px solid ${C.blue100}`, textAlign: "center", bgcolor: m.bg }}>
                        <Typography sx={{ fontSize: "1.8rem", fontWeight: 800, color: m.color, fontFamily: "'DM Mono', monospace" }}>{m.value}</Typography>
                        <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: C.gray600, mt: 0.5 }}>{m.label}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
                {landingPageStats.pages?.length > 0 && (
                  <TableContainer sx={{ borderRadius: "12px", border: `1px solid ${C.blue100}` }}>
                    <Table size="small">
                      <TableHead><TableRow>
                        {["Page Name", "Category", "Visits", "Conversions", "Conv. Rate"].map(h => <TH key={h}>{h}</TH>)}
                      </TableRow></TableHead>
                      <TableBody>
                        {landingPageStats.pages.map((p, i) => (
                          <TableRow key={i} className="data-row">
                            <TD sx={{ fontWeight: 700, color: C.gray800 }}>{p.page_name}</TD>
                            <TD>{p.category || "—"}</TD>
                            <TD sx={{ fontFamily: "'DM Mono', monospace", fontWeight: 600, textAlign: "center" }}>{p.visit_count.toLocaleString()}</TD>
                            <TD><Box component="span" sx={{ px: 1.5, py: 0.4, borderRadius: "99px", bgcolor: "#dcfce7", color: "#16a34a", fontSize: "0.68rem", fontWeight: 700 }}>{p.conversion_count}</Box></TD>
                            <TD sx={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, color: "#7c3aed" }}>{p.conversion_rate}%</TD>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </SectionCard>
            )}

            {/* ══ Temperature Summary ═════════════════════════════════════════ */}
            <SectionCard delay={860}>
              <SectionHeader icon={<HotIcon />} title="Lead Temperature Summary"
                onDownload={() => handleDownload("temperature")}
                downloading={downloading.temperature} />
              <Divider sx={{ borderColor: C.blue50, mb: 3 }} />
              <Grid container spacing={3}>
                {[
                  { label: "Hot", count: leadsByTemperature.hot, accent: "linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%)", icon: <HotIcon />, dot: "#f87171" },
                  { label: "Warm", count: leadsByTemperature.warm, accent: "linear-gradient(135deg, #d97706 0%, #78350f 100%)", icon: <WarmIcon />, dot: "#fbbf24" },
                  { label: "Cold", count: leadsByTemperature.cold, accent: `linear-gradient(135deg, ${C.blue600} 0%, ${C.blue900} 100%)`, icon: <ColdIcon />, dot: C.blue300 },
                ].map((t, i) => {
                  const pct = totalLeads > 0 ? ((t.count / totalLeads) * 100).toFixed(1) : 0;
                  return (
                    <Grid item xs={12} sm={4} key={i}>
                      <Box className="crmh-slide-up" sx={{
                        background: t.accent, borderRadius: "20px", p: 4, textAlign: "center", color: C.white,
                        boxShadow: "0 8px 32px rgba(0,0,0,0.15)", animationDelay: `${880 + i * 80}ms`, cursor: "default",
                        transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s",
                        "&:hover": { transform: "scale(1.04) translateY(-6px)", boxShadow: "0 16px 48px rgba(0,0,0,0.22)" },
                      }}>
                        <Box sx={{ width: 52, height: 52, borderRadius: "16px", bgcolor: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2 }}>
                          {React.cloneElement(t.icon, { sx: { fontSize: 26, color: t.dot } })}
                        </Box>
                        <Typography sx={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900, fontSize: "3rem", lineHeight: 1, mb: 0.5 }}>{t.count}</Typography>
                        <Typography sx={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "1rem", opacity: 0.85 }}>{t.label} Leads</Typography>
                        <Box sx={{ mt: 2.5, px: 2, py: 0.75, borderRadius: "99px", bgcolor: "rgba(255,255,255,0.15)", display: "inline-block" }}>
                          <Typography sx={{ fontFamily: "'DM Mono', monospace", fontSize: "0.78rem", fontWeight: 500, opacity: 0.9 }}>{pct}% of total</Typography>
                        </Box>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </SectionCard>

          </Box>

          {/* ══ Toast notification ═══════════════════════════════════════════ */}
          <Snackbar open={toast.open} autoHideDuration={3500}
            onClose={() => setToast(t => ({ ...t, open: false }))}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
            <Alert severity={toast.severity} variant="filled"
              sx={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, borderRadius: "12px", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
              {toast.msg}
            </Alert>
          </Snackbar>
        </Box>
      </Box>
    </Box>
  );
}
