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
            }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
