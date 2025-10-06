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

1. **generate-reports.js** - Database extraction and report generation
2. **email-sender.js** - Email delivery system with HTML templates
3. **dashboard-server.js** - Express web server for analytics dashboard
4. **english_analytics_dashboard.html** - Frontend dashboard interface
5. **scheduler.js** - Automated task scheduler using node-schedule
6. **restartScheduler.sh** - PM2 process management script
7. **test-date-sync.js** - Date synchronization testing and validation utility
8. **test-date-logic.js** - Date calculation logic testing utility
9. **check-reports.js** - Report availability checking utility

### Data Flow

```
PostgreSQL Database → generate-reports.js → JSON Reports → email-sender.js → HTML Emails
                                               ↓
                                          dashboard-server.js → Web Dashboard
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
   DATABASE_URL=postgresql://user:password@host:port/database
   DEEPSEEK_API_KEY=your-deepseek-api-key
   ```

   **Note**: `DATABASE_URL` and `DEEPSEEK_API_KEY` are required for report generation. The system will exit with an error if these are not configured.

## 🚀 Usage

### Generate Reports from Database
```bash
node generate-reports.js
```
This will:
- Extract chat data from yesterday's date range (00:00:00 to 23:59:59 UTC)
- Generate AI assessments for each conversation
- Create structured JSON reports in `./reports/YYYY-MM-DD/` format

### Send Email Reports
```bash
node email-sender.js
```
This will:
- Process generated JSON reports
- Create personalized HTML emails for students and teachers
- Send reports via Gmail API

### Start Web Dashboard
```bash
node dashboard-server.js
```
Access the dashboard at `http://localhost:3000`

### Automated Scheduling
```bash
# Start the automated scheduler (runs daily at midnight)
node scheduler.js

# Or use PM2 for production deployment
./restartScheduler.sh
```
The scheduler will automatically:
- Generate reports from database daily at midnight (00:00:00)
- Send email reports if report generation succeeds
- Log all activities to `./logs/` directory

### NPM Scripts
```bash
npm start                 # Send email reports (email-sender.js)
npm run generate-reports  # Generate reports from database (generate-reports.js)
npm run send-reports      # Send email reports (email-sender.js)
npm run dashboard         # Start web dashboard (dashboard-server.js)
npm run full-process      # Generate reports then send emails
npm run test-date-sync    # Test date synchronization between components
```

### Testing & Validation
```bash
# Test date synchronization between components
npm run test-date-sync
# or
node test-date-sync.js

# Test date logic used in report generation
node test-date-logic.js

# Check available reports for yesterday's date
npm run check-reports
# or
node check-reports.js
```

### Production Deployment
```bash
# Install PM2 globally for process management
npm install -g pm2

# Start automated scheduler with PM2 (automatically uses current directory)
./restartScheduler.sh

# Monitor scheduler status
pm2 status
pm2 logs midnight-scheduler

# Stop scheduler
pm2 stop midnight-scheduler
```

## 📁 File Structure

