const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Load configuration from environment variables
const connectionString = process.env.DATABASE_URL;
const deepseekApiKey = process.env.DEEPSEEK_API_KEY;

// Validate required environment variables
if (!connectionString) {
  console.error('ERROR: DATABASE_URL environment variable is required');
  process.exit(1);
}

if (!deepseekApiKey) {
  console.error('ERROR: DEEPSEEK_API_KEY environment variable is required');
  process.exit(1);
}

const pool = new Pool({
  connectionString: connectionString,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Get current date for folder naming
const today = new Date();
today.setDate(today.getDate() - 1);
const currentDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
const baseDir = `./reports/${currentDate}`;

// Ensure base directory exists
if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir, { recursive: true });
  console.log(`Created directory: ${baseDir}`);
}

async function getRecentChatsWithUserInfo() {
  // Calculate yesterday's date range using local timezone (same logic as folder naming)
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Get start and end of yesterday in local timezone
  const yesterdayStart = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 0, 0, 0, 0);
  const yesterdayEnd = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59, 999);
  
  // Convert to Unix timestamps (seconds)
  const startTimestamp = Math.floor(yesterdayStart.getTime() / 1000);
  const endTimestamp = Math.floor(yesterdayEnd.getTime() / 1000);
  
  console.log(`Querying chats for yesterday: ${currentDate}`);
  console.log(`Local time range: ${yesterdayStart.toString()} to ${yesterdayEnd.toString()}`);
  console.log(`UTC time range: ${yesterdayStart.toISOString()} to ${yesterdayEnd.toISOString()}`);
  console.log(`Unix timestamps: ${startTimestamp} to ${endTimestamp}`);

  const query = `
    SELECT 
      u.id as user_id,
      u.name as user_name,
      u.email as user_email,
      c.id as chat_id,
      c.title,
      c.created_at,
      c.updated_at,
      c.chat as chat_data
    FROM chat c
    JOIN "user" u ON c.user_id = u.id
    WHERE (c.created_at >= $1 AND c.created_at <= $2)
       OR (c.updated_at >= $1 AND c.updated_at <= $2)
    ORDER BY u.name, c.updated_at DESC
  `;

  try {
    const result = await pool.query(query, [startTimestamp, endTimestamp]);
    console.log(`Found ${result.rows.length} chats for yesterday (${currentDate})`);
    return result.rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

function processCompleteMessages(messages) {
  let userCount = 0;
  let assistantCount = 0;
  let totalTokens = 0;
  let modelsUsed = new Set();

  // Calculate yesterday's date range for message filtering
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const yesterdayStart = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 0, 0, 0, 0);
  const yesterdayEnd = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59, 999);
  
  const startTimestamp = Math.floor(yesterdayStart.getTime() / 1000);
  const endTimestamp = Math.floor(yesterdayEnd.getTime() / 1000);

  // Filter messages to only include those from yesterday, then process them
  const filteredMessages = messages.filter(msg => {
    if (!msg.timestamp) return false;
    return msg.timestamp >= startTimestamp && msg.timestamp <= endTimestamp;
  });

  const processedMessages = filteredMessages.map(msg => {
    const content = msg.content || '';
    const role = msg.role || '';

    // Count by role
    if (role === 'user') userCount++;
    if (role === 'assistant') assistantCount++;

    // Track models
    if (msg.model) modelsUsed.add(msg.model);
    if (msg.models && Array.isArray(msg.models)) {
      msg.models.forEach(model => modelsUsed.add(model));
    }

    // Estimate tokens (rough approximation)
    if (content) {
      totalTokens += Math.ceil(content.length / 4);
    }

    return {
      role: role,
      content: content,
      timestamp: msg.timestamp,
      time: msg.timestamp ? new Date(msg.timestamp * 1000).toISOString() : null,
      model: msg.model || (msg.models && msg.models[0]) || null
    };
  });

  // Sort messages by timestamp
  processedMessages.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

  return {
    messages: processedMessages,
    total: processedMessages.length, // Use filtered count, not original count
    user: userCount,
    assistant: assistantCount,
    tokens: totalTokens,
    modelsUsed: Array.from(modelsUsed)
  };
}

