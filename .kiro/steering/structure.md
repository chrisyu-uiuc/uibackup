# Project Structure

## Root Directory
```
├── .env                           # Environment configuration
├── package.json                   # Node.js dependencies and scripts
├── english_analytics_dashboard.html  # Frontend dashboard interface
├── dashboard-server.js            # Express server for web dashboard
├── generate-reports.js            # Database extraction and report generation
├── email-sender.js                # Email delivery system
├── scheduler.js                   # Automated task scheduler
├── restartScheduler.sh            # PM2 process management script
├── logs/                          # Scheduler and process logs
└── reports/                       # Generated report storage
```

## Reports Directory Structure
```
reports/
└── YYYY-MM-DD/                    # Date-based folders (yesterday's date)
    ├── processing_overview.json   # Daily processing summary
    └── {user-id}/                 # Individual user folders
        ├── user_summary.json      # User activity overview
        └── chat_N_Title.json      # Individual chat sessions
```

## File Naming Conventions
- **Date folders**: ISO format `YYYY-MM-DD` (always yesterday's date)
- **User folders**: UUID format from database user IDs
- **Chat files**: `chat_{index}_{safe_title}.json` where title is sanitized
- **Summary files**: Always named `user_summary.json`

## Data Flow Architecture
1. **generate-reports.js**: Database → JSON reports
2. **email-sender.js**: JSON reports → HTML emails
3. **dashboard-server.js**: JSON reports → Web dashboard
4. **Dashboard**: Static HTML + Express API endpoints

## API Endpoints (dashboard-server.js)
- `GET /api/dates` - Available report dates
- `GET /api/users/:date` - Users for specific date
- `GET /api/user-summary/:date/:userId` - User summary data
- `GET /api/chat/:date/:userId/:chatFile` - Individual chat details
- `GET /` - Main dashboard interface

## Code Organization Patterns
- **Database queries**: Centralized in generate-reports.js
- **Email templates**: Inline HTML generation in email-sender.js
- **File operations**: Consistent use of fs-extra for async operations
- **Error handling**: Try-catch blocks with detailed console logging
- **Configuration**: Environment variables via dotenv

## Development Workflow

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

## Scheduler Architecture
- **scheduler.js**: Main scheduling logic using node-schedule
- **restartScheduler.sh**: PM2 deployment script for production
- **logs/**: Centralized logging for all scheduled operations
- **Execution Flow**: Reports → Email (only if reports succeed)
- **Frequency**: Every 5 minutes (configurable in scheduler.js)