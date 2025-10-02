# Product Overview

## English Practice Reports System

An automated English learning analytics platform that processes student chat conversations, generates educational assessments, and delivers personalized progress reports via email.

### Core Features
- **Chat Analysis**: Processes student conversations from PostgreSQL database
- **AI Assessment**: Uses DeepSeek API to generate educational feedback on English usage
- **Report Generation**: Creates detailed HTML reports for both students and teachers
- **Email Distribution**: Automated delivery via Gmail API
- **Web Dashboard**: Interactive analytics interface for viewing progress data
- **Automated Scheduling**: Continuous operation with scheduled report generation and delivery
- **Process Management**: Production-ready deployment with PM2 integration

### Target Users
- **Students**: Receive personalized progress reports with performance feedback
- **Teachers**: Get comprehensive analytics on student engagement and progress
- **Administrators**: Monitor overall system usage and student activity

### Data Flow
1. Extract chat data from OpenWebUI PostgreSQL database
2. Process conversations and generate educational assessments
3. Create structured JSON reports with full conversation history
4. Generate HTML email reports for students and teachers
5. Serve analytics through web dashboard interface
6. Automated scheduling ensures continuous operation every minute
7. Comprehensive logging tracks all system activities and errors