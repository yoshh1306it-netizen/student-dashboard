const GH_CONFIG = {
    owner: "souta-624",
    repo: "school", // ここを実際のリポジトリ名にする！
    path: "data.json"
};

const DEFAULT_ADMIN_DATA = {
    timeSettings: [
        { p: 1, s: "08:50", e: "09:40" },
        { p: 2, s: "09:50", e: "10:40" }
    ],
    schedule: {},
    tests: []
};

class App {
    constructor() {
        this.adminData = DEFAULT_ADMIN_DATA;
        this.timeLeft = 25 * 60;
        this.timer = null;
    }

    async init() {
        await this.loadFromGitHub();
        this.setupEvents();
        this.startClock();
        this.navigate('dashboard');
    }

    async loadFromGitHub() {
        try {
            const url = `https://raw.githubusercontent.com/${GH_CONFIG.owner}/${GH_CONFIG.repo}/main/${GH_CONFIG.path}?t=${Date.now()}`;
            const res = await fetch(url);
            if (res.ok) this.adminData = await res.json();
        } catch (e) { console.log("Read error, using default"); }
    }

    setupEvents() {
        document.getElementById('adminLoginSubmit').onclick = () => {
            if(document.getElementById('adminPinInput').value === '1234') this.navigate('admin');
            else alert("パスワードが違います");
        };
        document.getElementById('pomoStartBtn').onclick = () => this.toggleTimer();
        document.getElementById('pomoResetBtn').onclick = () => this.resetTimer();
    }

    navigate(viewId) {
        document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
        document.getElementById(`view-${viewId}`).classList.add('active');
    }

    startClock() {
        setInterval(() => {
            const now = new Date();
            document.getElementById('clockTime').textContent = now.toLocaleTimeString('ja-JP');
            document.getElementById('clockDate').textContent = now.toLocaleDateString('ja-JP', { year:'numeric', month:'long', day:'numeric', weekday:'short' });
        }, 1000);
    }

    toggleTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
            document.getElementById('pomoStartBtn').textContent = "開始";
        } else {
            document.getElementById('pomoStartBtn').textContent = "停止";
            this.timer = setInterval(() => {
                this.timeLeft--;
                this.updatePomoUI();
                if (this.timeLeft <= 0) { clearInterval(this.timer); alert("終了！"); }
            }, 1000);
        }
    }

    resetTimer() {
        clearInterval(this.timer);
        this.timer = null;
        this.timeLeft = 25 * 60;
        this.updatePomoUI();
        document.getElementById('pomoStartBtn').textContent = "開始";
    }

    updatePomoUI() {
        const m = Math.floor(this.timeLeft / 60);
        const s = this.timeLeft % 60;
        document.getElementById('pomoTime').textContent = `${m}:${s.toString().padStart(2, '0')}`;
        document.getElementById('pomoProgress').style.width = `${((25*60 - this.timeLeft) / (25*60)) * 100}%`;
    }
}

const app = new App();
window.onload = () => app.init();