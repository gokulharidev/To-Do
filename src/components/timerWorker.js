let seconds = 0;
const interval = setInterval(() => {
    seconds++;
    postMessage(seconds);
}, 1000);
self.onmessage = (e) => {
    if (e.data === 'stop') {
        clearInterval(interval);
        self.close();
    }
};
