<template>
  <view class="container">
    <view class="header-bg">
      <view class="welcome-text">欢迎使用</view>
      <view class="title">涉县乡村公益数字大脑</view>
    </view>
    
    <view class="module-cards">
      <view class="card shadow-hover" @click="navTo('/pages/farming/calculator')">
        <view class="card-icon red-icon">💧</view>
        <view class="card-title">智慧助农</view>
        <view class="card-desc">节水决策与用水公平调度</view>
      </view>
      
      <view class="card shadow-hover" @click="navTo('/pages/school/videos')">
        <view class="card-icon blue-icon">📚</view>
        <view class="card-title">乡村学堂</view>
        <view class="card-desc">儿童教育与防诈普法</view>
      </view>
      
      <view class="card shadow-hover" @click="navTo('/pages/culture/map')">
        <view class="card-icon green-icon">🗺️</view>
        <view class="card-title">文化融合</view>
        <view class="card-desc">红色有声地图与故事共创</view>
      </view>
    </view>
  </view>
</template>

<script setup>
const navTo = (url) => {
  uni.switchTab({
    url: url,
    fail: () => {
      uni.navigateTo({ url })
    }
  })
}
</script>

<style>
.container {
  min-height: 100vh;
  background-color: #f7f9fc;
  padding-bottom: 40px;
}
.header-bg {
  background: linear-gradient(135deg, #d32f2f, #f44336);
  padding: 60px 20px 80px;
  border-bottom-left-radius: 30px;
  border-bottom-right-radius: 30px;
  color: white;
}
.welcome-text {
  font-size: 16px;
  opacity: 0.9;
}
.title {
  font-size: 24px;
  font-weight: bold;
  margin-top: 10px;
}
.module-cards {
  margin-top: -50px;
  padding: 0 20px;
}
.card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}
.shadow-hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}
.shadow-hover:active {
  transform: translateY(2px);
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}
.card-icon {
  font-size: 32px;
  margin-bottom: 12px;
}
.card-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 6px;
}
.card-desc {
  font-size: 14px;
  color: #666;
}
</style>
