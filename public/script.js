async function processBookmarks() {
    const urlList = document.getElementById('urlList').value;
    const urls = urlList.split('\n').map((url) => ({ url }));

    const response = await fetch('/process-bookmarks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookmarks: urls }),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let bookmarksProcessed = 0;
    let buffer = '';

    while (true) {
        const { value, done } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value);
        const parts = buffer.split('\n').filter((part) => part.length > 0);

        if (parts.length > 1) {
            const bookmark = JSON.parse(parts.shift());
            buffer = parts.join('\n');

            addBookmarkToTable(bookmark);
            bookmarksProcessed++;
            setStatus(`Processed ${bookmarksProcessed} of ${urls.length} bookmarks`);
        }
    }

    setStatus('All bookmarks processed');
}
function setStatus(status) {
    const statusElement = document.getElementById('status');
    statusElement.textContent = status;
  }
  