import { MockMethod } from 'vite-plugin-mock'

const responses = {
  '你好': '你好！很高兴见到你。我是 AI 助手，有什么可以帮你的吗？',
  '你是谁': '我是一个 AI 助手，可以帮助你回答问题、提供建议或者陪你聊天。',
  '天气': '抱歉，我目前无法获取实时天气信息。不过我可以陪你聊聊天，或者回答其他问题。',
  '再见': '再见！如果还有问题随时来找我。',
  '谢谢': '不客气！很高兴能帮到你。',
  '默认': '抱歉，我可能没有完全理解你的问题。能请你换个方式描述一下吗？'
}

export default [
  {
    url: '/api/chat',
    method: 'post',
    response: ({ body }) => {
      const { message } = body
      let reply = responses['默认']
      
      // 简单的关键词匹配
      for (const [key, value] of Object.entries(responses)) {
        if (message.includes(key)) {
          reply = value
          break
        }
      }
      
      return {
        code: 200,
        data: {
          reply
        }
      }
    }
  }
] as MockMethod[] 