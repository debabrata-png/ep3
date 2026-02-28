import { useState, useEffect, useRef } from "react";
import {
  Box,
  Paper,
  TextField,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  Avatar,
  InputAdornment,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Chip,
  Divider,
  Badge,
} from "@mui/material";
import {
  Send as SendIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  Message as MessageIcon,
  DoneAll as DoneAllIcon,
  Done as DoneIcon,
  Textsms as TextsmsIcon,
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  ChatBubbleOutline as ChatIcon,
  MoreVert as MoreVertIcon,
  AttachFile as AttachFileIcon,
  FiberManualRecord as DotIcon,
  MarkChatUnread as UnreadIcon,
} from "@mui/icons-material";
import ep1 from "../api/ep1";
import global1 from "./global1";

/* =======================
   CONFIG
======================= */
const BLUE = "#1565C0";
const BLUE_DARK = "#0D47A1";
const BLUE_LIGHT = "#EFF6FF";
const BLUE_RING = "#BFDBFE";

/* =======================
   API HELPERS
======================= */
const fetchApprovedAlumniMentors = async (currentUserId, colid, department, semester, searchQuery = "") => {
  const params = {
    colid,
    status: "approved",
    isDeleted: false,
    ...(department && { department }),
    ...(semester && { semester }),
    ...(searchQuery ? { search: searchQuery } : {}),
  };

  const res = await ep1.get("/api/v2/mentors", { params });

  return (res.data.data || []).filter(m => m._id !== currentUserId);
};

const fetchChatHistory = async (userId1, userId2, colid) => {
  const res = await ep1.get("/api/v2/chat/history", {
    params: { userId1, userId2, colid },
  });
  return res.data.success ? res.data.data : [];
};

const markChatAsRead = async (senderId, receiverId, colid) => {
  await ep1.post("/api/v2/chat/mark-read", { senderId, receiverId, colid });
};

const sendChatMessage = async (payload) => {
  const res = await ep1.post("/api/v2/chat/send-message", payload);
  return res.data.success ? res.data.data : null;
};

