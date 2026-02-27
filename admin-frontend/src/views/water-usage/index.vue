<template>
  <div class="water-usage-container">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>用水调度审批</span>
          <el-button type="primary" size="small" @click="fetchData">刷新数据</el-button>
        </div>
      </template>

      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="申请编号" width="100" />
        <el-table-column prop="applicant" label="申请人" width="120" />
        <el-table-column prop="village" label="所属村庄" width="150" />
        <el-table-column prop="crop" label="所种作物" width="120" />
        <el-table-column prop="amount" label="申请金额/时长 (小时)" width="180" />
        <el-table-column prop="reason" label="申请理由" />
        <el-table-column prop="date" label="申请时间" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button 
              v-if="scope.row.status === 0" 
              size="small" 
              type="success" 
              @click="handleApprove(scope.row)">
              通过
            </el-button>
            <el-button 
              v-if="scope.row.status === 0" 
              size="small" 
              type="danger" 
              @click="handleReject(scope.row)">
              拒绝
            </el-button>
          </template>
        </el-table-column>
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
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)

const fetchData = async () => {
  loading.value = true
  try {
    const res = await axios.get('/farming/water-usage/list', {
      params: {
        page: currentPage.value,
        page_size: pageSize.value
      }
    })
    tableData.value = res.data.data
    total.value = res.data.total
  } catch (error) {
    ElMessage.error('加载用水申请数据失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

fetchData()

const getStatusType = (status) => {
  const types = { 0: 'warning', 1: 'success', 2: 'danger' }
  return types[status]
}

const getStatusText = (status) => {
  const texts = { 0: '待审批', 1: '已通过', 2: '已拒绝' }
  return texts[status]
}

const handlePageChange = (page) => {
  currentPage.value = page
  fetchData()
}

const handleApprove = async (row) => {
  try {
    await ElMessageBox.confirm(`确认通过 ${row.applicant} 的用水申请吗？`, '审批确认', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'success' })
    await axios.post(`/farming/water-usage/${row.id}/status`, { status: 1 })
    row.status = 1
    ElMessage({ type: 'success', message: '已通过申请' })
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

const handleReject = async (row) => {
  try {
    const { value } = await ElMessageBox.prompt('请输入拒绝理由', '拒绝申请', { confirmButtonText: '确定', cancelButtonText: '取消' })
    await axios.post(`/farming/water-usage/${row.id}/status`, { status: 2, reject_reason: value || '' })
    row.status = 2
    ElMessage({ type: 'success', message: `已拒绝申请，理由：${value || '无'}` })
  } catch (err) {
    if (err !== 'cancel' && err?.message !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}
</script>

<style scoped>
.water-usage-container {
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
