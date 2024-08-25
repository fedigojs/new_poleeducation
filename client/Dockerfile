# Строим проект с использованием Node.js
FROM node:20-alpine AS builder

# Устанавливаем рабочую директорию внутри контейнера
WORKDIR /client

# Копируем файл package.json и package-lock.json для установки зависимостей
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем все файлы проекта в контейнер
COPY . .

# Собираем приложение для продакшена
RUN npm run build

# Используем Nginx для отдачи статики
FROM nginx:alpine

# Копируем сгенерированные файлы в директорию, обслуживаемую Nginx
COPY --from=builder /client/build /usr/share/nginx/html

# Копируем кастомный конфигурационный файл
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Открываем порт 80
EXPOSE 80

# Запускаем Nginx
CMD ["nginx", "-g", "daemon off;"]
