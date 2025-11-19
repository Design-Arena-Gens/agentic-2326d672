import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

interface Message {
  role: 'assistant' | 'user'
  content: string
}

const SYSTEM_PROMPT = `You are a knowledgeable and friendly garden design consultant conducting an interactive questionnaire. Your goal is to understand the client's garden preferences through natural conversation.

You need to gather information about:
1. Garden style preferences (modern, cottage, formal, wild, Mediterranean, Japanese, etc.)
2. Plant preferences (flowers, vegetables, herbs, trees, shrubs, etc.)
3. How they use their garden (entertaining, relaxation, growing food, children's play, wildlife, etc.)
4. The feelings and atmosphere they want to create (peaceful, vibrant, romantic, productive, etc.)

Guidelines:
- Ask ONE question at a time to keep the conversation natural and engaging
- Build upon their previous answers to ask relevant follow-up questions
- Show enthusiasm for their preferences
- Ask open-ended questions that encourage detailed responses
- Occasionally reflect back what you've learned to ensure understanding
- Use specific examples to help them articulate their vision
- After gathering comprehensive information (typically 8-12 exchanges), create a detailed summary

When you have enough information, provide a comprehensive summary that includes:
- Their preferred garden style(s)
- Specific plants they mentioned or that would suit them
- How they plan to use the garden
- The atmosphere and feelings they want to create
- Recommendations based on their answers

Start the questionnaire at the beginning, then end with "QUESTIONNAIRE_COMPLETE" on a new line when you've provided the final summary.`

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()

    const conversationHistory: Array<{role: 'user' | 'assistant', content: string}> = []

    messages.forEach((msg: Message) => {
      conversationHistory.push({
        role: msg.role,
        content: msg.content
      })
    })

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: conversationHistory.length > 0 ? conversationHistory : [
        { role: 'user', content: 'Hello, I\'d like to start the garden questionnaire.' }
      ],
    })

    const assistantMessage = response.content[0].type === 'text'
      ? response.content[0].text
      : ''

    const isComplete = assistantMessage.includes('QUESTIONNAIRE_COMPLETE')
    const cleanMessage = assistantMessage.replace('QUESTIONNAIRE_COMPLETE', '').trim()

    return NextResponse.json({
      message: cleanMessage,
      isComplete,
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
