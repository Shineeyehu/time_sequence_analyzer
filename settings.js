// 应用设置管理
var AppSettings = (function() {
    // 存储键
    var SETTINGS_STORAGE_KEY = 'settings_v2';
    
    // 默认设置
    var DEFAULT_SETTINGS = {
        apiKey: '',
        selectedModel: 'deepseek/deepseek-chat:free',
        workStyle: 'balanced',
        priorityStrategy: 'balanced',
        notificationType: 'browser',
        autoSuggestRests: true,
        restInterval: 2,
        restDuration: 10,
        theme: 'light',
        lastUpdated: new Date().toISOString()
    };
    
    // 获取设置
    function getSettings() {
        try {
            var settings = localStorage.getItem(SETTINGS_STORAGE_KEY);
            if (!settings) {
                return DEFAULT_SETTINGS;
            }
            
            // 合并保存的设置和默认设置，确保所有必要的字段都存在
            var parsedSettings = JSON.parse(settings);
            return Object.assign({}, DEFAULT_SETTINGS, parsedSettings);
        } catch (error) {
            console.error('Error loading settings:', error);
            return DEFAULT_SETTINGS;
        }
    }
    
    // 保存设置
    function saveSettings(settings) {
        try {
            // 确保包含所有必要的字段
            var completeSettings = Object.assign({}, DEFAULT_SETTINGS, settings);
            completeSettings.lastUpdated = new Date().toISOString();
            
            localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(completeSettings));
            return true;
        } catch (error) {
            console.error('Error saving settings:', error);
            return false;
        }
    }
    
    // 获取API密钥
    function getApiKey() {
        var settings = getSettings();
        return settings.apiKey || '';
    }
    
    // 设置API密钥
    function setApiKey(apiKey) {
        var settings = getSettings();
        settings.apiKey = apiKey;
        return saveSettings(settings);
    }
    
    // 重置设置到默认值
    function resetSettings() {
        try {
            localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
            return true;
        } catch (error) {
            console.error('Error resetting settings:', error);
            return false;
        }
    }
    
    // 导出设置
    function exportSettings() {
        try {
            var settings = getSettings();
            // 出于安全考虑，不导出API密钥
            var exportSettings = Object.assign({}, settings);
            delete exportSettings.apiKey;
            
            var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportSettings, null, 2));
            var downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", "task_assistant_settings.json");
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
            return true;
        } catch (error) {
            console.error('Error exporting settings:', error);
            return false;
        }
    }
    
    // 导入设置
    function importSettings(jsonData) {
        try {
            var importedSettings = JSON.parse(jsonData);
            if (!importedSettings || typeof importedSettings !== 'object') {
                throw new Error('Invalid settings data format');
            }
            
            // 保留当前的API密钥
            var currentSettings = getSettings();
            importedSettings.apiKey = currentSettings.apiKey;
            
            return saveSettings(importedSettings);
        } catch (error) {
            console.error('Error importing settings:', error);
            return false;
        }
    }
    
    // 公开API
    return {
        getSettings: getSettings,
        saveSettings: saveSettings,
        getApiKey: getApiKey,
        setApiKey: setApiKey,
        resetSettings: resetSettings,
        exportSettings: exportSettings,
        importSettings: importSettings
    };
})();