<template>
  <view class="container">
    <view class="channels">
      <scroll-view scroll-x class="scroll-channels">
        <view 
          v-for="cat in categories" 
          :key="cat"
          class="channel" 
          :class="{ active: activeCategory === cat }"
          @click="switchCategory(cat)">
          {{ cat }}
        </view>
      </scroll-view>
    </view>
    
    <view class="video-list">
      <view class="video-card" v-for="video in videos" :key="video.id">
        <view class="video-cover">
          <view class="play-btn">▶</view>
        </view>
        <view class="video-info">
          <view class="video-title">{{ video.title }}</view>
          <view class="video-meta">
            <text class="tag">{{ video.category }}</text>
            <text class="views">{{ video.views }} 次观看</text>
          </view>
          <button class="quiz-btn" @click="goToQuiz(video)">课后问答 (+10 积分)</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { request } from '../../utils/request'

const videos = ref([])
const activeCategory = ref('儿童动画')
const categories = ['儿童动画', '职场普通话', '老年防诈']

onMounted(() => {
  fetchVideos()
})

const switchCategory = (category) => {
  activeCategory.value = category
  fetchVideos()
}

const fetchVideos = async () => {
  try {
    uni.showNavigationBarLoading()
    const res = await request({ 
      url: '/school/videos',
      data: { category: activeCategory.value }
    })
    videos.value = res.videos
  } catch (e) {
    console.error(e)
  } finally {
    uni.hideNavigationBarLoading()
  }
}

const goToQuiz = (video) => {
  uni.showModal({
    title: '知识问答',
    content: `关于《${video.title}》的随堂测试：拼音 "m" 的发音部位是？\nA. 双唇\nB. 齿龈`,
    confirmText: 'A',
    cancelText: 'B',
    success: async (res) => {
      const option = res.confirm ? 'A' : 'B'
      try {
        const quizRes = await request({
          url: '/school/quiz',
          method: 'POST',
          data: { video_id: video.id, selected_option: option }
        })
        if (quizRes.correct) {
          uni.showToast({ title: `回答正确！积分 +${quizRes.score_added}`, icon: 'success' })
        } else {
          uni.showToast({ title: '回答错误', icon: 'error' })
        }
      } catch (e) {
         uni.showToast({ title: '网络错误', icon: 'error' })
      }
    }
  })
}
</script>

<style>
.container { min-height: 100vh; background: #f7f9fc; }
.channels { background: #fff; padding: 10px 0; border-bottom: 1px solid #eee; }
.scroll-channels { white-space: nowrap; padding: 0 10px; }
.channel { display: inline-block; padding: 6px 16px; margin: 0 8px; border-radius: 20px; font-size: 14px; color: #666; background: #f0f0f0; }
.channel.active { background: #d32f2f; color: #fff; font-weight: bold; }

.video-list { padding: 16px; }
.video-card { background: #fff; border-radius: 12px; margin-bottom: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
.video-cover { height: 180px; background: #333; position: relative; display: flex; align-items: center; justify-content: center; background-image: url('https://dummyimage.com/600x400/999/fff&text=Video+Cover'); background-size: cover; background-position: center; }
.play-btn { width: 50px; height: 50px; background: rgba(0,0,0,0.5); border-radius: 50%; color: white; display: flex; align-items: center; justify-content: center; font-size: 20px; }
.video-info { padding: 16px; }
.video-title { font-size: 16px; font-weight: bold; color: #333; margin-bottom: 10px; }
.video-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.tag { font-size: 12px; color: #e65100; background: #fff3e0; padding: 2px 8px; border-radius: 4px; }
.views { font-size: 12px; color: #999; }
.quiz-btn { background: #fff; border: 1px solid #d32f2f; color: #d32f2f; font-size: 14px; border-radius: 20px; }
</style>
