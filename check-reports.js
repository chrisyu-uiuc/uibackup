const fs = require('fs-extra');
const path = require('path');

async function checkReports() {
    // Calculate yesterday's date (same logic as both files)
    const today = new Date();
    today.setDate(today.getDate() - 1);
    const reportDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    console.log('📊 English Practice Reports Status Check');
    console.log('='.repeat(50));
    console.log(`📅 Report Date: ${reportDate} (Yesterday)`);
    
    const reportsDir = path.join(__dirname, 'reports', reportDate);
    const dirExists = await fs.pathExists(reportsDir);
    
    console.log(`📂 Reports Directory: ${dirExists ? '✅ EXISTS' : '❌ NOT FOUND'}`);
    console.log(`📍 Path: ${reportsDir}`);
    
    if (dirExists) {
        try {
            const items = await fs.readdir(reportsDir);
            const userDirs = [];
            
            for (const item of items) {
                const itemPath = path.join(reportsDir, item);
                const stats = await fs.stat(itemPath);
                
                if (stats.isDirectory()) {
                    const summaryPath = path.join(itemPath, 'user_summary.json');
                    if (await fs.pathExists(summaryPath)) {
                        userDirs.push(item);
                    }
                }
            }
            
            console.log(`\n👥 Students with Reports: ${userDirs.length}`);
            
            if (userDirs.length > 0) {
                console.log('\n📋 Available Reports:');
                for (let i = 0; i < userDirs.length; i++) {
                    const userId = userDirs[i];
                    const summaryPath = path.join(reportsDir, userId, 'user_summary.json');
                    
                    try {
                        const summary = await fs.readJson(summaryPath);
                        console.log(`   ${i + 1}. ${summary.user_info.user_name} (${summary.user_info.user_email})`);
                        console.log(`      📊 ${summary.summary.total_chats} chats, ${summary.summary.student_messages} messages`);
                    } catch (error) {
                        console.log(`   ${i + 1}. ${userId} (Error reading summary)`);
                    }
                }
                
                console.log('\n🚀 Ready to Send Emails!');
                console.log('💡 Run: node email-sender.js');
            } else {
                console.log('\n⚠️  No valid student reports found');
            }
        } catch (error) {
            console.log(`\n❌ Error reading directory: ${error.message}`);
        }
    } else {
        console.log('\n📝 To Generate Reports:');
        console.log('💡 Run: node generate-reports.js');
        console.log('   This will create reports for yesterday\'s data');
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('🔄 Complete Workflow:');
    console.log('1. node generate-reports.js  # Creates yesterday\'s reports');
    console.log('2. node email-sender.js      # Sends emails for yesterday\'s reports');
    console.log('3. Both use the same date: ' + reportDate);
}

checkReports().catch(console.error);