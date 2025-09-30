# Project Structure

## Root Directory
```
├── .env                           # Environment configuration
├── package.json                   # Node.js dependencies and scripts
├── english_analytics_dashboard.html  # Frontend dashboard interface
├── nodeserver.js                  # Express server for web dashboard
├── main10.js                      # Database extraction and report generation
├── reportSystem5.js               # Email delivery system
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
1. **main10.js**: Database → JSON reports
2. **reportSystem5.js**: JSON reports → HTML emails
3. **nodeserver.js**: JSON reports → Web dashboard
4. **Dashboard**: Static HTML + Express API endpoints

## API Endpoints (nodeserver.js)
- `GET /api/dates` - Available report dates
- `GET /api/users/:date` - Users for specific date
- `GET /api/user-summary/:date/:userId` - User summary data
- `GET /api/chat/:date/:userId/:chatFile` - Individual chat details
- `GET /` - Main dashboard interface

## Code Organization Patterns
- **Database queries**: Centralized in main10.js
- **Email templates**: Inline HTML generation in reportSystem5.js
- **File operations**: Consistent use of fs-extra for async operations
- **Error handling**: Try-catch blocks with detailed console logging
- **Configuration**: Environment variables via dotenv

## Development Workflow
1. Run `main10.js` to generate reports from database
2. Run `reportSystem5.js` to send email reports
3. Run `nodeserver.js` to view dashboard at localhost:3000
4. Reports persist in filesystem for historical analysis