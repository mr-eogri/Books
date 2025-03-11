async function fetchBooks() {
    const response = await fetch("books.json");
    const books = await response.json();
    displayBooks(books);
}

function displayBooks(books) {
    const container = document.getElementById("book-container");
    container.innerHTML = "";

    books.forEach(book => {
        const bookDiv = document.createElement("div");
        bookDiv.classList.add("book");

        // إنشاء صورة الغلاف باستخدام Canvas
        const canvas = document.createElement("canvas");
        canvas.width = 150;
        canvas.height = 200;
        generateCover(canvas, book.title);

        // اسم الكتاب
        const title = document.createElement("h3");
        title.textContent = book.title;

        // عند الضغط على الكتاب، يفتح الرابط
        bookDiv.addEventListener("click", () => {
            window.open(book.link, "_blank");
        });

        // إضافة العناصر للواجهة
        bookDiv.appendChild(canvas);
        bookDiv.appendChild(title);
        container.appendChild(bookDiv);
    });
}

// دالة لإنشاء صورة غلاف بسيطة باستخدام Canvas
function generateCover(canvas, title) {
    const ctx = canvas.getContext("2d");

    // خلفية عشوائية
    const colors = ["#2D83EC", "#FF5733", "#33FF57", "#FFC300", "#C70039"];
    ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // نص الكتاب
    ctx.fillStyle = "white";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.fillText(title.slice(0, 12) + "...", canvas.width / 2, canvas.height / 2);
}

// البحث عن الكتب
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
