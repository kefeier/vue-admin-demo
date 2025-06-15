const express = require('express')
const cors = require('cors')
const app = express()

app.use(cors())
app.use(express.json())

const responses = {
  '你好': '你好！很高兴见到你。我是 AI 助手，有什么可以帮你的吗？',
  '你是谁': '我是一个 AI 助手，可以帮助你回答问题、提供建议或者陪你聊天。',
  '天气': '抱歉，我目前无法获取实时天气信息。不过我可以陪你聊聊天，或者回答其他问题。',
  '再见': '再见！如果还有问题随时来找我。',
  '谢谢': '不客气！很高兴能帮到你。',
  '默认': '抱歉，我可能没有完全理解你的问题。能请你换个方式描述一下吗？'
}

// 模拟流式响应
async function* streamResponse(message) {
  let reply = responses['默认']
  
  // 简单的关键词匹配
  for (const [key, value] of Object.entries(responses)) {
    if (message.includes(key)) {
      reply = value
      break
    }
  }

  // 将回复分成字符数组
  const chars = reply.split('')
  
  // 逐个字符发送
  for (const char of chars) {
    await new Promise(resolve => setTimeout(resolve, 50))
    yield char
  }
}

app.post('/api/chat/stream', async (req, res) => {
  const { message } = req.body

  // 设置 SSE 头部
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  try {
    for await (const char of streamResponse(message)) {
      res.write(`data: ${JSON.stringify({ char })}\n\n`)
    }
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`)
  } catch (error) {
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`)
  } finally {
    res.end()
  }
})

const PORT = 3000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
}) 