import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../layout/index.vue'

const routes = [
    {
        path: '/',
        component: Layout,
        redirect: '/dashboard',
        children: [
            {
                path: 'dashboard',
                name: 'Dashboard',
                component: () => import('../views/dashboard/index.vue'),
                meta: { title: '数据赋能大屏', icon: 'DataLine' }
            },
            {
                path: 'water-usage',
                name: 'WaterUsage',
                component: () => import('../views/water-usage/index.vue'),
                meta: { title: '用水调度审批', icon: 'List' }
            },
            {
                path: 'farming-behavior',
                name: 'FarmingBehavior',
                component: () => import('../views/farming-behavior/index.vue'),
                meta: { title: '农事行为反馈', icon: 'DocumentChecked' }
            },
            {
                path: 'volunteer',
                name: 'Volunteer',
                component: () => import('../views/volunteer/index.vue'),
                meta: { title: '志愿者管理', icon: 'UserFilled' }
            },
            {
                path: 'activity',
                name: 'Activity',
                component: () => import('../views/activity/index.vue'),
                meta: { title: '活动管理', icon: 'Calendar' }
            },
            {
                path: 'video-watch',
                name: 'VideoWatch',
                component: () => import('../views/video-watch/index.vue'),
                meta: { title: '视频观看记录', icon: 'VideoPlay' }
            }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
