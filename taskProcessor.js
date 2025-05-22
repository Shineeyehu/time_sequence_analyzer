// Task data processing and management

var TaskProcessor = (function() {
    /**
     * Process raw subtask strings into structured objects
     * @param {Array<string>} subtaskStrings - Array of subtask description strings
     * @returns {Array<Object>} - Array of structured subtask objects
     */
    function processSubtasks(subtaskStrings) {
        return subtaskStrings.map(function(text, index) {
            // Determine if this is likely a "高效工作" or "可摸鱼" task
            var isEfficientTask = determineTaskType(text);
            
            return {
                id: 'subtask_' + Date.now() + '_' + index,
                title: text,
                description: '',
                priority: getPriorityFromText(text),
                tag: isEfficientTask ? 'efficient' : 'rest',
                completed: false,
                dueDate: null
            };
        });
    }
    
    /**
     * Determine if a task is likely to be an "efficient" task requiring focus
     * @param {string} taskText - The task description text
     * @returns {boolean} - True if task is likely high-focus, false if more relaxed
     */
    function determineTaskType(taskText) {
        // Keywords that suggest high-focus tasks
        var efficientKeywords = [
            '分析', '撰写', '设计', '研究', '评估', '创建',
            '开发', '实现', '编写', '策划', '评审', '决策',
            '规划', '解决', '检查', '测试', '审核', '预测'
        ];
        
        // Keywords that suggest more relaxed tasks
        var breakKeywords = [
            '收集', '整理', '格式化', '发送', '分享', '保存',
            '复制', '归档', '转发', '更新', '备份', '填写',
            '下载', '上传', '记录', '存储', '查看', '浏览'
        ];
        
        // Count matches for each category
        var efficientCount = 0;
        var breakCount = 0;
        
        for (var i = 0; i < efficientKeywords.length; i++) {
            if (taskText.includes(efficientKeywords[i])) {
                efficientCount++;
            }
        }
        
        for (var j = 0; j < breakKeywords.length; j++) {
            if (taskText.includes(breakKeywords[j])) {
                breakCount++;
            }
        }
        
        // Add some randomness for demo purposes
        if (efficientCount === breakCount) {
            return Math.random() > 0.4; // 60% chance of being efficient
        }
        
        return efficientCount > breakCount;
    }
    
    /**
     * Get priority level from task text
     * @param {string} taskText - The task description text
     * @returns {string} - Priority level: 'high', 'medium', or 'low'
     */
    function getPriorityFromText(taskText) {
        // Keywords that suggest high priority
        var highPriorityKeywords = ['紧急', '重要', '关键', '立即', '优先', '必须'];
        
        // Keywords that suggest low priority
        var lowPriorityKeywords = ['可选', '次要', '参考', '考虑', '建议', '如果可能'];
        
        // Check for high priority keywords
        for (var i = 0; i < highPriorityKeywords.length; i++) {
            if (taskText.includes(highPriorityKeywords[i])) {
                return 'high';
            }
        }
        
        // Check for low priority keywords
        for (var j = 0; j < lowPriorityKeywords.length; j++) {
            if (taskText.includes(lowPriorityKeywords[j])) {
                return 'low';
            }
        }
        
        // Default to medium priority
        return 'medium';
    }
    
    // Public API
    return {
        processSubtasks: processSubtasks
    };
})();