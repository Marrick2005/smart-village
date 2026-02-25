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
          layout="prev, pager, next"
          :total="50"
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

const fetchData = async () => {
  loading.value = true
  setTimeout(() => {
    tableData.value = [
      { id: '10001', applicant: '张三', village: '涉县第一村', crop: '核桃', amount: '2 小时', reason: '核桃果实膨大期，需要补充水分', date: '2023-11-20 10:30', status: 0 },
      { id: '10002', applicant: '李四', village: '涉县第一村', crop: '花椒', amount: '1 小时', reason: '土壤干旱，需要微灌', date: '2023-11-20 11:15', status: 1 },
      { id: '10003', applicant: '王五', village: '涉县第二村', crop: '核桃', amount: '3 小时', reason: '近一周无雨水', date: '2023-11-20 14:00', status: 0 },
      { id: '10004', applicant: '赵六', village: '涉县第三村', crop: '玉米', amount: '1.5 小时', reason: '玉米抽穗期', date: '2023-11-19 09:20', status: 2 },
    ]
    loading.value = false
  }, 500)
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

const handleApprove = async (row) => {
  try {
    await ElMessageBox.confirm(`确认通过 ${row.applicant} 的用水申请吗？`, '审批确认', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'success' })
    row.status = 1
    ElMessage({ type: 'success', message: '已通过申请' })
  } catch (err) {}
}

const handleReject = async (row) => {
  try {
    const { value } = await ElMessageBox.prompt('请输入拒绝理由', '拒绝申请', { confirmButtonText: '确定', cancelButtonText: '取消' })
    row.status = 2
    ElMessage({ type: 'success', message: `已拒绝申请，理由：${value || '无'}` })
  } catch (err) {}
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
