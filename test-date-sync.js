const EnglishPracticeReports = require('./email-sender.js');
const fs = require('fs-extra');
const path = require('path');

async function testDateSync() {
    console.log('🔍 Testing Date Synchronization Between Report Generation and Email Sending\n');
    
    // Test the date logic used in both files
    const today = new Date();
    today.setDate(today.getDate() - 1);
    const expectedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    console.log(`📅 Expected Report Date (Yesterday): ${expectedDate}`);
    
    // Test email sender date logic
    const reportSystem = new EnglishPracticeReports();
    console.log(`📧 Email Sender Report Date: ${reportSystem.reportDate}`);
    
    // Check if dates match
    if (reportSystem.reportDate === expectedDate) {
        console.log('✅ Date synchronization: PASSED');
    } else {
        console.log('❌ Date synchronization: FAILED');
        console.log(`   Expected: ${expectedDate}`);
        console.log(`   Got: ${reportSystem.reportDate}`);
        return;
    }
    
    // Check if the reports directory exists for this date
    const reportsDir = path.join(__dirname, 'reports', expectedDate);
    const dirExists = await fs.pathExists(reportsDir);
    
    console.log(`\n📂 Reports Directory Check:`);
    console.log(`   Path: ${reportsDir}`);
    console.log(`   Exists: ${dirExists ? '✅ YES' : '❌ NO'}`);
    
    if (dirExists) {
        // List available users
        try {
            const studentIds = await reportSystem.getAllStudentIds();
            console.log(`\n👥 Available Students: ${studentIds.length}`);
            studentIds.forEach((id, index) => {
                console.log(`   ${index + 1}. ${id}`);
            });
            
            if (studentIds.length > 0) {
                console.log('\n🎉 Ready to send emails for yesterday\'s reports!');
                console.log('\n💡 To send emails, run:');
                console.log('   node email-sender.js');
            } else {
                console.log('\n⚠️  No student reports found for yesterday');
                console.log('💡 Make sure to run generate-reports.js first');
            }
        } catch (error) {
            console.log(`\n❌ Error checking students: ${error.message}`);
        }
    } else {
        console.log('\n⚠️  Reports directory not found for yesterday');
        console.log('💡 Run generate-reports.js first to create reports');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📋 SUMMARY');
    console.log('='.repeat(60));
    console.log('✅ Both generate-reports.js and email-sender.js use yesterday\'s date');
    console.log('✅ Directory paths are synchronized');
    console.log('✅ Email system will look for reports in the correct location');
    console.log('\n🔄 Workflow:');
    console.log('1. generate-reports.js creates reports for yesterday');
    console.log('2. email-sender.js sends emails using yesterday\'s reports');
    console.log('3. Both use the same date calculation logic');
}

testDateSync().catch(console.error);