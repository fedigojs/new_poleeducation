import globals from 'globals';
import pluginJs from '@eslint/js';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks'; // Импортируем плагин

export default [
    {
        files: ['**/*.{js,mjs,cjs,jsx}'], // Указываем файлы, к которым применяются настройки
        languageOptions: {
            globals: globals.browser, // Устанавливаем глобальные переменные
        },
        rules: {
            ...pluginJs.configs.recommended.rules, // Рекомендуемые правила для JS
            ...pluginReact.configs.flat.recommended.rules, // Рекомендуемые правила для React
            ...pluginReactHooks.configs.recommended.rules, // Рекомендуемые правила для хуков React
            // Если нужно, можно добавить кастомные настройки правил хуков:
            'react-hooks/rules-of-hooks': 'error', // Проверяет правила хуков
            'react-hooks/exhaustive-deps': 'warn', // Проверяет зависимости хуков useEffect
        },
    },
];