function analyzeChatData(chats) {
  const userStats = {};

  chats.forEach(chat => {
    const { user_id, user_name, user_email, chat_id, title, created_at, updated_at, chat_data } = chat;

    if (!userStats[user_id]) {
      userStats[user_id] = {
        user_id,
        user_name: user_name || 'Unknown',
        user_email: user_email || 'No email',
        totalChats: 0,
        totalMessages: 0,
        userMessages: 0,
        assistantMessages: 0,
        totalTokens: 0,
        modelsUsed: new Set(),
        lastActivity: 0,
        chats: []
      };
    }

    const userStat = userStats[user_id];
    userStat.totalChats++;

    try {
      const chatJson = typeof chat_data === 'string' ? JSON.parse(chat_data) : chat_data;

      // Process complete messages array
      const messages = chatJson.messages || [];
      const messageStats = processCompleteMessages(messages);

      userStat.totalMessages += messageStats.total;
      userStat.userMessages += messageStats.user;
      userStat.assistantMessages += messageStats.assistant;
      userStat.totalTokens += messageStats.tokens;

      // Track models used
      messageStats.modelsUsed.forEach(model => userStat.modelsUsed.add(model));
      if (chatJson.models && Array.isArray(chatJson.models)) {
        chatJson.models.forEach(model => userStat.modelsUsed.add(model));
      }

      // Update last activity
      if (updated_at > userStat.lastActivity) {
        userStat.lastActivity = updated_at;
      }

      // Store complete chat details with all messages
      userStat.chats.push({
        chat_id,
        title: title || chatJson.title || 'Untitled',
        messageCount: messageStats.total,
        messages: messageStats.messages,
        created_at: new Date(created_at * 1000).toISOString(),
        updated_at: new Date(updated_at * 1000).toISOString(),
        models: messageStats.modelsUsed,
        estimatedTokens: messageStats.tokens,
        assessment: null // Will be filled by AI assessment
      });

    } catch (error) {
      console.error(`Error processing chat ${chat_id}:`, error.message);
    }
  });

  // Convert sets to arrays for output
  Object.values(userStats).forEach(stat => {
    stat.modelsUsed = Array.from(stat.modelsUsed);
    stat.lastActivity = new Date(stat.lastActivity * 1000).toISOString();
  });

  return userStats;
}

function parseStructuredAssessment(text) {
  try {
    // Try to parse as JSON first
    return JSON.parse(text);
  } catch (error) {
    // If not JSON, try to extract structured data from text
    const assessment = {
      performance_comment: '',
      correction: '',
      improvement_areas: '',
      encouragement: ''
    };

    const lines = text.split('\n');
    let currentSection = '';

    for (const line of lines) {
      const trimmedLine = line.trim();

      if (trimmedLine.includes('PERFORMANCE COMMENT:')) {
        currentSection = 'performance_comment';
        assessment.performance_comment = trimmedLine.replace('PERFORMANCE COMMENT:', '').trim();
      } else if (trimmedLine.includes('CORRECTION:')) {
        currentSection = 'correction';
        assessment.correction = trimmedLine.replace('CORRECTION:', '').trim();
      } else if (trimmedLine.includes('IMPROVEMENT AREAS:')) {
        currentSection = 'improvement_areas';
        assessment.improvement_areas = trimmedLine.replace('IMPROVEMENT AREAS:', '').trim();
      } else if (trimmedLine.includes('ENCOURAGEMENT:')) {
        currentSection = 'encouragement';
        assessment.encouragement = trimmedLine.replace('ENCOURAGEMENT:', '').trim();
      } else if (currentSection && trimmedLine && !trimmedLine.match(/^\d+\./)) {
        // Append to current section if it's not a numbered item
        assessment[currentSection] += ' ' + trimmedLine;
      }
    }

    // Clean up each section
    Object.keys(assessment).forEach(key => {
      assessment[key] = assessment[key].trim();
    });

    return assessment;
  }
}

