const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

// Serve static files from current directory
app.use(express.static(__dirname));
app.use('/reports', express.static(path.join(__dirname, 'reports')));

// API endpoint to get available dates
app.get('/api/dates', (req, res) => {
    const reportsDir = path.join(__dirname, 'reports');
    
    if (!fs.existsSync(reportsDir)) {
        return res.json([]);
    }
    
    try {
        const dates = fs.readdirSync(reportsDir)
            .filter(item => fs.statSync(path.join(reportsDir, item)).isDirectory())
            .sort().reverse(); // Most recent first
        
        res.json(dates);
    } catch (error) {
        console.error('Error reading dates:', error);
        res.status(500).json({ error: 'Failed to read dates' });
    }
});

// API endpoint to get users for a specific date
app.get('/api/users/:date', (req, res) => {
    const date = req.params.date;
    const dateDir = path.join(__dirname, 'reports', date);
    
    if (!fs.existsSync(dateDir)) {
        return res.json([]);
    }
    
    try {
        const users = fs.readdirSync(dateDir)
            .filter(item => fs.statSync(path.join(dateDir, item)).isDirectory())
            .map(userId => {
                const summaryPath = path.join(dateDir, userId, 'user_summary.json');
                if (fs.existsSync(summaryPath)) {
                    try {
                        const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
                        return {
                            user_id: userId,
                            user_name: summary.user_info.user_name,
                            user_email: summary.user_info.user_email,
                            chat_count: summary.summary.total_chats
                        };
                    } catch (error) {
                        console.error(`Error reading summary for ${userId}:`, error);
                        return {
                            user_id: userId,
                            user_name: 'Unknown',
                            user_email: 'No email',
                            chat_count: 0
                        };
                    }
                }
                return {
                    user_id: userId,
                    user_name: 'Unknown',
                    user_email: 'No email',
                    chat_count: 0
                };
            });
        
        res.json(users);
    } catch (error) {
        console.error('Error reading users:', error);
        res.status(500).json({ error: 'Failed to read users' });
    }
});

// API endpoint to get user summary
app.get('/api/user-summary/:date/:userId', (req, res) => {
    const { date, userId } = req.params;
    const summaryPath = path.join(__dirname, 'reports', date, userId, 'user_summary.json');
    
    if (!fs.existsSync(summaryPath)) {
        return res.status(404).json({ error: 'User summary not found' });
    }
    
    try {
        const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
        res.json(summary);
    } catch (error) {
        console.error('Error reading user summary:', error);
        res.status(500).json({ error: 'Failed to read user summary' });
    }
});

// API endpoint to get chat detail
app.get('/api/chat/:date/:userId/:chatFile', (req, res) => {
    const { date, userId, chatFile } = req.params;
    const chatPath = path.join(__dirname, 'reports', date, userId, chatFile);
    
    if (!fs.existsSync(chatPath)) {
        return res.status(404).json({ error: 'Chat file not found' });
    }
    
    try {
        const chatData = JSON.parse(fs.readFileSync(chatPath, 'utf8'));
        res.json(chatData);
    } catch (error) {
        console.error('Error reading chat file:', error);
        res.status(500).json({ error: 'Failed to read chat file' });
    }
});

// Serve the dashboard at the root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'english_analytics_dashboard.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Dashboard available at http://localhost:${PORT}`);
});
