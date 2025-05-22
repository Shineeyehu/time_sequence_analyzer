// UI组件和渲染函数
var UIComponents = (function() {
    // 获取应用状态的引用
    function getAppState() {
        return window.appState || { 
            currentTaskId: null,
            taskView: { showCompletedTasks: false }
        };
    }
    
    // 渲染任务列表
    function renderTaskList() {
        var taskListContainer = document.getElementById('taskListContainer');
        var emptyTaskList = document.getElementById('emptyTaskList');
        
        if (!taskListContainer || !emptyTaskList) return;
        
        var tasks = DataStorage.getAllTasks();
        
        if (tasks.length === 0) {
            // 显示空任务列表提示
            emptyTaskList.classList.remove('hidden');
            taskListContainer.innerHTML = '';
            return;
        }
        
        // 隐藏空任务列表提示
        emptyTaskList.classList.add('hidden');
        
        // 清空任务列表容器
        taskListContainer.innerHTML = '';
        
        // 渲染任务列表项
        tasks.forEach(function(task) {
            var taskItem = createTaskListItem(task);
            taskListContainer.appendChild(taskItem);
        });
    }
    
    // 创建任务列表项
    function createTaskListItem(task) {
        var taskItem = document.createElement('div');
        taskItem.className = 'bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow';
        taskItem.setAttribute('data-task-id', task.id);
        
        // 计算任务进度
        var totalSubtasks = task.subtasks ? task.subtasks.length : 0;
        var completedSubtasks = task.subtasks ? task.subtasks.filter(function(subtask) {
            return subtask.completed;
        }).length : 0;
        
        var progressPercentage = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;
        
        // 设置任务列表项内容
        taskItem.innerHTML = `
            <div class="flex justify-between items-start mb-3">
                <h3 class="font-medium text-gray-800">${task.mainTask}</h3>
                <span class="text-xs text-gray-500">${formatDate(task.createdAt)}</span>
            </div>
            <div class="mb-3">
                <div class="flex justify-between items-center mb-1">
                    <div class="text-xs text-gray-500">${completedSubtasks}/${totalSubtasks} 完成</div>
                    <div class="text-xs font-medium text-gray-700">${progressPercentage}%</div>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-1.5">
                    <div class="bg-indigo-600 h-1.5 rounded-full" style="width: ${progressPercentage}%"></div>
                </div>
            </div>
            <div class="flex justify-between items-center">
                <div class="flex space-x-1">
                    ${task.tags ? task.tags.map(function(tag) {
                        return `<span class="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full">${tag}</span>`;
                    }).join('') : ''}
                </div>
                <button class="view-task-btn text-xs text-indigo-600 hover:text-indigo-800 flex items-center">
                    查看详情
                    <span class="material-symbols-outlined text-sm ml-1">arrow_forward</span>
                </button>
            </div>
        `;
        
        // 添加点击事件
        var viewTaskBtn = taskItem.querySelector('.view-task-btn');
        if (viewTaskBtn) {
            viewTaskBtn.addEventListener('click', function() {
                if (typeof showTaskDetail === 'function') {
                    showTaskDetail(task.id);
                } else if (window.showTaskDetail) {
                    window.showTaskDetail(task.id);
                }
            });
        }
        
        return taskItem;
    }
    
    // 渲染任务详情
    function renderTaskDetail() {
        var appState = getAppState();
        var taskDetailTitle = document.getElementById('taskDetailTitle');
        var taskDetailProgressBar = document.getElementById('taskDetailProgressBar');
        var completedSubtasksElement = document.getElementById('completedSubtasks');
        var totalSubtasksElement = document.getElementById('totalSubtasks');
        var taskDetailSubtasks = document.getElementById('taskDetailSubtasks');
        
        if (!taskDetailTitle || !taskDetailProgressBar || !completedSubtasksElement || 
            !totalSubtasksElement || !taskDetailSubtasks) return;
        
        var currentTaskId = appState.currentTaskId;
        var task = DataStorage.getTask(currentTaskId);
        
        if (!task) {
            console.error('Task not found:', currentTaskId);
            return;
        }
        
        // 设置任务标题
        taskDetailTitle.textContent = task.mainTask;
        
        // 添加标题点击编辑功能
        taskDetailTitle.style.cursor = 'pointer';
        taskDetailTitle.title = '点击编辑标题';
        taskDetailTitle.addEventListener('click', function() {
            editTaskTitle(currentTaskId, task.mainTask);
        });
        
        // 计算任务进度
        var totalSubtasks = task.subtasks ? task.subtasks.length : 0;
        var completedSubtasks = task.subtasks ? task.subtasks.filter(function(subtask) {
            return subtask.completed;
        }).length : 0;
        
        var progressPercentage = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;
        
        // 更新进度条
        taskDetailProgressBar.style.width = progressPercentage + '%';
        completedSubtasksElement.textContent = completedSubtasks;
        totalSubtasksElement.textContent = totalSubtasks;
        
        // 清空子任务容器
        taskDetailSubtasks.innerHTML = '';
        
        // 渲染子任务
        if (task.subtasks && task.subtasks.length > 0) {
            task.subtasks.forEach(function(subtask, index) {
                // 如果任务已完成且不显示已完成任务，则跳过
                if (subtask.completed && !appState.taskView.showCompletedTasks) {
                    return;
                }
                
                var subtaskItem = createSubtaskItem(subtask, index, currentTaskId);
                taskDetailSubtasks.appendChild(subtaskItem);
            });
        } else {
            // 显示无子任务提示
            var emptySubtasks = document.createElement('div');
            emptySubtasks.className = 'text-center py-6 text-gray-500';
            emptySubtasks.textContent = '暂无子任务';
            taskDetailSubtasks.appendChild(emptySubtasks);
        }
    }
    
    // 编辑任务标题
    function editTaskTitle(taskId, currentTitle) {
        var newTitle = prompt('编辑任务标题:', currentTitle);
        if (newTitle && newTitle.trim() && newTitle !== currentTitle) {
            var task = DataStorage.getTask(taskId);
            if (task) {
                task.mainTask = newTitle.trim();
                DataStorage.saveTask(task);
                renderTaskDetail();
            }
        }
    }
    
    // 创建子任务项
    function createSubtaskItem(subtask, index, taskId) {
        var subtaskItem = document.createElement('div');
        subtaskItem.className = 'bg-white border border-gray-200 rounded-lg p-4 ' + 
                              (subtask.completed ? 'bg-gray-50' : '');
        subtaskItem.setAttribute('data-subtask-index', index);
        
        // 设置子任务内容
        subtaskItem.innerHTML = `
            <div class="flex items-start">
                <div class="flex-shrink-0 mr-3">
                    <input type="checkbox" class="subtask-checkbox h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500" 
                           ${subtask.completed ? 'checked' : ''}>
                </div>
                <div class="flex-1">
                    <div class="flex justify-between items-start">
                        <h4 class="font-medium text-gray-800 ${subtask.completed ? 'line-through text-gray-500' : ''}">${subtask.title || subtask.text}</h4>
                        <div class="flex items-center space-x-2">
                            ${subtask.priority ? `
                            <span class="px-2 py-1 ${getPriorityClass(subtask.priority)} text-xs rounded-full">
                                ${getPriorityLabel(subtask.priority)}
                            </span>` : ''}
                            <button class="edit-subtask-btn p-1 text-gray-400 hover:text-gray-600">
                                <span class="material-symbols-outlined text-sm">edit</span>
                            </button>
                        </div>
                    </div>
                    ${subtask.description ? `<p class="text-sm text-gray-600 mt-1 ${subtask.completed ? 'text-gray-400' : ''}">${subtask.description}</p>` : ''}
                    ${subtask.dueDate ? `<p class="text-xs text-gray-500 mt-2">截止日期: ${formatDate(subtask.dueDate)}</p>` : ''}
                </div>
            </div>
        `;
        
        // 添加复选框事件
        var checkbox = subtaskItem.querySelector('.subtask-checkbox');
        if (checkbox) {
            checkbox.addEventListener('change', function() {
                toggleSubtaskCompletion(taskId, index);
            });
        }
        
        // 添加编辑按钮事件
        var editBtn = subtaskItem.querySelector('.edit-subtask-btn');
        if (editBtn) {
            editBtn.addEventListener('click', function() {
                editSubtask(taskId, index);
            });
        }
        
        return subtaskItem;
    }
    
    // 获取优先级标签
    function getPriorityLabel(priority) {
        switch(priority) {
            case 'high': return '高';
            case 'medium': return '中';
            case 'low': return '低';
            default: return '中';
        }
    }
    
    // 获取优先级样式类
    function getPriorityClass(priority) {
        switch(priority) {
            case 'high': return 'bg-red-50 text-red-700';
            case 'medium': return 'bg-yellow-50 text-yellow-700';
            case 'low': return 'bg-green-50 text-green-700';
            default: return 'bg-yellow-50 text-yellow-700';
        }
    }
    
    // 格式化日期
    function formatDate(dateString) {
        if (!dateString) return '';
        
        var date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }
    
    // 切换子任务完成状态
    function toggleSubtaskCompletion(taskId, subtaskIndex) {
        var task = DataStorage.getTask(taskId);
        if (!task || !task.subtasks || subtaskIndex >= task.subtasks.length) return;
        
        task.subtasks[subtaskIndex].completed = !task.subtasks[subtaskIndex].completed;
        DataStorage.saveTask(task);
        
        renderTaskDetail();
    }
    
    // 编辑子任务
    function editSubtask(taskId, subtaskIndex) {
        var task = DataStorage.getTask(taskId);
        if (!task || !task.subtasks || !task.subtasks[subtaskIndex]) return;
        
        var subtask = task.subtasks[subtaskIndex];
        
        // 创建编辑对话框
        var dialog = document.createElement('div');
        dialog.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        dialog.innerHTML = `
            <div class="bg-white rounded-lg p-6 w-96 max-w-full">
                <h3 class="text-lg font-medium text-gray-900 mb-4">编辑子任务</h3>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">任务标题</label>
                        <input type="text" id="editSubtaskTitle" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                               value="${subtask.title || subtask.text}">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">截止日期</label>
                        <input type="datetime-local" id="editSubtaskDueDate" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                               value="${subtask.dueDate ? new Date(subtask.dueDate).toISOString().slice(0, 16) : ''}">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">优先级</label>
                        <select id="editSubtaskPriority" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500">
                            <option value="high" ${subtask.priority === 'high' ? 'selected' : ''}>高</option>
                            <option value="medium" ${subtask.priority === 'medium' ? 'selected' : ''}>中</option>
                            <option value="low" ${subtask.priority === 'low' ? 'selected' : ''}>低</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">描述</label>
                        <textarea id="editSubtaskDescription" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                                  rows="3">${subtask.description || ''}</textarea>
                    </div>
                </div>
                <div class="mt-6 flex justify-end space-x-3">
                    <button id="cancelEditSubtask" class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500">取消</button>
                    <button id="saveEditSubtask" class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">保存</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        // 绑定事件
        var cancelBtn = dialog.querySelector('#cancelEditSubtask');
        var saveBtn = dialog.querySelector('#saveEditSubtask');
        
        cancelBtn.addEventListener('click', function() {
            document.body.removeChild(dialog);
        });
        
        saveBtn.addEventListener('click', function() {
            var newTitle = dialog.querySelector('#editSubtaskTitle').value.trim();
            var newDueDate = dialog.querySelector('#editSubtaskDueDate').value;
            var newPriority = dialog.querySelector('#editSubtaskPriority').value;
            var newDescription = dialog.querySelector('#editSubtaskDescription').value.trim();
            
            if (newTitle) {
                subtask.title = newTitle;
                subtask.dueDate = newDueDate ? new Date(newDueDate).toISOString() : null;
                subtask.priority = newPriority;
                subtask.description = newDescription;
                
                DataStorage.saveTask(task);
                renderTaskDetail();
                document.body.removeChild(dialog);
            } else {
                alert('请输入任务标题');
            }
        });
    }
    
    // 渲染仪表盘
    function renderDashboard() {
        console.log('Render dashboard');
        
        // 设置仪表盘中的"调整设置"按钮事件
        var dashboardSettingsBtn = document.getElementById('showPersonalSettingsBtn');
        if (dashboardSettingsBtn) {
            dashboardSettingsBtn.addEventListener('click', function() {
                var personalSettingsDrawer = document.getElementById('personalSettingsDrawer');
                if (personalSettingsDrawer) {
                    personalSettingsDrawer.classList.remove('translate-x-full');
                    personalSettingsDrawer.classList.add('translate-x-0');
                    
                    // 如果有AppSettings模块，加载设置
                    if (typeof AppSettings !== 'undefined' && AppSettings.getSettings) {
                        var settings = AppSettings.getSettings();
                        var workStyleSelect = document.getElementById('workStyle');
                        var priorityStrategySelect = document.getElementById('priorityStrategy');
                        var apiKeyInput = document.getElementById('apiKeyInput');
                        
                        if (workStyleSelect && settings.workStyle) {
                            workStyleSelect.value = settings.workStyle;
                        }
                        
                        if (priorityStrategySelect && settings.priorityStrategy) {
                            priorityStrategySelect.value = settings.priorityStrategy;
                        }
                        
                        if (apiKeyInput && settings.apiKey) {
                            apiKeyInput.value = settings.apiKey;
                        }
                    }
                }
            });
        }
        
        // 创建简单的图表数据
        var tasks = DataStorage.getAllTasks();
        var totalTasks = 0;
        var completedTasks = 0;
        
        tasks.forEach(function(task) {
            if (task.subtasks) {
                totalTasks += task.subtasks.length;
                completedTasks += task.subtasks.filter(function(subtask) {
                    return subtask.completed;
                }).length;
            }
        });
        
        // 创建任务完成情况图表
        var completionCtx = document.getElementById('taskCompletionChart');
        if (completionCtx) {
            new Chart(completionCtx, {
                type: 'doughnut',
                data: {
                    labels: ['已完成', '未完成'],
                    datasets: [{
                        data: [completedTasks, totalTasks - completedTasks],
                        backgroundColor: ['rgba(16, 185, 129, 0.7)', 'rgba(229, 231, 235, 0.7)']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true
                }
            });
        }
        
        // 创建任务类型分布图表
        var typeCtx = document.getElementById('taskTypeChart');
        if (typeCtx) {
            new Chart(typeCtx, {
                type: 'pie',
                data: {
                    labels: ['分析研究', '内容创作', '沟通协作', '其他任务'],
                    datasets: [{
                        data: [35, 25, 20, 20],
                        backgroundColor: [
                            'rgba(99, 102, 241, 0.7)',
                            'rgba(16, 185, 129, 0.7)',
                            'rgba(239, 68, 68, 0.7)',
                            'rgba(59, 130, 246, 0.7)'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true
                }
            });
        }
    }
    
    // 加载任务详情
    function loadTaskDetail(taskId) {
        // 更新全局状态
        if (window.appState) {
            window.appState.currentTaskId = taskId;
        }
        renderTaskDetail();
    }
    
    // 公开API
    return {
        renderTaskList: renderTaskList,
        renderTaskDetail: renderTaskDetail,
        loadTaskDetail: loadTaskDetail,
        renderDashboard: renderDashboard
    };
})();

// 将UI组件函数暴露到全局作用域
var renderTaskList = UIComponents.renderTaskList;
var renderTaskDetail = UIComponents.renderTaskDetail;
var loadTaskDetail = UIComponents.loadTaskDetail;
var renderDashboard = UIComponents.renderDashboard;