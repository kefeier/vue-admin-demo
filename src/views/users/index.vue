<template>
  <div class="user-list">
    <el-table :data="userList" style="width: 100%">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="姓名" width="120" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="role" label="角色" width="120" />
      <el-table-column prop="status" label="状态" width="100" />
      <el-table-column prop="createTime" label="创建时间" width="180" />
    </el-table>
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
        layout="total, sizes, prev, pager, next"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { ElTable, ElTableColumn, ElPagination } from 'element-plus'
import axios from 'axios'

interface User {
  id: number
  name: string
  email: string
  role: string
  status: string
  createTime: string
}

const userList = ref<User[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

const fetchUsers = async () => {
  try {
    const response = await axios.get('/api/users', {
      params: {
        page: currentPage.value,
        pageSize: pageSize.value
      }
    })
    userList.value = response.data.data.list
    total.value = response.data.data.total
  } catch (error) {
    console.error('获取用户列表失败:', error)
  }
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchUsers()
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
  fetchUsers()
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.user-list {
  padding: 20px;
}
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 