<template>
  <view class="container">
    <map 
      class="red-map" 
      :latitude="latitude" 
      :longitude="longitude" 
      :markers="markers" 
      @markertap="onMarkerTap"
      scale="12">
    </map>
    
    <view class="info-panel" :class="{'info-panel-open': showInfo}">
      <view class="panel-header">
        <view class="panel-title">{{ currentPOITitle }}</view>
        <view class="close-btn" @click="showInfo = false">✕</view>
      </view>
      <view class="panel-content">
        <view class="audio-player">
          <view class="play-btn" @click="togglePlay">
             {{ isPlaying ? '⏸️' : '▶️' }}
          </view>
          <view class="audio-progress">
             <view class="audio-desc">语音讲解：{{ currentPOITitle }}背后的故事...</view>
             <view class="progress-bar"><view class="progress" :style="{'width': isPlaying ? '50%' : '0'}"></view></view>
          </view>
        </view>
        <view class="desc-text">
          这里是八路军一二九师司令部旧址，是抗日战争时期晋冀鲁豫边区的首脑机关所在地...
        </view>
        <button class="action-btn" @click="navToAudio">参与方言故事共创</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { request } from '../../utils/request'

const latitude = ref(36.5755) // 涉县大致维度
const longitude = ref(113.8820) // 涉县大致经度

const markers = ref([])

const showInfo = ref(false)
const currentPOITitle = ref('')
const isPlaying = ref(false)

onMounted(() => {
  fetchLandmarks()
})

const fetchLandmarks = async () => {
  try {
    const res = await request({ url: '/culture/red-landmarks' })
    markers.value = res.landmarks.map(m => ({
       ...m,
       iconPath: '/static/marker.png',
       callout: { content: m.title, display: 'ALWAYS', padding: 5, borderRadius: 5 }
    }))
  } catch (err) {
    console.error(err)
  }
}

const onMarkerTap = (e) => {
  const markerId = e.detail.markerId
  const marker = markers.value.find(m => m.id === markerId)
  if (marker) {
    currentPOITitle.value = marker.title
    showInfo.value = true
    isPlaying.value = false
  }
}

const togglePlay = () => {
  isPlaying.value = !isPlaying.value
  if (isPlaying.value) {
    uni.showToast({ title: '开始播放流式音频...', icon: 'none' })
  }
}

const navToAudio = () => {
  uni.navigateTo({ url: '/pages/culture/audio' })
}
</script>

<style>
.container { position: relative; width: 100vw; height: 100vh; }
.red-map { width: 100%; height: 100%; }

.info-panel {
  position: absolute; bottom: 0; left: 0; right: 0; background: #fff;
  border-top-left-radius: 20px; border-top-right-radius: 20px;
  transform: translateY(100%); transition: transform 0.3s ease-in-out;
  padding: 20px; box-shadow: 0 -4px 16px rgba(0,0,0,0.1);
}
.info-panel-open { transform: translateY(0); }

.panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.panel-title { font-size: 18px; font-weight: bold; color: #d32f2f; }
.close-btn { font-size: 20px; color: #999; padding: 0 10px; }

.audio-player { display: flex; align-items: center; background: #f5f5f5; padding: 12px; border-radius: 12px; margin-bottom: 16px; }
.play-btn { font-size: 32px; margin-right: 12px; }
.audio-progress { flex: 1; }
.audio-desc { font-size: 13px; color: #666; margin-bottom: 6px; }
.progress-bar { height: 4px; background: #ddd; border-radius: 2px; overflow: hidden; }
.progress { height: 100%; background: #d32f2f; transition: width 0.3s; }

.desc-text { font-size: 14px; color: #444; line-height: 1.6; margin-bottom: 20px; }
.action-btn { background: #d32f2f; color: white; border-radius: 25px; box-shadow: 0 4px 10px rgba(211,47,47,0.3); }
</style>
