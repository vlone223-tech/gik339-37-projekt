const url = "http://localhost:3000/library";
let isUpdating = false;
let updatingBookId = null;

// Form Submission
document.getElementById("bookForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const bookData = {
    bookTitle: document.getElementById("bookTitle").value.trim(),
    bookGenre: document.getElementById("bookGenre").value.trim(),
    publishedYear: parseInt(document.getElementById("publishedYear").value),
    rating: parseInt(document.getElementById("rating").value),
  };

  // Input Validation
  if (
    !bookData.bookTitle ||
    !bookData.bookGenre ||
    isNaN(bookData.publishedYear) ||
    isNaN(bookData.rating) ||
    bookData.rating < 1 ||
    bookData.rating > 5
  ) {
    showTopMessage("Invalid input. Please check your entries.", "danger");
    return;
  }

  const method = isUpdating ? "PUT" : "POST";
  const endpoint = isUpdating ? `${url}/${updatingBookId}` : url;

  // Confirmation for updates
  if (isUpdating && !confirm("Are you sure you want to update this book?")) {
    return;
  }

  fetch(endpoint, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bookData),
  })
    .then((response) => response.json())
    .then(() => {
      const message = isUpdating
        ? "Book updated successfully!"
        : "Book added successfully!";
      showTopMessage(message, "success");
      resetForm();
      fetchAndDisplayBooks();
    })
    .catch((error) => showTopMessage(`Error: ${error.message}`, "danger"));
});

// Prepare Form for Updating a Book
function prepareUpdate(id) {
  isUpdating = true;
  updatingBookId = id;

  // Fetch book details to prefill the form
  fetch(`${url}/${id}`)
    .then((response) => response.json())
    .then((data) => {
      document.getElementById("bookTitle").value = data.bookTitle;
      document.getElementById("bookGenre").value = data.bookGenre;
      document.getElementById("publishedYear").value = data.publishedYear;
      document.getElementById("rating").value = data.rating;
      document.getElementById("updateBookBtn").style.display = "block";
      document.getElementById("submitBookBtn").style.display = "none";
    })
    .catch((error) => showTopMessage(`Error: ${error.message}`, "danger"));
}

// Delete Book with Confirmation
function deleteBook(id) {
  if (!confirm("Are you sure you want to delete this book?")) {
    return;
  }

  fetch(`${url}/${id}`, { method: "DELETE" })
    .then(() => {
      showTopMessage("Book deleted successfully!", "success");
      fetchAndDisplayBooks();
    })
    .catch((error) => showTopMessage(`Error: ${error.message}`, "danger"));
}

// Reset Form
function resetForm() {
  document.getElementById("bookForm").reset();
  document.getElementById("updateBookBtn").style.display = "none";
  document.getElementById("submitBookBtn").style.display = "block";
  isUpdating = false;
  updatingBookId = null;
}

// Fetch and Display Books
function fetchAndDisplayBooks() {
  fetch(url)
    .then((response) => response.json())
    .then((books) => {
      const bookList = document.getElementById("bookList");
      bookList.innerHTML = "";
      books.forEach((book) => {
        const listItem = document.createElement("li");
        listItem.className =
          "list-group-item d-flex justify-content-between align-items-center";
        listItem.innerHTML = `
          <div>
            <strong>${book.bookTitle}</strong><br>
            Genre: ${book.bookGenre}<br>
            Year: ${book.publishedYear}<br>
            Rating: ${book.rating}
          </div>
          <div>
            <button class="btn btn-warning btn-sm" onclick="prepareUpdate(${book.id})">Update</button>
            <button class="btn btn-danger btn-sm" onclick="deleteBook(${book.id})">Delete</button>
          </div>
        `;
        bookList.appendChild(listItem);
      });
    });
}

// Show Message at Top
function showTopMessage(message, type) {
  const messageBox = document.getElementById("messageBox");
  const messageText = document.getElementById("messageText");

  messageBox.className = `alert alert-${type} alert-dismissible fade show mt-3`;
  messageText.textContent = message;
  messageBox.style.display = "block";

  // Auto-hide the message after 10 seconds
  setTimeout(() => {
    messageBox.style.display = "none";
  }, 50000); // 10 seconds
}

// Clear Top Message (Optional for Manual Close)
function clearMessage() {
  const messageBox = document.getElementById("messageBox");
  messageBox.style.display = "none";
}

// Initialize
window.onload = fetchAndDisplayBooks;
