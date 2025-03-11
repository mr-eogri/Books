let books = []; // مصفوفة تخزين الكتب بعد جلبها
let batchSize = 10; // عدد الكتب التي يتم تحميلها دفعة واحدة
let currentIndex = 0; // تتبع آخر كتاب تم تحميله

// تحميل البيانات من JSON
async function fetchBooks() {
    try {
        const response = await fetch("books.json");
        books = await response.json();
        displayBooks(); // تحميل أول دفعة من الكتب
    } catch (error) {
        console.error("❌ خطأ في تحميل الكتب:", error);
    }
}

// عرض الكتب على دفعات
function displayBooks() {
    const container = document.getElementById("book-container");

    for (let i = 0; i < batchSize && currentIndex < books.length; i++, currentIndex++) {
        const book = books[currentIndex];
        const bookDiv = document.createElement("div");
        bookDiv.classList.add("book");

        // صورة الغلاف أو إنشاء صورة تلقائية
        const img = document.createElement("img");
        img.alt = `غلاف ${book.title}`;
        img.loading = "lazy"; // تحسين الأداء بالتحميل عند الحاجة

        if (book.cover) {
            img.src = book.cover;
        } else {
            const canvas = document.createElement("canvas");
            canvas.width = 150;
            canvas.height = 200;
            generateCover(canvas, book.title);
            img.src = canvas.toDataURL("image/png");
        }

        // اسم الكتاب
        const title = document.createElement("h3");
        title.textContent = book.title;

        // عند الضغط، يفتح رابط الكتاب
        bookDiv.addEventListener("click", () => {
            window.open(book.link, "_blank");
        });

        // إضافة العناصر
        bookDiv.appendChild(img);
        bookDiv.appendChild(title);
        container.appendChild(bookDiv);
    }

    // إظهار زر "تحميل المزيد" إذا كان هناك كتب متبقية
    toggleLoadMoreButton();
}

// دالة إنشاء غلاف كتاب تلقائيًا عند عدم توفر صورة
function generateCover(canvas, title) {
    const ctx = canvas.getContext("2d");
    const colors = ["#2D83EC", "#FF5733", "#33FF57", "#FFC300", "#C70039"];
    ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.fillText(title.slice(0, 12) + "...", canvas.width / 2, canvas.height / 2);
}

// البحث داخل الكتب
document.getElementById("search").addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();
    const filteredBooks = books.filter(book => book.title.toLowerCase().includes(query));
    
    const container = document.getElementById("book-container");
    container.innerHTML = ""; // تفريغ المحتوى القديم
    currentIndex = 0;
    books = filteredBooks;
    displayBooks();
});

// زر "تحميل المزيد" لتحميل دفعات إضافية
const loadMoreBtn = document.createElement("button");
loadMoreBtn.textContent = "تحميل المزيد";
loadMoreBtn.classList.add("load-more");
loadMoreBtn.addEventListener("click", displayBooks);
document.body.appendChild(loadMoreBtn);

// إظهار أو إخفاء زر "تحميل المزيد" حسب الحاجة
function toggleLoadMoreButton() {
    if (currentIndex >= books.length) {
        loadMoreBtn.style.display = "none";
    } else {
        loadMoreBtn.style.display = "block";
    }
}

fetchBooks();
