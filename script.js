async function fetchBooks() {
    const response = await fetch("books.json"); // استبدله بـ API حقيقي
    const books = await response.json();
    displayBooks(books);
}

function displayBooks(books) {
    const container = document.getElementById("book-container");
    container.innerHTML = "";
    books.forEach(book => {
        const bookDiv = document.createElement("div");
        bookDiv.classList.add("book");
        bookDiv.innerHTML = `
            <img src="${book.cover}" alt="غلاف ${book.title}">
            <h3>${book.title}</h3>
        `;
        bookDiv.addEventListener("click", () => {
            window.open(book.link, "_blank");
        });
        container.appendChild(bookDiv);
    });
}

document.getElementById("search").addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();
    fetch("books.json")
        .then(response => response.json())
        .then(books => {
            const filteredBooks = books.filter(book => book.title.toLowerCase().includes(query));
            displayBooks(filteredBooks);
        });
});

fetchBooks();
