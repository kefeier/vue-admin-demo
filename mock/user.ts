import { MockMethod } from 'vite-plugin-mock'

const users = [
  {
    id: 1,
    name: '张三',
    email: 'zhangsan@example.com',
    role: '管理员',
    status: '启用',
    createTime: '2024-01-01'
  },
  {
    id: 2,
    name: '李四',
    email: 'lisi@example.com',
    role: '用户',
    status: '启用',
    createTime: '2024-01-02'
  },
  {
    id: 3,
    name: '王五',
    email: 'wangwu@example.com',
    role: '用户',
    status: '禁用',
    createTime: '2024-01-03'
  }
]

export default [
  {
    url: '/api/users',
    method: 'get',
    response: ({ query }) => {
      const { page = 1, pageSize = 10 } = query
      const start = (page - 1) * pageSize
      const end = start + pageSize
      const list = users.slice(start, end)
      
      return {
        code: 200,
        data: {
          list,
          total: users.length
        }
      }
    }
  }
] as MockMethod[]