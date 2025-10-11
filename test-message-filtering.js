// Test script to verify message date filtering logic
// Create timestamps for yesterday (Oct 10, 2025) and 2 days ago (Oct 8, 2025)
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);

const twoDaysAgo = new Date();
twoDaysAgo.setDate(twoDaysAgo.getDate() - 3);

const testMessages = [
    {
        role: 'user',
        content: 'hi',
        timestamp: Math.floor(new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 17, 54, 0).getTime() / 1000) // Yesterday 17:54
    },
    {
        role: 'assistant',
        content: 'Hi there! Which Hong Kong festival is your favourite?',
        timestamp: Math.floor(new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 17, 54, 30).getTime() / 1000) // Yesterday 17:54:30
    },
    {
        role: 'user',
        content: 'My favourite festival is the Mid-Autumn Festival. I love eating mooncakes!',
        timestamp: Math.floor(new Date(twoDaysAgo.getFullYear(), twoDaysAgo.getMonth(), twoDaysAgo.getDate(), 11, 6, 0).getTime() / 1000) // 3 days ago - should be filtered out
    },
    {
        role: 'assistant',
        content: 'That\'s a great choice! The Mid-Autumn Festival is very special.',
        timestamp: Math.floor(new Date(twoDaysAgo.getFullYear(), twoDaysAgo.getMonth(), twoDaysAgo.getDate(), 11, 6, 30).getTime() / 1000) // 3 days ago - should be filtered out
    }
];

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

    console.log(`Filtering messages for yesterday: ${yesterday.toDateString()}`);
    console.log(`Timestamp range: ${startTimestamp} to ${endTimestamp}`);
    console.log(`Date range: ${yesterdayStart.toISOString()} to ${yesterdayEnd.toISOString()}`);

    // Filter messages to only include those from yesterday, then process them
    const filteredMessages = messages.filter(msg => {
        if (!msg.timestamp) return false;
        const isInRange = msg.timestamp >= startTimestamp && msg.timestamp <= endTimestamp;
        const msgDate = new Date(msg.timestamp * 1000);
        console.log(`Message from ${msgDate.toISOString()}: ${isInRange ? 'INCLUDED' : 'FILTERED OUT'}`);
        return isInRange;
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

console.log('Testing message filtering...\n');
console.log('Original messages:', testMessages.length);

const result = processCompleteMessages(testMessages);

console.log('\nFiltered results:');
console.log('Total messages after filtering:', result.total);
console.log('User messages:', result.user);
console.log('Assistant messages:', result.assistant);

console.log('\nFiltered messages:');
result.messages.forEach((msg, index) => {
    console.log(`${index + 1}. [${msg.role}] ${msg.content} (${msg.time})`);
});