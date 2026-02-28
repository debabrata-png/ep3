import { useState, useEffect, useRef } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  Avatar,
  InputAdornment,
  Alert,
  CircularProgress,
  Badge,
  IconButton,
  Tooltip,
  Chip,
  Divider,
} from "@mui/material";
import {
  Send as SendIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Close as CloseIcon,
  ChatBubbleOutline as ChatIcon,
  Message as MessageIcon,
  MoreVert as MoreVertIcon,
  AttachFile as AttachFileIcon,
  DoneAll as DoneAllIcon,
  Done as DoneIcon,
  FiberManualRecord as DotIcon,
  MarkChatUnread as UnreadIcon,
  Textsms as TextsmsIcon,
} from "@mui/icons-material";
import ep1 from "../api/ep1";
import global1 from "./global1";

const FacultyChat = () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const [currentUserDetails, setCurrentUserDetails] = useState(currentUser);
  const [students, setStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentLoading, setStudentLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [approvalChecked, setApprovalChecked] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [mentorData, setMentorData] = useState(null);

  const messagesEndRef = useRef(null);
  const pollingIntervalRef = useRef(null);

  const fetchStudents = async (searchQuery = "", user = currentUserDetails, mentor = mentorData) => {
    try {
      setStudentLoading(true);
      setError(null);


      let targetRoles = "Student";
      if (user?.role === "Student") {
        targetRoles = "Faculty,PE,Alumni";
      } else if (["Faculty", "PE", "Alumni"].includes(user?.role)) {
        targetRoles = "Student";
      } else if (user?.role === "Admin") {
        targetRoles = "Student,Faculty,PE,Alumni";
      }

      const params = {
        roles: targetRoles,
        searchQuery,
        limit: 500,
      };

      if (user?.role === "Alumni") {
        params.colid = user.colid;
        params.department = user.department;
        params.semester = mentor?.semester || user.semester;
      } else {
        params.colid = user?.colid || global1.colid;
        params.department = user?.department;
        params.status = "approved";
      }

      const res = await ep1.get("/api/v2/users/by-role", { params });

      if (res.data.success) {
        const studentsData = res.data.data || [];
        const newUnreadCounts = {};
        const studentsWithLastMessage = await Promise.all(
          studentsData.map(async (student) => {
            try {
              const chatRes = await ep1.get("/api/v2/chat/history", {
                params: {
                  userId1: user?._id,
                  userId2: student._id,
                  colid: user?.colid || global1.colid,
                },
              });
              const messages = chatRes.data.data || [];
              const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
              // Count unread messages (sent by this student, received by current user, not read)
              const unread = messages.filter(
                (m) => m.senderId === student._id && m.receiverId === user?._id && !m.isRead
              ).length;
              newUnreadCounts[student._id] = unread;
              return {
                ...student,
                lastMessageTime: lastMessage ? new Date(lastMessage.createdAt).getTime() : 0,
              };
            } catch {
              return { ...student, lastMessageTime: 0 };
            }
          })
        );
        setUnreadCounts(newUnreadCounts);
        studentsWithLastMessage.sort((a, b) => b.lastMessageTime - a.lastMessageTime);
        setStudents(studentsWithLastMessage);
      }
    } catch (err) {
      console.error("Error fetching students:", err);
      setError("Failed to fetch students");
    } finally {
      setStudentLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      if (currentUser?._id) {
        try {
          const res = await ep1.get(`/api/v2/users/${currentUser._id}`);
          const user = res.data.success ? res.data.data : currentUser;
          if (res.data.success) setCurrentUserDetails(user);

          // Check approval status for Alumni users
          if (user.role === "Alumni") {
            try {
              const mentorRes = await ep1.get("/api/v2/mentors", {
                params: {
                  colid: user.colid || global1.colid,
                  userid: user._id,
                  status: "approved",
                },
              });
              if (mentorRes.data.success && mentorRes.data.count > 0) {
                const mentorRecord = mentorRes.data.data[0];
                setMentorData(mentorRecord);
                setIsApproved(true);
                setApprovalChecked(true);
                fetchStudents("", user, mentorRecord);
              } else {
                setIsApproved(false);
                setApprovalChecked(true);
                fetchStudents("", user, null);
              }
            } catch {
              setIsApproved(false);
              setApprovalChecked(true);
              fetchStudents("", user, null);
            }
          } else {
            // Non-Alumni users skip approval check
            setIsApproved(true);
            setApprovalChecked(true);
            fetchStudents("", user);
          }
        } catch {
          // Non-Alumni users skip approval check
          if (currentUser.role !== "Alumni") {
            setIsApproved(true);
          }
          setApprovalChecked(true);
          fetchStudents("", currentUser);
        }
      }
    };
    init();
  }, []);

  const fetchChatHistory = async (otherUserId) => {
    try {
      setLoadingMessages(true);
      setMessages([]);
      const res = await ep1.get("/api/v2/chat/history", {
        params: {
          userId1: currentUser?._id,
          userId2: otherUserId,
          colid: currentUser?.colid || global1.colid,
        },
      });

      if (res.data.success) {
        const newMessages = res.data.data || [];
        console.log("📩 Initial messages loaded:", newMessages.length);
        setMessages(newMessages);
        markMessagesAsRead(otherUserId);
      }
    } catch (err) {
      console.error("Error fetching chat history:", err);
      setError("Failed to fetch chat history");
    } finally {
      setLoadingMessages(false);
    }
  };

  const fetchChatHistorySilent = async (otherUserId) => {
    try {
      const res = await ep1.get("/api/v2/chat/history", {
        params: {
          userId1: currentUser?._id,
          userId2: otherUserId,
          colid: currentUser?.colid || global1.colid,
        },
      });

      if (res.data.success) {
        const newMessages = res.data.data || [];

        setMessages(prevMessages => {

          if (prevMessages.length !== newMessages.length) {
            console.log("🔄 Message count changed:", prevMessages.length, "→", newMessages.length);
            return newMessages;
          }


          if (prevMessages.length > 0 && newMessages.length > 0) {
            const prevLastId = prevMessages[prevMessages.length - 1]._id;
            const newLastId = newMessages[newMessages.length - 1]._id;

            if (prevLastId !== newLastId) {
              console.log("🔄 Last message changed");
              return newMessages;
            }
          }


          return prevMessages;
        });
      }
    } catch (err) {
      console.error("Error polling messages:", err);
    }
  };


  const startPolling = (otherUserId) => {

    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    console.log("🔁 Starting message polling for:", otherUserId);

    pollingIntervalRef.current = setInterval(() => {
      console.log("📡 Polling for new messages...");
      fetchChatHistorySilent(otherUserId);
    }, 2000);
  };

  const markMessagesAsRead = async (otherUserId) => {
    try {
      await ep1.post("/api/v2/chat/mark-read", {
        senderId: otherUserId,
        receiverId: currentUser?._id,
        colid: currentUser?.colid || global1.colid,
      });
      console.log("✅ Messages marked as read");
    } catch (err) {
      console.error("Error marking messages as read:", err);
    }
  };

  const sendMessage = async (receiverId, receiverName, receiverRole) => {
    if (!messageInput.trim()) return;

    try {
      console.log("📤 Sending message to:", receiverName);

      const res = await ep1.post("/api/v2/chat/send-message", {
        senderId: currentUser?._id,
        senderName: currentUser?.name,
        senderRole: currentUser?.role,
        receiverId,
        receiverName,
        receiverRole,
        message: messageInput.trim(),
        colid: currentUser?.colid || global1.colid,
      });

      if (res.data.success) {
        console.log("✅ Message sent successfully");

        const sentMessage = res.data.data;
        setMessages(prevMessages => [...prevMessages, sentMessage]);
        setMessageInput("");

        fetchStudents(studentSearch);
      }
    } catch (err) {
      console.error("❌ Error sending message:", err);
      setError("Failed to send message");
    }
  };

  const handleSelectStudent = (student) => {
    console.log("👤 Selected student:", student.name);
    setSelectedStudent(student);
    fetchChatHistory(student._id);
    startPolling(student._id);
    // Clear unread count for selected student
    setUnreadCounts((prev) => ({ ...prev, [student._id]: 0 }));
  };

  const handleStudentSearch = (e) => {
    const query = e.target.value;
    setStudentSearch(query);
    fetchStudents(query);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);



  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        console.log("🧹 Cleanup: stopping polling");
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const selectedChat = selectedStudent;

  const getAvatar = (person, size = 40) => {
    const photoUrl = person.profilePhoto || person.photo || person.avatar;

    if (photoUrl) {
      return (
        <Avatar
          src={photoUrl}
          alt={person.name}
          sx={{
            width: size,
            height: size,
            border: "2px solid #E8EAF6",
            boxShadow: "0 2px 8px rgba(63, 81, 181, 0.15)",
          }}
        />
      );
    }

    return (
      <Avatar
        sx={{
          width: size,
          height: size,
          backgroundColor: "#3F51B5",
          fontSize: size * 0.4,
          fontWeight: 600,
          border: "2px solid #E8EAF6",
          boxShadow: "0 2px 8px rgba(63, 81, 181, 0.15)",
        }}
      >
        {person.name.charAt(0).toUpperCase()}
      </Avatar>
    );
  };

  const getRoleDisplay = (role) => {
    const roleMap = {
      PE: { label: "Faculty", color: "#5E35B1" },
      Admin: { label: "Administrator", color: "#D32F2F" },
      Faculty: { label: "Faculty", color: "#1976D2" },
      Student: { label: "Student", color: "#388E3C" },
      Alumni: { label: "Alumni", color: "#F57C00" },
    };
    return roleMap[role] || { label: role, color: "#546E7A" };
  };

  const renderReadReceipt = (message) => {
    if (message.senderId !== currentUser?._id) {
      return null;
    }

    if (message.isRead) {
      return (
        <DoneAllIcon
          sx={{
            fontSize: 16,
            color: "#4CAF50",
            ml: 0.5,
          }}
        />
      );
    } else {
      return (
        <DoneIcon
          sx={{
            fontSize: 16,
            color: "#B0BEC5",
            ml: 0.5,
          }}
        />
      );
    }
  };

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
      {!approvalChecked ? (
        <Box sx={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", p: 3 }}>
          <CircularProgress size={40} sx={{ color: "#3F51B5" }} />
        </Box>
      ) : currentUser && !["Faculty", "PE", "Admin", "Student", "Alumni"].includes(currentUser.role) ? (
        <Box sx={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", p: 3 }}>
          <Alert severity="error" sx={{ maxWidth: 600 }}>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              Access Denied: Only Students, Faculty, and Alumni can access the chat feature.
            </Typography>
          </Alert>
        </Box>
      ) : !isApproved ? (
        <Box sx={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", p: 3, flexDirection: "column", gap: 2 }}>
          <Alert severity="warning" sx={{ maxWidth: 600 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Access Restricted
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              Your Alumni mentor application has not been approved yet. Please wait for admin approval to access the chat feature.
            </Typography>
          </Alert>
        </Box>
      ) : (
        <Paper
          elevation={6}
          sx={{
            display: "flex",
            width: "100%",
            height: "100%",
            overflow: "hidden",
            borderRadius: 3,
            boxShadow: "0 24px 60px rgba(63, 81, 181, 0.15)",
            bgcolor: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(12px)",
          }}
        >
          <Box
            sx={{
              width: 400,
              borderRight: "1px solid #E0E0E0",
              display: "flex",
              flexDirection: "column",
              backgroundColor: "#FFFFFF",
            }}
          >
            <Box
              sx={{
                p: 3,
                background: "linear-gradient(135deg, #3F51B5 0%, #5E35B1 100%)",
                color: "#FFFFFF",
                boxShadow: "0 2px 8px rgba(63, 81, 181, 0.2)",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                <MessageIcon sx={{ fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Messages
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.95, fontSize: "0.875rem", ml: 4.5 }}>
                {currentUser?.name}
              </Typography>
            </Box>

            <Box
              sx={{
                p: 2.5,
                backgroundColor: "#F5F5F5",
                borderBottom: "1px solid #E0E0E0",
              }}
            >
              <TextField
                fullWidth
                size="small"
                placeholder="Search students..."
                value={studentSearch}
                onChange={handleStudentSearch}
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
                    "&:hover": {
                      boxShadow: "0 4px 12px rgba(63, 81, 181, 0.12)",
                    },
                    "&.Mui-focused": {
                      boxShadow: "0 4px 16px rgba(63, 81, 181, 0.18)",
                    },
                  },
                }}
              />
            </Box>

            {/* Contact List */}
            <Box
              sx={{
                flex: 1,
                overflowY: "auto",
                backgroundColor: "#FFFFFF",
              }}
            >
              {studentLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", flexDirection: "column", gap: 2 }}>
                  <CircularProgress size={40} sx={{ color: "#3F51B5" }} />
                  <Typography variant="body2" sx={{ color: "#757575" }}>
                    Loading students...
                  </Typography>
                </Box>
              ) : students.length === 0 ? (
                <Box sx={{ p: 4, textAlign: "center" }}>
                  <TextsmsIcon sx={{ fontSize: 64, color: "#BDBDBD", mb: 2 }} />
                  <Typography variant="body1" sx={{ color: "#757575", fontWeight: 500 }}>
                    No students found
                  </Typography>
                  {studentSearch && (
                    <Typography variant="body2" sx={{ color: "#9E9E9E", mt: 1 }}>
                      Try adjusting your search
                    </Typography>
                  )}
                </Box>
              ) : (
                <List disablePadding>
                  {students.map((person) => (
                    <ListItemButton
                      key={person._id}
                      selected={selectedChat?._id === person._id}
                      onClick={() => handleSelectStudent(person)}
                      sx={{
                        borderBottom: "1px solid #F5F5F5",
                        backgroundColor: selectedChat?._id === person._id ? "rgba(63, 81, 181, 0.08)" : "transparent",
                        py: 2,
                        px: 2.5,
                        borderRadius: 2,
                        mx: 1,
                        my: 0.5,
                        transition: "all 0.2s ease",
                        "&:hover": {
                          backgroundColor: "rgba(63, 81, 181, 0.05)",
                          transform: "translateX(4px)",
                        },
                      }}
                    >
                      <Box sx={{ mr: 2 }}>
                        <Badge
                          badgeContent={unreadCounts[person._id] || 0}
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
                          {getAvatar(person, 50)}
                        </Badge>
                      </Box>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: "1rem", mb: 0.5, color: "#212121" }}>
                            {person.name}
                          </Typography>
                        }
                        secondary={
                          <Chip
                            label={getRoleDisplay(person.role).label}
                            size="small"
                            sx={{
                              height: 22,
                              fontSize: "0.7rem",
                              fontWeight: 600,
                              backgroundColor: `${getRoleDisplay(person.role).color}15`,
                              color: getRoleDisplay(person.role).color,
                              border: `1px solid ${getRoleDisplay(person.role).color}30`,
                            }}
                          />
                        }
                      />
                    </ListItemButton>
                  ))}
                </List>
              )}
            </Box>
          </Box>

          {/* Chat Area - CONTINUED IN NEXT PART DUE TO LENGTH */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              backgroundColor: "#FAFAFA",
            }}
          >
            {selectedChat ? (
              <>
                <Box
                  sx={{
                    p: 2.5,
                    borderBottom: "2px solid #E0E0E0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 100%)",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    {getAvatar(selectedChat, 48)}
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "1.1rem", color: "#212121" }}>
                        {selectedChat.name}
                      </Typography>
                      <Chip
                        label={getRoleDisplay(selectedChat.role).label}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          backgroundColor: `${getRoleDisplay(selectedChat.role).color}15`,
                          color: getRoleDisplay(selectedChat.role).color,
                          border: `1px solid ${getRoleDisplay(selectedChat.role).color}30`,
                        }}
                      />
                    </Box>
                  </Box>
                  <Tooltip title="Close chat">
                    <IconButton
                      size="small"
                      onClick={() => {
                        console.log("🛑 Closing chat");
                        setSelectedStudent(null);
                        setMessages([]);
                        if (pollingIntervalRef.current) {
                          clearInterval(pollingIntervalRef.current);
                        }
                      }}
                      sx={{
                        color: "#757575",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          backgroundColor: "rgba(244, 67, 54, 0.1)",
                          color: "#F44336",
                        },
                      }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Tooltip>
                </Box>

                <Box
                  sx={{
                    flex: 1,
                    overflowY: "auto",
                    p: 3,
                    backgroundColor: "#FAFAFA",
                    backgroundImage: `
                      linear-gradient(rgba(224, 224, 224, 0.05) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(224, 224, 224, 0.05) 1px, transparent 1px)
                    `,
                    backgroundSize: "20px 20px",
                  }}
                >
                  {loadingMessages ? (
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", flexDirection: "column", gap: 2 }}>
                      <CircularProgress size={50} sx={{ color: "#3F51B5" }} />
                      <Typography variant="body1" sx={{ color: "#757575" }}>
                        Loading conversation...
                      </Typography>
                    </Box>
                  ) : messages.length === 0 ? (
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", flexDirection: "column" }}>
                      <Box
                        sx={{
                          width: 120,
                          height: 120,
                          borderRadius: "50%",
                          backgroundColor: "rgba(63, 81, 181, 0.1)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mb: 3,
                        }}
                      >
                        <MessageIcon sx={{ fontSize: 60, color: "#3F51B5" }} />
                      </Box>
                      <Typography variant="h6" sx={{ color: "#424242", fontWeight: 600, mb: 1 }}>
                        No messages yet
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#757575", textAlign: "center" }}>
                        Start a conversation with {selectedChat.name}
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      {messages.map((msg, index) => {
                        const isOwnMessage = msg.senderId === currentUser?._id;
                        const showDateDivider = index === 0 ||
                          new Date(messages[index - 1].createdAt).toDateString() !== new Date(msg.createdAt).toDateString();

                        return (
                          <Box key={msg._id || index}>
                            {showDateDivider && (
                              <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
                                <Chip
                                  label={new Date(msg.createdAt).toLocaleDateString([], {
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric"
                                  })}
                                  size="small"
                                  sx={{
                                    backgroundColor: "#FFFFFF",
                                    fontWeight: 600,
                                    fontSize: "0.75rem",
                                    color: "#616161",
                                    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
                                    border: "1px solid #E0E0E0",
                                  }}
                                />
                              </Box>
                            )}
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: isOwnMessage ? "flex-end" : "flex-start",
                                mb: 1,
                              }}
                            >
                              <Paper
                                elevation={2}
                                sx={{
                                  maxWidth: "65%",
                                  p: 1,
                                  background: isOwnMessage
                                    ? "linear-gradient(135deg, #3F51B5 0%, #5E35B1 100%)"
                                    : "#FFFFFF",
                                  color: isOwnMessage ? "#FFFFFF" : "#212121",
                                  borderRadius: isOwnMessage ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                                  wordWrap: "break-word",
                                  position: "relative",
                                  boxShadow: isOwnMessage
                                    ? "0 4px 12px rgba(63, 81, 181, 0.3)"
                                    : "0 2px 8px rgba(0, 0, 0, 0.08)",
                                  border: isOwnMessage
                                    ? "none"
                                    : "1px solid #E0E0E0",
                                  transition: "transform 0.2s ease",
                                  "&:hover": {
                                    transform: "scale(1.02)",
                                  },
                                }}
                              >
                                <Typography variant="body2" sx={{ lineHeight: 1.4, fontSize: "0.9rem", mb: 0.25 }}>
                                  {msg.message}
                                </Typography>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "flex-end",
                                    gap: 0.5,
                                    mt: 0.25,
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: isOwnMessage ? "rgba(255, 255, 255, 0.8)" : "#757575",
                                      fontSize: "0.7rem",
                                      fontWeight: 500,
                                    }}
                                  >
                                    {new Date(msg.createdAt).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </Typography>
                                  {renderReadReceipt(msg)}
                                </Box>
                              </Paper>
                            </Box>
                          </Box>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </Box>

                <Box
                  sx={{
                    p: 2.5,
                    backgroundColor: "#FFFFFF",
                    borderTop: "2px solid #E0E0E0",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1.5,
                      alignItems: "flex-end",
                      backgroundColor: "#F5F5F5",
                      borderRadius: 3,
                      p: 1.5,
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                      border: "1px solid #E0E0E0",
                      transition: "all 0.3s ease",
                      "&:focus-within": {
                        boxShadow: "0 4px 16px rgba(63, 81, 181, 0.15)",
                        borderColor: "#3F51B5",
                      },
                    }}
                  >
                    <TextField
                      fullWidth
                      multiline
                      maxRows={4}
                      placeholder="Type a message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage(selectedChat._id, selectedChat.name, selectedChat.role);
                        }
                      }}
                      variant="standard"
                      InputProps={{
                        disableUnderline: true,
                        sx: {
                          fontSize: "0.95rem",
                          color: "#212121",
                        },
                      }}
                    />
                    <IconButton
                      onClick={() => sendMessage(selectedChat._id, selectedChat.name, selectedChat.role)}
                      disabled={!messageInput.trim()}
                      sx={{
                        backgroundColor: "#3F51B5",
                        color: "#FFFFFF",
                        width: 48,
                        height: 48,
                        transition: "all 0.3s ease",
                        "&:hover": {
                          backgroundColor: "#303F9F",
                          transform: "scale(1.1)",
                        },
                        "&:disabled": {
                          backgroundColor: "#E0E0E0",
                          color: "#9E9E9E",
                        },
                      }}
                    >
                      <SendIcon sx={{ fontSize: 22 }} />
                    </IconButton>
                  </Box>
                </Box>
              </>
            ) : (
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
                    background: "linear-gradient(135deg, #3F51B5 0%, #5E35B1 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 3,
                    boxShadow: "0 8px 24px rgba(63, 81, 181, 0.3)",
                  }}
                >
                  <MessageIcon sx={{ fontSize: 80, color: "#FFFFFF" }} />
                </Box>
                <Typography variant="h5" sx={{ color: "#212121", fontWeight: 600, mb: 1 }}>
                  Professional Communication
                </Typography>
                <Typography variant="body1" sx={{ color: "#757575", textAlign: "center", maxWidth: 400 }}>
                  Select a student from the list to start messaging
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      )}

      {error && (
        <Alert
          severity="error"
          onClose={() => setError(null)}
          sx={{
            position: "fixed",
            bottom: 20,
            right: 20,
            minWidth: 300,
            zIndex: 9999,
            boxShadow: "0 4px 16px rgba(211, 47, 47, 0.3)",
            borderLeft: "4px solid #D32F2F",
          }}
        >
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default FacultyChat;