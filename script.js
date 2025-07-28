
    let currentSession = {
        isActive: false,
        isPaused: false,
        startTime: null,
        elapsedTime: 0,
        goalMinutes: 25,
        subject: ''
    };

    let dailyStats = {
        totalStudyTime: parseInt(localStorage.getItem('totalStudyTime') || '0'),
        sessionsCompleted: parseInt(localStorage.getItem('sessionsCompleted') || '0'),
        distractionsToday: parseInt(localStorage.getItem('distractionsToday') || '0'),
        lastResetDate: localStorage.getItem('lastResetDate') || new Date().toDateString()
    };

    let timerInterval;
    let distractions = JSON.parse(localStorage.getItem('todayDistractions') || '[]');

    const motivationalQuotes = [
        "The expert in anything was once a beginner who refused to give up.",
        "Success is the sum of small efforts repeated day in and day out.",
        "Don't watch the clock; do what it does. Keep going.",
        "The future depends on what you do today.",
        "Education is the most powerful weapon you can use to change the world.",
        "Every accomplishment starts with the decision to try.",
        "Your limitation—it's only your imagination.",
        "Push yourself, because no one else is going to do it for you.",
        "Great things never come from comfort zones.",
        "Dream it. Wish it. Do it."
    ];

    function initializeApp() {
        checkDateReset();
        updateDisplay();
        loadDistractions();
        showRandomQuote();
        updateStats();
    }

    function checkDateReset() {
        const today = new Date().toDateString();
        if (dailyStats.lastResetDate !== today) {
            dailyStats.totalStudyTime = 0;
            dailyStats.sessionsCompleted = 0;
            dailyStats.distractionsToday = 0;
            dailyStats.lastResetDate = today;
            distractions = [];
            saveData();
        }
    }

    function startStudySession() {
        const subject = document.getElementById('studySubject').value.trim();
        const goalMinutes = parseInt(document.getElementById('studyGoal').value);

        if (!subject) {
            alert('Please enter what you\'re studying!');
            return;
        }

        currentSession = {
            isActive: true,
            isPaused: false,
            startTime: Date.now(),
            elapsedTime: 0,
            goalMinutes: goalMinutes,
            subject: subject
        };

        document.getElementById('startBtn').classList.add('hidden');
        document.getElementById('pauseBtn').classList.remove('hidden');
        document.getElementById('stopBtn').classList.remove('hidden');

        timerInterval = setInterval(updateTimer, 1000);
        
        updateProgressText(`Studying ${subject} - Stay focused! 🎯`);
    }

    function pauseSession() {
        if (currentSession.isActive && !currentSession.isPaused) {
            currentSession.isPaused = true;
            clearInterval(timerInterval);
            
            document.getElementById('pauseBtn').classList.add('hidden');
            document.getElementById('resumeBtn').classList.remove('hidden');
            
            updateProgressText('Session paused - Take a breath and come back! 😌');
        }
    }

    function resumeSession() {
        if (currentSession.isActive && currentSession.isPaused) {
            currentSession.isPaused = false;
            currentSession.startTime = Date.now() - currentSession.elapsedTime;
            
            timerInterval = setInterval(updateTimer, 1000);
            
            document.getElementById('resumeBtn').classList.add('hidden');
            document.getElementById('pauseBtn').classList.remove('hidden');
            
            updateProgressText(`Back to studying ${currentSession.subject}! 💪`);
        }
    }

    function stopSession() {
        if (currentSession.isActive) {
            clearInterval(timerInterval);

            const finalMinutes = Math.floor(currentSession.elapsedTime / 60000);
            const wasCompleted = finalMinutes >= currentSession.goalMinutes;
            
            dailyStats.totalStudyTime += finalMinutes;
            if (wasCompleted) {
                dailyStats.sessionsCompleted++;
            }
            
            document.getElementById('startBtn').classList.remove('hidden');
            document.getElementById('pauseBtn').classList.add('hidden');
            document.getElementById('resumeBtn').classList.add('hidden');
            document.getElementById('stopBtn').classList.add('hidden');
            
            currentSession.isActive = false;
            currentSession.elapsedTime = 0;

            if (wasCompleted) {
                updateProgressText(`🎉 Great job! You completed ${finalMinutes} minutes of ${currentSession.subject}!`);
                showRandomQuote();
            } else {
                updateProgressText(`Session ended. You studied for ${finalMinutes} minutes. Every minute counts! 👍`);
            }
            
            updateDisplay();
            updateStats();
            saveData();
        }
    }

    function updateTimer() {
        if (currentSession.isActive && !currentSession.isPaused) {
            currentSession.elapsedTime = Date.now() - currentSession.startTime;
            updateDisplay();
            updateProgress();
            
            // Check if goal is reached
            const minutes = Math.floor(currentSession.elapsedTime / 60000);
            if (minutes >= currentSession.goalMinutes) {
                stopSession();
            }
        }
    }

    function updateDisplay() {
        const minutes = Math.floor(currentSession.elapsedTime / 60000);
        const seconds = Math.floor((currentSession.elapsedTime % 60000) / 1000);
        
        document.getElementById('timerDisplay').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    function updateProgress() {
        if (currentSession.isActive) {
            const progress = Math.min((currentSession.elapsedTime / (currentSession.goalMinutes * 60000)) * 100, 100);
            document.getElementById('progressFill').style.width = progress + '%';
        } else {
            document.getElementById('progressFill').style.width = '0%';
        }
    }

    function updateProgressText(text) {
        document.getElementById('progressText').textContent = text;
    }

    function logDistraction() {
        const input = document.getElementById('distractionInput');
        const distractionText = input.value.trim();
        
        if (!distractionText) {
            alert('Please describe what distracted you!');
            return;
        }
        
        const distraction = {
            text: distractionText,
            time: new Date().toLocaleTimeString(),
            sessionActive: currentSession.isActive
        };
        
        distractions.push(distraction);
        dailyStats.distractionsToday++;
        
        input.value = '';
        loadDistractions();
        updateStats();
        saveData();
        
        const encouragements = [
            "Awareness is the first step to improvement! 🌟",
            "You're building better habits by tracking this! 💪",
            "Every distraction logged is progress toward better focus! 🎯",
            "Great job being mindful of your attention! 🧠"
        ];
        
        const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
        updateProgressText(randomEncouragement);
    }

    function loadDistractions() {
        const list = document.getElementById('distractionList');
        
        if (distractions.length === 0) {
            list.innerHTML = '<p style="text-align: center; color: #666;">No distractions logged yet. Stay focused! 💪</p>';
            return;
        }
        
        list.innerHTML = distractions.slice(-5).reverse().map((distraction, index) => `
            <div class="distraction-item">
                <span>${distraction.text}</span>
                <small>${distraction.time}</small>
            </div>
        `).join('');
    }

    function updateStats() {
        document.getElementById('totalStudyTime').textContent = dailyStats.totalStudyTime;
        document.getElementById('sessionsCompleted').textContent = dailyStats.sessionsCompleted;
        document.getElementById('distractionCount').textContent = dailyStats.distractionsToday;
        
        const focusScore = dailyStats.totalStudyTime > 0 ? 
            Math.max(0, Math.round(100 - (dailyStats.distractionsToday / dailyStats.totalStudyTime * 100))) : 100;
        document.getElementById('focusScore').textContent = focusScore;
    }

    function showRandomQuote() {
        const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
        document.getElementById('motivationalQuote').textContent = randomQuote;
    }

    function saveData() {
        localStorage.setItem('totalStudyTime', dailyStats.totalStudyTime.toString());
        localStorage.setItem('sessionsCompleted', dailyStats.sessionsCompleted.toString());
        localStorage.setItem('distractionsToday', dailyStats.distractionsToday.toString());
        localStorage.setItem('lastResetDate', dailyStats.lastResetDate);
        localStorage.setItem('todayDistractions', JSON.stringify(distractions));
    }

    document.addEventListener('DOMContentLoaded', initializeApp);

    setInterval(showRandomQuote, 300000);