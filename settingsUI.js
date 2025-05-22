// 设置界面UI组件和逻辑
const SettingsUI = (() => {
    // 创建设置模态框
    function createSettingsModal() {
        const modal = document.createElement('div');
        modal.id = 'settingsModal';
        modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 hidden';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'bg-white rounded-xl shadow-xl p-6 w-full max-w-md';
        
        // 标题
        const header = document.createElement('div');
        header.className = 'flex justify-between items-center mb-6';
        
        const title = document.createElement('h3');
        title.className = 'text-xl font-semibold text-gray-800';
        title.textContent = '应用设置';
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'text-gray-500 hover:text-gray-700';
        closeBtn.innerHTML = '<span class="material-symbols-outlined">close</span>';
        closeBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
        
        header.appendChild(title);
        header.appendChild(closeBtn);
        modalContent.appendChild(header);
        
        // 设置表单
        const form = document.createElement('form');
        form.id = 'settingsForm';
        form.className = 'space-y-5';
        
        // API密钥设置
        const apiKeyGroup = document.createElement('div');
        apiKeyGroup.className = 'space-y-2';
        
        const apiKeyLabel = document.createElement('label');
        apiKeyLabel.htmlFor = 'apiKey';
        apiKeyLabel.className = 'block text-sm font-medium text-gray-700';
        apiKeyLabel.textContent = 'OpenRouter API密钥';
        
        const apiKeyInput = document.createElement('input');
        apiKeyInput.type = 'password';
        apiKeyInput.id = 'apiKey';
        apiKeyInput.name = 'apiKey';
        apiKeyInput.className = 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500';
        apiKeyInput.placeholder = '输入您的OpenRouter API密钥';
        
        const apiKeyHelp = document.createElement('p');
        apiKeyHelp.className = 'text-xs text-gray-500 mt-1';
        apiKeyHelp.innerHTML = '从 <a href="https://openrouter.ai/keys" target="_blank" class="text-indigo-600 hover:underline">OpenRouter</a> 获取API密钥';
        
        apiKeyGroup.appendChild(apiKeyLabel);
        apiKeyGroup.appendChild(apiKeyInput);
        apiKeyGroup.appendChild(apiKeyHelp);
        form.appendChild(apiKeyGroup);
        
        // 模型选择设置
        const modelGroup = document.createElement('div');
        modelGroup.className = 'space-y-2 mt-4';
        
        const modelLabel = document.createElement('label');
        modelLabel.htmlFor = 'selectedModel';
        modelLabel.className = 'block text-sm font-medium text-gray-700';
        modelLabel.textContent = '选择AI模型（免费）';
        
        const modelSelect = document.createElement('select');
        modelSelect.id = 'selectedModel';
        modelSelect.name = 'selectedModel';
        modelSelect.className = 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500';
        
        // 添加免费模型选项
        const freeModels = [
            { id: 'qwen/qwen-72b-a22b:free', name: 'Qwen3 235B A22B (推荐)' },
            // { id: 'qwen/qwen-32b-qwq:free', name: 'Qwen QwQ 32B (免费)' }, // 已移除 - 无效的模型ID
            { id: 'deepseek/deepseek-chat-v3-0324:free', name: 'DeepSeek V3 0324 (免费)' },
            { id: 'deepseek/deepseek-chat:free', name: 'DeepSeek V3 (免费)' },
            { id: 'google/gemini-1.5-flash-experimental:free', name: 'Gemini 2.0 Flash (实验版)' },
            // { id: 'openai/gpt-3.5-turbo', name: 'OpenAI GPT-3.5 Turbo' },
            { id: 'anthropic/claude-instant-1.2', name: 'Anthropic Claude Instant' },
            { id: 'google/gemini-pro', name: 'Google Gemini Pro' },
            { id: 'meta-llama/llama-2-13b-chat', name: 'Meta Llama 2 (13B)' },
            { id: 'mistralai/mistral-7b-instruct', name: 'Mistral AI (7B)' }
        ];
        
        freeModels.forEach(model => {
            const option = document.createElement('option');
            option.value = model.id;
            option.textContent = model.name;
            modelSelect.appendChild(option);
        });
        
        const modelHelp = document.createElement('p');
        modelHelp.className = 'text-xs text-gray-500 mt-1';
        modelHelp.textContent = '所有模型均为OpenRouter提供的免费额度';
        
        modelGroup.appendChild(modelLabel);
        modelGroup.appendChild(modelSelect);
        modelGroup.appendChild(modelHelp);
        form.appendChild(modelGroup);
        
        // 通知设置
        const notificationGroup = document.createElement('div');
        notificationGroup.className = 'flex items-center justify-between';
        
        const notificationLabel = document.createElement('span');
        notificationLabel.className = 'text-sm font-medium text-gray-700';
        notificationLabel.textContent = '启用通知';
        
        const notificationToggle = document.createElement('label');
        notificationToggle.className = 'relative inline-flex items-center cursor-pointer';
        
        const notificationCheckbox = document.createElement('input');
        notificationCheckbox.type = 'checkbox';
        notificationCheckbox.id = 'notificationsEnabled';
        notificationCheckbox.name = 'notificationsEnabled';
        notificationCheckbox.className = 'sr-only peer';
        
        const notificationSlider = document.createElement('div');
        notificationSlider.className = 'w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[""] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600';
        
        notificationToggle.appendChild(notificationCheckbox);
        notificationToggle.appendChild(notificationSlider);
        
        notificationGroup.appendChild(notificationLabel);
        notificationGroup.appendChild(notificationToggle);
        form.appendChild(notificationGroup);
        
        // 休息建议设置
        const restGroup = document.createElement('div');
        restGroup.className = 'flex items-center justify-between';
        
        const restLabel = document.createElement('span');
        restLabel.className = 'text-sm font-medium text-gray-700';
        restLabel.textContent = '自动建议休息';
        
        const restToggle = document.createElement('label');
        restToggle.className = 'relative inline-flex items-center cursor-pointer';
        
        const restCheckbox = document.createElement('input');
        restCheckbox.type = 'checkbox';
        restCheckbox.id = 'autoSuggestRests';
        restCheckbox.name = 'autoSuggestRests';
        restCheckbox.className = 'sr-only peer';
        
        const restSlider = document.createElement('div');
        restSlider.className = 'w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[""] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600';
        
        restToggle.appendChild(restCheckbox);
        restToggle.appendChild(restSlider);
        
        restGroup.appendChild(restLabel);
        restGroup.appendChild(restToggle);
        form.appendChild(restGroup);
        
        // 休息间隔设置
        const restIntervalGroup = document.createElement('div');
        restIntervalGroup.className = 'space-y-2';
        
        const restIntervalLabel = document.createElement('label');
        restIntervalLabel.htmlFor = 'restInterval';
        restIntervalLabel.className = 'block text-sm font-medium text-gray-700';
        restIntervalLabel.textContent = '连续几个高效任务后建议休息';
        
        const restIntervalInput = document.createElement('input');
        restIntervalInput.type = 'number';
        restIntervalInput.id = 'restInterval';
        restIntervalInput.name = 'restInterval';
        restIntervalInput.min = '1';
        restIntervalInput.max = '10';
        restIntervalInput.className = 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500';
        
        restIntervalGroup.appendChild(restIntervalLabel);
        restIntervalGroup.appendChild(restIntervalInput);
        form.appendChild(restIntervalGroup);
        
        // 休息时长设置
        const restDurationGroup = document.createElement('div');
        restDurationGroup.className = 'space-y-2';
        
        const restDurationLabel = document.createElement('label');
        restDurationLabel.htmlFor = 'restDuration';
        restDurationLabel.className = 'block text-sm font-medium text-gray-700';
        restDurationLabel.textContent = '建议休息时长(分钟)';
        
        const restDurationInput = document.createElement('input');
        restDurationInput.type = 'number';
        restDurationInput.id = 'restDuration';
        restDurationInput.name = 'restDuration';
        restDurationInput.min = '1';
        restDurationInput.max = '60';
        restDurationInput.className = 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500';
        
        restDurationGroup.appendChild(restDurationLabel);
        restDurationGroup.appendChild(restDurationInput);
        form.appendChild(restDurationGroup);
        
        // 保存按钮
        const saveBtn = document.createElement('button');
        saveBtn.type = 'submit';
        saveBtn.className = 'w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 mt-4';
        saveBtn.textContent = '保存设置';
        
        form.appendChild(saveBtn);
        modalContent.appendChild(form);
        modal.appendChild(modalContent);
        
        // 表单提交处理
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const settings = {
                apiKey: formData.get('apiKey'),
                selectedModel: formData.get('selectedModel'),
                notificationsEnabled: formData.get('notificationsEnabled') === 'on',
                autoSuggestRests: formData.get('autoSuggestRests') === 'on',
                restInterval: parseInt(formData.get('restInterval')) || 2,
                restDuration: parseInt(formData.get('restDuration')) || 10
            };
            
            AppSettings.saveSettings(settings);
            modal.classList.add('hidden');
            
            // 显示保存成功通知
            if (window.showNotification) {
                window.showNotification('设置已保存', '您的设置已成功保存并应用。', 'success');
            }
        });
        
        return modal;
    }
    
    // 加载设置到表单
    function loadSettingsToForm() {
        const settings = AppSettings.getSettings();
        
        const apiKeyInput = document.getElementById('apiKey');
        if (apiKeyInput) apiKeyInput.value = settings.apiKey || '';
        
        const modelSelect = document.getElementById('selectedModel');
        if (modelSelect) modelSelect.value = settings.selectedModel || 'openai/gpt-3.5-turbo';
        
        const notificationsCheckbox = document.getElementById('notificationsEnabled');
        if (notificationsCheckbox) notificationsCheckbox.checked = settings.notificationsEnabled !== false;
        
        const autoSuggestRestsCheckbox = document.getElementById('autoSuggestRests');
        if (autoSuggestRestsCheckbox) autoSuggestRestsCheckbox.checked = settings.autoSuggestRests !== false;
        
        const restIntervalInput = document.getElementById('restInterval');
        if (restIntervalInput) restIntervalInput.value = settings.restInterval || 2;
        
        const restDurationInput = document.getElementById('restDuration');
        if (restDurationInput) restDurationInput.value = settings.restDuration || 10;
    }
    
    // 显示设置模态框
    function showSettingsModal() {
        let modal = document.getElementById('settingsModal');
        
        if (!modal) {
            modal = createSettingsModal();
            document.body.appendChild(modal);
        }
        
        loadSettingsToForm();
        modal.classList.remove('hidden');
    }
    
    // 公开API
    return {
        showSettingsModal
    };
})();