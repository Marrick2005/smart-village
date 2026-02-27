<template>
  <div class="farming-behavior-container">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>农事实践打卡反馈</span>
          <el-button type="primary" size="small" @click="fetchData">刷新数据</el-button>
        </div>
      </template>

      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="record_id" label="记录ID" width="100" />
        <el-table-column prop="user_name" label="农户姓名" width="120" />
        <el-table-column prop="township" label="所属乡镇" width="150" />
        <el-table-column prop="crop_type" label="作物类型" width="120" />
        <el-table-column prop="farming_stage" label="生长阶段" width="120" />
        <el-table-column prop="reminder_category" label="提醒类别" />
        <el-table-column prop="record_time" label="打卡时间" width="180" />
        <el-table-column prop="is_adopted_advice" label="建议采纳状态" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.is_adopted_advice ? 'success' : 'info'">
              {{ scope.row.is_adopted_advice ? '已采纳' : '未采纳' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="scope">
            <el-button 
              v-if="!scope.row.is_adopted_advice" 
              size="small" 
              type="success" 
              @click="handleAdopt(scope.row)">
              标记为采纳
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
import { ref, onMounted } from 'vue'
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
    const res = await axios.get('/admin/farming-behavior', {
      params: {
        skip: (currentPage.value - 1) * pageSize.value,
        limit: pageSize.value
      }
    })
    tableData.value = res.data.data
    total.value = res.data.total
  } catch (error) {
    ElMessage.error('加载农事记录失败')
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

const handleAdopt = async (row) => {
  try {
    await ElMessageBox.confirm(`确认将 ${row.user_name} 的此条记录标记为已采纳此建议吗？`, '采纳确认', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'success' })
    
    await axios.post(`/admin/farming-behavior/${row.record_id}/adopt`, {
      is_adopted: true
    })
    
    row.is_adopted_advice = true
    ElMessage({ type: 'success', message: '已成功标记为采纳' })
  } catch (err) {
    if (err !== 'cancel') {
        ElMessage.error('操作失败')
    }
  }
}
</script>

<style scoped>
.farming-behavior-container {
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
