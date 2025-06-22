<template>
  <div style="width: 400px;">
    <el-popover
      placement="bottom-start"
      width="300"
      trigger="click"
      v-model:visible="popoverVisible"
    >
      <div>
        <el-input
          v-model="search"
          placeholder="搜索标签"
          size="small"
          @input="filterTree"
          clearable
        />
        <el-tree
          :data="filteredTreeData"
          :props="defaultProps"
          show-checkbox
          node-key="id"
          ref="treeRef"
          :default-checked-keys="selectedKeys"
          @check="handleCheck"
          :filter-node-method="filterNode"
        />
      </div>
      <template #reference>
        <el-input
          v-model="inputValue"
          placeholder="请选择标签"
          readonly
          @focus="popoverVisible = true"
        >
          <template #suffix>
            <el-icon><arrow-down /></el-icon>
          </template>
        </el-input>
      </template>
    </el-popover>
    <div style="margin-top: 8px;">
      <el-tag
        v-for="item in selectedNodes"
        :key="item.id"
        closable
        @close="removeTag(item)"
        style="margin-right: 4px;"
      >
        {{ item.label }}
      </el-tag>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ArrowDown } from '@element-plus/icons-vue'

const treeData = ref([
  {
    id: 1,
    label: '理科',
    children: [
      { id: 2, label: '数学' },
      { id: 3, label: '物理' }
    ]
  },
  {
    id: 4,
    label: '文科',
    children: [
      { id: 5, label: '语文' }
    ]
  }
])

const defaultProps = {
  children: 'children',
  label: 'label'
}

const popoverVisible = ref(false)
const search = ref('')
const treeRef = ref()
const selectedKeys = ref([])
const selectedNodes = ref([])

const inputValue = computed(() =>
  selectedNodes.value.map(n => n.label).join(', ')
)

const filteredTreeData = ref([...treeData.value])

function filterTree() {
  if (!search.value) {
    filteredTreeData.value = [...treeData.value]
    treeRef.value && treeRef.value.filter('')
    return
  }
  treeRef.value && treeRef.value.filter(search.value)
}

function filterNode(value, data) {
  if (!value) return true
  return data.label.includes(value)
}

function handleCheck(checkedNodes, checkedKeys) {
  selectedKeys.value = checkedKeys
  selectedNodes.value = checkedNodes
}

function removeTag(node) {
  const idx = selectedKeys.value.indexOf(node.id)
  if (idx > -1) {
    selectedKeys.value.splice(idx, 1)
    selectedNodes.value = selectedNodes.value.filter(n => n.id !== node.id)
    treeRef.value.setCheckedKeys(selectedKeys.value)
  }
}

// 保持已选节点和 keys 同步
watch(selectedKeys, (val) => {
  selectedNodes.value = treeRef.value.getCheckedNodes()
})
</script>