```
├── .env                           # Environment configuration
├── package.json                   # Dependencies and scripts
├── generate-reports.js            # Database extraction and AI assessment
├── email-sender.js                # Email delivery system
├── dashboard-server.js            # Web dashboard server
├── scheduler.js                   # Automated task scheduler
├── restartScheduler.sh            # PM2 process management script
├── test-date-sync.js              # Date synchronization testing utility
├── test-date-logic.js             # Date calculation logic testing utility
├── check-reports.js               # Report availability checking utility
├── english_analytics_dashboard.html  # Dashboard frontend
├── logs/                          # Scheduler and process logs
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
- `node-schedule` - Task scheduling and automation
- `pm2` - Process management for production deployment

### External APIs
- **DeepSeek API** - AI-powered educational assessments
- **Gmail SMTP** - Email delivery
- **PostgreSQL** - OpenWebUI chat data source

## 🔒 Security Notes

- Store sensitive credentials in `.env` file (never commit to version control)
- Use Gmail app-specific passwords instead of regular passwords
- Ensure PostgreSQL connection uses proper authentication
- Keep DeepSeek API key secure
- All sensitive configuration now uses environment variables for better security

## 🤖 Automated Scheduling

The system includes an automated scheduler that runs tasks at regular intervals:

### Scheduler Features
- **Portable Configuration**: Automatically uses current working directory (no hardcoded paths)
- **Automatic Execution**: Runs daily at midnight (00:00:00) using node-schedule
- **Sequential Processing**: Generates reports first, then sends emails only if successful
- **Comprehensive Logging**: All activities logged to `./logs/` directory
- **Process Management**: PM2 integration for production deployment
- **Error Handling**: Graceful failure handling with detailed error logs

### Scheduler Configuration
The scheduler (`scheduler.js`) automatically:
1. Uses the current working directory (no hardcoded paths)
2. Runs `generate-reports.js` daily at midnight (00:00:00)
3. If report generation succeeds, runs `email-sender.js`
4. Logs all activities with timestamps to master log file
5. Creates separate log files for each execution

### Log Files
- `logs/scheduler-master.log` - Main scheduler activity log
- `logs/generate-reports-{timestamp}.out.log` - Report generation output
- `logs/generate-reports-{timestamp}.err.log` - Report generation errors
- `logs/email-sender-{timestamp}.out.log` - Email sending output
- `logs/email-sender-{timestamp}.err.log` - Email sending errors

## 📈 Development Workflow

### Manual Execution
1. Run `generate-reports.js` to generate reports from database
2. Run `email-sender.js` to send email reports
3. Run `dashboard-server.js` to view dashboard at localhost:3000
4. Reports persist in filesystem for historical analysis

### Automated Execution
1. Start scheduler with `node scheduler.js` or `./restartScheduler.sh`
2. Monitor logs in `./logs/` directory
3. Access dashboard at localhost:3000 for real-time data
4. System runs continuously with automatic error recovery

## 🧪 Testing & Validation

The system includes comprehensive testing utilities to ensure proper functionality and date synchronization:

### Date Synchronization Test
Verify that all components use consistent date logic:

```bash
npm run test-date-sync
```

This test will:
- ✅ Verify date calculation consistency between `generate-reports.js` and `email-sender.js`
- ✅ Check if reports directory exists for yesterday's date
- ✅ List available student reports
- ✅ Confirm system readiness for email sending
- ✅ Validate directory structure and file paths

### Date Logic Test
Test the core date calculation logic used in report generation:

```bash
node test-date-logic.js
```

This test will:
- ✅ Display current date and calculated report date (yesterday)
- ✅ Show database query date range (yesterday 00:00:00 to 23:59:59)
- ✅ Convert to Unix timestamps for database queries
- ✅ Test sample dates to verify inclusion/exclusion logic
- ✅ Validate that the system correctly identifies yesterday's data

### Report Availability Check
Check what reports are available for processing:

```bash
npm run check-reports
# or
node check-reports.js
```

This utility will:
- ✅ Check if reports directory exists for yesterday's date
- ✅ List all available student reports
- ✅ Display student names and activity summaries
- ✅ Confirm system readiness for email distribution
- ✅ Provide guidance on next steps

**Expected Output:**
```
🔍 Testing Date Synchronization Between Report Generation and Email Sending

📅 Expected Report Date (Yesterday): 2025-10-03
📧 Email Sender Report Date: 2025-10-03
✅ Date synchronization: PASSED

📂 Reports Directory Check:
   Path: /path/to/reports/2025-10-03
   Exists: ✅ YES

👥 Available Students: 2
   1. user-uuid-1
   2. user-uuid-2

🎉 Ready to send emails for yesterday's reports!
```

### When to Run Tests
- **After initial setup** to verify configuration
- **Before running automated scheduler** in production
- **When troubleshooting date-related issues** or data synchronization problems
- **After making changes** to date calculation logic
- **Daily monitoring** to ensure reports are being generated correctly
- **Before manual email sending** to confirm reports are available

## 🐛 Troubleshooting

### Common Issues

1. **Date Synchronization Issues**
   - Run `node test-date-sync.js` to diagnose date calculation problems
   - Run `node test-date-logic.js` to verify core date logic
   - Ensure both components use identical yesterday date logic
   - Check timezone settings if dates don't match

2. **Environment Variables Missing**
   - Error: "DATABASE_URL environment variable is required"
   - Error: "DEEPSEEK_API_KEY environment variable is required"
   - Solution: Ensure `.env` file exists with all required variables

3. **Database Connection Failed**
   - Verify PostgreSQL connection string format
   - Check network connectivity and credentials
   - Ensure DATABASE_URL is properly set

4. **Email Sending Failed**
   - Ensure Gmail app-specific password is correct
   - Check Gmail account settings allow less secure apps

5. **AI Assessment Failed**
   - Verify DeepSeek API key is valid and properly set
   - Check API rate limits and quotas

6. **Reports Not Generated**
   - Ensure reports directory has write permissions
   - Check if there's chat data in the last 24 hours
   - Run date sync test to verify directory paths

5. **Scheduler Not Running**
   - Check PM2 status: `pm2 status`
   - View scheduler logs: `pm2 logs midnight-scheduler`
   - Restart scheduler: `./restartScheduler.sh`

6. **Path Configuration Issues**
   - The scheduler now automatically uses the current working directory
   - Ensure you run `./restartScheduler.sh` from the project root directory
   - No manual path configuration needed in scheduler.js

7. **Log Files Growing Too Large**
   - Logs are automatically rotated by PM2
   - Manual cleanup: `pm2 flush midnight-scheduler`
   - Check disk space in `./logs/` directory

8. **Process Memory Issues**
   - Monitor with: `pm2 monit`
   - Restart if needed: `pm2 restart midnight-scheduler`
   - Check system resources

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