/**
 * AI Service for Tasker-v2
 * This service handles task urgency analysis and smart selection.
 * In a real-world app, these would call an LLM API (like Gemini).
 */

export async function analyzeTaskUrgency(task) {
    // Simulate AI Analysis
    console.log('AI analyzing urgency for:', task.title);

    // Logic mock: Keywords that increase urgency
    const urgentKeywords = ['urgent', 'important', 'deadline', 'asap', 'client', 'fix'];
    let score = 30; // base score

    const text = (task.title + ' ' + (task.description || '')).toLowerCase();

    urgentKeywords.forEach(word => {
        if (text.includes(word)) score += 15;
    });

    if (task.priority === 0) score += 20; // High priority boost

    return Math.min(score, 100);
}

export async function smartPickTasks(backlog) {
    // Simulate AI Selection
    console.log('AI picking top 3 tasks from backlog of size:', backlog.length);

    // Logic mock: Sort by priority and then by "AI Score" (simulated)
    return backlog
        .map(t => ({
            ...t,
            aiScore: Math.random() * 100 + (t.priority === 0 ? 50 : 0) // Priority boost
        }))
        .sort((a, b) => b.aiScore - a.aiScore)
        .slice(0, 3)
        .map(t => t.id);
}
