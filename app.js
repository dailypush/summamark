const express = require('express');
const multer = require('multer');
const cheerio = require('cheerio');
const app = express();
const port = process.env.PORT || 3000;


app.use(express.json());
app.use(express.static('public')); // Serve static files from the 'public' directory

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.post('/upload', upload.single('bookmarksFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded');
    }

    // Parse the bookmarks file here and return the parsed status
    const parsedStatus = parseBookmarksFile(req.file.buffer.toString());

    res.json(parsedStatus);
});

function parseBookmarksFile(bookmarksFile) {
    const $ = cheerio.load(bookmarksFile);
    const bookmarks = [];

    $('a').each((i, element) => {
        const title = $(element).text();
        const url = $(element).attr('href');
        bookmarks.push({ title, url });
    });

    // Log the parsed bookmarks
    console.log('Parsed bookmarks:', bookmarks);

    // Return parsed status object with the actual bookmarks count and the parsed bookmarks
    return {
        success: true,
        message: 'Bookmarks file parsed successfully',
        bookmarksCount: bookmarks.length,
        bookmarks: bookmarks,
    };
}


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
