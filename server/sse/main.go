package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gin-contrib/cors"
)

func main() {
	router := gin.Default()

	// 配置 CORS 中间件
	router.Use(cors.Default())

	// 定义响应映射
	responses := map[string]string{
		"你好": "你好！很高兴见到你。我是 AI 助手，有什么可以帮你的吗？",
		"你是谁": "我是一个 AI 助手，可以帮助你回答问题、提供建议或者陪你聊天。",
		"天气": "抱歉，我目前无法获取实时天气信息。不过我可以陪你聊聊天，或者回答其他问题。",
		"再见": "再见！如果还有问题随时来找我。",
		"谢谢": "不客气！很高兴能帮到你。",
		"默认": "抱歉，我可能没有完全理解你的问题。能请你换个方式描述一下吗？",
	}

	// 流式响应模拟
	streamResponse := func(message string) string {
		reply := responses["默认"]
		
		// 简单的关键词匹配
		for key, value := range responses {
			if strings.Contains(message, key) {
				reply = value
				break
			}
		}
		return reply
	}

	// SSE 流式聊天端点
	router.POST("/api/chat/stream", func(c *gin.Context) {
		// 解析请求体
		var requestBody struct {
			Message string `json:"message"`
		}
		if err := c.BindJSON(&requestBody); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "无效请求"})
			return
		}

		// 获取响应内容
		reply := streamResponse(requestBody.Message)
		
		// 设置 SSE 头部
		c.Writer.Header().Set("Content-Type", "text/event-stream")
		c.Writer.Header().Set("Cache-Control", "no-cache")
		c.Writer.Header().Set("Connection", "keep-alive")
		c.Writer.Flush()

		// 模拟流式响应
		for _, char := range reply {
			// 构造事件数据
			eventData, _ := json.Marshal(gin.H{"char": string(char)})
			
			// 发送事件
			fmt.Fprintf(c.Writer, "data: %s\n\n", eventData)
			c.Writer.Flush()
			
			// 等待 50 毫秒
			time.Sleep(50 * time.Millisecond)
		}

		// 发送结束事件
		doneData, _ := json.Marshal(gin.H{"done": true})
		fmt.Fprintf(c.Writer, "data: %s\n\n", doneData)
		c.Writer.Flush()
	})

	// 启动服务器
	port := 3000
	router.Run(fmt.Sprintf(":%d", port))
	fmt.Printf("Server is running on port %d\n", port)
}