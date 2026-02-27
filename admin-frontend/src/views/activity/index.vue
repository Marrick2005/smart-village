<template>
  <div class="activity-container">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>公益活动管理</span>
          <el-button type="primary" size="small" @click="fetchData">刷新数据</el-button>
        </div>
      </template>

      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="activity_id" label="活动ID" width="100" />
        <el-table-column prop="activity_name" label="活动名称" width="200" />
        <el-table-column prop="activity_type" label="活动类型" width="150">
          <template #default="scope">
            <el-tag>{{ scope.row.activity_type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="village" label="开展村庄" width="150" />
        <el-table-column prop="total_budget" label="活动经费 (元)" width="150">
          <template #default="scope">
            <span style="color: #f56c6c; font-weight: bold;">¥{{ scope.row.total_budget }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="activity_description" label="活动说明" show-overflow-tooltip />
        <el-table-column prop="start_time" label="开始时间" width="180" />
        <el-table-column prop="end_time" label="结束时间" width="180" />
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          background
          layout="total, prev, pager, next"
          :total="total"
          v-model:current-page="currentPage"
          :page-size="pageSize"
          @current-change="handlePageChange"
          class="mt-4"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)

const fetchData = async () => {
  loading.value = true
  try {
    const res = await axios.get('/admin/activities', {
      params: {
        skip: (currentPage.value - 1) * pageSize.value,
        limit: pageSize.value
      }
    })
    tableData.value = res.data.data
    total.value = res.data.total
  } catch (error) {
    ElMessage.error('加载活动列表失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})

const handlePageChange = (page) => {
  currentPage.value = page
  fetchData()
}
</script>

<style scoped>
.activity-container {
  width: 100%;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
