<template>
  <div class="chat-container">
    <div class="chat-messages" ref="messagesRef">
      <div v-for="(message, index) in messages" :key="index" 
           :class="['message', message.role === 'user' ? 'user-message' : 'ai-message']">
        <el-avatar :size="40" :icon="message.role === 'user' ? 'User' : 'Service'" />
        <div class="message-content">
          <div class="message-text">{{ message.content }}</div>
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
}

const messages = ref<Message[]>([])
const inputMessage = ref('')
const loading = ref(false)
const messagesRef = ref<HTMLElement>()

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
    const response = await axios.post('/api/chat', {
      message: userMessage.content
    })
    
    const aiMessage: Message = {
      role: 'ai',
      content: response.data.data.reply,
      time: formatTime()
    }
    
    messages.value.push(aiMessage)
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
</style> 