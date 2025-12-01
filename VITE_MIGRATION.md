# Миграция с Create React App на Vite

## Зачем мигрировать?

### Текущая проблема с CRA:
- ❌ Сборка занимает 2-5 минут
- ❌ Требует ~2GB RAM
- ❌ Медленный Hot Module Replacement (HMR)
- ❌ **Create React App больше не поддерживается** (deprecated)
- ❌ Нет обновлений с 2022 года

### Преимущества Vite:
- ✅ Сборка dev за 1-3 секунды (в 10-20 раз быстрее!)
- ✅ Сборка prod за 30-60 секунд (в 3-5 раз быстрее!)
- ✅ Требует ~500MB RAM (в 4 раза меньше!)
- ✅ Мгновенный HMR (обновления без перезагрузки)
- ✅ Активная поддержка (от создателя Vue.js)
- ✅ Современная сборка (native ESM, tree-shaking)

## Пошаговая инструкция

### Шаг 1: Установка зависимостей

```bash
cd frontend

# Установить Vite и плагины
npm install -D vite @vitejs/plugin-react

# Опционально: для абсолютных импортов
npm install -D vite-tsconfig-paths
```

### Шаг 2: Создать vite.config.js

Создайте файл `frontend/vite.config.js`:

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],

  // Настройка путей (как в CRA)
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // Proxy для API (как в package.json proxy)
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.REACT_APP_API_URL || 'http://localhost:3002',
        changeOrigin: true,
      },
    },
  },

  // Production build настройки
  build: {
    outDir: 'build',
    sourcemap: false,
    // Для совместимости со старыми браузерами
    target: 'es2015',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          antd: ['antd'],
          query: ['@tanstack/react-query'],
        },
      },
    },
  },

  // Замена process.env
  define: {
    'process.env': {},
  },
});
```

### Шаг 3: Переместить index.html

```bash
# Переместить index.html в корень frontend/
mv frontend/public/index.html frontend/index.html
```

**Изменить `frontend/index.html`:**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Pole Education</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
    <!-- ВАЖНО: добавить type="module" -->
    <script type="module" src="/src/index.jsx"></script>
  </body>
</html>
```

### Шаг 4: Обновить package.json

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "start": "vite"
  }
}
```

### Шаг 5: Обновить переменные окружения

**Vite использует `VITE_` префикс вместо `REACT_APP_`**

Переименуйте файлы:
```bash
mv frontend/.env frontend/.env.local
```

Замените в файлах:
```bash
# Было
REACT_APP_API_URL=http://localhost:3002

# Стало
VITE_API_URL=http://localhost:3002
```

В коде замените:
```javascript
// Было
const apiUrl = process.env.REACT_APP_API_URL;

// Стало
const apiUrl = import.meta.env.VITE_API_URL;
```

### Шаг 6: Обновить импорты (если нужно)

Если используете абсолютные импорты:

```javascript
// Работают без изменений
import Component from '@/components/Component';
import api from '@/api/api';
```

### Шаг 7: Удалить старые зависимости

```bash
npm uninstall react-scripts

# Можно удалить react-app-rewired, если использовался
npm uninstall react-app-rewired customize-cra
```

### Шаг 8: Тестирование

```bash
# Запустить dev сервер
npm run dev

# Открыть http://localhost:3000
# Проверить что всё работает

# Собрать production
npm run build

# Проверить production build
npm run preview
```

### Шаг 9: Обновить .gitignore

Добавьте:
```
# Vite
dist
.vite
```

### Шаг 10: Обновить Docker и CI/CD

**docker-compose.prod.yml:**
```yaml
frontend-builder:
  build:
    context: ./frontend
    dockerfile: Dockerfile.prod
  volumes:
    - build:/frontend/build
  command: sh -c "npm install && npm run build"
```

**frontend/Dockerfile.prod:**
```dockerfile
FROM node:18-alpine

WORKDIR /frontend

COPY package*.json ./
RUN npm ci --only=production

COPY . .

CMD ["npm", "run", "build"]
```

## Миграция за 15 минут (быстрый способ)

Если нет времени на полную миграцию, вот минимальный набор:

```bash
cd frontend

# 1. Установить Vite
npm install -D vite @vitejs/plugin-react

# 2. Создать vite.config.js (см. выше)

# 3. Переместить index.html
mv public/index.html ./
# Добавить <script type="module" src="/src/index.jsx"></script>

# 4. Обновить scripts в package.json
# "dev": "vite"
# "build": "vite build"

# 5. Переименовать .env
# REACT_APP_ → VITE_

# 6. Тестировать
npm run dev
```

## Troubleshooting

### Проблема: process is not defined

**Решение:** В `vite.config.js` добавьте:
```javascript
define: {
  'process.env': {},
  global: 'globalThis',
}
```

### Проблема: Импорты не работают

**Решение:** Проверьте что расширения указаны:
```javascript
// Было (работало в CRA)
import Component from './Component';

// Должно быть (Vite требует расширения)
import Component from './Component.jsx';
```

### Проблема: CSS не подключается

**Решение:** Убедитесь что импорты CSS есть:
```javascript
import './index.css';
import 'antd/dist/antd.css';
```

## Рекомендации

1. **Сделайте бэкап:**
   ```bash
   git checkout -b migration/vite
   git add .
   git commit -m "Before Vite migration"
   ```

2. **Тестируйте постепенно:**
   - Сначала dev сервер
   - Потом production build
   - Потом деплой на staging

3. **Не спешите:**
   - Лучше потратить 2 часа на миграцию
   - Чем мучиться с медленной сборкой годами

## Результат

После миграции на Vite:
- 🚀 Dev сервер запускается за 1-3 секунды (было 30-60 сек)
- 🚀 Production build за 30-60 секунд (было 2-5 минут)
- 🚀 HMR обновления мгновенные
- 🚀 Можно собирать на сервере с 512MB RAM (было нужно 2GB)
- 🚀 Современный стек, активная поддержка

## Полезные ссылки

- [Официальная документация Vite](https://vitejs.dev/)
- [Руководство по миграции с CRA](https://vitejs.dev/guide/migration.html)
- [React + Vite template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react)
