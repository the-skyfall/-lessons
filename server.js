const http = require('http');
const fs = require('fs');
const path = require('path');
const formidable = require('formidable'); // Установите formidable

const PORT = 3000;
const UPLOAD_DIR = path.join(__dirname, 'folder-W');

// Создание сервера
const server = http.createServer((req, res) => {
    const { method, url } = req;

    // Обработка запроса на получение списка файлов
    if (method === 'GET' && url === '/files') {
        fs.readdir(UPLOAD_DIR, (err, files) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Ошибка получения списка файлов');
                return;
            }
            const htmlFiles = files.filter(file => file.endsWith('.html'));
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(htmlFiles));
        });
        return;
    }

    // Обработка запроса на загрузку файлов
    if (method === 'POST' && url === '/upload') {
        const form = new formidable.IncomingForm();
        form.uploadDir = UPLOAD_DIR;
        form.keepExtensions = true;

        form.parse(req, (err, fields, files) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Ошибка загрузки файла');
                return;
            }

            const uploadedFile = files.file[0];
            if (uploadedFile) {
                const oldPath = uploadedFile.filepath;
                const newPath = path.join(UPLOAD_DIR, uploadedFile.originalFilename);

                fs.rename(oldPath, newPath, err => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'text/plain' });
                        res.end('Ошибка перемещения файла');
                        return;
                    }
                    res.writeHead(200, { 'Content-Type': 'text/plain' });
                    res.end('Файл успешно загружен');
                });
            } else {
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('Файл не найден');
            }
        });
        return;
    }

    // Обработка запросов для admin.html
    if (method === 'GET' && url === '/admin.html') {
        fs.readFile(path.join(__dirname, 'public', 'admin.html'), (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Ошибка загрузки страницы администратора');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
        return;
    }

    // Обработка запросов для главной страницы
    if (method === 'GET' && url === '/') {
        fs.readFile(path.join(__dirname, 'public', 'index.html'), (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Ошибка загрузки главной страницы');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
        return;
    }

    // Обработка запросов для файлов в папке folder-W
    if (method === 'GET' && url.startsWith('/folder-W/')) {
        const filePath = path.join(__dirname, 'folder-W', url.replace('/folder-W/', ''));
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Файл не найден');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
        return;
    }

    // Обработка запросов на несуществующие маршруты
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Страница не найдена');
});

server.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});






