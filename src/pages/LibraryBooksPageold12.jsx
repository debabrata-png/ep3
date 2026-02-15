import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Pagination,
} from "@mui/material";
import {
  Edit,
  Delete,
  ArrowBack,
  CloudUpload,
  Download,
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import global1 from "./global1";
import ep1 from "../api/ep1";
import * as XLSX from "xlsx";
 

const LIMIT = 10;

const LibraryBooksPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [books, setBooks] = useState([]);
  const [libraryName, setLibraryName] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [issueDialogOpen, setIssueDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [addForm, setAddForm] = useState({
    bookId: "",
    title: "",
    author: "",
    isbn: "",
    publisher: "",
    publishedDate: "",
    accessid: "",
    category: "",
    booklanguage: "",
    price: "",
    pages: "",
    source: "",
    editionOfBook: "",
    volume: "",
    classNo: "",
    donatedBy: "",
    issuedstatus: "available",
    colid: String(global1.colid),
  });
  const [studentQuery, setStudentQuery] = useState("");
  const [studentResults, setStudentResults] = useState([]);
  const [error, setError] = useState("");

  const [issueForm, setIssueForm] = useState({
    regno: "",
    student: "",
    bookid: "",
    bookname: "",
    issuedate: "",
    duedate: "",
    expectedreturndate: "",
    fineperday: "",
    programcode: "",
    semester: "",
  });

  const fetchLibrary = async () => {
    try {
      const res = await ep1.get(`/api/v2/getlibrary/${id}`);
      const name = res.data.data?.libraryname || "";
      setLibraryName(name);
    } catch (error) {}
  };

  const fetchBooks = async (page = 1) => {
    try {
      console.log(global1.colid);

      const res = await ep1.get("/api/v2/getbooks", {
        params: {
          libraryid: id,
          page,
          limit: LIMIT,
          colid: Number(global1.colid),
        },
      });
      console.log(res);

      setBooks(res.data.data.books);
      setTotalPages(Math.ceil(res.data.data.total / LIMIT));
    } catch (error) {}
  };

  const handleOpenIssueDialog = (book) => {
    setSelectedBook(book);
    setIssueForm({
      regno: "",
      student: "",
      bookid: book.bookId,
      bookname: book.title,
      issuedate: "",
      duedate: "",
      expectedreturndate: "",
      fineperday: "",
      colid: Number(global1.colid) || 0,
    });
    setStudentQuery("");
    setStudentResults([]);
    setIssueDialogOpen(true);
  };

  const handleOpenEditDialog = (book) => {
    setEditForm(book);
    setEditDialogOpen(true);
  };

  const handleOpenAddDialog = () => {
    setAddForm({
      bookId: "",
      title: "",
      author: "",
      isbn: "",
      publisher: "",
      publishedDate: "",
      accessid: "",
      category: "",
      booklanguage: "",
      price: "",
      pages: "",
      source: "",
       editionOfBook: "",
      volume: "",
      classNo: "",
      donatedBy: "",
      colid: String(global1.colid),
      issuedstatus: "available",
    });
    setSelectedFile(null);
    setError("");
    setAddDialogOpen(true);
  };

  const downloadExcelTemplate = () => {
    // Create template data with column headers
    const templateData = [
      {
        author: "Sample Author",
        accessid: "ACC001",
        bookId: "BOOK001",
        title: "Sample Book Title",
        isbn: "978-1234567890",
        publisher: "Sample Publisher",
        publishedDate: "2024-01-01",
        category: "Fiction",
        booklanguage: "English",
        price: "500",
        pages: "250",
        source: "Purchase",
         editionOfBook: "1st",
        volume: "1",
        classNo: "813.54",
        donatedBy: "John Doe"
      }
    ];

    // Create a new workbook
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Books Template");

    // Set column widths for better readability
    const columnWidths = [
      { wch: 20 }, // author
      { wch: 15 }, // accessid
      { wch: 15 }, // bookId
      { wch: 30 }, // title
      { wch: 18 }, // isbn
      { wch: 20 }, // publisher
      { wch: 15 }, // publishedDate
      { wch: 15 }, // category
      { wch: 15 }, // booklanguage
      { wch: 10 }, // price
      { wch: 10 }, // pages
      { wch: 15 }, // source
      { wch: 15 }, //  editionOfBook
      { wch: 10 }, // volume
      { wch: 12 }, // classNo
      { wch: 20 }, // donatedBy
    ];
    worksheet['!cols'] = columnWidths;

    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, "Book_Upload_Template.xlsx");
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const validTypes = [
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];
      if (
        validTypes.includes(file.type) ||
        file.name.endsWith(".xlsx") ||
        file.name.endsWith(".xls")
      ) {
        setSelectedFile(file);
        setError("");
      } else {
        setError("Please select a valid Excel file (.xls or .xlsx)");
        event.target.value = null;
      }
    }
  };

  const handleBulkUpload = async () => {
    if (!selectedFile) {
      setError("Please select a  file");
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          console.log("Parsed Excel Data:", jsonData);
          console.log("Column Names:", Object.keys(jsonData[0] || {}));

          if (jsonData.length === 0) {
            setError("Excel file is empty. Please add book data.");
            setUploading(false);
            return;
          }

          const batchId = `BATCH-${Date.now()}`;

          const getColumnValue = (row, ...possibleNames) => {
            for (const name of possibleNames) {
              if (row[name]) return String(row[name]).trim();
            }
            return "";
          };

          const booksData = jsonData.map((row) => ({
            bookId: getColumnValue(row, "bookId", "BookId", "Book ID", "book_id"),
            title: getColumnValue(row, "title", "Title"),
            author: getColumnValue(row, "author", "Author", "Author Name", "author_name"),
            isbn: getColumnValue(row, "isbn", "ISBN"),
            publisher: getColumnValue(row, "publisher", "Publisher"),
            publishedDate: getColumnValue(row, "publishedDate", "PublishedDate", "Published Date", "publication_date"),
            accessid: getColumnValue(row, "accessid", "AccessId", "Access ID", "access_id"),
            category: getColumnValue(row, "category", "Category"),
            booklanguage: getColumnValue(row, "booklanguage", "BookLanguage", "Language", "language"),
            price: getColumnValue(row, "price", "Price", "book_price"),
            pages: getColumnValue(row, "pages", "Pages", "page_count"),
            source: getColumnValue(row, "source", "Source"),
             editionOfBook: getColumnValue(row, " editionOfBook", " editionOfBook", " edition Of Book", " edition_of_book"),
            volume: getColumnValue(row, "volume", "Volume"),
            classNo: getColumnValue(row, "classNo", "ClassNo", "Class No", "class_no"),
            donatedBy: getColumnValue(row, "donatedBy", "DonatedBy", "Donated By", "donated_by"),
            bulkUploadBatch: batchId,
            libraryid: id,
            libraryname: libraryName,
            colid: String(global1.colid),
            issuedstatus: "available",
          }));

          let successCount = 0;
          let errorCount = 0;
          const failedBooks = [];

          for (let i = 0; i < booksData.length; i++) {
            const book = booksData[i];

            try {
              await ep1.post("/api/v2/createbook", book);
              successCount++;
              console.log(
                `Added book ${i + 1}/${booksData.length}: ${book.title || "Unknown"}`
              );
            } catch (err) {
              errorCount++;
              const errorMsg = err.response?.data?.message || err.message || "Unknown error";
              failedBooks.push(
                `Row ${i + 1} (${book.bookId || book.title || "No ID"}): ${errorMsg}`
              );
              console.error(`Failed to add book at row ${i + 1}:`, err);
            }
          }

          if (errorCount > 0) {
            setError(
              `Upload complete!\nSuccessful: ${successCount}\nFailed: ${errorCount}\n\nDetails:\n${failedBooks.slice(0, 5).join("\n")}${failedBooks.length > 5 ? `\n... and ${failedBooks.length - 5} more` : ""}`
            );
          } else {
            alert(`Bulk upload successful! ${successCount} books added.`);
            setAddDialogOpen(false);
            setSelectedFile(null);
            setError("");
            fetchBooks(page);
          }
        } catch (parseError) {
          setError(
            "Failed to parse Excel file. Please check the file format.\n\nRequired columns: author, accessid\nOptional columns: bookId, title, isbn, publisher, publishedDate, category, booklanguage, price, pages, source,  editionOfBook, volume, classNo, donatedBy"
          );
          console.error(parseError);
        } finally {
          setUploading(false);
        }
      };

      reader.readAsArrayBuffer(selectedFile);
    } catch (err) {
      setError("Failed to upload books.");
      console.error(err);
      setUploading(false);
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (!window.confirm("Are you sure you want to delete this book?")) return;
    try {
      await ep1.get(`/api/v2/deletebook/${bookId}`);
      alert("Book deleted successfully!");
      fetchBooks(page);
    } catch (err) {
      alert("Failed to delete book.");
    }
  };

  const handleSubmitIssue = async () => {
    if (!issueForm.student || !issueForm.regno) {
      alert("Please select a valid student before issuing.");
      return;
    }

    const issueDate = new Date(issueForm.issuedate);
    const dueDate = new Date(issueForm.duedate);
    const finePerDay = parseFloat(issueForm.fineperday || "0");

    let fineAmount = 0;

    if (issueDate > dueDate && finePerDay > 0) {
      const daysLate = Math.ceil((issueDate - dueDate) / (1000 * 60 * 60 * 24));
      fineAmount = daysLate * finePerDay;
    }

    const payload = {
      transactionid: `TXN-${Date.now()}`,
      libraryid: id,
      libraryname: libraryName,
      bookid: issueForm.bookid,
      bookname: issueForm.bookname,
      colid: Number(issueForm.colid) || 0,
      regno: issueForm.regno,
      student: issueForm.student,
      issuedate: issueForm.issuedate,
      duedate: issueForm.duedate,
      expectedreturndate: issueForm.expectedreturndate,
      fineperday: issueForm.fineperday,
      issuestatus: "issued",
    };

    try {
      const res = await ep1.post("/api/v2/issuebook/create", payload);

      await ep1.post(`/api/v2/updatebook/${selectedBook._id}`, {
        issuedstatus: "issued",
      });

      if (fineAmount > 0) {
        const finePayload = {
          name: global1.name,
          user: global1.user,
          feegroup: "Library",
          regno: issueForm.regno,
          student: issueForm.student,
          feeitem: `Fine for ${issueForm.bookname}`,
          amount: parseFloat(fineAmount.toFixed(2)),
          paymode: "unpaid",
          paydetails: "",
          feecategory: "fine",
          semester: issueForm.semester,
          type: "library",
          installment: "N/A",
          comments: `Late issue fine`,
          academicyear: "2025-26",
          colid: Number(global1.colid) || 0,
          classdate: issueDate,
          status: "due",
          programcode: issueForm.programcode
        };

        await ep1.post(`/api/v2/createledgerstud`, finePayload);
      }

      alert("Book issued successfully!");
      setIssueDialogOpen(false);
      fetchBooks(page);
    } catch (error) {
      alert("Failed to issue book.");
    }
  };

  const handleSubmitEdit = async () => {
    try {
      await ep1.post(`/api/v2/updatebook/${editForm._id}`, editForm);
      alert("Book updated successfully!");
      setEditDialogOpen(false);
      fetchBooks(page);
    } catch (err) {
      alert("Failed to update book.");
    }
  };

  const handleSubmitAdd = async () => {
    if (!addForm.author) {
      setError("Author is required");
      return;
    }
    if (!addForm.accessid) {
      setError("Access ID is required");
      return;
    }

    try {
      await ep1.post("/api/v2/createbook", {
        ...addForm,
        libraryid: id,
        libraryname: libraryName,
      });
      alert("Book added successfully!");
      setAddDialogOpen(false);
      setError("");
      fetchBooks(page);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to add book";
      setError(errorMsg);
      console.error("Error adding book:", err);
    }
  };

  const handleSearch = async () => {
    if (!search.trim()) return fetchBooks(1);
    try {
      const res = await ep1.get("/api/v2/searchbooks", {
        params: { query: search, libraryid: id, page, limit: LIMIT },
      });
      setBooks(res.data.data);
      setTotalPages(Math.ceil(res.data.total / LIMIT));
    } catch (error) {}
  };

  useEffect(() => {
    setAddDialogOpen(false);
    setEditDialogOpen(false);
    setIssueDialogOpen(false);
    fetchLibrary();
  }, [id]);

  useEffect(() => {
    fetchBooks(page);
  }, [page]);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      const trimmedQuery = studentQuery.trim();
      if (!trimmedQuery) {
        setStudentResults([]);
        setIssueForm((prev) => ({ ...prev, student: "" }));
        return;
      }

      try {
        const res = await ep1.get("/api/v2/searchstudent", {
          params: { regno: trimmedQuery },
        });

        if (res.data?.data) {
          const s = res.data.data;
          const student = { regno: s.regno, name: s.name, programcode: s.programcode, semester: s.semester };

          setStudentResults([student]);
          setIssueForm((prev) => ({
            ...prev,
            regno: student.regno,
            student: student.name,
            programcode: student.programcode,
            semester: student.semester
          }));
        } else {
          setStudentResults([]);
          setIssueForm((prev) => ({ ...prev, student: "" }));
        }
      } catch {
        setStudentResults([]);
        setIssueForm((prev) => ({ ...prev, student: "" }));
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [studentQuery]);
  
  return (
    <Box>
      <Button>
        <ArrowBack onClick={() => navigate("/admin/libraries")} />
      </Button>
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{ color: "#1976d2", fontWeight: 600 }}
      >
        {libraryName ? `${libraryName} - Books` : "Library Books"}
      </Typography>

      <Box
        display="flex"
        justifyContent="center"
        gap={2}
        flexWrap="wrap"
        mb={2}
      >
        <TextField
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search books"
          size="small"
          sx={{ width: 300 }}
        />
        <Button variant="contained" onClick={handleSearch}>
          Search
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            setSearch("");
            fetchBooks(1);
          }}
        >
          Clear
        </Button>
      </Box>

      <Box display="flex" justifyContent="center" gap={2} mb={2}>
        <Button variant="contained" onClick={handleOpenAddDialog}>
          Add Book
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => navigate(`/library/${id}/issued-books`)}
        >
          View Issued Books
        </Button>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => navigate(`/library/${id}/report`)}
        >
          View Report
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{  mx: "auto" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Status</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Author</TableCell>
              <TableCell>ISBN</TableCell>
              <TableCell>Publisher</TableCell>
              <TableCell>Published Date</TableCell>
              <TableCell>Access ID</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Language</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Pages</TableCell>
              <TableCell>Source</TableCell>
              <TableCell>Edition</TableCell>
              <TableCell>Volume</TableCell>
              <TableCell>Class No</TableCell>
              <TableCell>Donated By</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {books.map((book) => (
              <TableRow key={book._id} hover>
                <TableCell
                  sx={{
                    color:
                      book.issuedstatus === "available"
                        ? "green"
                        : book.issuedstatus === "issued"
                        ? "orange"
                        : "inherit",
                    fontWeight: 600,
                    textTransform: "capitalize",
                  }}
                >
                  {book.issuedstatus}
                </TableCell>
                <TableCell>{book.title}</TableCell>
                <TableCell>{book.author}</TableCell>
                <TableCell>{book.isbn}</TableCell>
                <TableCell>{book.publisher}</TableCell>
                <TableCell>{book.publishedDate}</TableCell>
                <TableCell>{book.accessid}</TableCell>
                <TableCell>{book.category}</TableCell>
                <TableCell>{book.booklanguage}</TableCell>
                <TableCell>{book.price || "-"}</TableCell>
                <TableCell>{book.pages || "-"}</TableCell>
                <TableCell>{book.source || "-"}</TableCell>
                <TableCell>{book.editionOfBook || "-"}</TableCell>

                <TableCell>{book.volume || "-"}</TableCell>
                <TableCell>{book.classNo || "-"}</TableCell>
                <TableCell>{book.donatedBy || "-"}</TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      startIcon={<Edit />}
                      onClick={() => handleOpenEditDialog(book)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      startIcon={<Delete />}
                      onClick={() => handleDeleteBook(book._id)}
                    >
                      Delete
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      size="small"
                      onClick={() => handleOpenIssueDialog(book)}
                      disabled={book.issuedstatus === "issued"}
                    >
                      Issue
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={2}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}

      {/* Add Book Dialog - Manual Entry + Bulk Upload */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Book</DialogTitle>
        <DialogContent>
          {error && (
            <Box
              sx={{
                mb: 2,
                p: 2,
                backgroundColor: "#ffebee",
                border: "1px solid #f44336",
                borderRadius: "4px",
              }}
            >
              <Typography variant="body2" color="error" sx={{ whiteSpace: "pre-wrap" }}>
                {error}
              </Typography>
            </Box>
          )}

          {/* Manual Entry Form */}
          {!selectedFile ? (
            <>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, mt: 2 }}>
                Manual Entry
              </Typography>
              
              {/* Required Fields First */}
              <TextField
                label="Author (Required)"
                fullWidth
                margin="dense"
                value={addForm.author || ""}
                onChange={(e) => setAddForm({ ...addForm, author: e.target.value })}
              />
              <TextField
                label="Access ID (Required)"
                fullWidth
                margin="dense"
                value={addForm.accessid || ""}
                onChange={(e) => setAddForm({ ...addForm, accessid: e.target.value })}
              />
              
              
              <TextField
                label="Book ID  "
                fullWidth
                margin="dense"
                value={addForm.bookId || ""}
                onChange={(e) => setAddForm({ ...addForm, bookId: e.target.value })}
              />
              <TextField
                label="Title  "
                fullWidth
                margin="dense"
                value={addForm.title || ""}
                onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
              />
              <TextField
                label="ISBN  "
                fullWidth
                margin="dense"
                value={addForm.isbn || ""}
                onChange={(e) => setAddForm({ ...addForm, isbn: e.target.value })}
              />
              <TextField
                label="Publisher "
                fullWidth
                margin="dense"
                value={addForm.publisher || ""}
                onChange={(e) => setAddForm({ ...addForm, publisher: e.target.value })}
              />
              <TextField
                label="Published Date  "
                fullWidth
                margin="dense"
                placeholder="YYYY-MM-DD"
                value={addForm.publishedDate || ""}
                onChange={(e) => setAddForm({ ...addForm, publishedDate: e.target.value })}
              />
              <TextField
                label="Category  "
                fullWidth
                margin="dense"
                value={addForm.category || ""}
                onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
              />
              <TextField
                label="Book Language  "
                fullWidth
                margin="dense"
                value={addForm.booklanguage || ""}
                onChange={(e) => setAddForm({ ...addForm, booklanguage: e.target.value })}
              />
 
              <TextField
                label="Price  "
                type="number"
                inputProps={{ step: "0.01", min: "0" }}
                fullWidth
                margin="dense"
                value={addForm.price || ""}
                onChange={(e) => setAddForm({ ...addForm, price: e.target.value })}
              />
              
               
              <TextField
                label="Pages  "
                type="number"
                inputProps={{ min: "0" }}
                fullWidth
                margin="dense"
                value={addForm.pages || ""}
                onChange={(e) => setAddForm({ ...addForm, pages: e.target.value })}
              />
              
              {/* New Fields */}
              <TextField
                label="Source  "
                fullWidth
                margin="dense"
                value={addForm.source || ""}
                onChange={(e) => setAddForm({ ...addForm, source: e.target.value })}
              />
              <TextField
                label=" Edition Of Book  "
                fullWidth
                margin="dense"
                 
                value={addForm. editionOfBook || ""}
                onChange={(e) => setAddForm({ ...addForm,  editionOfBook: e.target.value })}
              />
              <TextField
                label="Volume  "
                fullWidth
                margin="dense"
                value={addForm.volume || ""}
                onChange={(e) => setAddForm({ ...addForm, volume: e.target.value })}
              />
              <TextField
                label="Class No  "
                fullWidth
                margin="dense"
                value={addForm.classNo || ""}
                onChange={(e) => setAddForm({ ...addForm, classNo: e.target.value })}
              />
              <TextField
                label="Donated By  "
                fullWidth
                margin="dense"
                value={addForm.donatedBy || ""}
                onChange={(e) => setAddForm({ ...addForm, donatedBy: e.target.value })}
              />
              
              <Box sx={{ my: 3, borderTop: "1px solid #e0e0e0" }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Bulk Upload  
              </Typography>
              <Typography variant="caption" color="textSecondary" sx={{ display: "block", mb: 2 }}>
                Upload  file (.xls or .xlsx) with book details to add multiple books at once.
              </Typography>
              <Typography variant="caption" color="textSecondary" sx={{ display: "block", mb: 2, fontWeight: 500 }}>
                Required columns: <strong>author, accessid</strong>
                <br />
                
              </Typography>
              
              {/* Download Template Button */}
              <Button
                variant="outlined"
                startIcon={<Download />}
                fullWidth
                sx={{ mb: 2 }}
                onClick={downloadExcelTemplate}
              >
                Download   Template
              </Button>
              
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUpload />}
                fullWidth
                sx={{ mb: 2 }}
              >
                Select   File
                <input
                  type="file"
                  hidden
                  accept=".xls,.xlsx"
                  onChange={handleFileChange}
                />
              </Button>
            </>
          ) : (
            <>
              
              <Box
                sx={{
                  p: 2,
                  backgroundColor: "#e8f5e9",
                  border: "1px solid #4caf50",
                  borderRadius: "4px",
                  mb: 2,
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  ✓ File Selected
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {selectedFile.name}
                </Typography>
              </Box>
              <Button
                variant="text"
                onClick={() => {
                  setSelectedFile(null);
                  setError("");
                }}
                sx={{ mb: 2 }}
              >
                ✕ Choose Different File
              </Button>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setAddDialogOpen(false);
              setSelectedFile(null);
              setError("");
            }}
          >
            Cancel
          </Button>
          {selectedFile ? (
            <Button
              variant="contained"
              onClick={handleBulkUpload}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Upload File"}
            </Button>
          ) : (
            <Button variant="contained" onClick={handleSubmitAdd}>
              Add Book
            </Button>
          )}
        </DialogActions>
      </Dialog>
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Book - {editForm.title}</DialogTitle>
        <DialogContent>
          <TextField
            label="Book ID"
            fullWidth
            margin="dense"
            value={editForm.bookId || ""}
            onChange={(e) => setEditForm({ ...editForm, bookId: e.target.value })}
          />
          <TextField
            label="Title"
            fullWidth
            margin="dense"
            value={editForm.title || ""}
            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
          />
          <TextField
            label="Author"
            fullWidth
            margin="dense"
            value={editForm.author || ""}
            onChange={(e) => setEditForm({ ...editForm, author: e.target.value })}
          />
          <TextField
            label="ISBN"
            fullWidth
            margin="dense"
            value={editForm.isbn || ""}
            onChange={(e) => setEditForm({ ...editForm, isbn: e.target.value })}
          />
          <TextField
            label="Publisher"
            fullWidth
            margin="dense"
            value={editForm.publisher || ""}
            onChange={(e) => setEditForm({ ...editForm, publisher: e.target.value })}
          />
          <TextField
            label="Published Date"
            fullWidth
            margin="dense"
            value={editForm.publishedDate || ""}
            onChange={(e) => setEditForm({ ...editForm, publishedDate: e.target.value })}
          />
          <TextField
            label="Access ID"
            fullWidth
            margin="dense"
            value={editForm.accessid || ""}
            onChange={(e) => setEditForm({ ...editForm, accessid: e.target.value })}
          />
          <TextField
            label="Category"
            fullWidth
            margin="dense"
            value={editForm.category || ""}
            onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
          />
          <TextField
            label="Book Language"
            fullWidth
            margin="dense"
            value={editForm.booklanguage || ""}
            onChange={(e) => setEditForm({ ...editForm, booklanguage: e.target.value })}
          />
          <TextField
            label="Price"
            type="number"
            inputProps={{ step: "0.01", min: "0" }}
            fullWidth
            margin="dense"
            value={editForm.price || ""}
            onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
          />
          <TextField
            label="Pages"
            type="number"
            inputProps={{ min: "0" }}
            fullWidth
            margin="dense"
            value={editForm.pages || ""}
            onChange={(e) => setEditForm({ ...editForm, pages: e.target.value })}
          />
          <TextField
            label="Source"
            fullWidth
            margin="dense"
            value={editForm.source || ""}
            onChange={(e) => setEditForm({ ...editForm, source: e.target.value })}
          />
          <TextField
            label=" Edition Of Book"
            fullWidth
            margin="dense"
             
            value={editForm. editionOfBook || ""}
            onChange={(e) => setEditForm({ ...editForm,  editionOfBook: e.target.value })}
          />
          <TextField
            label="Volume"
            fullWidth
            margin="dense"
            value={editForm.volume || ""}
            onChange={(e) => setEditForm({ ...editForm, volume: e.target.value })}
          />
          <TextField
            label="Class No"
            fullWidth
            margin="dense"
            value={editForm.classNo || ""}
            onChange={(e) => setEditForm({ ...editForm, classNo: e.target.value })}
          />
          <TextField
            label="Donated By"
            fullWidth
            margin="dense"
            value={editForm.donatedBy || ""}
            onChange={(e) => setEditForm({ ...editForm, donatedBy: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitEdit}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Issue Book Dialog */}
      <Dialog open={issueDialogOpen} onClose={() => setIssueDialogOpen(false)}>
        <DialogTitle>Issue Book - {selectedBook?.title}</DialogTitle>
        <DialogContent>
          <TextField
            label="Search Student"
            fullWidth
            margin="dense"
            value={studentQuery}
            onChange={(e) => {
              const value = e.target.value;
              setStudentQuery(value);
              setIssueForm((prev) => ({ ...prev, regno: value }));
            }}
          />

          {studentResults.map((s) => (
            <Box
              key={s.regno}
              onClick={() => {
                setIssueForm((prev) => ({
                  ...prev,
                  regno: s.regno,
                  student: s.name,
                }));
                setStudentQuery(`${s.regno}`);
                setStudentResults([]);
              }}
              sx={{
                p: 1,
                cursor: "pointer",
                "&:hover": { backgroundColor: "#eee" },
              }}
            >
              {s.name} ({s.regno})
            </Box>
          ))}

          {issueForm.student && (
            <TextField
              label="Student Name"
              fullWidth
              margin="dense"
              value={issueForm.student}
              InputProps={{ readOnly: true }}
            />
          )}

          <TextField
            label="Issue Date"
            type="date"
            fullWidth
            margin="dense"
            InputLabelProps={{ shrink: true }}
            value={issueForm.issuedate}
            onChange={(e) =>
              setIssueForm({ ...issueForm, issuedate: e.target.value })
            }
          />
          <TextField
            label="Due Date"
            type="date"
            fullWidth
            margin="dense"
            InputLabelProps={{ shrink: true }}
            value={issueForm.duedate}
            onChange={(e) =>
              setIssueForm({ ...issueForm, duedate: e.target.value })
            }
          />
          <TextField
            label="Expected Return Date"
            type="date"
            fullWidth
            margin="dense"
            InputLabelProps={{ shrink: true }}
            value={issueForm.expectedreturndate}
            onChange={(e) =>
              setIssueForm({ ...issueForm, expectedreturndate: e.target.value })
            }
          />
          <TextField
            label="Fine Per Day"
            fullWidth
            margin="dense"
            value={issueForm.fineperday}
            onChange={(e) =>
              setIssueForm({ ...issueForm, fineperday: e.target.value })
            }
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setIssueDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitIssue}>
            Issue
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LibraryBooksPage;