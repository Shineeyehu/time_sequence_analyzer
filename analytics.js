// 数据分析与可视化

var Analytics = (function() {
    // 初始化仪表盘
    // 存储图表实例的引用
    var completionChart = null;
    var typeChart = null;
    
    function initDashboard() {
        // 加载所有任务数据
        var allTasks = DataStorage.getAllTasks();
        
        // 创建简单的图表数据
        var totalTasks = 0;
        var completedTasks = 0;
        
        allTasks.forEach(function(task) {
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
            // 销毁旧图表实例
            if (completionChart) {
                completionChart.destroy();
            }
            
            completionChart = new Chart(completionCtx, {
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
            // 销毁旧图表实例
            if (typeChart) {
                typeChart.destroy();
            }
            
            // 统计任务类型分布
            var taskTypes = {
                '分析研究': 0,
                '内容创作': 0,
                '沟通协作': 0,
                '其他任务': 0
            };

            allTasks.forEach(function(task) {
                // 根据任务文本判断类型
                var taskText = task.title || '';
                if (taskText.includes('分析') || taskText.includes('研究') || taskText.includes('评估')) {
                    taskTypes['分析研究']++;
                } else if (taskText.includes('创作') || taskText.includes('编写') || taskText.includes('设计')) {
                    taskTypes['内容创作']++;
                } else if (taskText.includes('沟通') || taskText.includes('协作') || taskText.includes('会议')) {
                    taskTypes['沟通协作']++;
                } else {
                    taskTypes['其他任务']++;
                }
            });

            typeChart = new Chart(typeCtx, {
                type: 'pie',
                data: {
                    labels: Object.keys(taskTypes),
                    datasets: [{
                        data: Object.values(taskTypes),
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
        
        // 生成效率洞察
        generateEfficiencyInsights(allTasks);
        
        // 绑定数据分析页面中的"调整设置"按钮事件
        bindDashboardSettingsButton();
    }
    
    // 绑定数据分析页面中的"调整设置"按钮事件
    function bindDashboardSettingsButton() {
        var dashboardSettingsBtn = document.querySelector('#dashboardSection #showPersonalSettingsBtn');
        if (dashboardSettingsBtn) {
            dashboardSettingsBtn.addEventListener('click', function(e) {
                e.stopPropagation(); // 阻止事件冒泡
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
    }
    
    // 生成效率洞察
    function generateEfficiencyInsights(allTasks) {
        var insightsContainer = document.getElementById('taskAnalyticsContent');
        if (!insightsContainer) return;
        
        // 如果没有任务，显示默认信息
        if (allTasks.length === 0) {
            insightsContainer.innerHTML = '<p>暂无任务数据，无法生成效率洞察。创建您的第一个任务，开始追踪您的工作效率！</p>';
            return;
        }
        
        // 计算统计数据
        var totalSubtasks = 0;
        var completedSubtasks = 0;
        
        allTasks.forEach(function(task) {
            if (task.subtasks) {
                totalSubtasks += task.subtasks.length;
                completedSubtasks += task.subtasks.filter(function(subtask) {
                    return subtask.completed;
                }).length;
            }
        });
        
        // 计算完成率
        var completionRate = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;
        
        // 生成洞察文本
        var insights = '';
        
        insights += `<p>📊 <strong>总体完成率：</strong> ${completionRate}%</p>`;
        
        if (completionRate < 30) {
            insights += '<p>您的任务完成率较低，建议将大任务拆分为更小的步骤，逐步推进。</p>';
        } else if (completionRate < 70) {
            insights += '<p>您的任务完成率处于中等水平，继续保持并尝试提高效率。</p>';
        } else {
            insights += '<p>您的任务完成率很高，继续保持这种高效的工作状态！</p>';
        }
        
        // 更新洞察容器
        insightsContainer.innerHTML = insights;
    }
    
    // 公开API
    return {
        initDashboard: initDashboard
    };
})();