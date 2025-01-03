// Define API base URL
const url = "http://localhost:3000/library";

// Variables for managing book updates and deletions
let isUpdating = false;
let updatingBookId = null;
let deleteBookId = null;

// Event listener for adding a new book
document.getElementById("bookForm").addEventListener("submit", function (e) {
  e.preventDefault();

  if (isUpdating) return; // Prevent submitting if updating

  const bookData = {
    bookTitle: document.getElementById("bookTitle").value.trim(),
    bookGenre: document.getElementById("bookGenre").value.trim(),
    publishedYear: parseInt(document.getElementById("publishedYear").value),
    rating: parseInt(document.getElementById("rating").value),
  };

  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bookData),
  })
    .then((response) => response.json())
    .then(() => {
      resetFormAndButtons();
      fetchAndDisplayBooks();
    })
    .catch((error) => console.error("Error:", error));
});

// Function to fetch and display all books
function fetchAndDisplayBooks() {
  fetch(url)
    .then((response) => response.json())
    .then((books) => {
      const bookList = document.getElementById("bookList");
      bookList.innerHTML = "";

      books.forEach((book) => {
        const listItem = document.createElement("li");
        listItem.classList.add(
          "list-group-item",
          "d-flex",
          "justify-content-between",
          "align-items-center"
        );

        listItem.innerHTML = `
          <div>
            <p><strong>Title:</strong> ${book.bookTitle}</p>
            <p><strong>Genre:</strong> ${book.bookGenre}</p>
            <p><strong>Year:</strong> ${book.publishedYear}</p>
            <p><strong>Rating:</strong> ${book.rating}</p>
          </div>
          <div>
            <button class="btn btn-warning btn-sm" onclick="prepareUpdateBook(${book.id})">Update</button>
            <button class="btn btn-danger btn-sm" onclick="confirmDeleteBook(${book.id}, '${book.bookTitle}')">Delete</button>
          </div>
        `;

        bookList.appendChild(listItem);
      });
    })
    .catch((error) => console.error("Error fetching books:", error));
}

// Function to prepare updating a book
function prepareUpdateBook(id) {
  isUpdating = true;
  updatingBookId = id;

  document.getElementById("updateBookBtn").style.display = "block";
  document.getElementById("submitBookBtn").style.display = "none";

  fetch(`${url}/${id}`)
    .then((response) => response.json())
    .then((data) => {
      document.getElementById("bookTitle").value = data.bookTitle || "";
      document.getElementById("bookGenre").value = data.bookGenre || "";
      document.getElementById("publishedYear").value = data.publishedYear || "";
      document.getElementById("rating").value = data.rating || "";

      document
        .getElementById("bookForm")
        .scrollIntoView({ behavior: "smooth" });
    })
    .catch((error) => console.error("Error fetching book:", error));
}

// Event listener for updating a book
document
  .getElementById("updateBookBtn")
  .addEventListener("click", function (e) {
    e.preventDefault();
    if (!isUpdating || !updatingBookId) return;

    const bookData = {
      bookTitle: document.getElementById("bookTitle").value.trim(),
      bookGenre: document.getElementById("bookGenre").value.trim(),
      publishedYear: parseInt(document.getElementById("publishedYear").value),
      rating: parseInt(document.getElementById("rating").value),
    };

    fetch(`${url}/${updatingBookId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookData),
    })
      .then((response) => response.json())
      .then(() => {
        resetFormAndButtons();
        fetchAndDisplayBooks();
      })
      .catch((error) => console.error("Error updating book:", error));
  });

// Function to confirm deleting a book
function confirmDeleteBook(id, title) {
  deleteBookId = id;

  document.getElementById("deleteConfirmModalBody").innerHTML = `
    Are you sure you want to delete the book "<strong>${title}</strong>"?
  `;

  const deleteConfirmModal = new bootstrap.Modal(
    document.getElementById("deleteConfirmModal")
  );
  deleteConfirmModal.show();
}

// Event listener for confirming book deletion
document
  .getElementById("confirmDeleteBtn")
  .addEventListener("click", function () {
    if (deleteBookId !== null) {
      deleteBook(deleteBookId);
    }
  });

// Function to delete a book
function deleteBook(id) {
  fetch(`${url}/${id}`, { method: "DELETE" })
    .then(() => {
      fetchAndDisplayBooks();
    })
    .catch((error) => console.error("Error deleting book:", error));
}

// Function to reset form and buttons
function resetFormAndButtons() {
  document.getElementById("bookForm").reset();
  document.getElementById("updateBookBtn").style.display = "none";
  document.getElementById("submitBookBtn").style.display = "block";
  isUpdating = false;
  updatingBookId = null;
}

// Load books when page loads
window.onload = fetchAndDisplayBooks;
