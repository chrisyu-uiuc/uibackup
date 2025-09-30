# English Practice Reports System

An automated English learning analytics platform that processes student chat conversations, generates AI-powered educational assessments, and delivers personalized progress reports via email.

## 🚀 Features

- **Chat Analysis**: Extracts and processes student conversations from PostgreSQL database
- **AI Assessment**: Uses DeepSeek API to generate educational feedback on English usage
- **Report Generation**: Creates detailed JSON reports with full conversation history
- **Email Distribution**: Automated HTML email delivery via Gmail API
- **Web Dashboard**: Interactive analytics interface for viewing progress data
- **Multi-format Output**: JSON data files and HTML email templates

## 🏗️ Architecture

### Core Components

1. **main10.js** - Database extraction and report generation
2. **reportSystem5.js** - Email delivery system with HTML templates
3. **nodeserver.js** - Express web server for analytics dashboard
4. **english_analytics_dashboard.html** - Frontend dashboard interface

### Data Flow

```
PostgreSQL Database → main10.js → JSON Reports → reportSystem5.js → HTML Emails
                                      ↓
                                 nodeserver.js → Web Dashboard
```

## 📋 Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database access
- Gmail account with app-specific password
- DeepSeek API key

## 🔧 Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `.env`:
   ```env
   GMAIL_USER=your-gmail@gmail.com
   GMAIL_APP_PASSWORD=your-app-specific-password
   TEACHER_EMAIL=teacher@example.com
   ```

4. Update database connection string in `main10.js`:
   ```javascript
   const connectionString = 'postgresql://user:password@host:port/database';
   ```

5. Add your DeepSeek API key in `main10.js`:
   ```javascript
   const deepseekApiKey = 'your-deepseek-api-key';
   ```

## 🚀 Usage

### Generate Reports from Database
```bash
node main10.js
```
This will:
- Extract chat data from the last 24 hours
- Generate AI assessments for each conversation
- Create structured JSON reports in `./reports/YYYY-MM-DD/` format

### Send Email Reports
```bash
node reportSystem5.js
```
This will:
- Process generated JSON reports
- Create personalized HTML emails for students and teachers
- Send reports via Gmail API

### Start Web Dashboard
```bash
node nodeserver.js
```
Access the dashboard at `http://localhost:3000`

### NPM Scripts
```bash
npm start                 # Send email reports (reportSystem5.js)
npm run generate-reports  # Generate reports from database (main10.js)
npm run send-reports      # Send email reports (reportSystem5.js)
npm run dashboard         # Start web dashboard (nodeserver.js)
npm run full-process      # Generate reports then send emails
```

## 📁 File Structure

```
├── .env                           # Environment configuration
├── package.json                   # Dependencies and scripts
├── main10.js                      # Database extraction and AI assessment
├── reportSystem5.js               # Email delivery system
├── nodeserver.js                  # Web dashboard server
├── english_analytics_dashboard.html  # Dashboard frontend
└── reports/                       # Generated reports
    └── YYYY-MM-DD/               # Date-based folders (yesterday's date)
        ├── processing_overview.json  # Daily processing summary
        └── {user-id}/            # Individual user folders
            ├── user_summary.json # User activity overview
            └── chat_N_Title.json # Individual chat sessions
```

## 🔌 API Endpoints

The web dashboard provides these REST endpoints:

- `GET /api/dates` - Available report dates
- `GET /api/users/:date` - Users for specific date
- `GET /api/user-summary/:date/:userId` - User summary data
- `GET /api/chat/:date/:userId/:chatFile` - Individual chat details
- `GET /` - Main dashboard interface

## 📊 Report Structure

### User Summary (`user_summary.json`)
```json
{
  "user_info": {
    "user_id": "uuid",
    "user_name": "Student Name",
    "user_email": "student@example.com"
  },
  "summary": {
    "total_chats": 5,
    "total_messages": 42,
    "student_messages": 21,
    "chatbot_messages": 21,
    "total_tokens": 1250,
    "models_used": ["deepseek-chat"],
    "last_activity": "2025-09-30T10:30:00.000Z"
  },
  "chat_overview": [...]
}
```

### Individual Chat (`chat_N_Title.json`)
```json
{
  "user_info": {...},
  "chat_info": {
    "chat_id": "chat-uuid",
    "title": "Conversation Title",
    "message_count": 8,
    "estimated_practice_time": "5 minutes"
  },
  "conversation_history": [...],
  "educational_assessment": {
    "performance_comment": "AI-generated feedback",
    "correction": "Grammar and vocabulary corrections",
    "improvement_areas": "Specific areas to focus on",
    "encouragement": "Motivational message"
  }
}
```

## 🤖 AI Assessment

The system uses DeepSeek API to generate structured educational assessments with:

- **Performance Comments**: Overall English usage evaluation
- **Corrections**: Specific grammar and vocabulary feedback
- **Improvement Areas**: Targeted learning suggestions
- **Encouragement**: Motivational messages for continued learning

## 📧 Email Templates

### Student Reports
- Personalized progress summary
- Full conversation history
- AI-generated assessments
- Improvement suggestions
- Encouragement messages

### Teacher Reports
- Student activity overview
- Detailed conversation analysis
- Progress indicators
- Engagement metrics

## 🛠️ Dependencies

### Core Libraries
- `express` - Web server framework
- `pg` - PostgreSQL client
- `nodemailer` - Email sending
- `googleapis` - Google APIs integration
- `fs-extra` - Enhanced file operations
- `dotenv` - Environment variable management

### External APIs
- **DeepSeek API** - AI-powered educational assessments
- **Gmail SMTP** - Email delivery
- **PostgreSQL** - OpenWebUI chat data source

## 🔒 Security Notes

- Store sensitive credentials in `.env` file (never commit to version control)
- Use Gmail app-specific passwords instead of regular passwords
- Ensure PostgreSQL connection uses proper authentication
- Keep DeepSeek API key secure

## 📈 Development Workflow

1. Run `main10.js` to generate reports from database
2. Run `reportSystem5.js` to send email reports
3. Run `nodeserver.js` to view dashboard at localhost:3000
4. Reports persist in filesystem for historical analysis

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Verify PostgreSQL connection string
   - Check network connectivity and credentials

2. **Email Sending Failed**
   - Ensure Gmail app-specific password is correct
   - Check Gmail account settings allow less secure apps

3. **AI Assessment Failed**
   - Verify DeepSeek API key is valid
   - Check API rate limits and quotas

4. **Reports Not Generated**
   - Ensure reports directory has write permissions
   - Check if there's chat data in the last 24 hours

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Note**: This system processes data from the previous day (yesterday) by default. Reports are generated for the date range of 24 hours ago to ensure complete data capture.