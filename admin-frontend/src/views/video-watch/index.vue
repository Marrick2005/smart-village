<template>
  <div class="video-watch-container">
    <el-card shadow="hover" class="content-card">
      <template #header>
        <div class="card-header">
          <span>视频观看详细记录</span>
          <el-button type="primary" size="small" @click="fetchData">刷新数据</el-button>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" style="width: 100%" border stripe>
        <el-table-column prop="username" label="农户姓名" width="120">
          <template #default="scope">
            <el-link type="primary" :underline="false" @click="showUserDetails(scope.row)">
              {{ scope.row.username }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="township" label="所属乡镇" min-width="150" />
        <el-table-column prop="total_duration" label="累计观看时长 (秒)" width="180" align="center" />
        <el-table-column prop="finished_count" label="已完课数量" width="150" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.finished_count > 0 ? 'success' : 'info'">
              {{ scope.row.finished_count }} 部
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center">
          <template #default="scope">
            <el-button link type="primary" @click="showUserDetails(scope.row)">查看清单</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          layout="total, prev, pager, next"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 用户专属观看明细抽屉 -->
    <el-drawer
      v-model="drawerVisible"
      :title="`【${currentUser.username}】的观看清单`"
      direction="rtl"
      size="50%"
    >
      <el-table :data="userHistory" v-loading="drawerLoading" stripe>
        <el-table-column prop="video_title" label="已观视频" />
        <el-table-column prop="watch_time" label="观看时刻" width="160" />
        <el-table-column prop="duration" label="时长(秒)" width="90" align="center" />
        <el-table-column prop="is_finished" label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag size="small" :type="scope.row.is_finished ? 'success' : 'info'">
              {{ scope.row.is_finished ? '已完课' : '未完' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(15)

// 抽屉相关
const drawerVisible = ref(false)
const drawerLoading = ref(false)
const userHistory = ref([])
const currentUser = ref({})

const fetchData = async () => {
  loading.value = true
  try {
    const res = await axios.get('/school/video/records', {
      params: {
        page: currentPage.value,
        page_size: pageSize.value
      }
    })
    tableData.value = res.data.data
    total.value = res.data.total
  } catch (error) {
    console.error('获取视频观看记录失败:', error)
    ElMessage.error('获取数据失败，请检查后端服务')
  } finally {
    loading.value = false
  }
}

const showUserDetails = async (row) => {
  currentUser.value = row
  drawerVisible.value = true
  drawerLoading.value = true
  try {
    const res = await axios.get(`/school/user/${row.user_id}/videos`)
    userHistory.value = res.data
  } catch (error) {
    ElMessage.error('获取个人明细失败')
  } finally {
    drawerLoading.value = false
  }
}

const handlePageChange = (val) => {
  currentPage.value = val
  fetchData()
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.video-watch-container {
  padding: 10px;
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
