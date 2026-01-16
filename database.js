// IndexedDB database using Dexie
const db = new Dexie('SpeedReaderDB');

db.version(1).stores({
    sessions: '++id, title, text, currentIndex, speed, wordCount, createdAt, updatedAt'
});

class DatabaseManager {
    constructor() {
        this.db = db;
    }

    // Save a reading session
    async saveSession(title, text, currentIndex, speed, wordCount) {
        try {
            const now = new Date().toISOString();
            const id = await this.db.sessions.add({
                title: title || `Session ${new Date().toLocaleString()}`,
                text: text,
                currentIndex: currentIndex,
                speed: speed,
                wordCount: wordCount,
                createdAt: now,
                updatedAt: now
            });
            return id;
        } catch (error) {
            console.error('Error saving session:', error);
            throw error;
        }
    }

    // Get all saved sessions
    async getAllSessions() {
        try {
            return await this.db.sessions.orderBy('updatedAt').reverse().toArray();
        } catch (error) {
            console.error('Error getting sessions:', error);
            return [];
        }
    }

    // Get a session by ID
    async getSession(id) {
        try {
            return await this.db.sessions.get(id);
        } catch (error) {
            console.error('Error getting session:', error);
            return null;
        }
    }

    // Update a session
    async updateSession(id, updates) {
        try {
            updates.updatedAt = new Date().toISOString();
            await this.db.sessions.update(id, updates);
        } catch (error) {
            console.error('Error updating session:', error);
            throw error;
        }
    }

    // Delete a session
    async deleteSession(id) {
        try {
            await this.db.sessions.delete(id);
        } catch (error) {
            console.error('Error deleting session:', error);
            throw error;
        }
    }
}
