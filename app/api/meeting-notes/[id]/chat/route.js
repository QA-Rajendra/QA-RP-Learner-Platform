import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import MeetingNote from '@/models/MeetingNote';
import mongoose from 'mongoose';

export async function POST(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid meeting note ID' },
        { status: 400 }
      );
    }

    const note = await MeetingNote.findById(id);
    if (!note) {
      return NextResponse.json(
        { success: false, error: 'Meeting note not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { message } = body;

    if (!message || !message.trim()) {
      return NextResponse.json(
        { success: false, error: 'Message content is required' },
        { status: 400 }
      );
    }

    const userMessage = {
      role: 'user',
      content: message.trim(),
      timestamp: new Date(),
    };

    // Synthesize context-aware QA intelligence based on the meeting note
    const lower = message.toLowerCase();
    let reply = '';

    if (lower.includes('action item') || lower.includes('todo') || lower.includes('next step')) {
      reply = `### 📋 Extracted Action Items for "${note.title}":\n\n` +
        `1. **Next Immediate Step**: ${note.summary?.nextStep || 'Review coverage matrix'}\n` +
        `2. **Tooling Enforcement**: ${note.summary?.toolingDecision || 'Execute scheduled regression runs'}\n` +
        `3. **Key Deliverables**:\n` +
        (note.summary?.coverageGoals?.map((g, i) => `   - [ ] ${g}`).join('\n') || '   - [ ] Implement automated test cases');
    } else if (lower.includes('jira') || lower.includes('ticket') || lower.includes('user story')) {
      reply = `### 🎫 Generated Jira QA Story:\n\n` +
        `**Summary**: [QA-${note.topic?.toUpperCase()}] Test Coverage for ${note.title}\n` +
        `**Issue Type**: QA Test Execution / Technical Task\n` +
        `**Priority**: High\n` +
        `**Description**:\n` +
        `*Purpose*: ${note.summary?.purpose}\n\n` +
        `*Acceptance Criteria*:\n` +
        (note.summary?.coverageGoals?.map((g) => `* [x] Verify ${g}`).join('\n') || '') +
        `\n\n*Tooling Constraint*: ${note.summary?.toolingDecision}`;
    } else if (lower.includes('test case') || lower.includes('scenario') || lower.includes('matrix')) {
      reply = `### 🧪 Recommended Test Cases for "${note.topic}":\n\n` +
        `1. **Positive / Smoke Flow**: Verify happy path for ${note.summary?.coverageGoals?.[0] || 'primary journey'}\n` +
        `2. **Cross-Browser Parity**: Validate rendering & assertions on Chromium, Firefox, and WebKit viewports.\n` +
        `3. **Resilience & Error Handling**: Test retry behavior and graceful failure messaging.\n` +
        `4. **CI Parallel Execution**: Run ${note.topic} specs in parallel with artifact trace capture.`;
    } else {
      reply = `Based on the **${note.title}** discussion (${note.topic}):\n\n` +
        `• **Purpose**: ${note.summary?.purpose}\n` +
        `• **Core Strategy**: ${note.summary?.toolingDecision}\n` +
        `• **Next Steps**: ${note.summary?.nextStep}\n\n` +
        `Feel free to ask me to generate a test matrix, extract Jira tickets, or summarize the transcript!`;
    }

    const assistantMessage = {
      role: 'assistant',
      content: reply,
      timestamp: new Date(),
    };

    const updatedHistory = [...(note.chatHistory || []), userMessage, assistantMessage];
    note.chatHistory = updatedHistory;
    await note.save();

    return NextResponse.json({
      success: true,
      reply: assistantMessage,
      chatHistory: updatedHistory,
    });
  } catch (error) {
    console.error('Error handling meeting note chat:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process chat' },
      { status: 500 }
    );
  }
}
