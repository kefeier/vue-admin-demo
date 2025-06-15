<template>
  <div class="chat-container">
    <div class="chat-header">
      <el-switch
        v-model="useTypewriter"
        active-text="打字机效果"
        inactive-text="直接显示"
      />
    </div>
    <div class="chat-messages" ref="messagesRef">
      <div v-for="(message, index) in messages" :key="index" 
           :class="['message', message.role === 'user' ? 'user-message' : 'ai-message']">
        <el-avatar :size="40" :icon="message.role === 'user' ? 'User' : 'Service'" />
        <div class="message-content">
          <div class="message-text">
            <template v-if="message.role === 'ai' && message.isTyping">
              {{ message.displayContent }}<span class="cursor">|</span>
            </template>
            <template v-else>
              {{ message.content }}
            </template>
          </div>
          <div class="message-time">{{ message.time }}</div>
        </div>
      </div>
    </div>
    <div class="chat-input">
      <el-input
        v-model="inputMessage"
        type="textarea"
        :rows="3"
        placeholder="请输入您的问题..."
        @keyup.enter.ctrl="sendMessage"
      />
      <el-button type="primary" @click="sendMessage" :loading="loading">
        发送
      </el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, nextTick } from 'vue'
import { User, Service } from '@element-plus/icons-vue'
import axios from 'axios'

interface Message {
  role: 'user' | 'ai'
  content: string
  time: string
  isTyping?: boolean
  displayContent?: string
}

const messages = ref<Message[]>([])
const inputMessage = ref('')
const loading = ref(false)
const messagesRef = ref<HTMLElement>()
const useTypewriter = ref(true)

const formatTime = () => {
  const now = new Date()
  return now.toLocaleTimeString()
}

const scrollToBottom = async () => {
  await nextTick()
  if (messagesRef.value) {
    messagesRef.value.scrollTop = messagesRef.value.scrollHeight
  }
}

const sendMessage = async () => {
  if (!inputMessage.value.trim() || loading.value) return

  const userMessage: Message = {
    role: 'user',
    content: inputMessage.value,
    time: formatTime()
  }
  
  messages.value.push(userMessage)
  inputMessage.value = ''
  await scrollToBottom()
  
  loading.value = true
  try {
    if (useTypewriter.value) {
      // 使用 SSE 流式响应
      const aiMessage: Message = {
        role: 'ai',
        content: '',
        time: formatTime(),
        isTyping: true,
        displayContent: ''
      }
      messages.value.push(aiMessage)

      const response = await fetch('http://localhost:3000/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage.content })
      })

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = JSON.parse(line.slice(6))
              
              if (data.error) {
                throw new Error(data.error)
              }
              
              if (data.done) {
                aiMessage.isTyping = false
                aiMessage.content = aiMessage.displayContent || ''
                delete aiMessage.displayContent
                break
              }
              
              if (data.char) {
                aiMessage.displayContent = (aiMessage.displayContent || '') + data.char
                await scrollToBottom()
              }
            }
          }
        }
      }
    } else {
      // 使用普通响应
      const response = await axios.post('/api/chat', {
        message: userMessage.content,
        useTypewriter: false
      })
      
      const aiMessage: Message = {
        role: 'ai',
        content: response.data.data.reply,
        time: formatTime()
      }
      
      messages.value.push(aiMessage)
    }
    
    await scrollToBottom()
  } catch (error) {
    console.error('发送消息失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  messages.value.push({
    role: 'ai',
    content: '你好！我是 AI 助手，有什么可以帮你的吗？',
    time: formatTime()
  })
})
</script>

<style scoped>
.chat-container {
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
  padding: 20px;
  background-color: #f5f7fa;
}

.chat-header {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  margin-bottom: 20px;
}

.message {
  display: flex;
  margin-bottom: 20px;
  gap: 12px;
}

.message-content {
  flex: 1;
}

.message-text {
  padding: 12px;
  border-radius: 8px;
  max-width: 80%;
  word-break: break-word;
}

.user-message {
  flex-direction: row-reverse;
}

.user-message .message-text {
  background-color: #409eff;
  color: white;
}

.ai-message .message-text {
  background-color: #f2f6fc;
}

.message-time {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.chat-input {
  display: flex;
  gap: 12px;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
}

.chat-input .el-button {
  align-self: flex-end;
}

.cursor {
  display: inline-block;
  width: 2px;
  height: 1em;
  background-color: #409eff;
  margin-left: 2px;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
</style> 