async function generateEducationalAssessment(chat) {
  // Extract user messages for assessment
  const userMessages = chat.messages
    .filter(msg => msg.role === 'user')
    .map(msg => msg.content)
    .join('\n\n');

  const prompt = `
As an English educational professional, please provide a comprehensive assessment of the following English conversation practice. Analyze the user's language usage and provide constructive feedback.

CONVERSATION TO ASSESS:
${userMessages}

Please provide your assessment as a JSON object with the following exact structure:

{
  "performance_comment": "2-3 sentences commenting on their overall English performance, noting strengths and general language use",
  "correction": "2-3 sentences with specific corrections if needed, focusing on grammar, vocabulary, or pronunciation issues. If no major issues, mention what was done well",
  "improvement_areas": "2-3 sentences suggesting specific areas for improvement, such as grammar structures, vocabulary expansion, or communication strategies",
  "encouragement": "2-3 sentences of positive encouragement and motivation for continued learning"
}

Please be constructive, specific, and encouraging in your feedback. Focus on the educational value and language learning aspects. Return ONLY the JSON object, no other text.
`;

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${deepseekApiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are an experienced English education professional specializing in ESL/EFL teaching. Provide constructive, specific, and encouraging feedback on English language usage. Always respond with valid JSON in the exact format requested.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 800,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse the structured assessment
    return parseStructuredAssessment(content);

  } catch (error) {
    console.error('Error generating educational assessment:', error.message);
    return {
      performance_comment: "Assessment unavailable",
      correction: "Assessment unavailable",
      improvement_areas: "Assessment unavailable",
      encouragement: "Assessment unavailable",
      error: error.message
    };
  }
}

function createUserChatJSON(user, chat, index) {
  // Create user directory if it doesn't exist
  const userDir = path.join(baseDir, user.user_id);
  if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir, { recursive: true });
  }

  const chatData = {
    user_info: {
      user_id: user.user_id,
      user_name: user.user_name,
      user_email: user.user_email
    },
    chat_info: {
      chat_id: chat.chat_id,
      title: chat.title,
      created_at: chat.created_at,
      updated_at: chat.updated_at,
      message_count: chat.messageCount,
      estimated_practice_time: `${Math.round(chat.estimatedTokens / 50)} minutes`,
      models_used: chat.models
    },
    conversation_history: chat.messages.map(msg => ({
      role: msg.role === 'user' ? 'student' : 'chatbot',
      content: msg.content,
      timestamp: msg.time,
      model: msg.model
    })),
    educational_assessment: chat.assessment || {
      performance_comment: "Assessment not available",
      correction: "Assessment not available",
      improvement_areas: "Assessment not available",
      encouragement: "Assessment not available"
    }
  };

  // Create safe filename from chat title
  const safeTitle = chat.title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
  const filename = `chat_${index + 1}_${safeTitle}.json`;
  const filePath = path.join(userDir, filename);

  fs.writeFileSync(filePath, JSON.stringify(chatData, null, 2));
  console.log(`  ✓ Created: ${filename}`);

  return filePath;
}

function createUserSummaryJSON(user) {
  const userDir = path.join(baseDir, user.user_id);
  if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir, { recursive: true });
  }

  const userSummary = {
    user_info: {
      user_id: user.user_id,
      user_name: user.user_name,
      user_email: user.user_email
    },
    summary: {
      total_chats: user.totalChats,
      total_messages: user.totalMessages,
      student_messages: user.userMessages,
      chatbot_messages: user.assistantMessages,
      total_tokens: user.totalTokens,
      models_used: user.modelsUsed,
      last_activity: user.lastActivity
    },
    chat_overview: user.chats.map((chat, index) => ({
      chat_id: chat.chat_id,
      title: chat.title,
      message_count: chat.messageCount,
      created_at: chat.created_at,
      assessment_status: chat.assessment ? "completed" : "pending",
      file_name: `chat_${index + 1}_${chat.title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50)}.json`
    }))
  };

  const summaryPath = path.join(userDir, 'user_summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(userSummary, null, 2));
  console.log(`  ✓ Created: user_summary.json`);

  return summaryPath;
}

