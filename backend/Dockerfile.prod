# Указываем базовый образ Node.js
FROM node:20-alpine

# Устанавливаем рабочую директорию внутри контейнера
WORKDIR /backend

# Копируем файл package.json и package-lock.json для установки зависимостей
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем все файлы проекта в контейнер
COPY . .

# Открываем порт 5000 для приложения
EXPOSE 3002

# Команда для запуска приложения
CMD ["npm", "start"]
