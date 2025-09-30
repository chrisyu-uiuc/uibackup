# Technology Stack

## Runtime & Dependencies
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web server framework for dashboard API
- **PostgreSQL**: Database connection via `pg` library
- **Gmail API**: Email delivery via `nodemailer`

## Key Libraries
- `googleapis`: Google APIs integration
- `nodemailer`: Email sending functionality  
- `fs-extra`: Enhanced file system operations
- `dotenv`: Environment variable management
- `pg`: PostgreSQL database client
- `node-schedule`: Task scheduling and automation
- `pm2`: Process management for production deployment

## External APIs
- **DeepSeek API**: AI-powered educational assessment generation
- **Gmail SMTP**: Automated email delivery system
- **PostgreSQL Database**: OpenWebUI chat data source

## File Structure
- Reports stored in `./reports/YYYY-MM-DD/user-id/` format
- JSON files for structured data storage
- HTML templates for email generation
- Static file serving for dashboard

## Common Commands

### Development
```bash
# Start the web dashboard server
node dashboard-server.js

# Generate reports from database
node generate-reports.js

# Send email reports to users
node email-sender.js

# Start automated scheduler
node scheduler.js

# Production deployment with PM2
./restartScheduler.sh
```

### Package Management
```bash
# Install dependencies
npm install

# Start main report system
npm start

# Generate reports only (no email)
npm run generate-reports
```

## Environment Configuration
Required `.env` variables:
- `GMAIL_USER`: Gmail account for sending emails
- `GMAIL_APP_PASSWORD`: Gmail app-specific password
- `TEACHER_EMAIL`: Recipient for teacher reports

## Database Connection
PostgreSQL connection string format:
`postgresql://user:password@host:port/database`