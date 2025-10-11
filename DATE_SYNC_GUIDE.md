# Date Synchronization Guide

## Overview
Both `generate-reports.js` and `email-sender.js` now use **yesterday's date** for processing reports. This ensures that reports are generated and sent for the previous day's activity.

## Date Logic Used

### Both Files Use Identical Logic:
```javascript
const today = new Date();
today.setDate(today.getDate() - 1);  // Go back 1 day
const reportDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
```

### Enhanced Date Filtering in generate-reports.js:
```javascript
// Calculate yesterday's date range using local timezone
const now = new Date();
const yesterday = new Date(now);
yesterday.setDate(yesterday.getDate() - 1);

// Get start and end of yesterday in local timezone
const yesterdayStart = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 0, 0, 0, 0);
const yesterdayEnd = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59, 999);

// Convert to Unix timestamps (seconds)
const startTimestamp = Math.floor(yesterdayStart.getTime() / 1000);
const endTimestamp = Math.floor(yesterdayEnd.getTime() / 1000);
```

### Example:
- If today is **October 4, 2025**
- Reports will be generated/sent for **October 3, 2025**
- Directory: `./reports/2025-10-03/`

## File Synchronization

### generate-reports.js
- **Purpose**: Creates reports from database data with AI assessments
- **Date Used**: Yesterday (`today.getDate() - 1`)
- **Directory Created**: `./reports/YYYY-MM-DD/` (yesterday's date)
- **Database Query**: Filters chats created or updated yesterday
- **Message Filtering**: Only includes messages from yesterday's timeframe
- **Files Created**: 
  - `user_summary.json` for each user with activity overview
  - `chat_N_Title.json` for each conversation with full history and AI assessment
  - `processing_overview.json` with daily processing summary

### email-sender.js
- **Purpose**: Sends email reports to students and teachers
- **Date Used**: Yesterday (`today.getDate() - 1`) 
- **Directory Read**: `./reports/YYYY-MM-DD/` (yesterday's date)
- **Files Read**: Same files created by generate-reports.js

## Workflow

### 1. Generate Reports (Yesterday's Data)
```bash
node generate-reports.js
# Creates: ./reports/2025-10-03/
```

### 2. Send Email Reports (Yesterday's Reports)
```bash
node email-sender.js  
# Reads: ./reports/2025-10-03/
# Sends emails for yesterday's activity
```

### 3. Complete Process
```bash
npm run full-process
# Runs both commands in sequence
```

## Verification Commands

### Check Date Synchronization
```bash
npm run test-date-sync
# Verifies both files use the same date logic
```

### Check Available Reports
```bash
npm run check-reports
# Shows what reports are available for yesterday
```

## Directory Structure
```
./reports/
└── 2025-10-03/                    # Yesterday's date
    ├── processing_overview.json    # Daily summary
    ├── user-id-1/                 # Individual user folders
    │   ├── user_summary.json
    │   ├── chat_1_Title.json
    │   └── chat_2_Title.json
    └── user-id-2/
        ├── user_summary.json
        └── chat_1_Title.json
```

## Why Yesterday's Date?

### Benefits:
1. **Complete Data**: Ensures all of yesterday's conversations are captured with precise timestamp filtering
2. **Consistent Timing**: Reports sent in the morning for previous day's activity
3. **Database Consistency**: Avoids partial data from ongoing conversations
4. **Scheduling Friendly**: Works well with automated daily scheduling
5. **Message Accuracy**: Filters individual messages by timestamp to ensure only yesterday's content
6. **Timezone Handling**: Uses local timezone for consistent date boundaries

### Use Cases:
- **Morning Reports**: Send yesterday's progress each morning
- **Daily Summaries**: Complete picture of previous day's learning
- **Automated Scheduling**: Run at any time during the day for consistent results

## Troubleshooting

### No Reports Found
```bash
# Check if reports exist for yesterday
npm run check-reports

# If no reports, generate them first
npm run generate-reports
```

### Date Mismatch Issues
```bash
# Verify date synchronization
npm run test-date-sync
```

### Manual Date Override
If you need to process a specific date, you can modify the date logic in both files:
```javascript
// Instead of yesterday, use a specific date
const specificDate = new Date('2025-10-01');
const reportDate = `${specificDate.getFullYear()}-${String(specificDate.getMonth() + 1).padStart(2, '0')}-${String(specificDate.getDate()).padStart(2, '0')}`;
```

## Automated Scheduling

The scheduler (`scheduler.js`) runs both processes automatically:
1. Generates reports for yesterday's data
2. Sends emails using yesterday's reports
3. Both use the same date calculation for consistency

This ensures your English practice reports are always synchronized and sent for the correct date!