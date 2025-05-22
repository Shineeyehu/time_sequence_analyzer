// Task decomposition logic that handles LLM API calls

var TaskDecomposer = (function() {
    // API configuration
    function getApiKey() {
        // 使用AppSettings模块获取API密钥
        if (typeof AppSettings !== 'undefined' && AppSettings.getSettings) {
            return AppSettings.getSettings().apiKey;
        }
        return '';
    }

    // 免费模型列表
    var FREE_MODELS = [
        'qwen/qwen-72b-a22b:free',
        // 'qwen/qwen-32b-qwq:free', // 已移除 - 无效的模型ID
        'deepseek/deepseek-chat-v3-0324:free',
        'deepseek/deepseek-chat:free',
        'google/gemini-1.5-flash-experimental:free',
        'openai/gpt-3.5-turbo',
        'anthropic/claude-instant-1.2',
        'google/gemini-pro',
        'meta-llama/llama-2-13b-chat',
        'mistralai/mistral-7b-instruct'
    ];
    
    // 默认使用的免费模型
    var MODEL = 'qwen/qwen-72b-a22b:free';
    var API_URL = 'https://openrouter.ai/api/v1/chat/completions';
    
    // 网络状态检查
    function checkNetworkStatus() {
        return navigator.onLine;
    }
    
    /**
     * Construct a prompt for task decomposition
     * @param {string} mainTask - The main task description
     * @returns {string} - The formatted prompt for the LLM
     */
    function constructPrompt(mainTask) {
        return '\n作为一名专业的任务分解助手，请将以下复杂工作任务拆解为一系列清晰、可执行、有逻辑顺序的子任务。每个子任务应具体描述操作，并考虑完成整个大任务所需的所有必要步骤。\n\n大任务：\n' + mainTask + '\n\n请输出子任务列表，每个子任务以编号和文本描述的形式呈现。确保返回的格式是简洁的数字编号列表，不要添加额外的解释、标题或总结。例如：\n1. 第一个子任务\n2. 第二个子任务\n...等等\n';
    }
    
    /**
     * Call the LLM API to decompose the task
     * @param {string} mainTask - The main task description
     * @returns {Promise<Array>} - Array of subtask descriptions
     */
    function decomposeTask(mainTask) {
        return new Promise(function(resolve, reject) {
            try {
                // 检查网络连接
                if (!checkNetworkStatus()) {
                    window.showNotification('网络连接错误', '您当前处于离线状态，将使用本地任务拆解功能。请检查网络连接后重试。', 'warning');
                    resolve(getMockSubtasks(mainTask));
                    return;
                }
                
                var prompt = constructPrompt(mainTask);
                
                var apiKey = getApiKey();
                if (!apiKey) {
                    window.showNotification('API密钥未设置', '请在个性化设置中配置您的API密钥以使用智能拆解功能。', 'warning');
                    resolve(getMockSubtasks(mainTask));
                    return;
                }
                
                // 从设置中获取选择的模型，如果没有设置则使用默认模型
                var selectedModel = AppSettings.getSettings().selectedModel || MODEL;
                
                // 设置请求超时
                var timeoutId = setTimeout(function() {
                    window.showNotification('请求超时', '服务器响应时间过长，已切换到本地任务拆解。请稍后重试。', 'warning');
                    resolve(getMockSubtasks(mainTask));
                }, 15000); // 15秒超时
                
                fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + apiKey,
                        'HTTP-Referer': window.location.origin || 'http://localhost',
                        'X-Title': 'Task Decomposer',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        model: selectedModel,
                        messages: [
                            {
                                role: 'system',
                                content: '你是一个专业的任务分解助手，擅长将复杂任务分解为具体可执行的步骤。'
                            },
                            {
                                role: 'user',
                                content: prompt
                            }
                        ],
                        temperature: 0.5,
                        max_tokens: 800,
                        stream: false
                    })
                }).then(function(response) {
                    clearTimeout(timeoutId); // 清除超时计时器
                    
                    if (!response.ok) {
                        return response.json().then(function(errorData) {
                            console.error('API Error:', errorData);
                            var errorMessage = '服务器返回错误: ' + response.status;
                            
                            // 根据错误状态码提供更具体的错误信息
                            if (response.status === 401) {
                                errorMessage = 'API密钥无效或已过期，请检查您的API密钥设置。';
                            } else if (response.status === 403) {
                                errorMessage = '您没有权限访问此API，请检查您的账户权限。';
                            } else if (response.status === 429) {
                                errorMessage = 'API请求次数已达上限，请稍后再试。';
                            } else if (response.status >= 500) {
                                errorMessage = '服务器内部错误，请稍后再试。';
                            }
                            
                            window.showNotification('API调用失败', errorMessage, 'error');
                            throw new Error(errorMessage);
                        });
                    }
                    return response.json();
                }).then(function(data) {
                    if (!data || !data.choices || !data.choices[0] || !data.choices[0].message) {
                        throw new Error('API返回数据格式错误');
                    }
                    
                    var resultText = data.choices[0].message.content;
                    // Parse the numbered list into an array of tasks
                    var tasks = parseTaskList(resultText);
                    
                    if (tasks.length === 0) {
                        throw new Error('无法解析任务列表');
                    }
                    
                    window.showNotification('任务拆解成功', '已成功将任务拆解为' + tasks.length + '个子任务。', 'success');
                    resolve(tasks);
                }).catch(function(error) {
                    clearTimeout(timeoutId); // 确保清除超时计时器
                    console.error('Task decomposition error:', error);
                    
                    // 根据错误类型提供不同的错误信息
                    var errorMessage = '任务拆解过程中发生错误，已切换到本地任务拆解。';
                    if (error.name === 'TypeError' && error.message.includes('fetch')) {
                        errorMessage = '网络请求失败，请检查您的网络连接。';
                    } else if (error.message.includes('API密钥')) {
                        errorMessage = error.message;
                    }
                    
                    window.showNotification('任务拆解失败', errorMessage, 'error');
                    // Fallback to mock data for demo or if API fails
                    resolve(getMockSubtasks(mainTask));
                });
            } catch (error) {
                console.error('Task decomposition setup error:', error);
                window.showNotification('任务拆解初始化失败', '设置任务拆解过程中发生错误，已切换到本地任务拆解。', 'error');
                // Fallback to mock data for demo or if API fails
                resolve(getMockSubtasks(mainTask));
            }
        });
    }
    
    /**
     * Parse a numbered list from LLM into an array of tasks
     * @param {string} text - The text containing the numbered list
     * @returns {Array} - Array of subtask descriptions
     */
    function parseTaskList(text) {
        // Regular expression to match numbered list items (1. Task description)
        var regex = /^\s*(\d+)\.\s*(.+)$/gm;
        var tasks = [];
        var match;
        
        while ((match = regex.exec(text)) !== null) {
            var taskDescription = match[2].trim();
            if (taskDescription) {
                tasks.push(taskDescription);
            }
        }
        
        return tasks;
    }
    
    /**
     * Generate mock subtasks for demo or fallback
     * @param {string} mainTask - The main task description
     * @returns {Array} - Array of mock subtask descriptions
     */
    function getMockSubtasks(mainTask) {
        // 记录API调用失败，以便用户知道正在使用备用方案
        console.warn('使用本地备用任务拆解，API调用失败或未配置API密钥');
        // Determine mock tasks based on keywords in the main task
        if (mainTask.includes('周报') || mainTask.includes('报告')) {
            return [
                '确定周报结构与关键内容',
                '收集上周的市场反馈数据',
                '收集上周的销售数据',
                '收集上周的用户活跃度数据',
                '整理并分析市场反馈数据',
                '整理并分析销售数据',
                '整理并分析用户活跃度数据',
                '撰写周报初稿',
                '制作关键数据图表或可视化元素',
                '校对周报内容',
                '请同事进行内容复审',
                '根据反馈修改和润色周报',
                '最终定稿并格式化文件',
                '将周报发送给相关领导和团队成员'
            ];
        } else if (mainTask.includes('演示') || mainTask.includes('演讲') || mainTask.includes('汇报')) {
            return [
                '确定演示主题和目标受众',
                '创建演示大纲',
                '收集相关数据和案例',
                '设计演示幻灯片模板',
                '撰写演示内容和讲稿',
                '创建配图和可视化内容',
                '完成幻灯片初稿',
                'rehearsal - 进行演示彩排',
                '向同事/朋友收集反馈',
                '根据反馈调整内容和表达',
                '准备可能的问答内容',
                '检查演示设备和环境',
                '最终彩排一次',
                '进行正式演示'
            ];
        } else if (mainTask.includes('项目') || mainTask.includes('研发')) {
            return [
                '明确项目目标和范围',
                '创建项目计划和时间线',
                '确定所需资源和团队成员',
                '分配任务和职责',
                '设置项目管理工具和流程',
                '进行初步研究和需求分析',
                '创建项目原型或设计',
                '与团队讨论并调整计划',
                '开始执行项目任务',
                '定期检查进度和质量',
                '处理出现的问题和风险',
                '与相关方进行项目沟通和更新',
                '进行阶段性测试或评审',
                '整理项目交付物和文档',
                '完成最终交付和汇报'
            ];
        } else {
            // Generic subtasks
            return [
                '明确任务目标和需求',
                '收集必要的信息和资源',
                '制定实施计划和时间表',
                '准备所需工具和环境',
                '执行第一步核心操作',
                '检查初步结果并调整',
                '完成下一阶段的工作',
                '与相关人员沟通进展',
                '整理中期成果和笔记',
                '处理可能出现的问题',
                '完成任务的最后步骤',
                '检查最终成果质量',
                '整理总结文档',
                '提交或分享最终成果'
            ];
        }
    }
    
    // Public API
    return {
        decomposeTask: decomposeTask
    };
})();