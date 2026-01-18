<template>
    <div class="workdayrecord-container">
        <el-card class="box-card">
            <template #header>
                <div class="card-header">
                    <span class="title">工天记录管理</span>
                    <el-button style="float: right;" :icon="Plus" type="primary" @click="openDialog('add')">新增工天记录</el-button>
                </div>
            </template>

            <!-- 工天记录数据表格 -->
            <el-table
                :data="workDayRecords"
                v-loading="loading"
                style="width: 100%"
                border
                stripe
            > 
                <el-table-column prop="id" label="ID" width="80" align="center"/>
                <el-table-column prop="employeeName" label="员工姓名" width="150" />
                <el-table-column prop="projectName" label="项目名称" width="200" />
                <el-table-column prop="workDate" label="工作日期" width="120" align="center"/>
                <el-table-column prop="duration" label="工时(小时)" width="120" align="center"/>
                <el-table-column prop="description" label="备注" />
                <el-table-column label="操作" width="180" align="center" fixed="right">
                    <template #default="scope">
                        <el-button size="small" :icon="Edit" @click="openDialog('edit', scope.row)">编辑</el-button>
                        <el-button type="danger" size="small" :icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <!-- 工天记录添加/编辑对话框 -->
        <el-dialog
            v-model="dialogVisible"
            title="录入工天"
            width="500px"
            :before-close="closeDialog"
        >
            <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
                <el-form-item label="员工" prop="employeeId">
                    <el-select v-model="form.employeeId" placeholder="选择员工" style="width: 100%">
                        <el-option
                            v-for="employee in employees"
                            :key="employee.id"
                            :label="employee.name"
                            :value="employee.id"
                        />
                    </el-select>
                </el-form-item>

                <el-form-item label="项目" prop="projectId">
                    <el-select v-model="form.projectId" placeholder="选择项目" style="width: 100%">
                        <el-option
                            v-for="project in projects"
                            :key="project.id"
                            :label="project.name"
                            :value="project.id"
                        />
                    </el-select>
                </el-form-item>

                <el-form-item label="工作日期" prop="workDate">
                    <el-date-picker 
                        v-model="form.workDate" 
                        type="date" 
                        placeholder="选择工作日期"
                        style="width: 100%"
                        value-format="YYYY-MM-DD"
                    />
                </el-form-item>

                <el-form-item label="工时" prop="duration">
                    <el-input-number 
                        v-model.number="form.duration" 
                        :precision="1" 
                        :step="0.5" 
                        :min="0"
                        :max="1.5"
                        style="width: 100%"
                    />
                </el-form-item>

                <el-form-item label="备注" prop="description">
                    <el-input v-model="form.description" type="textarea" placeholder="请输入备注"/>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="closeDialog">取 消</el-button>
                <el-button type="primary" @click="submitForm">确 定</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { Plus, Edit, Delete } from '@element-plus/icons-vue';
import axios from 'axios';
import { lo } from 'element-plus/es/locales.mjs';

// --- 配置 API 基础路径 ---
const BASE_URL = 'http://localhost:8000/api';

// --- 组件状态 ---
const workDayRecords = ref([]);
const employees = ref([]);
const projects = ref([]);
const loading = ref(false);
const dialogVisible = ref(false);
const formRef = ref(null);

const form = reactive({
    id: null,
    employeeId: null,
    projectId: null,
    workDate: '',
    duration: null,
    description: ''
});

// --- 校验规则 ---
const rules = {
    employeeId: [{ required: true, message: '请选择员工', trigger: 'change' }],
    projectId: [{ required: true, message: '请选择项目', trigger: 'change' }],
    workDate: [{ required: true, message: '请选择工作日期', trigger: 'change' }],
    duration: [{ required: true, message: '请输入工时', trigger: 'blur' }]
};

// --- 获取工天记录数据 ---
const loadAllData = async () => {
    loading.value = true;
    try {
        // 异步并行请求所有基础数据
        const [recordsRes, employeesRes, projectsRes] = await Promise.all([
            axios.get('${BASE_URL}/workdayrecords'),
            axios.get('${BASE_URL}/employees'),
            axios.get('${BASE_URL}/projects')
        ]);
        workDayRecords.value = recordsRes.data;
        employees.value = employeesRes.data;
        projects.value = projectsRes.data;
    } catch (error) {
        console.error("获取数据失败:", error);
    } finally {
        loading.value = false;
    }
};

// --- 操作方法 ---
const openDialog = (mode, record = null) => {
    // 重置表单，日期默认为今天
    Object.assign(form, {
        id: null,
        employeeId: null,
        projectId: null,
        workDate: new Date().toISOString().split('T')[0],
        duration: 1.0,
        description: ''
    });
    dialogVisible.value = true;
};

const submitForm = async () => {
    if (!formRef.value) {
      return;
    }
    await formRef.value.validate(async (valid) => {
      if (valid) {
        try {
          if (form.id) {
            // 编辑模式
            await axios.post(`/api/workdayrecords`, form);
            ElMessage.success('工天记录更新成功');
            dialogVisible.value = false;
            loadInitialData();// 刷新
          } else {
            // 新增模式
            await addWorkDayRecord(form);
            ElMessage.success('工天记录添加成功');
          }
          dialogVisible.value = false;
          loadAllData();
        } catch (error) {
          ElMessage.error('操作失败: ' + error.message);
        }
      }
    });
};

const handleDelete = (record) => {
    ElMessageBox.confirm(
      `确定删除该工天记录吗？`,
      '删除确认',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    ).then(async () => {
      try {
        await axios.delete(`${BASE_URL}/workdayrecords/${record.id}`);
        ElMessage.success('工天记录删除成功');
        loadAllData();
      } catch (error) {
        ElMessage.error('删除失败: ' + error.message);
      }
    }).catch(() => {});
};

onMounted(() => {
    loadAllData();
});
</script>

<style scoped>
.workdayrecord-container {
    padding: 20px;
}
.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.title {
    font-size: 18px;
    font-weight: bold;
}
</style>