async function processUserAssessmentsAndGenerateFiles(userStats) {
  console.log('\n=== PROCESSING USER ASSESSMENTS AND GENERATING FILES ===');
  console.log('='.repeat(60));

  let totalFilesCreated = 0;
  let processedUsers = 0;

  for (const userId in userStats) {
    const user = userStats[userId];
    console.log(`\nProcessing user: ${user.user_name}`);

    // Create user directory immediately
    const userDir = path.join(baseDir, user.user_id);
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }

    let userFilesCreated = 0;

    // Process each chat for this user
    for (const [index, chat] of user.chats.entries()) {
      console.log(`  Assessing chat ${index + 1}/${user.chats.length}: "${chat.title}"`);

      // Only assess chats with user messages
      const hasUserMessages = chat.messages.some(msg => msg.role === 'user');
      if (!hasUserMessages) {
        chat.assessment = {
          performance_comment: "No user messages available for assessment",
          correction: "No user messages available for assessment",
          improvement_areas: "No user messages available for assessment",
          encouragement: "No user messages available for assessment"
        };
      } else {
        try {
          chat.assessment = await generateEducationalAssessment(chat);
          console.log(`    ✓ Structured assessment completed`);

          // Add delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
          console.error(`    ✗ Failed to assess chat:`, error.message);
          chat.assessment = {
            performance_comment: "Assessment failed",
            correction: "Assessment failed",
            improvement_areas: "Assessment failed",
            encouragement: "Assessment failed",
            error: error.message
          };
        }
      }

      // Generate JSON file for this chat immediately after assessment
      createUserChatJSON(user, chat, index);
      userFilesCreated++;
      totalFilesCreated++;
    }

    // Generate user summary after all chats are processed
    createUserSummaryJSON(user);
    userFilesCreated++;
    totalFilesCreated++;

    processedUsers++;
    console.log(`✓ Completed user: ${user.user_name} (${userFilesCreated} files created)`);
  }

  return { totalFilesCreated, processedUsers };
}

function generateSummaryReport(userStats) {
  const users = Object.values(userStats);

  console.log('\n=== ENGLISH PRACTICE SUMMARY ===');
  console.log('='.repeat(45));

  users.forEach((user, index) => {
    console.log(`\n${index + 1}. Student: ${user.user_name}`);
    console.log(`   Practice Sessions: ${user.totalChats}`);
    console.log(`   Total Messages: ${user.totalMessages}`);
    console.log(`   Student Messages: ${user.userMessages}`);
    console.log(`   Chatbot Responses: ${user.assistantMessages}`);
    console.log(`   Last Active: ${user.lastActivity}`);

    // Show session previews with assessment status
    if (user.chats.length > 0) {
      console.log(`   Recent Practice Sessions:`);
      user.chats.slice(0, 3).forEach(chat => {
        const status = chat.assessment ? '✓ Assessed' : '⏳ Pending';
        console.log(`     - "${chat.title}" (${chat.messageCount} messages) [${status}]`);
      });
      if (user.chats.length > 3) {
        console.log(`     ... and ${user.chats.length - 3} more sessions`);
      }
    }
  });

  // Global summary
  console.log('\n' + '='.repeat(45));
  console.log('OVERALL PRACTICE SUMMARY:');
  console.log(`Total Active Students: ${users.length}`);
  console.log(`Total Practice Sessions: ${users.reduce((sum, user) => sum + user.totalChats, 0)}`);
  console.log(`Total Learning Interactions: ${users.reduce((sum, user) => sum + user.totalMessages, 0)}`);
  console.log(`Total Student Contributions: ${users.reduce((sum, user) => sum + user.userMessages, 0)}`);

  return users;
}

