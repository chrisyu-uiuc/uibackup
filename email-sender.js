const fs = require('fs-extra');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config();

class EnglishPracticeReports {
    constructor() {
        // Set report date to yesterday
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        this.reportDate = yesterday.toISOString().split('T')[0]; // YYYY-MM-DD of yesterday
        this.teacherEmail = process.env.TEACHER_EMAIL;
    }

    async initialize() {
        console.log('🚀 Starting English Practice Report System');
        console.log(`📅 Report Date (Yesterday): ${this.reportDate}`);
        console.log(`📧 Teacher Email: ${this.teacherEmail}`);
        
        // Validate environment variables
        if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
            throw new Error('Missing Gmail configuration in .env file');
        }
        
        return true;
    }

    // Helper function to convert newlines to HTML breaks
    formatMessageContent(content) {
        if (!content) return '';
        return content.replace(/\n/g, '<br>');
    }

    generateStudentHTMLReport(userSummary, chatDetails, fullChatRecords) {
        const userInfo = userSummary.user_info;
        const summary = userSummary.summary;
        const lastActivity = new Date(summary.last_activity).toLocaleDateString('en-GB');

        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your English Practice Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            background: #f8f9fa;
            padding: 20px;
        }
        .container { 
            max-width: 700px; 
            margin: 0 auto; 
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 40px 30px; 
            text-align: center; 
        }
        .header h1 { 
            margin: 0 0 10px 0; 
            font-size: 2.2em; 
            font-weight: 300;
        }
        .header p { 
            margin: 0; 
            opacity: 0.9; 
            font-size: 1.1em;
        }
        .content { 
            padding: 40px 30px; 
        }
        .welcome { 
            margin-bottom: 30px; 
        }
        .welcome h2 { 
            color: #333; 
            margin-bottom: 10px; 
            font-size: 1.8em;
        }
        .welcome p { 
            color: #666; 
            font-size: 1.1em; 
            line-height: 1.6;
        }
        .stats-grid { 
            display: grid; 
            grid-template-columns: repeat(2, 1fr); 
            gap: 15px; 
            margin: 30px 0; 
        }
        .stat-card { 
            background: white; 
            padding: 20px; 
            border-radius: 12px; 
            text-align: center; 
            box-shadow: 0 4px 15px rgba(0,0,0,0.08);
            border: 1px solid #e8ecef;
        }
        .stat-card h3 { 
            margin: 0 0 12px 0; 
            color: #555; 
            font-size: 0.95em;
            font-weight: 600;
        }
        .stat-number { 
            color: #667eea; 
            font-weight: bold; 
            font-size: 2em;
            display: block;
        }
        .section-title {
            color: #333;
            border-bottom: 3px solid #667eea;
            padding-bottom: 12px;
            margin: 35px 0 20px 0;
            font-size: 1.4em;
        }
        .chat-session { 
            background: white; 
            margin: 25px 0; 
            padding: 25px; 
            border-radius: 12px; 
            border-left: 5px solid #667eea;
            box-shadow: 0 3px 10px rgba(0,0,0,0.05);
        }
        .chat-header {
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #e8ecef;
        }
        .chat-title { 
            margin: 0 0 10px 0; 
            color: #333; 
            font-size: 1.4em;
        }
        .chat-meta {
            color: #666;
            font-size: 0.95em;
        }
        .conversation-section {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border: 1px solid #e8ecef;
        }
        .conversation-title {
            margin: 0 0 15px 0;
            color: #333;
            font-size: 1.2em;
            font-weight: 600;
        }
        .message-list {
            max-height: 300px;
            overflow-y: auto;
            border: 1px solid #e8ecef;
            border-radius: 8px;
            background: white;
        }
        .message {
            padding: 15px;
            border-bottom: 1px solid #f1f1f1;
            display: flex;
        }
        .message:last-child {
            border-bottom: none;
        }
        .message.student {
            background: #f8f9fa;
        }
        .message.chatbot {
            background: white;
        }
        .message-role {
            font-weight: 600;
            min-width: 80px;
            color: #555;
        }
        .message-content {
            flex: 1;
            color: #333;
            line-height: 1.5;
        }
        .message-time {
            font-size: 0.8em;
            color: #888;
            margin-top: 5px;
        }
        .assessment-section { 
            background: #e7f3ff; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 20px 0; 
            border-left: 4px solid #007bff;
        }
        .assessment-title {
            margin: 0 0 12px 0;
            color: #0056b3;
            font-size: 1.1em;
            font-weight: 600;
        }
        .assessment-content {
            margin: 0;
            color: #333;
            line-height: 1.6;
        }
        .improvement-box { 
            background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%); 
            padding: 25px; 
            border-radius: 12px; 
            margin: 25px 0; 
            border-left: 5px solid #f39c12;
        }
        .encouragement-box { 
            background: linear-gradient(135deg, #d1ecf1 0%, #a2d9f3 100%); 
            padding: 25px; 
            border-radius: 12px; 
            margin: 25px 0;
            border-left: 5px solid #17a2b8;
        }
        .box-title {
            margin: 0 0 15px 0;
            color: #333;
            font-size: 1.3em;
        }
        .improvement-list {
            margin: 0;
            padding-left: 20px;
        }
        .improvement-list li {
            margin-bottom: 8px;
            color: #555;
        }
        .footer {
            text-align: center;
            color: #666;
            font-size: 0.9em;
            padding: 25px;
            border-top: 1px solid #e8ecef;
            margin-top: 30px;
            background: #f8f9fa;
        }
        .last-activity {
            text-align: center;
            color: #666;
            font-style: italic;
            margin: 20px 0;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📚 Your English Practice Report</h1>
            <p>Daily Progress Summary • ${new Date(this.reportDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        
        <div class="content">
            <div class="welcome">
                <h2>Hello ${userInfo.user_name}! 👋</h2>
                <p>Great work on your English practice yesterday! Here's your detailed progress report:</p>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>💬 Total Chats</h3>
                    <span class="stat-number">${summary.total_chats}</span>
                </div>
                <div class="stat-card">
                    <h3>📝 Messages Sent</h3>
                    <span class="stat-number">${summary.student_messages}</span>
                </div>
                <div class="stat-card">
                    <h3>🤖 AI Responses</h3>
                    <span class="stat-number">${summary.chatbot_messages}</span>
                </div>
                <div class="stat-card">
                    <h3>⏱️ Practice Volume</h3>
                    <span class="stat-number">${summary.total_tokens}</span>
                    <small>tokens</small>
                </div>
            </div>
            
            <h3 class="section-title">Recent Practice Sessions</h3>
            ${chatDetails.map((chat, index) => {
                const fullChat = fullChatRecords[index];
                return `
            <div class="chat-session">
                <div class="chat-header">
                    <h4 class="chat-title">💬 ${chat.title}</h4>
                    <div class="chat-meta">
                        <div><strong>Duration:</strong> ${chat.estimated_practice_time}</div>
                        <div><strong>Messages:</strong> ${chat.message_count}</div>
                        <div><strong>Date:</strong> ${new Date(chat.created_at).toLocaleDateString('en-GB')}</div>
                    </div>
                </div>

                ${fullChat ? `
                <div class="conversation-section">
                    <h5 class="conversation-title">💬 Full Conversation Record</h5>
                    <div class="message-list">
                        ${fullChat.conversation_history.map(message => `
                        <div class="message ${message.role}">
                            <div class="message-role">${message.role === 'student' ? 'You:' : 'Tutor:'}</div>
                            <div class="message-content">
                                ${this.formatMessageContent(message.content)}
                                <div class="message-time">${new Date(message.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                        </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
                
                <div class="assessment-section">
                    <h5 class="assessment-title">Performance Assessment</h5>
                    <p class="assessment-content">${chat.assessment.performance_comment}</p>
                </div>
                
                <div class="assessment-section">
                    <h5 class="assessment-title">Corrections & Feedback</h5>
                    <p class="assessment-content">${chat.assessment.correction}</p>
                </div>
                
                <div class="assessment-section">
                    <h5 class="assessment-title">Areas for Improvement</h5>
                    <p class="assessment-content">${chat.assessment.improvement_areas}</p>
                </div>
            </div>
            `}).join('')}
            
            <div class="improvement-box">
                <h4 class="box-title">🎯 Areas to Focus On</h4>
                <ul class="improvement-list">
                    ${chatDetails.length > 0 ? 
                      chatDetails[0].assessment.improvement_areas.split('. ')
                         .filter(area => area.trim().length > 10)
                         .map(area => `<li>${area.trim()}</li>`).join('') 
                      : '<li>Continue your regular practice sessions</li><li>Try to use new vocabulary in conversations</li><li>Focus on sentence structure and grammar</li>'}
                </ul>
            </div>
            
            <div class="encouragement-box">
                <h4 class="box-title">🌟 Words of Encouragement</h4>
                <p>${chatDetails.length > 0 ? chatDetails[0].assessment.encouragement : "Your dedication to learning English is impressive! Every conversation brings you closer to fluency."}</p>
            </div>
            
            <div class="last-activity">
                <strong>Last Activity:</strong> ${lastActivity}
            </div>
        </div>
        
        <div class="footer">
            <p>This is an automated report from your English practice platform.<br>
            Keep up the great work! Every practice session brings you closer to fluency. 🚀</p>
        </div>
    </div>
</body>
</html>`;
    }

    generateTeacherHTMLReport(userSummary, chatDetails, fullChatRecords) {
        const userInfo = userSummary.user_info;
        const summary = userSummary.summary;
        const engagementLevel = summary.total_chats > 4 ? 'High' : summary.total_chats > 2 ? 'Moderate' : 'Low';
        const lastActivity = new Date(summary.last_activity).toLocaleDateString('en-GB');
        const reportDateFormatted = new Date(this.reportDate).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Progress Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            background: #f8f9fa;
            padding: 20px;
        }
        .container { 
            max-width: 800px; 
            margin: 0 auto; 
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .header { 
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%); 
            color: white; 
            padding: 40px 30px; 
            text-align: center; 
        }
        .header h1 { 
            margin: 0 0 10px 0; 
            font-size: 2.2em; 
            font-weight: 300;
        }
        .header p { 
            margin: 0; 
            opacity: 0.9; 
            font-size: 1.1em;
        }
        .content { 
            padding: 40px 30px; 
        }
        .student-profile { 
            background: white; 
            padding: 25px; 
            border-radius: 12px; 
            margin: 20px 0; 
            box-shadow: 0 4px 15px rgba(0,0,0,0.08);
            border: 2px solid #e8ecef;
        }
        .student-profile h2 { 
            margin: 0 0 20px 0; 
            color: #333; 
            font-size: 1.8em;
            text-align: center;
        }
        .profile-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-top: 15px;
        }
        .profile-item {
            display: flex;
            flex-direction: column;
            padding: 12px;
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #28a745;
        }
        .profile-label {
            font-weight: 600;
            color: #555;
            font-size: 0.9em;
            margin-bottom: 5px;
        }
        .profile-value {
            color: #333;
            font-size: 1.1em;
            font-weight: 500;
        }
        .stats-grid { 
            display: grid; 
            grid-template-columns: repeat(3, 1fr); 
            gap: 15px; 
            margin: 30px 0; 
        }
        .stat-card { 
            background: white; 
            padding: 25px; 
            border-radius: 12px; 
            text-align: center; 
            box-shadow: 0 4px 15px rgba(0,0,0,0.08);
            border: 1px solid #e8ecef;
        }
        .stat-card h3 { 
            margin: 0 0 15px 0; 
            color: #555; 
            font-size: 1em;
            font-weight: 600;
        }
        .stat-number { 
            color: #28a745; 
            font-weight: bold; 
            font-size: 2.2em;
            display: block;
        }
        .section-title {
            color: #333;
            border-bottom: 3px solid #28a745;
            padding-bottom: 12px;
            margin: 40px 0 25px 0;
            font-size: 1.5em;
        }
        .chat-analysis { 
            background: white; 
            margin: 25px 0; 
            padding: 25px; 
            border-radius: 12px; 
            border-left: 5px solid #28a745;
            box-shadow: 0 3px 10px rgba(0,0,0,0.05);
        }
        .chat-header {
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #e8ecef;
        }
        .chat-title { 
            margin: 0 0 10px 0; 
            color: #333; 
            font-size: 1.4em;
        }
        .chat-meta {
            color: #666;
            font-size: 0.95em;
        }
        .conversation-section {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border: 1px solid #e8ecef;
        }
        .conversation-title {
            margin: 0 0 15px 0;
            color: #333;
            font-size: 1.2em;
            font-weight: 600;
        }
        .message-list {
            max-height: 400px;
            overflow-y: auto;
            border: 1px solid #e8ecef;
            border-radius: 8px;
            background: white;
        }
        .message {
            padding: 15px;
            border-bottom: 1px solid #f1f1f1;
            display: flex;
        }
        .message:last-child {
            border-bottom: none;
        }
        .message.student {
            background: #f8f9fa;
        }
        .message.chatbot {
            background: white;
        }
        .message-role {
            font-weight: 600;
            min-width: 80px;
            color: #555;
        }
        .message-content {
            flex: 1;
            color: #333;
            line-height: 1.5;
        }
        .message-time {
            font-size: 0.8em;
            color: #888;
            margin-top: 5px;
        }
        .assessment-section { 
            background: #e7f3ff; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 20px 0; 
            border-left: 4px solid #007bff;
        }
        .assessment-title {
            margin: 0 0 12px 0;
            color: #0056b3;
            font-size: 1.1em;
            font-weight: 600;
        }
        .assessment-content {
            margin: 0;
            color: #333;
            line-height: 1.6;
        }
        .progress-indicators {
            background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
            padding: 25px;
            border-radius: 12px;
            margin: 25px 0;
            border-left: 5px solid #1976d2;
        }
        .indicators-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin-top: 15px;
        }
        .indicator {
            padding: 15px;
            background: white;
            border-radius: 8px;
            text-align: center;
        }
        .indicator-value {
            font-size: 1.4em;
            font-weight: bold;
            color: #1976d2;
            display: block;
            margin-bottom: 5px;
        }
        .indicator-label {
            color: #555;
            font-size: 0.9em;
        }
        .footer {
            text-align: center;
            color: #666;
            font-size: 0.9em;
            padding: 25px;
            border-top: 1px solid #e8ecef;
            margin-top: 30px;
            background: #f8f9fa;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Progress Report</h1>
            <p>Student Activity Analysis • ${reportDateFormatted}</p>
        </div>
        
        <div class="content">
            <div class="student-profile">
                <h2>Student: ${userInfo.user_name}</h2>
                <div class="profile-grid">
                    <div class="profile-item">
                        <span class="profile-label">Email</span>
                        <span class="profile-value">${userInfo.user_email}</span>
                    </div>
                    <div class="profile-item">
                        <span class="profile-label">User ID</span>
                        <span class="profile-value">${userInfo.user_id}</span>
                    </div>
                    <div class="profile-item">
                        <span class="profile-label">Last Active</span>
                        <span class="profile-value">${lastActivity}</span>
                    </div>
                    <div class="profile-item">
                        <span class="profile-label">AI Model</span>
                        <span class="profile-value">${summary.models_used.join(', ')}</span>
                    </div>
                </div>
            </div>
            
            <h3 class="section-title">📈 Activity Overview</h3>
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>Total Practice Sessions</h3>
                    <span class="stat-number">${summary.total_chats}</span>
                </div>
                <div class="stat-card">
                    <h3>Total Messages</h3>
                    <span class="stat-number">${summary.total_messages}</span>
                </div>
                <div class="stat-card">
                    <h3>Student Messages</h3>
                    <span class="stat-number">${summary.student_messages}</span>
                </div>
            </div>
            
            <h3 class="section-title">📝 Detailed Session Analysis</h3>
            ${chatDetails.map((chat, index) => {
                const fullChat = fullChatRecords[index];
                return `
            <div class="chat-analysis">
                <div class="chat-header">
                    <h4 class="chat-title">💬 ${chat.title}</h4>
                    <div class="chat-meta">
                        <div><strong>Duration:</strong> ${chat.estimated_practice_time}</div>
                        <div><strong>Messages:</strong> ${chat.message_count}</div>
                        <div><strong>Date:</strong> ${new Date(chat.created_at).toLocaleDateString('en-GB')}</div>
                    </div>
                </div>

                ${fullChat ? `
                <div class="conversation-section">
                    <h5 class="conversation-title">💬 Full Conversation Record</h5>
                    <div class="message-list">
                        ${fullChat.conversation_history.map(message => `
                        <div class="message ${message.role}">
                            <div class="message-role">${message.role === 'student' ? 'Student:' : 'Chatbot:'}</div>
                            <div class="message-content">
                                ${this.formatMessageContent(message.content)}
                                <div class="message-time">${new Date(message.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                        </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
                
                <div class="assessment-section">
                    <h5 class="assessment-title">Performance Assessment</h5>
                    <p class="assessment-content">${chat.assessment.performance_comment}</p>
                </div>
                
                <div class="assessment-section">
                    <h5 class="assessment-title">Corrections & Feedback</h5>
                    <p class="assessment-content">${chat.assessment.correction}</p>
                </div>
                
                <div class="assessment-section">
                    <h5 class="assessment-title">Areas for Improvement</h5>
                    <p class="assessment-content">${chat.assessment.improvement_areas}</p>
                </div>
            </div>
            `}).join('')}
            
            <div class="progress-indicators">
                <h4 class="assessment-title">🎯 Overall Progress Indicators</h4>
                <div class="indicators-grid">
                    <div class="indicator">
                        <span class="indicator-value">${engagementLevel}</span>
                        <span class="indicator-label">Engagement Level</span>
                    </div>
                    <div class="indicator">
                        <span class="indicator-value">${summary.student_messages}</span>
                        <span class="indicator-label">Active Participation</span>
                    </div>
                    <div class="indicator">
                        <span class="indicator-value">${summary.total_chats}</span>
                        <span class="indicator-label">Practice Consistency</span>
                    </div>
                    <div class="indicator">
                        <span class="indicator-value">${Math.round(summary.student_messages / summary.total_messages * 100)}%</span>
                        <span class="indicator-label">Conversation Balance</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p>Automated teaching assistant report • Generated on ${new Date().toLocaleString()} • Every student's progress matters 🌟</p>
        </div>
    </div>
</body>
</html>`;
    }

    createEmailTransporter() {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD
            }
        });
    }

    async sendEmail(toEmail, subject, htmlContent) {
        try {
            const transporter = this.createEmailTransporter();
            
            const mailOptions = {
                from: `"English Practice System" <${process.env.GMAIL_USER}>`,
                to: toEmail,
                subject: subject,
                html: htmlContent,
                text: this.convertHtmlToText(htmlContent)
            };

            const result = await transporter.sendMail(mailOptions);
            console.log(`✅ Email sent to ${toEmail}`);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error(`❌ Failed to send email to ${toEmail}:`, error.message);
            return { success: false, error: error.message };
        }
    }

    convertHtmlToText(html) {
        return html
            .replace(/<style[^>]*>.*?<\/style>/gs, '')
            .replace(/<script[^>]*>.*?<\/script>/gs, '')
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<[^>]+>/g, '')
            .replace(/\n{3,}/g, '\n\n')
            .replace(/&nbsp;/g, ' ')
            .trim();
    }

    async loadUserData(userId) {
        const reportsDir = path.join(__dirname, 'Reports', this.reportDate, userId);
        
        if (!await fs.pathExists(reportsDir)) {
            throw new Error(`Reports directory not found: ${reportsDir}`);
        }

        // Load user summary
        const summaryPath = path.join(reportsDir, 'user_summary.json');
        if (!await fs.pathExists(summaryPath)) {
            throw new Error(`User summary not found: ${summaryPath}`);
        }

        const userSummary = await fs.readJson(summaryPath);
        
        // Load chat details and full conversation history
        const chatDetails = [];
        const fullChatRecords = [];
        
        for (const chat of userSummary.chat_overview) {
            const chatPath = path.join(reportsDir, chat.file_name);
            if (await fs.pathExists(chatPath)) {
                const chatData = await fs.readJson(chatPath);
                chatDetails.push({
                    title: chatData.chat_info.title,
                    message_count: chatData.chat_info.message_count,
                    created_at: chatData.chat_info.created_at,
                    estimated_practice_time: chatData.chat_info.estimated_practice_time || 'N/A',
                    assessment: chatData.educational_assessment
                });
                
                // Store full conversation history
                fullChatRecords.push({
                    title: chatData.chat_info.title,
                    conversation_history: chatData.conversation_history || []
                });
            }
        }

        return { userSummary, chatDetails, fullChatRecords };
    }

    async getAllStudentIds() {
        const reportsBaseDir = path.join(__dirname, 'Reports', this.reportDate);
        
        if (!await fs.pathExists(reportsBaseDir)) {
            throw new Error(`Reports base directory not found: ${reportsBaseDir}`);
        }

        const items = await fs.readdir(reportsBaseDir);
        const studentIds = [];

        for (const item of items) {
            const itemPath = path.join(reportsBaseDir, item);
            const stats = await fs.stat(itemPath);
            
            if (stats.isDirectory()) {
                // Check if this directory has a user_summary.json file
                const userSummaryPath = path.join(itemPath, 'user_summary.json');
                if (await fs.pathExists(userSummaryPath)) {
                    studentIds.push(item);
                }
            }
        }

        return studentIds;
    }

    async sendDailyReports() {
        try {
            await this.initialize();
            
            console.log('\n📂 Scanning for students...');
            const studentIds = await this.getAllStudentIds();
            
            if (studentIds.length === 0) {
                console.log('❌ No students found for yesterday');
                return { error: 'No students found' };
            }

            console.log(`👥 Found ${studentIds.length} student(s): ${studentIds.join(', ')}`);

            const results = [];

            for (const studentId of studentIds) {
                console.log(`\n📂 Processing student: ${studentId}`);
                
                try {
                    const { userSummary, chatDetails, fullChatRecords } = await this.loadUserData(studentId);
                    
                    console.log(`👤 Student: ${userSummary.user_info.user_name}`);
                    console.log(`📧 Student Email: ${userSummary.user_info.user_email}`);
                    console.log(`💬 Chats loaded: ${chatDetails.length}`);

                    // Send student report
                    console.log('📧 Sending student report...');
                    const studentHTML = this.generateStudentHTMLReport(userSummary, chatDetails, fullChatRecords);
                    const studentResult = await this.sendEmail(
                        userSummary.user_info.user_email,
                        `📚 Your English Practice Report - ${this.reportDate}`,
                        studentHTML
                    );

                    // Send teacher report
                    console.log('📧 Sending progress report...');
                    const teacherHTML = this.generateTeacherHTMLReport(userSummary, chatDetails, fullChatRecords);
                    const teacherResult = await this.sendEmail(
                        this.teacherEmail,
                        `📊 Progress Report: ${userSummary.user_info.user_name} [${userSummary.user_info.user_email}] - ${this.reportDate}`,
                        teacherHTML
                    );

                    results.push({
                        studentId,
                        studentName: userSummary.user_info.user_name,
                        studentEmail: userSummary.user_info.user_email,
                        studentResult,
                        teacherResult,
                        sessions: chatDetails.length,
                        fullChats: fullChatRecords.length
                    });

                    console.log(`✅ Completed processing for ${userSummary.user_info.user_name}`);

                } catch (error) {
                    console.error(`❌ Error processing student ${studentId}:`, error.message);
                    results.push({
                        studentId,
                        error: error.message
                    });
                }
            }

            // Print comprehensive summary
            console.log('\n' + '='.repeat(80));
            console.log('🎉 BATCH REPORT DELIVERY SUMMARY');
            console.log('='.repeat(80));
            console.log(`Date: ${this.reportDate} (Yesterday)`);
            console.log(`Total Students Processed: ${studentIds.length}`);
            console.log(`Successful Students: ${results.filter(r => !r.error).length}`);
            console.log(`Failed Students: ${results.filter(r => r.error).length}`);
            console.log('='.repeat(80));

            results.forEach((result, index) => {
                if (result.error) {
                    console.log(`\n❌ ${index + 1}. ${result.studentId} - ERROR: ${result.error}`);
                } else {
                    console.log(`\n✅ ${index + 1}. ${result.studentName}`);
                    console.log(`   📧 Student Email: ${result.studentEmail}`);
                    console.log(`   📨 Student Report: ${result.studentResult.success ? '✅ SUCCESS' : '❌ FAILED'}`);
                    console.log(`   📨 Progress Report: ${result.teacherResult.success ? '✅ SUCCESS' : '❌ FAILED'}`);
                    console.log(`   💬 Sessions: ${result.sessions}`);
                    console.log(`   💭 Full Chats: ${result.fullChats}`);
                }
            });

            console.log('='.repeat(80));
            console.log(`⏰ Batch completed: ${new Date().toLocaleTimeString()}`);
            console.log('='.repeat(80));

            return {
                totalStudents: studentIds.length,
                successful: results.filter(r => !r.error).length,
                failed: results.filter(r => r.error).length,
                results
            };

        } catch (error) {
            console.error('\n❌ BATCH ERROR:', error.message);
            return { error: error.message };
        }
    }
}

// Main execution
async function main() {
    const reportSystem = new EnglishPracticeReports();
    await reportSystem.sendDailyReports();
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = EnglishPracticeReports;
