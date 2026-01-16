class SpeedReader {
    constructor() {
        this.words = [];
        this.currentIndex = 0;
        this.isPlaying = false;
        this.intervalId = null;
        this.startTime = null;
        this.pausedTime = 0;
        this.totalPausedTime = 0;
        
        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        this.textInput = document.getElementById('textInput');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.saveBtn = document.getElementById('saveBtn');
        this.speedSlider = document.getElementById('speedSlider');
        this.speedValue = document.getElementById('speedValue');
        this.wordCountSlider = document.getElementById('wordCountSlider');
        this.wordCountValue = document.getElementById('wordCountValue');
        this.readerSection = document.getElementById('readerSection');
        this.wordDisplay = document.getElementById('wordDisplay');
        this.progressValue = document.getElementById('progressValue');
        this.wordsReadValue = document.getElementById('wordsReadValue');
        this.timeRemainingValue = document.getElementById('timeRemainingValue');
        this.savedSessionsSection = document.getElementById('savedSessionsSection');
        this.sessionsList = document.getElementById('sessionsList');
        // Anchor letter is always enabled
        this.anchorEnabled = true;
        // Initialize database
        this.db = new DatabaseManager();
        this.currentSessionId = null;
    }

    attachEventListeners() {
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.saveBtn.addEventListener('click', () => this.saveProgress());
        this.speedSlider.addEventListener('input', (e) => {
            this.speedValue.textContent = e.target.value;
            if (this.isPlaying) {
                this.restart();
            }
        });
        this.wordCountSlider.addEventListener('input', (e) => {
            this.wordCountValue.textContent = e.target.value;
        });

        // Allow paste in textarea
        this.textInput.addEventListener('paste', (e) => {
            setTimeout(() => {
                this.processText();
            }, 10);
        });

        // Process text on input
        this.textInput.addEventListener('input', () => {
            this.processText();
        });

        // Load saved sessions on page load
        this.loadSavedSessions();
    }

    processText() {
        const text = this.textInput.value.trim();
        if (text) {
            // Split text into words, preserving some punctuation context
            this.words = text
                .replace(/\s+/g, ' ')
                .split(' ')
                .filter(word => word.length > 0);
        } else {
            this.words = [];
        }
    }

    start() {
        const text = this.textInput.value.trim();
        if (!text) {
            alert('Please enter some text to read!');
            return;
        }

        this.processText();
        
        if (this.words.length === 0) {
            alert('No text to read!');
            return;
        }

        // Show reader section immediately
        this.readerSection.style.display = 'block';
        
        // Scroll to reader section on mobile
        setTimeout(() => {
            this.readerSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);

        // If resuming from pause, continue from where we left off
        if (this.currentIndex >= this.words.length) {
            this.currentIndex = 0;
        }

        this.isPlaying = true;
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;

        if (!this.startTime) {
            this.startTime = Date.now();
        } else if (this.pausedTime) {
            // Adjust start time to account for paused duration
            this.totalPausedTime += Date.now() - this.pausedTime;
            this.pausedTime = 0;
        }

        this.displayWord();
        this.scheduleNextWord();
    }

    pause() {
        this.isPlaying = false;
        this.pausedTime = Date.now();
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        
        if (this.intervalId) {
            clearTimeout(this.intervalId);
            this.intervalId = null;
        }
    }

    reset() {
        this.isPlaying = false;
        this.currentIndex = 0;
        this.startTime = null;
        this.pausedTime = 0;
        this.totalPausedTime = 0;
        
        if (this.intervalId) {
            clearTimeout(this.intervalId);
            this.intervalId = null;
        }

        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.readerSection.style.display = 'none';
        this.wordDisplay.className = 'word-display anchor-mode';
        this.wordDisplay.style.transform = '';
        this.wordDisplay.innerHTML = 'Ready to start...';
        // Remove anchor marker
        const existingMarker = this.wordDisplay.parentElement.querySelector('.anchor-marker');
        if (existingMarker) {
            existingMarker.remove();
        }
        this.updateStats();
    }

    restart() {
        const wasPlaying = this.isPlaying;
        this.pause();
        if (wasPlaying) {
            setTimeout(() => this.start(), 50);
        }
    }

    displayWord() {
        const wordsPerFlash = parseInt(this.wordCountSlider.value);
        const wordsToShow = this.words.slice(
            this.currentIndex,
            this.currentIndex + wordsPerFlash
        );

        if (wordsToShow.length > 0) {
            // Always use anchor letter (enabled by default)
            this.displayWordWithAnchor(wordsToShow);
            this.currentIndex += wordsPerFlash;
        } else {
            // Finished reading
            this.finish();
        }

        this.updateStats();
    }

    displayWordWithAnchor(words) {
        // Add anchor marker if it doesn't exist
        const readerDisplay = this.wordDisplay.parentElement;
        let anchorMarker = readerDisplay.querySelector('.anchor-marker');
        if (!anchorMarker) {
            anchorMarker = document.createElement('div');
            anchorMarker.className = 'anchor-marker';
            readerDisplay.appendChild(anchorMarker);
        }
        
        // Calculate anchor letter position for each word and find the one that will be centered
        // For multiple words, we'll center based on the first word's anchor
        const firstWord = words[0];
        const anchorInfo = this.getAnchorPosition(firstWord);
        
        if (!anchorInfo) {
            // Fallback if no anchor found
            this.wordDisplay.className = 'word-display';
            this.wordDisplay.style.transform = '';
            this.wordDisplay.textContent = words.join(' ');
            return;
        }
        
        // Format all words with anchor highlighting
        const formattedWords = words.map(word => {
            const info = this.getAnchorPosition(word);
            if (!info) return word;
            
            const before = word.substring(0, info.position);
            const anchor = word[info.position];
            const after = word.substring(info.position + 1);
            
            return `${before}<span class="anchor-letter">${anchor}</span>${after}`;
        });
        
        // Set the HTML and styles first
        this.wordDisplay.className = 'word-display anchor-mode';
        this.wordDisplay.innerHTML = formattedWords.join(' ');
        this.wordDisplay.style.textAlign = 'left';
        this.wordDisplay.style.transform = 'translateX(0)';
        
        // Use a small delay to ensure DOM is updated, then measure and adjust
        setTimeout(() => {
            // Find the anchor letter span in the first word
            const anchorSpans = this.wordDisplay.querySelectorAll('.anchor-letter');
            if (anchorSpans.length === 0) return;
            
            const anchorSpan = anchorSpans[0]; // Use first word's anchor
            
            // Get positions relative to the reader display container
            const anchorRect = anchorSpan.getBoundingClientRect();
            const readerRect = readerDisplay.getBoundingClientRect();
            
            // Calculate the center X position of the anchor letter relative to reader display
            const anchorCenterX = anchorRect.left - readerRect.left + anchorRect.width / 2;
            const readerCenterX = readerRect.width / 2;
            
            // Calculate offset needed to move anchor to center
            const offset = readerCenterX - anchorCenterX;
            
            // Apply positioning to center the anchor letter
            this.wordDisplay.style.transform = `translateX(${offset}px)`;
        }, 10);
    }
    
    getAnchorPosition(word) {
        // Remove punctuation for calculation, but preserve it in display
        const cleanWord = word.replace(/[^\w]/g, '');
        if (cleanWord.length === 0) return null;
        
        // Calculate anchor position: 1/3 from start, but at least 1 character in
        // For very short words (1-2 chars), use the first character
        let anchorIndex;
        if (cleanWord.length <= 2) {
            anchorIndex = 0;
        } else if (cleanWord.length <= 4) {
            anchorIndex = 1;
        } else {
            // For longer words, use approximately 1/3 from start
            anchorIndex = Math.floor(cleanWord.length / 3);
        }
        
        // Find the actual character position in the original word (accounting for punctuation)
        let charCount = 0;
        let anchorPos = -1;
        for (let i = 0; i < word.length; i++) {
            if (/[\w]/.test(word[i])) {
                if (charCount === anchorIndex) {
                    anchorPos = i;
                    break;
                }
                charCount++;
            }
        }
        
        // If we didn't find it (shouldn't happen), use first letter
        if (anchorPos === -1) {
            anchorPos = word.search(/[\w]/);
            if (anchorPos === -1) return null;
        }
        
        return { position: anchorPos, index: anchorIndex };
    }

    scheduleNextWord() {
        if (!this.isPlaying) return;

        const wpm = parseInt(this.speedSlider.value);
        const wordsPerMinute = wpm;
        const wordsPerSecond = wordsPerMinute / 60;
        const millisecondsPerWord = 1000 / wordsPerSecond;
        const wordsPerFlash = parseInt(this.wordCountSlider.value);
        const delay = millisecondsPerWord * wordsPerFlash;

        this.intervalId = setTimeout(() => {
            if (this.isPlaying) {
                this.displayWord();
                this.scheduleNextWord();
            }
        }, delay);
    }

    finish() {
        this.isPlaying = false;
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        
        if (this.intervalId) {
            clearTimeout(this.intervalId);
            this.intervalId = null;
        }

        this.wordDisplay.innerHTML = '✓ Finished!';
        this.wordDisplay.style.color = '#10b981';
        
        setTimeout(() => {
            this.wordDisplay.style.color = '';
        }, 2000);
    }

    updateStats() {
        const totalWords = this.words.length;
        const wordsRead = Math.min(this.currentIndex, totalWords);
        const progress = totalWords > 0 ? Math.round((wordsRead / totalWords) * 100) : 0;

        this.progressValue.textContent = `${progress}%`;
        this.wordsReadValue.textContent = `${wordsRead} / ${totalWords}`;

        // Calculate time remaining
        if (this.isPlaying && this.startTime && totalWords > 0) {
            const elapsed = (Date.now() - this.startTime - this.totalPausedTime) / 1000; // seconds
            const wpm = parseInt(this.speedSlider.value);
            const wordsPerSecond = wpm / 60;
            const wordsRemaining = totalWords - wordsRead;
            const secondsRemaining = wordsRemaining / wordsPerSecond;
            
            if (secondsRemaining > 0) {
                const minutes = Math.floor(secondsRemaining / 60);
                const seconds = Math.floor(secondsRemaining % 60);
                this.timeRemainingValue.textContent = minutes > 0 
                    ? `${minutes}m ${seconds}s`
                    : `${seconds}s`;
            } else {
                this.timeRemainingValue.textContent = '0s';
            }
        } else if (totalWords > 0 && !this.isPlaying) {
            // Estimate time if not playing
            const wpm = parseInt(this.speedSlider.value);
            const wordsPerSecond = wpm / 60;
            const wordsRemaining = totalWords - wordsRead;
            const secondsRemaining = wordsRemaining / wordsPerSecond;
            
            if (secondsRemaining > 0) {
                const minutes = Math.floor(secondsRemaining / 60);
                const seconds = Math.floor(secondsRemaining % 60);
                this.timeRemainingValue.textContent = minutes > 0 
                    ? `${minutes}m ${seconds}s`
                    : `${seconds}s`;
            } else {
                this.timeRemainingValue.textContent = '--';
            }
        } else {
            this.timeRemainingValue.textContent = '--';
        }
    }

    async saveProgress() {
        const text = this.textInput.value.trim();
        if (!text) {
            alert('No text to save!');
            return;
        }

        const title = prompt('Enter a title for this session (or leave blank for auto-generated):');
        if (title === null) return; // User cancelled

        try {
            const speed = parseInt(this.speedSlider.value);
            const wordCount = parseInt(this.wordCountSlider.value);
            
            if (this.currentSessionId) {
                // Update existing session
                await this.db.updateSession(this.currentSessionId, {
                    title: title || `Session ${new Date().toLocaleString()}`,
                    text: text,
                    currentIndex: this.currentIndex,
                    speed: speed,
                    wordCount: wordCount
                });
                alert('Progress updated!');
            } else {
                // Create new session
                this.currentSessionId = await this.db.saveSession(
                    title,
                    text,
                    this.currentIndex,
                    speed,
                    wordCount
                );
                alert('Progress saved!');
            }
            
            await this.loadSavedSessions();
        } catch (error) {
            console.error('Error saving progress:', error);
            alert('Error saving progress. Please try again.');
        }
    }

    async loadSavedSessions() {
        try {
            const sessions = await this.db.getAllSessions();
            
            if (sessions.length === 0) {
                this.savedSessionsSection.style.display = 'none';
                return;
            }

            this.savedSessionsSection.style.display = 'block';
            this.sessionsList.innerHTML = '';

            sessions.forEach(session => {
                const sessionItem = document.createElement('div');
                sessionItem.className = 'session-item';
                
                const date = new Date(session.updatedAt).toLocaleString();
                const progress = session.text ? Math.round((session.currentIndex / session.text.split(' ').length) * 100) : 0;
                
                sessionItem.innerHTML = `
                    <div class="session-info">
                        <div class="session-title">${this.escapeHtml(session.title)}</div>
                        <div class="session-meta">
                            <span>Progress: ${progress}%</span>
                            <span>Speed: ${session.speed} WPM</span>
                            <span>${date}</span>
                        </div>
                    </div>
                    <div class="session-actions">
                        <button class="btn btn-small btn-load" data-id="${session.id}">Load</button>
                        <button class="btn btn-small btn-delete" data-id="${session.id}">Delete</button>
                    </div>
                `;

                // Load button
                sessionItem.querySelector('.btn-load').addEventListener('click', () => {
                    this.loadSession(session.id);
                });

                // Delete button
                sessionItem.querySelector('.btn-delete').addEventListener('click', async () => {
                    if (confirm('Delete this session?')) {
                        try {
                            await this.db.deleteSession(session.id);
                            if (this.currentSessionId === session.id) {
                                this.currentSessionId = null;
                            }
                            await this.loadSavedSessions();
                        } catch (error) {
                            console.error('Error deleting session:', error);
                            alert('Error deleting session.');
                        }
                    }
                });

                this.sessionsList.appendChild(sessionItem);
            });
        } catch (error) {
            console.error('Error loading sessions:', error);
        }
    }

    async loadSession(id) {
        try {
            const session = await this.db.getSession(id);
            if (!session) {
                alert('Session not found!');
                return;
            }

            // Load the session data
            this.textInput.value = session.text;
            this.currentIndex = session.currentIndex || 0;
            this.speedSlider.value = session.speed || 300;
            this.speedValue.textContent = session.speed || 300;
            this.wordCountSlider.value = session.wordCount || 1;
            this.wordCountValue.textContent = session.wordCount || 1;
            this.currentSessionId = session.id;

            // Process the text
            this.processText();

            // Show reader section if there's text
            if (session.text) {
                this.readerSection.style.display = 'block';
                this.updateStats();
                
                // Scroll to reader section
                setTimeout(() => {
                    this.readerSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }

            alert('Session loaded! Click "Speed Read" to continue from where you left off.');
        } catch (error) {
            console.error('Error loading session:', error);
            alert('Error loading session.');
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the speed reader when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SpeedReader();
});
