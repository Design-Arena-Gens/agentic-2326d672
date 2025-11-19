'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'assistant' | 'user'
  content: string
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const startQuestionnaire = async () => {
    setHasStarted(true)
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [] }),
      })

      const data = await response.json()

      if (data.message) {
        setMessages([{ role: 'assistant', content: data.message }])
      }

      if (data.isComplete) {
        setIsComplete(true)
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages([{
        role: 'assistant',
        content: 'Sorry, there was an error starting the questionnaire. Please refresh and try again.'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMessage }]
        }),
      })

      const data = await response.json()

      if (data.message) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.message }])
      }

      if (data.isComplete) {
        setIsComplete(true)
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, there was an error processing your response. Please try again.'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const restart = () => {
    setMessages([])
    setIsComplete(false)
    setHasStarted(false)
    setInput('')
  }

  return (
    <div className="container">
      <div className="header">
        <h1>🌿 Garden Style Questionnaire</h1>
        <p>Discover your perfect garden with AI-powered guidance</p>
      </div>

      {!hasStarted ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '30px' }}>
            Let's explore your garden dreams together. I'll ask you questions to understand
            your style preferences, plant choices, how you use your garden, and the atmosphere
            you want to create.
          </p>
          <button className="start-button" onClick={startQuestionnaire}>
            Start Questionnaire
          </button>
        </div>
      ) : (
        <>
          <div className="chat-container">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.role}`}>
                <div dangerouslySetInnerHTML={{ __html: message.content.replace(/\n/g, '<br>') }} />
              </div>
            ))}
            {isLoading && (
              <div className="message assistant">
                <div className="loading"></div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {!isComplete && (
            <div className="input-container">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your answer here..."
                disabled={isLoading}
              />
              <button onClick={sendMessage} disabled={isLoading || !input.trim()}>
                Send
              </button>
            </div>
          )}

          {isComplete && (
            <button className="restart-button" onClick={restart}>
              Start New Questionnaire
            </button>
          )}
        </>
      )}
    </div>
  )
}
