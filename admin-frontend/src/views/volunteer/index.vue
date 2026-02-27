<template>
  <div class="volunteer-container">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>志愿者管理与活动反馈</span>
          <el-button type="primary" size="small" @click="fetchData">刷新数据</el-button>
        </div>
      </template>

      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="feedback_id" label="反馈ID" width="100" />
        <el-table-column prop="user_name" label="志愿者姓名" width="120" />
        <el-table-column prop="activity_name" label="参与活动" width="200" />
        <el-table-column prop="personal_gain_score" label="个人收获评分" width="150">
          <template #default="scope">
            <el-rate :model-value="scope.row.personal_gain_score" disabled show-score text-color="#ff9900" />
          </template>
        </el-table-column>
        <el-table-column prop="organization_score" label="组织协调评分" width="150">
          <template #default="scope">
            <el-rate :model-value="scope.row.organization_score" disabled show-score text-color="#ff9900" />
          </template>
        </el-table-column>
        <el-table-column prop="satisfaction_score" label="总体满意度" width="150">
          <template #default="scope">
            <el-rate :model-value="scope.row.satisfaction_score" disabled show-score text-color="#ff9900" />
          </template>
        </el-table-column>
        <el-table-column prop="improvement_suggestion" label="改进建议" show-overflow-tooltip />
        <el-table-column prop="submit_time" label="提交时间" width="180" />
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
    const res = await axios.get('/admin/volunteers', {
      params: {
        skip: (currentPage.value - 1) * pageSize.value,
        limit: pageSize.value
      }
    })
    tableData.value = res.data.data
    total.value = res.data.total
  } catch (error) {
    ElMessage.error('加载志愿者反馈记录失败')
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
.volunteer-container {
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
