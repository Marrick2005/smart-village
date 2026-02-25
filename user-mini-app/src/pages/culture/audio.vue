<template>
  <view class="container">
    <view class="header">
      <view class="title">方言故事共创</view>
      <view class="subtitle">用涉县乡音，讲述我们的故事</view>
    </view>
    
    <view class="record-box">
      <view class="status-text">{{ isRecording ? '正在录音...' : '点击底部按钮开始录音' }}</view>
      <view class="audio-waves" v-if="isRecording">
        <view class="wave"></view>
        <view class="wave"></view>
        <view class="wave"></view>
      </view>
      
      <view v-if="localAudioPath && !isRecording" class="preview-box">
        <view class="preview-text">录音已完成 (12s)</view>
        <button class="play-btn" @click="playAudio">试听录音</button>
      </view>
    </view>
    
    <view class="form-box">
      <input type="text" class="input" placeholder="给您的故事起个名字..." />
      <input type="text" class="input" placeholder="标签 (例如：抗战故事 / 民间传说)" />
    </view>
    
    <view class="bottom-actions">
      <view class="action-row" v-if="!isRecording && !localAudioPath">
        <view class="record-btn-large" @click="startRecord">
           <view class="mic-icon">🎤</view>
        </view>
      </view>
      <view class="action-row" v-if="isRecording">
        <view class="stop-btn-large" @click="stopRecord">
           <view class="stop-icon">■</view>
        </view>
      </view>
      <view class="action-row dual" v-if="localAudioPath && !isRecording">
        <button class="btn-cancel" @click="resetRecord">重录</button>
        <button class="btn-submit" @click="submitStory">提交作品</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { request } from '../../utils/request'

const isRecording = ref(false)
const localAudioPath = ref('')
const rm = uni.getRecorderManager()
const am = uni.createInnerAudioContext()

const storyTitle = ref('')
const storyTags = ref('')

rm.onStop((res) => {
  localAudioPath.value = res.tempFilePath
  isRecording.value = false
  uni.showToast({ title: '录音结束' })
})

const startRecord = () => {
  isRecording.value = true
  rm.start({ format: 'mp3' })
}

const stopRecord = () => rm.stop()

const resetRecord = () => localAudioPath.value = ''

const playAudio = () => {
  if (localAudioPath.value) {
    am.src = localAudioPath.value
    am.play()
  }
}

const submitStory = async () => {
  if(!storyTitle.value || !localAudioPath.value) {
     return uni.showToast({ title: '请填写标题并录音', icon: 'none' })
  }
  
  uni.showLoading({ title: '上传中...' })
  try {
     const res = await request({
       url: `/culture/upload-story?title=${encodeURIComponent(storyTitle.value)}&tags=${encodeURIComponent(storyTags.value)}`,
       method: 'POST'
     })
     uni.hideLoading()
     uni.showToast({ title: res.message, icon: 'success' })
     setTimeout(() => uni.navigateBack(), 1500)
  } catch(e) {
     uni.hideLoading()
     uni.showToast({ title: '提交失败', icon: 'error' })
  }
}
</script>

<style>
.container { min-height: 100vh; background: #fff; padding: 20px; display: flex; flex-direction: column; }
.header { text-align: center; margin-bottom: 40px; }
.title { font-size: 24px; font-weight: bold; color: #333; margin-bottom: 10px; }
.subtitle { font-size: 14px; color: #666; }

.record-box { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.status-text { font-size: 16px; color: #999; margin-bottom: 30px; }

.audio-waves { display: flex; align-items: center; justify-content: center; height: 50px; }
.wave { width: 8px; height: 100%; background: #d32f2f; margin: 0 4px; border-radius: 4px; animation: wave-anim 1s infinite ease-in-out alternate; }
.wave:nth-child(2) { animation-delay: 0.2s; }
.wave:nth-child(3) { animation-delay: 0.4s; }

@keyframes wave-anim {
  0% { transform: scaleY(0.3); }
  100% { transform: scaleY(1); }
}

.preview-box { text-align: center; }
.preview-text { font-size: 15px; color: #333; margin-bottom: 10px; font-weight: bold; }
.play-btn { background: #f0f0f0; color: #333; border-radius: 20px; font-size: 14px; border: none; }

.form-box { margin-bottom: 40px; }
.input { background: #f7f9fc; padding: 15px; border-radius: 10px; margin-bottom: 15px; font-size: 15px; }

.bottom-actions { margin-bottom: 30px; }
.action-row { display: flex; justify-content: center; align-items: center; }
.action-row.dual { justify-content: space-between; gap: 15px; }

.record-btn-large { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #f44336, #d32f2f); display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 16px rgba(211,47,47,0.4); }
.mic-icon { font-size: 36px; color: white; }

.stop-btn-large { width: 80px; height: 80px; border-radius: 50%; background: #333; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 16px rgba(0,0,0,0.3); }
.stop-icon { font-size: 24px; color: white; }

.btn-cancel { flex: 1; background: #f0f0f0; color: #333; border-radius: 25px; padding: 12px 0; font-size: 16px; }
.btn-submit { flex: 2; background: #d32f2f; color: white; border-radius: 25px; padding: 12px 0; font-size: 16px; box-shadow: 0 4px 10px rgba(211,47,47,0.3); }
</style>
