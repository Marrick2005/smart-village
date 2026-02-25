<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card shadow="hover" class="stat-card">
          <template #header>总用户活跃度</template>
          <div class="stat-value">{{ stats.active_users.toLocaleString() }}</div>
          <div class="stat-desc">较昨日增加 <span class="text-success">+5.2%</span></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="stat-card">
          <template #header>视频完课率</template>
          <div class="stat-value">{{ stats.video_completion_rate }}%</div>
          <div class="stat-desc">较上周增加 <span class="text-success">+2.1%</span></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="stat-card">
          <template #header>今日待审批用水申请</template>
          <div class="stat-value text-warning">{{ stats.pending_approvals }}</div>
          <div class="stat-desc">请及时处理</div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" class="mt-20">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>农业需求热力图 (高频词云分析)</template>
          <div ref="wordCloudRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>系统活跃度趋势</template>
          <div ref="lineChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import * as echarts from 'echarts'
import axios from 'axios'

const wordCloudRef = ref(null)
const lineChartRef = ref(null)

const stats = ref({
  active_users: 0,
  video_completion_rate: 0,
  pending_approvals: 0,
  activity_trend: []
})

const wordCloudData = ref([])

onMounted(async () => {
  await fetchDashboardData()
  initLineChart()
  initBarChart()
})

const fetchDashboardData = async () => {
  try {
    const statsRes = await axios.get('/analytics/dashboard-stats')
    stats.value = statsRes.data

    const cloudRes = await axios.get('/analytics/word-cloud')
    wordCloudData.value = cloudRes.data.data
  } catch (error) {
    console.error("加载面板数据失败", error)
  }
}

const initLineChart = () => {
  if (!lineChartRef.value) return
  const chart = echarts.init(lineChartRef.value)
  const option = {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
    yAxis: { type: 'value' },
    series: [
      {
        data: stats.value.activity_trend.length ? stats.value.activity_trend : [820, 932, 901, 934, 1290, 1330, 1320],
        type: 'line',
        smooth: true,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(58,77,233,0.8)' },
            { offset: 1, color: 'rgba(58,77,233,0.3)' }
          ])
        },
        itemStyle: { color: '#3a4de9' }
      }
    ]
  }
  chart.setOption(option)
  window.addEventListener('resize', () => chart.resize())
}

const initBarChart = () => {
  if (!wordCloudRef.value) return
  const chart = echarts.init(wordCloudRef.value)
  
  const names = wordCloudData.value.map(item => item.name)
  const values = wordCloudData.value.map(item => item.value)
  
  const option = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: { type: 'category', data: names.length ? names : ['黑腐病'], axisLabel: { interval: 0, rotate: 30 } },
    yAxis: { type: 'value' },
    series: [{
      data: values.length ? values : [100],
      type: 'bar',
      itemStyle: { color: '#67c23a', borderRadius: [5, 5, 0, 0] }
    }]
  }
  chart.setOption(option)
  window.addEventListener('resize', () => chart.resize())
}
</script>

<style scoped>
.dashboard-container {
  width: 100%;
}
.stat-card {
  height: 160px;
}
.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
  margin: 10px 0;
}
.stat-desc {
  font-size: 14px;
  color: #909399;
}
.text-success { color: #67C23A; }
.text-warning { color: #E6A23C; }
.mt-20 { margin-top: 20px; }
.chart-container {
  height: 350px;
  width: 100%;
}
</style>
