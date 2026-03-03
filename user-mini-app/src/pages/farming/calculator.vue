<template>
  <view class="container">
    <view class="tabs">
      <view :class="['tab', currentTab === 0 ? 'active' : '']" @click="currentTab = 0">节水计算器</view>
      <view :class="['tab', currentTab === 1 ? 'active' : '']" @click="currentTab = 1">调度台</view>
    </view>
    
    <view v-if="currentTab === 0" class="content-box">
      <view class="form-group">
        <text class="label">作物类型</text>
        <picker @change="onCropChange" :value="cropIndex" :range="cropTypes">
          <view class="picker-box">{{ cropTypes[cropIndex] || '请选择作物' }}</view>
        </picker>
      </view>
      
      <view class="form-group">
        <text class="label">当前生长阶段</text>
        <picker @change="onStageChange" :value="stageIndex" :range="stageTypes">
          <view class="picker-box">{{ stageTypes[stageIndex] || '请选择生长阶段' }}</view>
        </picker>
      </view>
      
      <view class="weather-box">
        <text class="weather-title">涉县今日气象数据</text>
        <view class="weather-details">
          <text>气温: 28°C</text>
          <text>降水概率: 10%</text>
          <text>湿度: 45%</text>
        </view>
      </view>
      
      <button class="primary-btn" @click="calculate">计算灌溉建议</button>
      
      <view v-if="result" class="result-box">
        <text class="result-title">智能建议</text>
        <text class="result-text">{{ result }}</text>
      </view>
    </view>
    
    <view v-if="currentTab === 1" class="content-box">
      <view class="quota-board">
        <view class="quota-title">我的用水配额</view>
        <view class="quota-value">{{ quota }} <text class="unit">小时</text></view>
      </view>
      
      <view class="form-group margin-top">
        <text class="label">申请用水 (小时)</text>
        <input type="number" class="input-box" placeholder="请输入申请时长" v-model="applyDuration" />
      </view>
      <view class="form-group">
        <text class="label">申请理由</text>
        <textarea class="textarea-box" placeholder="例如: 核桃膨大期需水" v-model="applyReason" />
      </view>
      <button class="primary-btn" @click="submitApply">提交申请</button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { request } from '../../utils/request'

const currentTab = ref(0)
const cropTypes = ['核桃', '花椒', '玉米', '冬小麦']
const cropIndex = ref(0)
const stageTypes = ['幼苗期', '开花期', '果实膨大期', '成熟期']
const stageIndex = ref(2)

const result = ref('')
const quota = ref(0)
const applyDuration = ref('')
const applyReason = ref('')

onMounted(() => {
  fetchQuota()
})

const fetchQuota = async () => {
  try {
    const res = await request({ url: '/farming/water-usage-quota' })
    quota.value = res.quota_hours
  } catch (e) {
    console.error(e)
  }
}

const onCropChange = (e) => cropIndex.value = e.detail.value
const onStageChange = (e) => stageIndex.value = e.detail.value

const calculate = async () => {
  uni.showLoading({ title: '智能化计算中...' })
  try {
    const res = await request({
      url: '/farming/irrigation-decision',
      method: 'POST',
      data: {
        crop_type: cropTypes[cropIndex.value],
        stage: stageTypes[stageIndex.value]
      }
    })
    result.value = res.decision
  } catch (error) {
    result.value = '请求失败，请检查网络。'
  } finally {
    uni.hideLoading()
  }
}

const submitApply = async () => {
  console.log('按钮点击: submitApply')
  console.log('当前数据:', { duration: applyDuration.value, reason: applyReason.value })
  if (!applyDuration.value || !applyReason.value) {
    console.warn('校验不通过: 字段缺失')
    return uni.showToast({ title: '请填写完整申请信息', icon: 'none' })
  }
  uni.showLoading({ title: '提交中...' })
  console.log('准备发送请求...')
  try {
    const res = await request({
      url: '/farming/water-usage-apply',
      method: 'POST',
      data: {
        duration: Number(applyDuration.value),
        reason: applyReason.value
      }
    })
    uni.showToast({ title: res.message, icon: 'success' })
    applyDuration.value = ''
    applyReason.value = ''
  } catch (error) {
    uni.showToast({ title: '提交失败', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}
</script>

<style>
.container { min-height: 100vh; background-color: #f7f9fc; }
.tabs { display: flex; background: #fff; padding: 0 20px; border-bottom: 1px solid #eee; }
.tab { padding: 16px 20px; font-size: 16px; color: #666; font-weight: 500; position: relative; }
.tab.active { color: #d32f2f; font-weight: bold; }
.tab.active::after { content: ''; position: absolute; bottom: 0; left: 20px; right: 20px; height: 3px; background: #d32f2f; border-radius: 3px; }

.content-box { padding: 20px; }
.form-group { margin-bottom: 20px; }
.label { display: block; font-size: 14px; color: #333; margin-bottom: 8px; font-weight: bold; }
.picker-box, .input-box { background: #fff; padding: 14px; border-radius: 8px; font-size: 15px; border: 1px solid #e0e0e0; }
.textarea-box { background: #fff; padding: 14px; border-radius: 8px; font-size: 15px; border: 1px solid #e0e0e0; width: 100%; height: 100px; box-sizing: border-box; }

.weather-box { background: linear-gradient(135deg, #4facfe, #00f2fe); border-radius: 12px; padding: 16px; color: white; margin-bottom: 24px; }
.weather-title { font-size: 14px; opacity: 0.9; margin-bottom: 10px; display: block; }
.weather-details { display: flex; justify-content: space-between; font-size: 16px; font-weight: bold; }

.primary-btn { background: #d32f2f; color: white; border-radius: 25px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 10px rgba(211,47,47,0.3); border: none; }
.primary-btn:active { opacity: 0.8; }

.result-box { margin-top: 24px; background: #e8f5e9; padding: 16px; border-radius: 8px; border-left: 4px solid #4caf50; }
.result-title { font-size: 16px; font-weight: bold; color: #2e7d32; display: block; margin-bottom: 8px; }
.result-text { font-size: 15px; color: #333; line-height: 1.5; }

.quota-board { background: #fff; padding: 24px; border-radius: 12px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
.quota-title { font-size: 14px; color: #666; }
.quota-value { font-size: 40px; font-weight: bold; color: #d32f2f; margin-top: 10px; }
.unit { font-size: 16px; font-weight: normal; color: #333; }
.margin-top { margin-top: 24px; }
</style>
