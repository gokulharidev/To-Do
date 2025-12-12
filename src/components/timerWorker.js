// Timer Web Worker - Background timing with preserved elapsed time
let seconds = 0;
let interval = null;

self.onmessage = (e) => {
    if (e.data && e.data.command === 'start') {
        // Start with the provided initial seconds (preserves elapsed time on resume)
        seconds = e.data.startSeconds || 0;

        // Clear any existing interval
        if (interval) {
            clearInterval(interval);
        }

        // Start counting
        interval = setInterval(() => {
            seconds++;
            postMessage(seconds);
        }, 1000);
    } else if (e.data === 'stop' || (e.data && e.data.command === 'stop')) {
        if (interval) {
            clearInterval(interval);
        }
        self.close();
    }
};
