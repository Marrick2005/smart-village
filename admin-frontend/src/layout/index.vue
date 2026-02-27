<template>
  <div class="app-wrapper">
    <el-container class="layout-container">
      <el-aside width="220px" class="aside">
        <div class="logo">
          <h2>数字大脑管理</h2>
        </div>
        <el-menu
          :default-active="activePath"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
          router
        >
          <el-menu-item index="/dashboard">
            <el-icon><DataLine /></el-icon>
            <template #title>数据赋能大屏</template>
          </el-menu-item>
          <el-menu-item index="/water-usage">
            <el-icon><List /></el-icon>
            <template #title>用水调度审批</template>
          </el-menu-item>
          <el-menu-item index="/farming-behavior">
            <el-icon><DocumentChecked /></el-icon>
            <template #title>农事实践反馈</template>
          </el-menu-item>
          <el-menu-item index="/volunteer">
            <el-icon><UserFilled /></el-icon>
            <template #title>志愿者管理</template>
          </el-menu-item>
          <el-menu-item index="/activity">
            <el-icon><Calendar /></el-icon>
            <template #title>活动管理</template>
          </el-menu-item>
        </el-menu>
      </el-aside>
      
      <el-container>
        <el-header class="header">
          <div class="header-breadcrumb">
            涉县乡村公益数字大脑后台管理系统
          </div>
          <div class="header-user">
            <el-dropdown>
              <span class="el-dropdown-link">
                Admin <el-icon class="el-icon--right"><arrow-down /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item>退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>
        
        <el-main class="main-content">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { DataLine, List, DocumentChecked, UserFilled, Calendar, ArrowDown } from '@element-plus/icons-vue'

const route = useRoute()
const activePath = computed(() => route.path)
</script>

<style scoped>
.app-wrapper {
  height: 100vh;
  width: 100vw;
}

.layout-container {
  height: 100%;
}

.aside {
  background-color: #304156;
  height: 100%;
  color: white;
  transition: width 0.28s;
}

.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  background-color: #2b3643;
  color: #fff;
  overflow: hidden;
}

.logo h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.header {
  height: 60px;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  z-index: 10;
}

.header-breadcrumb {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.header-user .el-dropdown-link {
  cursor: pointer;
  display: flex;
  align-items: center;
  color: #606266;
}

.main-content {
  background-color: #f0f2f5;
  padding: 20px;
  height: calc(100vh - 60px);
  overflow-y: auto;
}
</style>
