const inp = document.getElementById('inp');
const btn = document.getElementById('btn');
const qrSection = document.getElementById('qr-section');
const qrImg = document.getElementById('qr-img');
const qrLabel = document.getElementById('qr-label');
const qrStatus = document.getElementById('qr-status');
const errorMsg = document.getElementById('error-msg');
const dlBtn = document.getElementById('dl-btn');
const chips = document.querySelectorAll('.chip');

let size = 200;
let currentVal = '';

chips.forEach(c => {
    c.addEventListener('click', () => {
        chips.forEach(x => x.classList.remove('active'));
        c.classList.add('active');
        size = parseInt(c.dataset.size);
        if (currentVal) generate();
    });
});

function generate() {
    const val = inp.value.trim();
    if (!val) {
        errorMsg.classList.add('show');
        return;
    }
    errorMsg.classList.remove('show');
    currentVal = val;

    const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=10&data=${encodeURIComponent(val)}`;

    qrSection.style.display = 'block';
    requestAnimationFrame(() => requestAnimationFrame(() => qrSection.classList.add('show')));

    qrImg.classList.add('loading');
    qrStatus.textContent = '⏳ Generating...';
    qrStatus.className = 'qr-status';
    qrLabel.textContent = val;

    qrImg.style.width = size + 'px';
    qrImg.style.height = size + 'px';

    qrImg.src = '';

    qrImg.onload = () => {
        qrImg.classList.remove('loading');
        qrStatus.textContent = '✅ Ready to scan!';
    };

    qrImg.onerror = () => {
        qrImg.classList.remove('loading');
        qrStatus.textContent = '❌ Failed to load - check your connection.';
        qrStatus.classList.add('error');
    };

    qrImg.src = apiUrl;
}

btn.addEventListener('click', generate);
inp.addEventListener('keydown', e => { if (e.key === 'Enter') generate(); });
inp.addEventListener('input', () => { if (inp.value.trim()) errorMsg.classList.remove('show'); });

dlBtn.addEventListener('click', () => {
    if (!currentVal) return;
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&margin=10&data=${encodeURIComponent(currentVal)}`;
    const a = Object.assign(document.createElement('a'), {
        href: url,
        download: 'qrcode.png',
        target: '_blank'
    });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
});
