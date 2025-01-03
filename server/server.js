const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const server = express();
const port = 3000;

// Middleware for handling JSON and URL-encoded data
server.use(express.json());
server.use(express.urlencoded({ extended: false }));

// CORS headers to allow requests from other origins
server.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Methods", "*");
  next();
});

// Connect to SQLite Database
const db = new sqlite3.Database("./database.db", (err) => {
  if (err) {
    console.error("Error connecting to the database:", err.message);
  } else {
    console.log("Connected to SQLite database: database.db");
  }
});

// Start the server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Route to fetch all books
server.get("/library", (req, res) => {
  db.all("SELECT * FROM library", (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(results);
    }
  });
});

// Route to fetch a specific book
server.get("/library/:id", (req, res) => {
  db.get("SELECT * FROM library WHERE id = ?", [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (!row) {
      res.status(404).json({ message: "Book not found" });
    } else {
      res.json(row);
    }
  });
});

// Route to add a new book
server.post("/library", (req, res) => {
  const { bookTitle, bookGenre, publishedYear, rating } = req.body;

  if (!bookTitle || !bookGenre || !publishedYear || !rating) {
    return res.status(400).json({ message: "All fields are required" });
  }

  db.run(
    "INSERT INTO library (bookTitle, bookGenre, publishedYear, rating) VALUES (?, ?, ?, ?)",
    [bookTitle, bookGenre, publishedYear, rating],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res
          .status(201)
          .json({ message: "Book added successfully", id: this.lastID });
      }
    }
  );
});

// Route to update a book
server.put("/library/:id", (req, res) => {
  const { bookTitle, bookGenre, publishedYear, rating } = req.body;

  if (!bookTitle || !bookGenre || !publishedYear || !rating) {
    return res.status(400).json({ message: "All fields are required" });
  }

  db.run(
    "UPDATE library SET bookTitle = ?, bookGenre = ?, publishedYear = ?, rating = ? WHERE id = ?",
    [bookTitle, bookGenre, publishedYear, rating, req.params.id],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (this.changes === 0) {
        res.status(404).json({ message: "Book not found" });
      } else {
        res.json({ message: "Book updated successfully" });
      }
    }
  );
});

// Route to delete a book
server.delete("/library/:id", (req, res) => {
  console.log("DELETE request received for ID:", req.params.id); // Debug log

  db.run("DELETE FROM library WHERE id = ?", [req.params.id], function (err) {
    if (err) {
      console.error("Error deleting book:", err.message); // Log error
      res.status(500).json({ error: err.message });
    } else if (this.changes === 0) {
      console.warn("No book found with ID:", req.params.id); // Log if book not found
      res.status(404).json({ message: "Book not found" });
    } else {
      console.log("Book deleted successfully with ID:", req.params.id); // Log success
      res.json({ message: "Book deleted successfully" });
    }
  });
});
