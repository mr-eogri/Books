// تحديد ملف الـ Worker الخاص بـ pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";

let books = [];
let batchSize = 10;
let currentIndex = 0;

// تحميل الكتب
async function fetchBooks() {
    try {
        const response = await fetch("books.json");
        books = await response.json();
        displayBooks();
    } catch (error) {
        console.error("❌ خطأ في تحميل الكتب:", error);
    }
}

// عرض الكتب بشكل تدريجي
function displayBooks() {
    const container = document.getElementById("book-container");

    for (let i = 0; i < batchSize && currentIndex < books.length; i++, currentIndex++) {
        const book = books[currentIndex];
        const bookDiv = document.createElement("div");
        bookDiv.classList.add("book");

        // استخراج الغلاف من PDF
        const canvas = document.createElement("canvas");
        canvas.width = 150;
        canvas.height = 200;
        getPDFCover(book.link, canvas);

        // اسم الكتاب
        const title = document.createElement("h3");
        title.textContent = book.title;

        // عند الضغط، يتم فتح محتوى الكتاب في نافذة جديدة
        bookDiv.addEventListener("click", () => openPDF(book.link));

        // إضافة العناصر إلى الصفحة
        bookDiv.appendChild(canvas);
        bookDiv.appendChild(title);
        container.appendChild(bookDiv);
    }

    toggleLoadMoreButton();
}

// استخراج أول صفحة من PDF كصورة غلاف
async function getPDFCover(pdfUrl, canvas) {
    const loadingTask = pdfjsLib.getDocument(pdfUrl);
    loadingTask.promise.then(pdf => {
        return pdf.getPage(1); // تحميل الصفحة الأولى
    }).then(page => {
        const viewport = page.getViewport({ scale: 1.5 });
        const context = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderContext = {
            canvasContext: context,
            viewport: viewport
        };
        page.render(renderContext);
    }).catch(error => {
        console.error("⚠️ فشل تحميل الغلاف:", error);
    });
}

// فتح الكتاب في نافذة جديدة داخل الموقع
function openPDF(pdfUrl) {
    const viewer = document.getElementById("pdf-viewer");
    const frame = document.getElementById("pdf-frame");

    frame.src = pdfUrl;
    viewer.classList.remove("hidden");
}

// إغلاق نافذة عرض PDF
document.getElementById("close-btn").addEventListener("click", () => {
    document.getElementById("pdf-viewer").classList.add("hidden");
    document.getElementById("pdf-frame").src = "";
});

// زر تحميل المزيد
const loadMoreBtn = document.createElement("button");
loadMoreBtn.textContent = "تحميل المزيد";
loadMoreBtn.classList.add("load-more");
loadMoreBtn.addEventListener("click", displayBooks);
document.body.appendChild(loadMoreBtn);

function toggleLoadMoreButton() {
    loadMoreBtn.style.display = currentIndex >= books.length ? "none" : "block";
}

fetchBooks();