/* =======================
   COMPONENT
======================= */
const ChatPageInner = ({ currentUser, colid }) => {

  /* =======================
     STATE
  ======================= */
  const [currentUserDetails, setCurrentUserDetails] = useState(currentUser);
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [listLoading, setListLoading] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});

  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [msgLoading, setMsgLoading] = useState(false);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);
  const pollingIntervalRef = useRef(null);

  /* =======================
     LOAD MENTORS
  ======================= */
  const loadContacts = async (q = "", user = currentUserDetails) => {
    try {
      setListLoading(true);
      const data = await fetchApprovedAlumniMentors(
        user._id,
        user.colid || colid,
        user.department,
        user.semester,
        q
      );
      data.sort((a, b) => (a.firstName ?? "").localeCompare(b.firstName ?? ""));
      setContacts(data);

      // Compute unread counts for each mentor
      const newUnreadCounts = {};
      await Promise.all(
        data.map(async (m) => {
          try {
            const msgs = await fetchChatHistory(user._id, m.userid, user.colid || colid);
            const unread = msgs.filter(
              (msg) => msg.senderId === m.userid && msg.receiverId === user._id && !msg.isRead
            ).length;
            newUnreadCounts[m._id] = unread;
          } catch {
            newUnreadCounts[m._id] = 0;
          }
        })
      );
      setUnreadCounts(newUnreadCounts);
    } catch {
      setError("Failed to load alumni mentors");
    } finally {
      setListLoading(false);
    }
  };

  /* =======================
     EFFECTS - INIT
  ======================= */
  useEffect(() => {
    const init = async () => {
      if (currentUser?._id) {
        try {
          const res = await ep1.get(`/api/v2/users/${currentUser._id}`);
          if (res.data.success) {
            const freshUser = res.data.data;
            setCurrentUserDetails(freshUser);
            // Re-load contacts with fresh data
            loadContacts("", freshUser);
          } else {
            loadContacts("", currentUser);
          }
        } catch (err) {
          console.error("Failed to refresh user details", err);
          loadContacts("", currentUser);
        }
      }
    };
    init();
  }, []);

  /* =======================
     LOAD MESSAGES
  ======================= */
  const loadMessages = async (otherId) => {
    try {
      setMsgLoading(true);
      const msgs = await fetchChatHistory(currentUser._id, otherId, colid);
      setMessages(msgs);
      await markChatAsRead(otherId, currentUser._id, colid);
    } catch {
      setError("Failed to load messages");
    } finally {
      setMsgLoading(false);
    }
  };

  /* =======================
     POLLING
  ======================= */
  const startPolling = (otherId) => {
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);

    pollingIntervalRef.current = setInterval(async () => {
      const msgs = await fetchChatHistory(currentUser._id, otherId, colid);
      setMessages(prev => (prev.length !== msgs.length ? msgs : prev));
    }, 2000);
  };

  /* =======================
     SEND MESSAGE
  ======================= */
  const handleSend = async () => {
    if (!messageInput.trim() || !selectedContact) return;

    const saved = await sendChatMessage({
      senderId: currentUser._id,
      senderName: currentUser.name,
      senderRole: "Student",
      receiverId: selectedContact.userid,
      receiverName: displayName(selectedContact),
      receiverRole: "Alumni",
      message: messageInput.trim(),
      colid,
    });

    if (saved) {
      setMessages(prev => [...prev, saved]);
      setMessageInput("");
    }
  };

  /* =======================
     HELPERS
  ======================= */
  const displayName = (p) =>
    `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim();

  const getAvatar = (p) => (
    <Avatar sx={{
      width: 44,
      height: 44,
      fontWeight: 700,
      background: `linear-gradient(135deg, ${BLUE} 0%, ${BLUE_DARK} 100%)`,
      border: `2px solid ${BLUE_RING}`,
    }}>
      {displayName(p).charAt(0)}
    </Avatar>
  );

  const renderReadReceipt = (msg) =>
    msg.senderId === currentUser._id ? (
      msg.isRead
        ? <DoneAllIcon sx={{ fontSize: 14, color: BLUE }} />
        : <DoneIcon sx={{ fontSize: 14, color: "#94A3B8" }} />
    ) : null;

  /* =======================
     EFFECTS
  ======================= */

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => () => pollingIntervalRef.current && clearInterval(pollingIntervalRef.current), []);

  /* =======================
     RENDER
  ======================= */
  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        background: "linear-gradient(135deg, #F5F7FA 0%, #E8EAF6 50%, #F3E5F5 100%)",
        display: "flex",
        p: 0,
        m: 0,
        overflow: "hidden",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          display: "flex",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          borderRadius: 3,
          boxShadow: "0 24px 60px rgba(21, 101, 192, 0.15)",
          bgcolor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(12px)",
        }}
      >
        {/* LEFT – ALUMNI LIST */}
        <Box
          sx={{
            width: 400,
            borderRight: "1px solid #E0E0E0",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#FFFFFF",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 3,
              background: `linear-gradient(135deg, ${BLUE} 0%, ${BLUE_DARK} 100%)`,
              color: "#FFFFFF",
              boxShadow: "0 2px 8px rgba(21, 101, 192, 0.2)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
              <SchoolIcon sx={{ fontSize: 28 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Find Mentors
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.95, fontSize: "0.875rem", ml: 4.5 }}>
              Connect with Alumni
            </Typography>
          </Box>

          <Box sx={{ p: 2.5, backgroundColor: "#F5F5F5", borderBottom: "1px solid #E0E0E0" }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search mentors…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                loadContacts(e.target.value);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#757575" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#FFFFFF",
                  borderRadius: 2,
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
                  transition: "all 0.3s ease",
                  "&:hover": { boxShadow: "0 4px 12px rgba(21, 101, 192, 0.12)" },
                  "&.Mui-focused": { boxShadow: "0 4px 16px rgba(21, 101, 192, 0.18)" },
                },
              }}
            />
          </Box>

          <Box sx={{ flex: 1, overflowY: "auto", backgroundColor: "#FFFFFF" }}>
            {listLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", flexDirection: "column", gap: 2 }}>
                <CircularProgress size={40} sx={{ color: BLUE }} />
                <Typography variant="body2" sx={{ color: "#757575" }}>Loading mentors...</Typography>
              </Box>
            ) : contacts.length === 0 ? (
              <Box sx={{ p: 4, textAlign: "center" }}>
                <TextsmsIcon sx={{ fontSize: 64, color: "#BDBDBD", mb: 2 }} />
                <Typography variant="body1" sx={{ color: "#757575", fontWeight: 500 }}>No mentors found</Typography>
              </Box>
            ) : (
              <List disablePadding>
                {contacts.map((m) => (
                  <ListItemButton
                    key={m._id}
                    selected={selectedContact?._id === m._id}
                    onClick={() => {
                      setSelectedContact(m);
                      loadMessages(m.userid);
                      startPolling(m.userid);
                      // Clear unread count for this contact
                      setUnreadCounts((prev) => ({ ...prev, [m._id]: 0 }));
                    }}
                    sx={{
                      borderBottom: "1px solid #F5F5F5",
                      backgroundColor: selectedContact?._id === m._id ? "rgba(21, 101, 192, 0.08)" : "transparent",
                      py: 2,
                      px: 2.5,
                      borderRadius: 2,
                      mx: 1,
                      my: 0.5,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        backgroundColor: "rgba(21, 101, 192, 0.05)",
                        transform: "translateX(4px)",
                      },
                    }}
                  >
                    <Box sx={{ mr: 2 }}>
                      <Badge
                        badgeContent={unreadCounts[m._id] || 0}
                        color="error"
                        overlap="circular"
                        sx={{
                          "& .MuiBadge-badge": {
                            fontWeight: 700,
                            fontSize: "0.7rem",
                            minWidth: 20,
                            height: 20,
                            borderRadius: 10,
                            boxShadow: "0 2px 6px rgba(244, 67, 54, 0.4)",
                          },
                        }}
                      >
                        {getAvatar(m)}
                      </Badge>
                    </Box>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: "1rem", mb: 0.5, color: "#212121" }}>
                          {displayName(m)}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 0.5 }}>
                          {(m.mentorshipDomain || m.domains?.length > 0) && (
                            <Chip
                              size="small"
                              label={m.mentorshipDomain || m.domains?.[0]}
                              sx={{
                                fontSize: "0.7rem",
                                fontWeight: 600,
                                backgroundColor: "#E3F2FD",
                                color: "#1565C0",
                                border: "1px solid #BBDEFB",
                                height: 22,
                              }}
                            />
                          )}
                          <Chip
                            size="small"
                            icon={<CheckCircleIcon sx={{ fontSize: "14px !important" }} />}
                            label="Approved"
                            sx={{
                              fontSize: "0.65rem",
                              backgroundColor: "#E8F5E9",
                              color: "#2E7D32",
                              border: "1px solid #C8E6C9",
                              height: 22,
                            }}
                          />
                        </Box>
                      }
                    />
                  </ListItemButton>
                ))}
              </List>
            )}
          </Box>
        </Box>

        {/* RIGHT – CHAT */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", backgroundColor: "#FAFAFA" }}>
          {!selectedContact ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                flexDirection: "column",
                backgroundColor: "#FAFAFA",
              }}
            >
              <Box
                sx={{
                  width: 160,
                  height: 160,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${BLUE} 0%, ${BLUE_DARK} 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 3,
                  boxShadow: "0 8px 24px rgba(21, 101, 192, 0.3)",
                }}
              >
                <SchoolIcon sx={{ fontSize: 80, color: "#FFFFFF" }} />
              </Box>
              <Typography variant="h5" sx={{ color: "#212121", fontWeight: 600, mb: 1 }}>
                Alumni Mentor Chat
              </Typography>
              <Typography variant="body1" sx={{ color: "#757575", textAlign: "center", maxWidth: 400 }}>
                Select a mentor from the list to start messaging
              </Typography>
            </Box>
          ) : (
            <>
              <Box sx={{
                p: 2.5,
                borderBottom: "2px solid #E0E0E0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 100%)",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
              }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  {getAvatar(selectedContact)}
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "1.1rem", color: "#212121" }}>{displayName(selectedContact)}</Typography>
                    <Chip label="Alumni Mentor" size="small" sx={{ height: 20, fontSize: "0.7rem", fontWeight: 600, backgroundColor: "#E3F2FD", color: BLUE, border: "1px solid #BBDEFB" }} />
                  </Box>
                </Box>
                <Tooltip title="Close chat">
                  <IconButton onClick={() => setSelectedContact(null)} sx={{ color: "#757575", "&:hover": { backgroundColor: "rgba(244, 67, 54, 0.1)", color: "#F44336" } }}>
                    <CloseIcon />
                  </IconButton>
                </Tooltip>
              </Box>

              <Box sx={{
                flex: 1,
                overflowY: "auto",
                p: 3,
                backgroundColor: "#FAFAFA",
                backgroundImage: `linear-gradient(rgba(224, 224, 224, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(224, 224, 224, 0.05) 1px, transparent 1px)`,
                backgroundSize: "20px 20px",
              }}>
                {msgLoading ? (
                  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", flexDirection: "column", gap: 2 }}>
                    <CircularProgress size={50} sx={{ color: BLUE }} />
                    <Typography variant="body1" sx={{ color: "#757575" }}>Loading conversation...</Typography>
                  </Box>
                ) : messages.map((msg, index) => {
                  const isOwnMessage = msg.senderId === currentUser._id;
                  return (
                    <Box key={msg._id || index} sx={{ display: "flex", justifyContent: isOwnMessage ? "flex-end" : "flex-start", mb: 1 }}>
                      <Paper sx={{
                        maxWidth: "65%",
                        p: 1,
                        background: isOwnMessage ? `linear-gradient(135deg, ${BLUE} 0%, ${BLUE_DARK} 100%)` : "#FFFFFF",
                        color: isOwnMessage ? "#FFFFFF" : "#212121",
                        borderRadius: isOwnMessage ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                        boxShadow: isOwnMessage ? "0 4px 12px rgba(21, 101, 192, 0.3)" : "0 2px 8px rgba(0, 0, 0, 0.08)",
                        border: isOwnMessage ? "none" : "1px solid #E0E0E0",
                        wordWrap: "break-word",
                      }}>
                        <Typography variant="body2" sx={{ lineHeight: 1.4, fontSize: "0.9rem", mb: 0.25 }}>{msg.message}</Typography>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.5, mt: 0.25 }}>
                          <Typography variant="caption" sx={{ color: isOwnMessage ? "rgba(255, 255, 255, 0.8)" : "#757575", fontSize: "0.7rem", fontWeight: 500 }}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </Typography>
                          {renderReadReceipt(msg)}
                        </Box>
                      </Paper>
                    </Box>
                  )
                })}
                <div ref={messagesEndRef} />
              </Box>

              <Box sx={{ p: 2.5, backgroundColor: "#FFFFFF", borderTop: "2px solid #E0E0E0" }}>
                <Box sx={{
                  display: "flex",
                  gap: 1.5,
                  alignItems: "flex-end",
                  backgroundColor: "#F5F5F5",
                  borderRadius: 3,
                  p: 1.5,
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                  border: "1px solid #E0E0E0",
                  transition: "all 0.3s ease",
                  "&:focus-within": { boxShadow: "0 4px 16px rgba(21, 101, 192, 0.15)", borderColor: BLUE },
                }}>
                  <TextField
                    fullWidth
                    multiline
                    maxRows={4}
                    placeholder="Type a message…"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    variant="standard"
                    InputProps={{ disableUnderline: true, sx: { fontSize: "0.95rem", color: "#212121" } }}
                  />
                  <IconButton onClick={handleSend} disabled={!messageInput.trim()} sx={{
                    backgroundColor: BLUE, color: "#FFFFFF", width: 48, height: 48, transition: "all 0.3s ease",
                    "&:hover": { backgroundColor: BLUE_DARK, transform: "scale(1.1)" },
                    "&:disabled": { backgroundColor: "#E0E0E0", color: "#9E9E9E" }
                  }}>
                    <SendIcon sx={{ fontSize: 22 }} />
                  </IconButton>
                </Box>
              </Box>
            </>
          )}
        </Box>
      </Paper>

      {error && <Alert severity="error" sx={{ position: "fixed", bottom: 20, right: 20, zIndex: 9999 }}>{error}</Alert>}
    </Box>
  );
};

const ChatPage = () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const colid = currentUser?.colid || global1.colid;

  if (!currentUser || currentUser.role !== "Student") {
    return (
      <Box sx={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Alert severity="error">
          Access Denied: Only students can chat with alumni mentors.
        </Alert>
      </Box>
    );
  }
  return <ChatPageInner currentUser={currentUser} colid={colid} />;
};

export default ChatPage;
