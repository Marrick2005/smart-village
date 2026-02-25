<template>
  <view class="container">
    <view class="header">
      <view class="title">留守儿童云陪伴</view>
    </view>
    
    <view class="checkin-box card">
      <view class="box-title">今日打卡</view>
      <view class="box-desc">上传你的作业照片或朗读视频</view>
      <button class="upload-btn" @click="chooseImage">上传照片打卡</button>
      
      <view v-if="checkinImage" class="preview">
        <image :src="checkinImage" mode="aspectFill" class="img-preview" />
        <button class="submit-btn" @click="submitCheckin">提交打卡</button>
      </view>
    </view>
    
    <view class="showcase-box">
      <view class="section-title">优秀打卡展示墙</view>
      <scroll-view scroll-x class="gallery">
        <view class="gallery-item" v-for="i in 4" :key="i">
           <view class="item-img-placeholder">展示图 {{ i }}</view>
           <view class="item-author">小明同学</view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const checkinImage = ref('')

const chooseImage = () => {
  uni.chooseImage({
    count: 1,
    success: (res) => {
      checkinImage.value = res.tempFilePaths[0]
    }
  })
}

const submitCheckin = () => {
  uni.showLoading({ title: '提交中' })
  setTimeout(() => {
    uni.hideLoading()
    uni.showToast({ title: '打卡成功！', icon: 'success' })
    checkinImage.value = ''
  }, 800)
}
</script>

<style>
.container { min-height: 100vh; background: #f7f9fc; padding: 20px; }
.header { margin-bottom: 24px; }
.title { font-size: 24px; font-weight: bold; color: #333; }
.card { background: #fff; border-radius: 16px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }

.box-title { font-size: 18px; font-weight: bold; margin-bottom: 8px; }
.box-desc { font-size: 14px; color: #666; margin-bottom: 20px; }
.upload-btn { background: #e3f2fd; color: #1976d2; border-radius: 25px; font-size: 15px; border: 1px dashed #90caf9; }
.preview { margin-top: 20px; text-align: center; }
.img-preview { width: 100%; height: 200px; border-radius: 12px; margin-bottom: 16px; background: #eee; }
.submit-btn { background: #1976d2; color: #fff; border-radius: 25px; }

.showcase-box { margin-top: 30px; }
.section-title { font-size: 18px; font-weight: bold; margin-bottom: 16px; }
.gallery { white-space: nowrap; }
.gallery-item { display: inline-block; width: 140px; margin-right: 16px; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
.item-img-placeholder { height: 100px; background: #ffccbc; display: flex; align-items: center; justify-content: center; color: #d84315; font-size: 14px; }
.item-author { padding: 10px; font-size: 13px; color: #333; text-align: center; font-weight: bold; }
</style>
