<template>
  <div class="project-list-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>项目管理</span>
          <el-button style="float: right;" type="primary" :icon="Plus" @click="openDialog('add')">新建项目</el-button>
        </div>
      </template>

      <!-- 项目数据表格 -->
      <el-table
        :data="projectList"
        v-loading="loading"
        style="width: 100%"
        border
        stripe
      > 
        <el-table-column prop="id" label="ID" width="80" align="center"/>
        <el-table-column prop="projectCode" label="项目编码" width="200" />
        <el-table-column prop="projectName" label="项目名称" width="200" />
        <el-table-column prop="manager" label="项目经理" width="150" />
        <el-table-column prop="startDate" label="开始日期" width="120" />
        <el-table-column prop="endDate" label="结束日期" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" />

        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="">
            <el-button size="small" :icon="Edit" @click="openDialog('edit', scope.row)">编辑</el-button>
            <el-button type="danger" size="small" :icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

    </el-card>

    <!-- 项目添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      :before-close="handleClose"
    >
      <el-form :model="projectForm" 
        :rules="rules" 
        ref="projectFormRef" 
        label-width="90px"
      >
        <el-form-item label="项目编码" prop="projectCode  ">
          <el-input v-model="projectForm.projectCode" placeholder="请输入项目编码" />
        </el-form-item>
        <el-form-item label="项目名称" prop="projectName">
          <el-input v-model="projectForm.projectName" placeholder="请输入项目名称" />
        </el-form-item>
        <el-form-item label="项目经理" prop="manager">
          <el-input v-model="projectForm.manager" placeholder="请输入项目经理" />
        </el-form-item>
        <el-form-item label="开始日期" prop="startDate">
          <el-date-picker
            v-model="projectForm.startDate"
            type="date"
            placeholder="选择开始日期"
            value-format="YYYY-MM-DD"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="结束日期" prop="endDate">
          <el-date-picker
            v-model="projectForm.endDate"
            type="date"
            placeholder="选择结束日期"
            value-format="YYYY-MM-DD"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="projectForm.status" placeholder="选择项目状态" style="width: 100%;">
            <el-option label="进行中" value="in_progress" />
            <el-option label="已完成" value="completed" />
            <el-option label="暂停" value="on_hold" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            type="textarea"
            v-model="projectForm.description"
            placeholder="请输入项目描述"
            :rows="4"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose">取 消</el-button>
          <el-button type="primary" @click="submitForm">确 定</el-button>
        </span>
      </template>
    </el-dialog> 
  </div>
</template>
<script setup lang="ts">
  import { ref, reactive, onMounted, computed, nextTick } from 'vue';
  import axios from 'axios';
  import { ElMessage, ElMessageBox } from 'element-plus';
  import { Plus, Edit, Delete } from '@element-plus/icons-vue';

  // --- API URL ---
  const API_URL = 'http://localhost:8080/api/projects';

  // --- 状态管理 ---
  const projectList = ref([]); // 项目列表数据
  const loading = ref(false); // 加载状态
  const dialogVisible = ref(false); // 对话框显示状态
  const dialogMode = ref<'add' | 'edit'>('add'); // 对话框模式
  const projectFormRef = ref(null); // 表单引用
   
  const projectForm = reactive({ // 项目表单数据模型
    id: null,
    projectName: '',
    manager: '',
    startDate: '',
    endDate: '',
    status: '',
    description: ''
  });

  // --- 计算属性 ---
  const dialogTitle = computed(() => dialogMode.value === 'add' ? '新增项目' : '编辑项目');

  // --- 辅助函数：状态转换 ---
  const getStatusTagType = (status) => {
    switch (status) {
      case 'in_progress': return 'success';
      case 'completed': return 'info';
      case 'on_hold': return 'warning';
      default: return '';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'in_progress': return '进行中';
      case 'completed': return '已完成';
      case 'on_hold': return '暂停';
      default: return '';
    }
  };

  // --- 表单验证规则 ---
  const rules = reactive({
    projectCode: [{ required: true, message: '请输入项目编码', trigger: 'blur' }],
    projectName: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
    manager: [{ required: true, message: '请输入项目经理', trigger: 'blur' }],
    startDate: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
    endDate: [{ required: true, message: '请选择结束日期', trigger: 'change' }],
    status: [{ required: true, message: '请选择项目状态', trigger: 'change' }]
  });
  // --- 获取项目列表 ---
  const fetchProjects = async () => {
    loading.value = true;
    try {
      const response = await axios.get(API_URL);
      projectList.value = response.data;
    } catch (error) {
      ElMessage.error('获取项目列表失败');
      ElMessage.error(error.message);
    } finally {
      loading.value = false;
    }
  };

  // --- 提交表单 ---
  const submitForm = async () => {
    if (!projectFormRef.value) {
      return;
    }
    await projectFormRef.value.validate(async (valid) => {
      if (valid) {
        try {
          if (dialogMode.value === 'add') {
            await axios.post(API_URL, projectForm);
            ElMessage.success('项目创建成功');
          } else {
            await axios.put(`${API_URL}/${projectForm.id}`, projectForm);
            ElMessage.success('项目更新成功');
          }
          dialogVisible.value = false;
          fetchProjects();
        } catch (error) {
          ElMessage.error('操作失败:' + error.message);
        }
      }
    });
  };

  // --- 删除项目 ---
  const handleDelete = (project) => {
    ElMessageBox.confirm(
      `确定删除项目 "${project.projectName}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    ).then(async () => {
      try {
        await axios.delete(`${API_URL}/${project.id}`);
        ElMessage.success('项目删除成功');
        fetchProjects();
      } catch (error) {
        ElMessage.error('删除失败:' + error.message);
      }
    }).catch(() => {});
  };

  // --- 打开对话框 ---
  const openDialog = (mode, project = {}) => {
    dialogMode.value = mode;
    if (projectFormRef.value) {
      projectFormRef.value.resetFields();
    } 
    if (mode === 'add') {
      // 重置表单
      Object.assign(projectForm, {
        id: null,
        projectName: '',
        manager: '',
        startDate: '',
        endDate: '',
        status: '',
        description: ''
      });
    } else {
      Object.assign(projectForm, {row});
    }

    nextTick(() => {
      dialogVisible.value = true;
    });
  };
  
  const handleClose = () => {
    dialogVisible.value = false;
  };
  // --- 生命周期钩子 ---
  onMounted(() => {
    fetchProjects();
  }); 
</script>

<style scoped>
.project-list-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
} 
.card-header {
  font-size: 18px;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
