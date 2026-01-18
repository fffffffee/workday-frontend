// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router'
import { resolveDirective } from "vue";
import EmployeeList from '../views/EmployeeList.vue';
import ProjectList from '../views/ProjectList.vue';
import WorkDayRecord from '../views/WorkDayRecord.vue';

const routes = [
    {
        path: '/',
        name: 'Home',
        redirect: '/employees'
    },
    {
        path: '/employees',
        name: 'Employees',
        component: EmployeeList
    },
    {
        path: '/projects',
        name: 'Projects',
        component: ProjectList,
        meta: { title: '项目管理' }
    },
    {
        path: '/workdayrecords',
        name: 'WorkDayRecords',
        component: WorkDayRecord,
        meta: { title: '工天录入' }
    }
    // Add more routes as needed
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router