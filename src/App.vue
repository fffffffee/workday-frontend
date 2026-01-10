<template>
  <el-container class="common-layout">
    <!-- 左侧侧边栏 - 宽度 200px -->
    <el-aside width="200px" class="sidebar">
      <div class="logo">
        <el-icon><Calendar /></el-icon>
        <span class="logo-text">工天管理系统</span>
      </div>
      
      <!-- 导航菜单 -->
      <el-menu
        :default-active="activePath"
        class="el-menu-vertical-demo"
        router 
        background-color="#545c64"
        text-color="#fff"
        active-text-color="#ffd04b"
      >
        <el-menu-item index="/workday-entry">
          <el-icon><Stamp /></el-icon>
          <span>工天录入</span>
        </el-menu-item>
        
        <el-sub-menu index="management">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>基础数据管理</span>
          </template>
          <el-menu-item index="/employees">
            <el-icon><User /></el-icon>
            <span>员工管理</span>
          </el-menu-item>
          <el-menu-item index="/projects">
            <el-icon><Management /></el-icon>
            <span>项目管理</span>
          </el-menu-item>
        </el-sub-menu>

        <el-menu-item index="/reports">
          <el-icon><DataLine /></el-icon>
          <span>统计报表</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 右侧内容区域 -->
    <el-container>
      <!-- 顶部头部 -->
      <el-header class="header">
        <div class="header-title">
          当前功能: {{ currentTitle }}
        </div>
      </el-header>

      <!-- 主要内容区域 -->
      <el-main class="main-content">
        <!-- 路由组件渲染区 -->
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
// 导入 Element Plus 图标 (已在 main.js 中全局注册，这里仅用于模板)
import { Calendar, Setting, User, Management, DataLine, Stamp, Plus} from '@element-plus/icons-vue';

const route = useRoute();

// 计算当前激活的路由路径，用于菜单高亮
const activePath = computed(() => route.path);

// 计算当前页面的标题，显示在头部
const currentTitle = computed(() => route.meta.title || '工天管理系统');
</script>

<style scoped>
.common-layout {
  height: 100vh; /* 确保占满整个视口高度 */
}

/* 侧边栏样式 */
.sidebar {
  background-color: #545c64;
  color: #fff;
  overflow-y: auto; /* 允许侧边栏内容滚动 */
}

.logo {
  display: flex;
  align-items: center;
  padding: 20px 0;
  justify-content: center;
  border-bottom: 1px solid #4a515a;
}

.logo-text {
  font-size: 18px;
  font-weight: bold;
  margin-left: 8px;
}

.el-menu-vertical-demo {
  border-right: none; /* 移除 Element Plus 菜单默认的右边框 */
  min-height: calc(100vh - 60px); /* 菜单高度减去 logo 区域高度 */
}

/* 顶部头部样式 */
.header {
  background-color: #ffffff;
  color: #333;
  line-height: 60px;
  border-bottom: 1px solid #eee;
  padding: 0 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
}

.header-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

/* 主要内容区域 */
.main-content {
  background-color: #f5f7fa;
  padding: 20px;
}
</style>
