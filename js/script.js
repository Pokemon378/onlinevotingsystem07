// Application State and Logic
const app = {
    // Data seeds
    candidates: [
        { id: 1, name: "Vasanth", dept: "CSE", photo: "images/vasanth.jpg" },
        { id: 2, name: "Ganesh Ram", dept: "IT", photo: "images/ganesh.jpg" },
        { id: 3, name: "Yuvaraj", dept: "Cybersecurity", photo: "images/yuvaraj.jpg" },
        { id: 4, name: "Hashini", dept: "IT", photo: "images/hashini.jpg" },
        { id: 5, name: "Kaviya", dept: "CSE", photo: "images/kaviya.jpg" },
        { id: 6, name: "Roshini", dept: "Cybersecurity", photo: "images/roshini.jpg" }
    ],

    // Initialize Local Storage structures if empty
    initStore: function() {
        if (!localStorage.getItem('voters_v2')) {
            localStorage.setItem('voters_v2', JSON.stringify([]));
        }
        if (!localStorage.getItem('votes_v2')) {
            const initialVotes = {};
            this.candidates.forEach(c => initialVotes[c.id] = 0);
            localStorage.setItem('votes_v2', JSON.stringify(initialVotes));
        }
    },

    // ---------- LOGIN & AUTH LOGIC ----------
    handleLogin: function(e) {
        e.preventDefault();
        const name = document.getElementById('studentName').value.trim();
        const regNo = document.getElementById('registerNumber').value.trim().toUpperCase();
        const errorDiv = document.getElementById('loginError');

        if (!name || !regNo) {
            errorDiv.textContent = "Please fill all fields.";
            return;
        }

        // Validate name to only allow alphabets and spaces (no symbols or numbers)
        const nameRegex = /^[A-Za-z\s]+$/;
        if (!nameRegex.test(name)) {
            errorDiv.textContent = "Name cannot contain numbers or special symbols.";
            const card = document.querySelector('.login-card');
            card.style.transform = "translateX(5px)";
            setTimeout(() => card.style.transform = "translateX(-5px)", 100);
            setTimeout(() => card.style.transform = "translateX(0)", 200);
            return;
        }

        // Validate Register Number to exactly 8 digits
        const regNoRegex = /^[0-9]{8}$/;
        if (!regNoRegex.test(regNo)) {
            errorDiv.textContent = "Register Number must be exactly 8 digits continuously.";
            const card = document.querySelector('.login-card');
            card.style.transform = "translateX(5px)";
            setTimeout(() => card.style.transform = "translateX(-5px)", 100);
            setTimeout(() => card.style.transform = "translateX(0)", 200);
            return;
        }

        const voters_v2 = JSON.parse(localStorage.getItem('voters_v2'));
        
        // Check if already voted
        const hasVoted = voters_v2.find(v => v.regNo === regNo);
        if (hasVoted) {
            errorDiv.textContent = "You have already voted! Multiple votes are not allowed.";
            
            // Add a little shake animation to the card for UX
            const card = document.querySelector('.login-card');
            card.style.transform = "translateX(5px)";
            setTimeout(() => card.style.transform = "translateX(-5px)", 100);
            setTimeout(() => card.style.transform = "translateX(0)", 200);
            return;
        }

        // Generate temporary auth token in sessionStorage
        sessionStorage.setItem('currentUser', JSON.stringify({ name, regNo }));
        window.location.href = 'vote.html';
    },

    checkAuth: function() {
        const user = JSON.parse(sessionStorage.getItem('currentUser'));
        if (!user) {
            window.location.href = 'login.html';
            return;
        }
        
        const displayElem = document.getElementById('displayUserName');
        if (displayElem) displayElem.textContent = user.name;

        // Verify they haven't voted in another tab while logged in
        const voters_v2 = JSON.parse(localStorage.getItem('voters_v2') || '[]');
        if (voters_v2.find(v => v.regNo === user.regNo)) {
            sessionStorage.removeItem('currentUser');
            alert("You have already voted!");
            window.location.href = 'login.html';
        }

        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            sessionStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        });
    },

    // ---------- VOTING LOGIC ----------
    renderCandidates: function() {
        const list = document.getElementById('candidatesList');
        if (!list) return;

        list.innerHTML = '';
        this.candidates.forEach(c => {
            const card = document.createElement('div');
            card.className = 'candidate-card card glassmorphism';
            card.innerHTML = `
                <img src="${c.photo}" alt="${c.name}" class="candidate-photo">
                <h3>${c.name}</h3>
                <p class="candidate-dept">${c.dept}</p>
                <button class="btn btn-primary w-100" onclick="app.castVote(${c.id})">Vote for ${c.name}</button>
            `;
            list.appendChild(card);
        });
    },

    castVote: function(candidateId) {
        const user = JSON.parse(sessionStorage.getItem('currentUser'));
        if (!user) return;

        // Confirm intention
        const candidate = this.candidates.find(c => c.id === candidateId);
        if (!confirm(`Are you sure you want to vote for ${candidate.name}?`)) {
            return;
        }

        // Record vote
        const votes_v2 = JSON.parse(localStorage.getItem('votes_v2'));
        votes_v2[candidateId] += 1;
        localStorage.setItem('votes_v2', JSON.stringify(votes_v2));

        // Record voter
        const voters_v2 = JSON.parse(localStorage.getItem('voters_v2'));
        voters_v2.push({
            name: user.name,
            regNo: user.regNo,
            timestamp: new Date().toLocaleString()
        });
        localStorage.setItem('voters_v2', JSON.stringify(voters_v2));

        // Clear session and show success
        sessionStorage.removeItem('currentUser');
        document.getElementById('candidatesList').classList.add('hidden');
        document.querySelector('h2').classList.add('hidden');
        document.getElementById('voteConfirmation').classList.remove('hidden');

        // Confetti effect for fun
        if(typeof confetti === 'function') {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        }

        setTimeout(() => {
            window.location.href = 'result.html';
        }, 3000);
    },

    // ---------- RESULTS LOGIC ----------
    renderResults: function() {
        const votes_v2 = JSON.parse(localStorage.getItem('votes_v2') || '{}');
        const ctx = document.getElementById('resultsChart');
        if (!ctx) return;

        let totalVotes = 0;
        const labels = [];
        const data = [];
        const backgroundColors = [
            'rgba(244, 63, 94, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(139, 92, 246, 0.8)',
            'rgba(20, 184, 166, 0.8)'
        ];

        let maxVotes = -1;
        let winnerName = "TBD";

        this.candidates.forEach(c => {
            const candidateVotes = votes_v2[c.id] || 0;
            totalVotes += candidateVotes;
            labels.push(c.name);
            data.push(candidateVotes);

            if (candidateVotes > maxVotes && totalVotes > 0) {
                maxVotes = candidateVotes;
                winnerName = c.name;
            } else if (candidateVotes === maxVotes && totalVotes > 0) {
                winnerName = "Tie";
            }
        });

        document.getElementById('totalVotes').textContent = totalVotes;
        document.getElementById('winnerName').textContent = totalVotes > 0 ? winnerName : 'No votes yet';

        // Render Detailed Results below chart
        const detailsContainer = document.getElementById('detailedResults');
        detailsContainer.innerHTML = '';
        
        this.candidates.forEach((c, index) => {
            const candidateVotes = votes_v2[c.id] || 0;
            const percentage = totalVotes === 0 ? 0 : Math.round((candidateVotes / totalVotes) * 100);
            
            detailsContainer.innerHTML += `
                <div class="result-item">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span style="display:inline-block; width:12px; height:12px; border-radius:50%; background-color:${backgroundColors[index].replace('0.8','1')}"></span>
                        <strong>${c.name}</strong>
                    </div>
                    <div>
                        <span>${candidateVotes} votes</span>
                        <span style="color:var(--text-secondary); margin-left:10px; font-weight:bold;">${percentage}%</span>
                    </div>
                </div>
            `;
        });

        // Initialize Chart
        Chart.defaults.color = '#0F172A';
        Chart.defaults.font.family = "'Inter', sans-serif";

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Votes',
                    data: data,
                    backgroundColor: backgroundColors,
                    borderWidth: 0,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    x: {
                        grid: { display: false }
                    }
                }
            }
        });

        // Launch confetti if there are votes_v2
        if(totalVotes > 0 && typeof confetti === 'function') {
            setTimeout(() => {
                confetti({
                    particleCount: 50,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 }
                });
                confetti({
                    particleCount: 50,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 }
                });
            }, 500);
        }
    },

    // ---------- ADMIN LOGIC ----------
    initAdmin: function() {
        // Toggle sections based on session
        const isAdminLoggedIn = sessionStorage.getItem('adminAuth') === 'true';
        const loginSection = document.getElementById('adminLoginSection');
        const dashboardSection = document.getElementById('adminDashboardSection');

        if (isAdminLoggedIn) {
            loginSection.classList.add('hidden');
            dashboardSection.classList.remove('hidden');
            this.renderVotersTable();
            this.renderAdminChart();
        }

        // Login Handler
        const loginForm = document.getElementById('adminLoginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const user = document.getElementById('adminUser').value;
                const pass = document.getElementById('adminPass').value;
                const err = document.getElementById('adminLoginError');

                if (user === 'admin' && pass === 'admin123') {
                    sessionStorage.setItem('adminAuth', 'true');
                    loginSection.classList.add('hidden');
                    dashboardSection.classList.remove('hidden');
                    this.renderVotersTable();
                    this.renderAdminChart();
                } else {
                    err.textContent = "Invalid username or password";
                }
            });
        }

        // Logout Handler
        const logoutBtn = document.getElementById('adminLogoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                sessionStorage.removeItem('adminAuth');
                window.location.reload();
            });
        }

        // Reset Handler
        const resetBtn = document.getElementById('resetElectionBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm("WARNING: This will delete all vote records permanently. Are you sure?")) {
                    localStorage.removeItem('voters_v2');
                    localStorage.removeItem('votes_v2');
                    app.initStore();
                    app.renderVotersTable();
                    alert("Election has been reset successfully.");
                }
            });
        }
    },

    // ---------- ADMIN CHART LOGIC ----------
    renderAdminChart: function() {
        const ctx = document.getElementById('adminResultsChart');
        if (!ctx) return;
        
        ctx.getContext('2d');
        const votes_v2 = JSON.parse(localStorage.getItem('votes_v2'));
        
        const labels = this.candidates.map(c => c.name);
        const data = this.candidates.map(c => votes_v2[c.id] || 0);

        // Chart identical to results page but slightly smaller
        const backgroundColors = [
            'rgba(244, 63, 94, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(139, 92, 246, 0.8)',
            'rgba(20, 184, 166, 0.8)'
        ];

        Chart.defaults.color = '#0F172A';
        Chart.defaults.font.family = "'Inter', sans-serif";

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Votes',
                    data: data,
                    backgroundColor: backgroundColors,
                    borderWidth: 0,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    x: {
                        grid: { display: false }
                    }
                }
            }
        });
    },

    renderVotersTable: function() {
        const tbody = document.getElementById('votersTableBody');
        if (!tbody) return;

        const voters_v2 = JSON.parse(localStorage.getItem('voters_v2') || '[]');
        tbody.innerHTML = '';

        if (voters_v2.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center text-muted">No voters have registered yet.</td></tr>';
            return;
        }

        // Render in reverse chronological order
        [...voters_v2].reverse().forEach(v => {
            tbody.innerHTML += `
                <tr>
                    <td>${v.name}</td>
                    <td>${v.regNo}</td>
                    <td>${v.timestamp}</td>
                </tr>
            `;
        });
    }
};

// Global init on file load
app.initStore();

// Attach login listener if on login page
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', app.handleLogin);
}