function createCompleteAnalysisReport(userStats, processingResults) {
  const completeReport = {
    generatedAt: new Date().toISOString(),
    timeRange: 'last_24_hours',
    assessmentType: 'english_educational_professional',
    baseDirectory: baseDir,
    processing_summary: {
      total_users: Object.keys(userStats).length,
      total_chats: Object.values(userStats).reduce((sum, user) => sum + user.chats.length, 0),
      total_files_created: processingResults.totalFilesCreated,
      processed_users: processingResults.processedUsers
    },
    users_overview: Object.values(userStats).map(user => ({
      user_id: user.user_id,
      user_name: user.user_name,
      total_chats: user.totalChats,
      total_messages: user.totalMessages,
      last_activity: user.lastActivity
    }))
  };

  const completeReportPath = path.join(baseDir, 'processing_overview.json');
  fs.writeFileSync(completeReportPath, JSON.stringify(completeReport, null, 2));
  console.log(`\n✓ Processing overview saved to: ${completeReportPath}`);

  return completeReportPath;
}

function printEmailInstructions(userStats) {
  console.log('\n\n=== EMAIL DISTRIBUTION INSTRUCTIONS ===');
  console.log('='.repeat(50));
  console.log('\nTo send reports via Google Email API:');
  console.log('\n1. Reports are organized in the following structure:');
  console.log(`   ${baseDir}/`);

  Object.values(userStats).forEach(user => {
    console.log(`   └── ${user.user_id}/ (${user.user_name})`);
    console.log(`       ├── user_summary.json`);
    user.chats.forEach((chat, index) => {
      const safeTitle = chat.title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
      console.log(`       ├── chat_${index + 1}_${safeTitle}.json`);
    });
  });

  console.log('\n2. For each user, you can:');
  console.log('   - Send the user_summary.json as a quick overview');
  console.log('   - Send individual chat JSON files for detailed analysis');
  console.log('   - Attach files or include JSON content in email body');

  console.log('\n3. Email template suggestions:');
  console.log('   Subject: Your English Practice Report - [Date]');
  console.log('   Body: Include personalized feedback and encourage continued practice');

  console.log('\n4. Total files available for distribution:');
  const totalChats = Object.values(userStats).reduce((sum, user) => sum + user.chats.length, 0);
  const totalUsers = Object.keys(userStats).length;
  console.log(`   - ${totalUsers} user folders`);
  console.log(`   - ${totalChats} individual chat reports`);
  console.log(`   - ${totalUsers} user summary files`);
}

async function main() {
  console.log('Starting English practice analysis...');
  console.log('Connecting to database...');

  try {
    // Test connection
    await pool.query('SELECT 1');
    console.log('Database connected successfully!');

    // Get recent chats with user info
    const chats = await getRecentChatsWithUserInfo();

    if (chats.length === 0) {
      console.log('No recent chat activity found in the last 24 hours.');
      return;
    }

    // Analyze data
    console.log('Analyzing practice data...');
    const userStats = analyzeChatData(chats);

    // Process assessments and generate files incrementally
    const processingResults = await processUserAssessmentsAndGenerateFiles(userStats);

    // Generate console summary
    generateSummaryReport(userStats);

    // Create processing overview (instead of complete analysis report)
    createCompleteAnalysisReport(userStats, processingResults);

    // Print email distribution instructions
    printEmailInstructions(userStats);

    console.log(`\n✅ All processing completed!`);
    console.log(`📁 Reports generated in: ${baseDir}`);
    console.log(`👥 Users processed: ${processingResults.processedUsers}`);
    console.log(`📄 Total files created: ${processingResults.totalFilesCreated}`);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
    console.log('\nDatabase connection closed.');
  }
}

// Run the analysis
main().catch(console.error);
