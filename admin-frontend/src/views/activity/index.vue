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
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="scope">
            <el-button link type="primary" @click="showParticipants(scope.row)">人员查看</el-button>
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

    <!-- 活动参与人员抽屉 -->
    <el-drawer
      v-model="drawerVisible"
      :title="`【${currentActivity.activity_name}】参与人员`"
      direction="rtl"
      size="40%"
    >
      <el-table :data="participantData" v-loading="drawerLoading" stripe border>
        <el-table-column prop="user_name" label="姓名" width="120" />
        <el-table-column prop="role" label="承担角色" />
        <el-table-column prop="duration" label="参与时长 (小时)" width="150" align="center" />
      </el-table>
    </el-drawer>
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

// 抽屉及参与人员相关
const drawerVisible = ref(false)
const drawerLoading = ref(false)
const participantData = ref([])
const currentActivity = ref({})

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

const showParticipants = async (row) => {
  currentActivity.value = row
  drawerVisible.value = true
  drawerLoading.value = true
  participantData.value = []
  try {
    const res = await axios.get(`/admin/activities/${row.activity_id}/participants`)
    participantData.value = res.data
  } catch (error) {
    ElMessage.error('获取人员名单失败')
    console.error(error)
  } finally {
    drawerLoading.value = false
  }
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
