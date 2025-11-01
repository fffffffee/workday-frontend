<template>
  <div class="employee-list">
    <h1>Employee List</h1>

    <el-button type="primary" @click="showDialog(null)">新增员工</el-button>
    <el-divider />

    <el-table :data="employees" stripe style="width: 100%" border>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="employeeCode" label="工号" width="120" />
      <el-table-column prop="name" label="姓名" width="120" />
      <!--<el-table-column prop="department" label="部门" />-->
      <el-table-column label="操作" width="180">
        <template #default="scope">
          <el-button size="small" @click="showDialog(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteEmployee(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑员工' : '新增员工'" width="500px">
      <el-form :model="currentEmployee" label-width="80px">
        <el-form-item label="工号">
          <el-input v-model="currentEmployee.employeeCode" />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="currentEmployee.name" />
        </el-form-item>
        <!--
        <el-form-item label="部门">
          <el-input v-model="currentEmployee.department" />
        </el-form-item>
        -->
      </el-form>
      <template #footer>
        <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="saveEmployee">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import axios from 'axios';
import { ElMessage,ElMessageBox } from 'element-plus';

// --- 状态 ---
const API_BASE_URL = 'http://localhost:8080/api/employees';
const employees = ref([]); // 员工列表数据
const dialogVisible = ref(false); // 对话框显示状态
const isEdit = ref(false); // 是否为编辑模式
const currentEmployee = ref({ // 当前正在编辑/新增的员工对象
  id: null,
  employeeCode: '',
  name: '',
  // department: ''
});

// --- API 操作函数 ---

// 1. 获取员工列表
const fetchEmployees = async () => {
  try {
    const response = await axios.get(API_BASE_URL);
    employees.value = response.data;
  } catch (error) {
    ElMessage.error('获取员工列表失败: ' + error.message);
  }
};

// 2. 显示对话框/编辑对话框
const showDialog = (employee) => {
  if (employee) {
    //编辑
    isEdit.value = true;
    // 使用深拷防止直接修改表格数据
    currentEmployee.value = { ...employee };
  } else {
    //新增
    isEdit.value = false;
    currentEmployee.value = {
      id: null,
      employeeCode: '',
      name: '',
      department: ''
    };
  }
  dialogVisible.value = true;
};
// 3. 保存员工（新增或编辑）
const saveEmployee = async () => {
  try {
    if (isEdit.value) {
      // 编辑员工（PUT 请求）
      await axios.put(`${API_BASE_URL}/${currentEmployee.value.id}`, currentEmployee.value);
      ElMessage.success('员工信息更新成功');
    } else {
      // 新增员工（POST 请求）
      await axios.post(API_BASE_URL, currentEmployee.value);
      ElMessage.success('员工新增成功');
    }
    dialogVisible.value = false;
    fetchEmployees(); // 刷新员工列表
  } catch (error) {
    ElMessage.error('保存员工信息失败: ' + error.response?.data || error.message);
    }
};
// 4. 删除员工
const deleteEmployee = (id) => {  ElMessageBox.confirm('确定删除该员工吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
}).then(async () => {
    try {  
      await axios.delete(`${API_BASE_URL}/${id}`);
      ElMessage.success('员工删除成功');
      fetchEmployees(); // 刷新员工列表
    } catch (error) {
      ElMessage.error('删除员工失败: ' + error.message);
    }
});
};
// --- 生命周期钩子 ---
onMounted(() => {
  fetchEmployees(); // 组件挂载时获取员工列表
});
</script>

<style scoped>
.employee-list {
  padding: 20px;
}
</style>