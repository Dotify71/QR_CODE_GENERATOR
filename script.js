const qrInput = document.getElementById('qr-input');
const generateBtn = document.getElementById('generate-btn');
const clearBtn = document.getElementById('clear-btn');
const qrResult = document.getElementById('qr-result');
const qrImage = document.getElementById('qr-image');
const qrLoader = document.getElementById('qr-loader');
const qrStatus = document.getElementById('qr-status');
const qrContent = document.getElementById('qr-content');
const errorMessage = document.getElementById('error-message');
const downloadBtn = document.getElementById('download-btn');
const copyBtn = document.getElementById('copy-btn');
const themeToggle = document.getElementById('theme-toggle');
const sizeBtns = document.querySelectorAll('.size-btn');
const colorBtns = document.querySelectorAll('.color-btn');
const historyList = document.getElementById('history-list');
const clearHistoryBtn = document.getElementById('clear-history');

let currentSize = 200;
let currentColor = '000000';
let currentValue = '';
let history = [];
let resizeTimeout;

// Safe localStorage wrapper
const storage = {
    get: (key) => {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            return null;
        }
    },
    set: (key, value) => {
        try {
            localStorage.setItem(key, value);
        } catch (e) {
            // Storage might be disabled or full
        }
    },
    remove: (key) => {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            // Storage might be disabled
        }
    }
};

// Initialize
function init() {
    // Load history from storage
    const savedHistory = storage.get('qrHistory');
    if (savedHistory) {
        try {
            history = JSON.parse(savedHistory);
        } catch (e) {
            history = [];
        }
    }

    renderHistory();
    loadTheme();
    setupEventListeners();

    // Handle window resize for responsive QR code
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (currentValue) {
                generateQR();
            }
        }, 250);
    });
}

function setupEventListeners() {
    generateBtn.addEventListener('click', generateQR);
    clearBtn.addEventListener('click', clearInput);
    downloadBtn.addEventListener('click', downloadQR);
    copyBtn.addEventListener('click', copyURL);
    themeToggle.addEventListener('click', toggleTheme);
    clearHistoryBtn.addEventListener('click', clearHistory);

    qrInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') generateQR();
    });

    qrInput.addEventListener('input', () => {
        if (qrInput.value.trim()) {
            errorMessage.classList.remove('show');
        }
    });

    sizeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            sizeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentSize = parseInt(btn.dataset.size);
            if (currentValue) generateQR();
        });
    });

    colorBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            colorBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentColor = btn.dataset.color;
            if (currentValue) generateQR();
        });
    });
}

function generateQR() {
    const value = qrInput.value.trim();

    if (!value) {
        showError('Please enter content to generate a QR code');
        return;
    }

    hideError();
    currentValue = value;

    // Adjust size for very small screens
    const screenWidth = window.innerWidth;
    let adjustedSize = currentSize;

    if (screenWidth < 374 && currentSize > 200) {
        adjustedSize = 200;
    } else if (screenWidth < 479 && currentSize > 300) {
        adjustedSize = 300;
    }

    const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${adjustedSize}x${adjustedSize}&margin=10&color=${currentColor}&data=${encodeURIComponent(value)}`;

    qrResult.classList.add('show');
    qrLoader.classList.add('show');
    qrImage.classList.remove('loaded');
    qrStatus.textContent = 'Generating...';
    qrStatus.className = 'qr-status';
    qrContent.textContent = value;

    qrImage.src = '';

    qrImage.onload = () => {
        qrLoader.classList.remove('show');
        qrImage.classList.add('loaded');
        qrStatus.textContent = 'Ready to scan';
        addToHistory(value, apiUrl);
    };

    qrImage.onerror = () => {
        qrLoader.classList.remove('show');
        qrStatus.textContent = 'Failed to load. Please check your connection.';
        qrStatus.classList.add('error');
    };

    qrImage.src = apiUrl;
}

function clearInput() {
    qrInput.value = '';
    qrInput.focus();
    hideError();
}

function downloadQR() {
    if (!currentValue) return;

    const url = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&margin=10&color=${currentColor}&data=${encodeURIComponent(currentValue)}`;

    const link = document.createElement('a');
    link.href = url;
    link.download = `qrcode-${Date.now()}.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('QR code downloaded');
}

function copyURL() {
    if (!currentValue) return;

    const url = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&margin=10&color=${currentColor}&data=${encodeURIComponent(currentValue)}`;

    navigator.clipboard.writeText(url).then(() => {
        showToast('URL copied to clipboard');
    }).catch(() => {
        showToast('Failed to copy URL');
    });
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
}

function hideError() {
    errorMessage.classList.remove('show');
}

function showToast(message) {
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    html.setAttribute('data-theme', newTheme);
    storage.set('theme', newTheme);
}

function loadTheme() {
    const savedTheme = storage.get('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
}

function addToHistory(value, url) {
    const existingIndex = history.findIndex(item => item.value === value);

    if (existingIndex !== -1) {
        history.splice(existingIndex, 1);
    }

    history.unshift({
        value,
        url,
        timestamp: Date.now()
    });

    history = history.slice(0, 10);
    storage.set('qrHistory', JSON.stringify(history));
    renderHistory();
}

function renderHistory() {
    if (history.length === 0) {
        historyList.innerHTML = '<p class="empty-state">No recent QR codes</p>';
        return;
    }

    historyList.innerHTML = history.map(item => `
        <div class="history-item" data-value="${encodeURIComponent(item.value)}">
            <img src="${item.url}" alt="QR Code">
            <div class="history-item-content">
                <div class="history-item-text">${escapeHtml(item.value)}</div>
                <div class="history-item-time">${formatTime(item.timestamp)}</div>
            </div>
        </div>
    `).join('');

    historyList.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', () => {
            const value = decodeURIComponent(item.dataset.value);
            qrInput.value = value;
            generateQR();
        });
    });
}

function clearHistory() {
    history = [];
    storage.remove('qrHistory');
    renderHistory();
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Start the app
init();
