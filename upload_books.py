import os
import random
import string
import asyncio
import subprocess
import zipfile
from telethon.sync import TelegramClient
from tqdm import tqdm

# بيانات تيليجرام
API_ID = "27187356"
API_HASH = "9857411e87c5a979f8880d76bb7ff422"
CHANNEL_USERNAME = "@alrubaieyoman"

# مسار المجلد
REPO_PATH = "/data/data/com.termux/files/home/Books"
BOOKS_FOLDER = os.path.join(REPO_PATH, "books")
ZIP_FILE_PATH = os.path.join(BOOKS_FOLDER, "books_archive.zip")
os.makedirs(BOOKS_FOLDER, exist_ok=True)

# إنشاء جلسة تيليجرام
client = TelegramClient("session_name", API_ID, API_HASH)

async def download_document(message, file_path, progress_bar):
    """تحميل كتاب واحد مع تحديث شريط التحميل"""
    with open(file_path, "wb") as f:
        async for chunk in client.iter_download(message.document):
            f.write(chunk)
            progress_bar.update(len(chunk))

async def download_pdfs():
    await client.start()
    print("📥 بدء تنزيل جميع الكتب...")

    existing_books = set(os.listdir(BOOKS_FOLDER))
    new_books = []

    # جمع جميع الكتب من القناة
    messages = []
    async for message in client.iter_messages(CHANNEL_USERNAME):
        if message.document and message.document.mime_type == "application/pdf":
            messages.append(message)

    print(f"📚 عدد الكتب المتاحة للتنزيل: {len(messages)}")

    tasks = []
    for message in messages:
        file_name = message.document.attributes[0].file_name
        file_size = message.document.size  # حجم الملف بالبايت

        # توليد اسم فريد
        random_str = ''.join(random.choices(string.ascii_letters + string.digits, k=6))
        new_file_name = f"{file_name.replace('.pdf', '')}_{random_str}.pdf"

        # التحقق من التكرار
        if any(file_name.startswith(file.split('_')[0]) for file in existing_books):
            print(f"⏭️ الكتاب موجود مسبقًا: {file_name}")
            continue

        file_path = os.path.join(BOOKS_FOLDER, new_file_name)

        # إنشاء شريط تحميل
        progress_bar = tqdm(total=file_size, unit='B', unit_scale=True, desc=new_file_name[:20])

        task = asyncio.create_task(download_document(message, file_path, progress_bar))
        tasks.append(task)
        new_books.append(new_file_name)

    # تشغيل جميع المهام المتوازية
    await asyncio.gather(*tasks)

    print(f"✅ تم تنزيل {len(new_books)} كتاب جديد.")

    if new_books:
        create_zip_archive(new_books)
        upload_to_github()

def create_zip_archive(files):
    """ضغط جميع الكتب في ملف ZIP"""
    print("🗜️ جاري ضغط جميع الكتب في ملف ZIP...")
    with zipfile.ZipFile(ZIP_FILE_PATH, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for file in files:
            file_path = os.path.join(BOOKS_FOLDER, file)
            zipf.write(file_path, arcname=file)
            os.remove(file_path)  # حذف الكتاب بعد الضغط

    print("✅ تم إنشاء ملف ZIP بنجاح.")

def upload_to_github():
    """رفع ملف ZIP إلى GitHub"""
    print("🚀 جاري رفع ملف ZIP إلى GitHub...")

    subprocess.run(["git", "-C", REPO_PATH, "add", "books/books_archive.zip"])
    subprocess.run(["git", "-C", REPO_PATH, "commit", "-m", "إضافة أرشيف جديد للكتب"])
    subprocess.run(["git", "-C", REPO_PATH, "push", "origin", "main"])

    print("✅ تم رفع ملف ZIP بنجاح.")

with client:
    client.loop.run_until_complete(download_pdfs())

