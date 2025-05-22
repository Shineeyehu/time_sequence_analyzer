// 数据存储管理
var DataStorage = (function() {
    // 任务存储键
    var TASKS_STORAGE_KEY = 'tasks_v2';
    
    // 获取所有任务
    function getAllTasks() {
        try {
            var tasks = localStorage.getItem(TASKS_STORAGE_KEY);
            return tasks ? JSON.parse(tasks) : [];
        } catch (error) {
            console.error('Error loading tasks:', error);
            return [];
        }
    }
    
    // 获取单个任务
    function getTask(taskId) {
        var tasks = getAllTasks();
        return tasks.find(function(task) {
            return task.id === taskId;
        });
    }
    
    // 保存任务
    function saveTask(task) {
        try {
            var tasks = getAllTasks();
            var existingTaskIndex = tasks.findIndex(function(t) {
                return t.id === task.id;
            });
            
            if (existingTaskIndex >= 0) {
                // 更新现有任务
                tasks[existingTaskIndex] = task;
            } else {
                // 添加新任务
                tasks.push(task);
            }
            
            localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
            return true;
        } catch (error) {
            console.error('Error saving task:', error);
            return false;
        }
    }
    
    // 删除任务
    function deleteTask(taskId) {
        try {
            var tasks = getAllTasks();
            var filteredTasks = tasks.filter(function(task) {
                return task.id !== taskId;
            });
            
            localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(filteredTasks));
            return true;
        } catch (error) {
            console.error('Error deleting task:', error);
            return false;
        }
    }
    
    // 导出任务数据
    function exportTaskData(taskId) {
        try {
            var task = getTask(taskId);
            if (!task) return false;
            
            var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(task, null, 2));
            var downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", "task_" + taskId + ".json");
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
            return true;
        } catch (error) {
            console.error('Error exporting task:', error);
            return false;
        }
    }
    
    // 迁移旧数据
    function migrateOldData() {
        try {
            // 迁移任务数据
            var oldTasks = localStorage.getItem('tasks');
            if (oldTasks) {
                var parsedOldTasks = JSON.parse(oldTasks);
                if (Array.isArray(parsedOldTasks) && parsedOldTasks.length > 0) {
                    // 检查是否已经迁移过
                    var newTasks = localStorage.getItem(TASKS_STORAGE_KEY);
                    if (!newTasks) {
                        localStorage.setItem(TASKS_STORAGE_KEY, oldTasks);
                        console.log('Successfully migrated tasks data to new format');
                    }
                }
            }
            
            return true;
        } catch (error) {
            console.error('Error migrating old data:', error);
            return false;
        }
    }
    
    // 公开API
    return {
        getAllTasks: getAllTasks,
        getTask: getTask,
        saveTask: saveTask,
        deleteTask: deleteTask,
        exportTaskData: exportTaskData,
        migrateOldData: migrateOldData
    };
})();