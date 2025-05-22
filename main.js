document.addEventListener('DOMContentLoaded', function() {
    // DOM元素引用
    var mainTaskInput = document.getElementById('mainTaskInput');
    var submitTaskBtn = document.getElementById('submitTaskBtn');
    var clearTaskBtn = document.getElementById('clearTaskBtn');
    var taskInputSection = document.getElementById('taskInput');
    var loadingSection = document.getElementById('loadingState');
    var taskListSection = document.getElementById('taskListSection');
    var taskDetailSection = document.getElementById('taskDetailSection');
    var dashboardSection = document.getElementById('dashboardSection');
    var taskListContainer = document.getElementById('taskListContainer');
    var emptyTaskList = document.getElementById('emptyTaskList');
    var taskDetailTitle = document.getElementById('taskDetailTitle');
    var taskDetailProgress = document.getElementById('taskDetailProgress');
    var taskDetailProgressBar = document.getElementById('taskDetailProgressBar');
    var taskDetailSubtasks = document.getElementById('taskDetailSubtasks');
    var settingsBtn = document.getElementById('settingsBtn');
    var homeLink = document.getElementById('homeLink');
    var newTaskBtn = document.getElementById('newTaskBtn');
    var taskListBtn = document.getElementById('taskListBtn');
    var dashboardBtn = document.getElementById('dashboardBtn');
    var createNewTaskBtn = document.getElementById('createNewTaskBtn');
    var createFirstTaskBtn = document.getElementById('createFirstTaskBtn');
    var backToListBtn = document.getElementById('backToListBtn');
    // var editDetailBtn = document.getElementById('editDetailBtn');
    var exportDetailBtn = document.getElementById('exportDetailBtn');
    var deleteTaskBtn = document.getElementById('deleteTaskBtn');
    var confirmationDialog = document.getElementById('confirmationDialog');
    var confirmationTitle = document.getElementById('confirmationTitle');
    var confirmationMessage = document.getElementById('confirmationMessage');
    var cancelConfirmation = document.getElementById('cancelConfirmation');
    var confirmAction = document.getElementById('confirmAction');
    var taskTemplates = document.querySelectorAll('.task-template');
    var workStyleSelect = document.getElementById('workStyle');
    var priorityStrategySelect = document.getElementById('priorityStrategy');

    // 应用状态
    var appState = {
        currentTaskId: null,
        currentTask: {
            mainTask: '',
            subtasks: []
        },
        confirmCallback: null,
        notificationTimeoutId: null,
        previousView: {
            taskInputVisible: true,
            taskListVisible: false,
            taskDetailVisible: false
        },
        taskView: {
            showCompletedTasks: false,
            sortMethod: 'default' // 'default', 'priority', 'tag'
        },
        personalSettings: {
            workStyle: 'balanced',
            priorityStrategy: 'balanced',
            notificationType: 'browser',
            apiKey: '' // 添加API Key设置
        }
    };
    
    // 初始化应用
    function initApp() {
        // 迁移旧数据
        if (typeof DataStorage !== 'undefined' && DataStorage.migrateOldData) {
            DataStorage.migrateOldData();
        }
        
        // 绑定事件监听器
        bindEventListeners();
        
        // 加载个性化设置
        loadPersonalSettings();
        
        // 显示任务输入界面（修改为默认显示任务输入而不是任务列表）
        showTaskInput();
    }
    
    // 加载个性化设置
    function loadPersonalSettings() {
        var settings = typeof AppSettings !== 'undefined' && AppSettings.getSettings ? 
                      AppSettings.getSettings() : 
                      {workStyle: 'balanced', priorityStrategy: 'balanced', notificationType: 'browser', apiKey: ''};
        
        // 设置工作风格
        if (workStyleSelect && settings.workStyle) {
            workStyleSelect.value = settings.workStyle;
        }
        
        // 设置优先级策略
        if (priorityStrategySelect && settings.priorityStrategy) {
            priorityStrategySelect.value = settings.priorityStrategy;
        }
        
        // 设置API Key
        var apiKeyInput = document.getElementById('apiKeyInput');
        if (apiKeyInput && settings.apiKey) {
            apiKeyInput.value = settings.apiKey;
        }
        
        // 更新应用状态
        appState.personalSettings = settings;
    }
    
    // 绑定事件监听器
    function bindEventListeners() {
        // 导航按钮
        if (homeLink) {
            homeLink.addEventListener('click', function(e) {
                e.preventDefault();
                showTaskInput();
            });
        }
        
        if (newTaskBtn) {
            newTaskBtn.addEventListener('click', function() {
                showTaskInput();
            });
        }
        
        if (taskListBtn) {
            taskListBtn.addEventListener('click', function() {
                showTaskList();
            });
        }
        
        if (dashboardBtn) {
            dashboardBtn.addEventListener('click', function() {
                showDashboard();
            });
        }
        
        // 设置按钮 - 使用SettingsUI模块
        if (settingsBtn) {
            settingsBtn.addEventListener('click', function() {
                if (typeof SettingsUI !== 'undefined' && SettingsUI.showSettingsModal) {
                    SettingsUI.showSettingsModal();
                } else {
                    console.error('SettingsUI module not found');
                    // 备用方案：使用侧边抽屉
                    var personalSettingsDrawer = document.getElementById('personalSettingsDrawer');
                    if (personalSettingsDrawer) {
                        personalSettingsDrawer.classList.remove('translate-x-full');
                        personalSettingsDrawer.classList.add('translate-x-0');
                        loadPersonalSettings();
                    }
                }
            });
        }
        
        // 提交任务按钮
        if (submitTaskBtn && mainTaskInput) {
            submitTaskBtn.addEventListener('click', function() {
                var taskText = mainTaskInput.value.trim();
                if (taskText) {
                    processMainTask(taskText);
                } else {
                    showNotification('输入错误', '请输入任务描述', 'error');
                }
            });
        }
        
        // 清空任务按钮
        if (clearTaskBtn && mainTaskInput) {
            clearTaskBtn.addEventListener('click', function() {
                mainTaskInput.value = '';
            });
        }
        
        // 任务模板按钮
        if (taskTemplates && taskTemplates.length > 0) {
            taskTemplates.forEach(function(template) {
                template.addEventListener('click', function() {
                    var taskTitle = this.querySelector('div:first-child').textContent;
                    if (mainTaskInput) {
                        mainTaskInput.value = taskTitle;
                    }
                });
            });
        }
        
        // 创建新任务按钮
        if (createNewTaskBtn) {
            createNewTaskBtn.addEventListener('click', function() {
                showTaskInput();
            });
        }
        
        // 创建第一个任务按钮
        if (createFirstTaskBtn) {
            createFirstTaskBtn.addEventListener('click', function() {
                showTaskInput();
            });
        }
        
        // 返回任务列表按钮
        if (backToListBtn) {
            backToListBtn.addEventListener('click', function() {
                showTaskList();
            });
        }
        
        // 删除任务按钮
        if (deleteTaskBtn) {
            deleteTaskBtn.addEventListener('click', function() {
                if (appState.currentTaskId) {
                    showConfirmation(
                        '删除任务',
                        '您确定要删除此任务吗？此操作无法撤销。',
                        function() {
                            if (DataStorage.deleteTask(appState.currentTaskId)) {
                                showNotification('删除成功', '任务已成功删除。', 'success');
                                showTaskList();
                            } else {
                                showNotification('删除失败', '删除任务时出现错误。', 'error');
                            }
                        }
                    );
                }
            });
        }
        
        // 导出任务按钮
        if (exportDetailBtn) {
            exportDetailBtn.addEventListener('click', function() {
                if (appState.currentTaskId && DataStorage.exportTaskData) {
                    if (DataStorage.exportTaskData(appState.currentTaskId)) {
                        showNotification('导出成功', '任务已成功导出为JSON文件。', 'success');
                    } else {
                        showNotification('导出失败', '导出任务时出现错误。', 'error');
                    }
                }
            });
        }
        
        // 确认对话框按钮
        if (confirmAction) {
            confirmAction.addEventListener('click', function() {
                if (typeof appState.confirmCallback === 'function') {
                    appState.confirmCallback();
                }
                hideConfirmation();
            });
        }
        
        if (cancelConfirmation) {
            cancelConfirmation.addEventListener('click', hideConfirmation);
        }
        
        // 仪表盘返回按钮
        var backFromDashboardBtn = document.getElementById('backFromDashboardBtn');
        if (backFromDashboardBtn) {
            backFromDashboardBtn.addEventListener('click', function() {
                // 返回到之前的页面
                if (appState.previousView.taskDetailVisible && appState.currentTaskId) {
                    showTaskDetail(appState.currentTaskId);
                } else if (appState.previousView.taskListVisible) {
                    showTaskList();
                } else {
                    showTaskInput();
                }
            });
        }
        
        // 任务分析按钮
        var showTaskAnalyticsBtn = document.getElementById('showTaskAnalyticsBtn');
        var hideTaskAnalyticsBtn = document.getElementById('hideTaskAnalyticsBtn');
        var taskAnalyticsCard = document.getElementById('taskAnalyticsCard');
        
        if (showTaskAnalyticsBtn && taskAnalyticsCard) {
            showTaskAnalyticsBtn.addEventListener('click', function() {
                taskAnalyticsCard.classList.remove('hidden');
                showTaskAnalyticsBtn.classList.add('hidden');
            });
        }
        
        if (hideTaskAnalyticsBtn && taskAnalyticsCard) {
            hideTaskAnalyticsBtn.addEventListener('click', function() {
                taskAnalyticsCard.classList.add('hidden');
                showTaskAnalyticsBtn.classList.remove('hidden');
            });
        }
        
        // 个性化设置侧边抽屉
        var showPersonalSettingsBtn = document.getElementById('showPersonalSettingsBtn');
        var closePersonalSettingsBtn = document.getElementById('closePersonalSettingsBtn');
        var savePersonalSettingsBtn = document.getElementById('savePersonalSettingsBtn');
        var personalSettingsDrawer = document.getElementById('personalSettingsDrawer');
        
        if (showPersonalSettingsBtn && personalSettingsDrawer) {
            showPersonalSettingsBtn.addEventListener('click', function() {
                // 显示侧边抽屉
                personalSettingsDrawer.classList.remove('translate-x-full');
                personalSettingsDrawer.classList.add('translate-x-0');
                
                // 加载当前设置
                loadPersonalSettings();
            });
        }
        
        if (closePersonalSettingsBtn && personalSettingsDrawer) {
            closePersonalSettingsBtn.addEventListener('click', function() {
                closePersonalSettingsDrawer();
            });
        }
        
        if (savePersonalSettingsBtn) {
            savePersonalSettingsBtn.addEventListener('click', function() {
                savePersonalSettings();
                closePersonalSettingsDrawer();
                showNotification('设置已保存', '您的个性化设置已成功保存。', 'success');
            });
        }
        
        // 数据分析页面中的"调整设置"按钮
        var dashboardSettingsBtn = document.querySelector('#dashboardSection #showPersonalSettingsBtn');
        if (dashboardSettingsBtn && personalSettingsDrawer) {
            dashboardSettingsBtn.addEventListener('click', function() {
                personalSettingsDrawer.classList.remove('translate-x-full');
                personalSettingsDrawer.classList.add('translate-x-0');
                loadPersonalSettings();
            });
        }
        
        // 点击抽屉外部区域关闭
        document.addEventListener('click', function(e) {
            if (personalSettingsDrawer && 
                !personalSettingsDrawer.contains(e.target) && 
                !personalSettingsDrawer.classList.contains('translate-x-full') && 
                e.target !== showPersonalSettingsBtn &&
                e.target !== settingsBtn &&
                !e.target.closest('#dashboardSection #showPersonalSettingsBtn')) {
                closePersonalSettingsDrawer();
            }
        });
        
        // 已完成任务折叠/展开按钮
        var toggleCompletedTasksBtn = document.getElementById('toggleCompletedTasksBtn');
        if (toggleCompletedTasksBtn) {
            toggleCompletedTasksBtn.addEventListener('click', function() {
                appState.taskView.showCompletedTasks = !appState.taskView.showCompletedTasks;
                
                var toggleIcon = this.querySelector('.material-symbols-outlined');
                var toggleText = document.getElementById('toggleCompletedTasksText');
                
                if (appState.taskView.showCompletedTasks) {
                    toggleIcon.textContent = 'expand_less';
                    toggleText.textContent = '隐藏已完成任务';
                } else {
                    toggleIcon.textContent = 'expand_more';
                    toggleText.textContent = '显示已完成任务';
                }
                
                if (typeof renderTaskDetail === 'function') {
                    renderTaskDetail();
                }
            });
        }
    }
    
    // 处理主任务
    function processMainTask(taskText) {
        // 显示加载状态
        taskInputSection.classList.add('hidden');
        loadingSection.classList.remove('hidden');
        
        // 创建任务对象
        var taskId = 'task_' + Date.now();
        var task = {
            id: taskId,
            mainTask: taskText,
            createdAt: new Date().toISOString(),
            subtasks: [],
            tags: []
        };
        
        // 检查网络状态
        if (!navigator.onLine) {
            // 如果离线，显示提示并使用本地拆解
            if (window.updateLoadingStatus) {
                window.updateLoadingStatus('网络连接已断开，将使用本地任务拆解...');
            }
            
            setTimeout(function() {
                // 使用本地拆解
                task.subtasks = generateSampleSubtasks(taskText);
                
                // 保存任务
                if (typeof DataStorage !== 'undefined' && DataStorage.saveTask) {
                    DataStorage.saveTask(task);
                }
                
                // 隐藏加载状态
                loadingSection.classList.add('hidden');
                
                // 显示任务详情
                showTaskDetail(taskId);
                
                // 显示通知
                showNotification('任务已拆解', '由于网络连接问题，已使用本地任务拆解功能。', 'info');
            }, 1500);
            return;
        }
        
        // 使用AI拆解任务
        if (window.updateLoadingStatus) {
            window.updateLoadingStatus('正在连接AI服务...');
        }
        
        // 检查是否有TaskDecomposer模块
        if (typeof TaskDecomposer !== 'undefined' && TaskDecomposer.decomposeTask) {
            TaskDecomposer.decomposeTask(taskText)
                .then(function(subtasks) {
                    if (subtasks && subtasks.length > 0) {
                        // 将子任务转换为应用所需的格式
                        task.subtasks = subtasks.map(function(text) {
                            return {
                                title: text,
                                description: '',
                                priority: getPriorityFromText(text),
                                completed: false,
                                dueDate: null
                            };
                        });
                    } else {
                        // 如果没有返回子任务，使用本地生成
                        task.subtasks = generateSampleSubtasks(taskText);
                    }
                    
                    // 保存任务
                    if (typeof DataStorage !== 'undefined' && DataStorage.saveTask) {
                        DataStorage.saveTask(task);
                    }
                    
                    // 隐藏加载状态
                    loadingSection.classList.add('hidden');
                    
                    // 显示任务详情
                    showTaskDetail(taskId);
                })
                .catch(function(error) {
                    console.error('Task decomposition error:', error);
                    
                    // 使用本地拆解作为备用
                    task.subtasks = generateSampleSubtasks(taskText);
                    
                    // 保存任务
                    if (typeof DataStorage !== 'undefined' && DataStorage.saveTask) {
                        DataStorage.saveTask(task);
                    }
                    
                    // 隐藏加载状态
                    loadingSection.classList.add('hidden');
                    
                    // 显示任务详情
                    showTaskDetail(taskId);
                    
                    // 显示错误通知
                    showNotification('任务拆解出错', '使用AI拆解任务时出现错误，已切换到本地任务拆解。', 'error');
                });
        } else {
            // 如果没有TaskDecomposer模块，使用本地拆解
            setTimeout(function() {
                task.subtasks = generateSampleSubtasks(taskText);
                
                // 保存任务
                if (typeof DataStorage !== 'undefined' && DataStorage.saveTask) {
                    DataStorage.saveTask(task);
                }
                
                // 隐藏加载状态
                loadingSection.classList.add('hidden');
                
                // 显示任务详情
                showTaskDetail(taskId);
            }, 1500);
        }
    }
    
    // 从文本中判断优先级
    function getPriorityFromText(text) {
        // 高优先级关键词
        var highPriorityKeywords = ['紧急', '重要', '关键', '立即', '优先', '必须'];
        
        // 低优先级关键词
        var lowPriorityKeywords = ['可选', '次要', '参考', '考虑', '建议', '如果可能'];
        
        // 检查高优先级关键词
        for (var i = 0; i < highPriorityKeywords.length; i++) {
            if (text.includes(highPriorityKeywords[i])) {
                return 'high';
            }
        }
        
        // 检查低优先级关键词
        for (var j = 0; j < lowPriorityKeywords.length; j++) {
            if (text.includes(lowPriorityKeywords[j])) {
                return 'low';
            }
        }
        
        // 默认为中等优先级
        return 'medium';
    }
    
    // 生成示例子任务
    function generateSampleSubtasks(mainTask) {
        // 这里只是生成一些示例子任务，实际应用中应该调用AI服务
        var subtasks = [
            {
                title: '分析任务需求',
                description: '详细了解' + mainTask + '的具体要求和目标',
                priority: 'high',
                completed: false,
                dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            },
            {
                title: '收集相关资料',
                description: '查找与' + mainTask + '相关的资料和参考信息',
                priority: 'medium',
                completed: false,
                dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                title: '制定初步计划',
                description: '为' + mainTask + '制定初步的执行计划和时间表',
                priority: 'medium',
                completed: false,
                dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                title: '执行计划第一阶段',
                description: '开始执行' + mainTask + '的第一阶段工作',
                priority: 'low',
                completed: false,
                dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];
        
        return subtasks;
    }
    
    // 关闭个性化设置侧边抽屉
    function closePersonalSettingsDrawer() {
        var personalSettingsDrawer = document.getElementById('personalSettingsDrawer');
        if (personalSettingsDrawer) {
            personalSettingsDrawer.classList.remove('translate-x-0');
            personalSettingsDrawer.classList.add('translate-x-full');
        }
    }
    
    // 保存个性化设置
    function savePersonalSettings() {
        var workStyle = workStyleSelect ? workStyleSelect.value : 'balanced';
        var priorityStrategy = priorityStrategySelect ? priorityStrategySelect.value : 'balanced';
        var notificationType = document.querySelector('input[name="notificationType"]:checked') ? 
                              document.querySelector('input[name="notificationType"]:checked').value : 'browser';
        var apiKey = document.getElementById('apiKeyInput') ? 
                    document.getElementById('apiKeyInput').value : '';
        
        var settings = {
            workStyle: workStyle,
            priorityStrategy: priorityStrategy,
            notificationType: notificationType,
            apiKey: apiKey
        };
        
        if (typeof AppSettings !== 'undefined' && AppSettings.saveSettings) {
            AppSettings.saveSettings(settings);
        }
        
        // 更新应用状态
        appState.personalSettings = settings;
        
        // 更新仪表盘显示
        updateDashboardSettings();
    }
    
    // 更新仪表盘设置显示
    function updateDashboardSettings() {
        var currentWorkStyle = document.getElementById('currentWorkStyle');
        var currentPriorityStrategy = document.getElementById('currentPriorityStrategy');
        var currentNotificationType = document.getElementById('currentNotificationType');
        
        if (currentWorkStyle) {
            switch(appState.personalSettings.workStyle) {
                case 'focused':
                    currentWorkStyle.textContent = '专注模式';
                    break;
                case 'relaxed':
                    currentWorkStyle.textContent = '轻松模式';
                    break;
                default:
                    currentWorkStyle.textContent = '平衡模式';
            }
        }
        
        if (currentPriorityStrategy) {
            switch(appState.personalSettings.priorityStrategy) {
                case 'deadline':
                    currentPriorityStrategy.textContent = '截止日期优先';
                    break;
                case 'importance':
                    currentPriorityStrategy.textContent = '重要性优先';
                    break;
                default:
                    currentPriorityStrategy.textContent = '平衡模式';
            }
        }
        
        if (currentNotificationType) {
            switch(appState.personalSettings.notificationType) {
                case 'email':
                    currentNotificationType.textContent = '邮件提醒';
                    break;
                default:
                    currentNotificationType.textContent = '浏览器通知';
            }
        }
    }
    
    // 显示任务输入界面
    function showTaskInput() {
        taskInputSection.classList.remove('hidden');
        taskListSection.classList.add('hidden');
        taskDetailSection.classList.add('hidden');
        dashboardSection.classList.add('hidden');
        
        // 更新应用状态
        appState.previousView = {
            taskInputVisible: true,
            taskListVisible: false,
            taskDetailVisible: false
        };
    }
    
    // 显示任务列表界面
    function showTaskList() {
        taskInputSection.classList.add('hidden');
        taskListSection.classList.remove('hidden');
        taskDetailSection.classList.add('hidden');
        dashboardSection.classList.add('hidden');
        
        // 更新应用状态
        appState.previousView = {
            taskInputVisible: false,
            taskListVisible: true,
            taskDetailVisible: false
        };
        
        // 渲染任务列表
        if (typeof renderTaskList === 'function') {
            renderTaskList();
        } else {
            // 如果renderTaskList未定义，显示空列表状态
            if (emptyTaskList) {
                emptyTaskList.classList.remove('hidden');
            }
            if (taskListContainer) {
                taskListContainer.innerHTML = '';
            }
        }
    }
    
    // 显示任务详情界面
    function showTaskDetail(taskId) {
        taskInputSection.classList.add('hidden');
        taskListSection.classList.add('hidden');
        taskDetailSection.classList.remove('hidden');
        dashboardSection.classList.add('hidden');
        
        // 更新应用状态
        appState.previousView = {
            taskInputVisible: false,
            taskListVisible: false,
            taskDetailVisible: true
        };
        
        // 设置当前任务ID
        appState.currentTaskId = taskId;
        
        // 加载任务详情
        if (typeof loadTaskDetail === 'function') {
            loadTaskDetail(taskId);
        } else {
            // 简单的任务详情渲染
            var task = typeof DataStorage !== 'undefined' && DataStorage.getTask ? 
                      DataStorage.getTask(taskId) : null;
            
            if (task && taskDetailTitle) {
                taskDetailTitle.textContent = task.mainTask;
            }
        }
    }
    
    // 显示仪表盘界面
    function showDashboard() {
        taskInputSection.classList.add('hidden');
        taskListSection.classList.add('hidden');
        taskDetailSection.classList.add('hidden');
        dashboardSection.classList.remove('hidden');
        
        // 渲染仪表盘数据
        if (typeof Analytics !== 'undefined' && Analytics.initDashboard) {
            Analytics.initDashboard();
        } else if (typeof renderDashboard === 'function') {
            renderDashboard();
        }
    }
    
    // 显示确认对话框
    function showConfirmation(title, message, callback) {
        confirmationTitle.textContent = title;
        confirmationMessage.textContent = message;
        appState.confirmCallback = callback;
        confirmationDialog.classList.remove('hidden');
    }
    
    // 隐藏确认对话框
    function hideConfirmation() {
        confirmationDialog.classList.add('hidden');
        appState.confirmCallback = null;
    }
    
    // 显示通知
    function showNotification(title, message, type) {
        var notificationToast = document.getElementById('notificationToast');
        var notificationTitle = document.getElementById('notificationTitle');
        var notificationMessage = document.getElementById('notificationMessage');
        var notificationIcon = document.getElementById('notificationIcon');
        var closeNotification = document.getElementById('closeNotification');
        
        if (notificationToast && notificationTitle && notificationMessage && notificationIcon) {
            // 设置通知内容
            notificationTitle.textContent = title;
            notificationMessage.textContent = message;
            
            // 设置通知图标
            var iconSpan = notificationIcon.querySelector('span');
            if (iconSpan) {
                switch(type) {
                    case 'success':
                        iconSpan.textContent = 'check_circle';
                        notificationIcon.className = 'mr-3 text-green-500';
                        break;
                    case 'error':
                        iconSpan.textContent = 'error';
                        notificationIcon.className = 'mr-3 text-red-500';
                        break;
                    case 'warning':
                        iconSpan.textContent = 'warning';
                        notificationIcon.className = 'mr-3 text-yellow-500';
                        break;
                    case 'info':
                        iconSpan.textContent = 'info';
                        notificationIcon.className = 'mr-3 text-blue-500';
                        break;
                }
            }
            
            // 显示通知
            notificationToast.classList.remove('hidden');
            setTimeout(function() {
                notificationToast.classList.remove('translate-y-10', 'opacity-0');
            }, 10);
            
            // 清除之前的定时器
            if (appState.notificationTimeoutId) {
                clearTimeout(appState.notificationTimeoutId);
            }
            
            // 设置自动关闭
            appState.notificationTimeoutId = setTimeout(function() {
                hideNotification();
            }, 5000);
            
            // 绑定关闭按钮事件
            if (closeNotification) {
                closeNotification.addEventListener('click', hideNotification);
            }
        }
    }
    
    // 隐藏通知
    function hideNotification() {
        var notificationToast = document.getElementById('notificationToast');
        
        if (notificationToast) {
            notificationToast.classList.add('translate-y-10', 'opacity-0');
            
            setTimeout(function() {
                notificationToast.classList.add('hidden');
            }, 300);
        }
    }
    
    // 暴露全局函数和变量
    window.showNotification = showNotification;
    window.appState = appState;
    window.showTaskDetail = showTaskDetail;
    
    // 初始化应用
    initApp();
});