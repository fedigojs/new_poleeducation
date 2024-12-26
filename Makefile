# Переменные
DOCKER_COMPOSE = docker-compose -f docker-compose.prod.yml
BACKUP_DIR = /var/www/poleeducation/backup
VOLUME_NAME = poleeducation_db_data
REMOTE_SERVER = user@your-server.com
LOCAL_BACKUP_PATH = ./poleeducation_db_backup.tar.gz

# Основная команда для деплоя
build-and-deploy:
	@echo "Деплой проекта..."
	$(DOCKER_COMPOSE) down --remove-orphans || { echo "Failed to stop containers"; exit 1; }
	docker system prune -a --volumes=false || { echo "Failed to prune Docker caches"; exit 1; }
	sudo rm -rf /var/www/html/* || { echo "Failed to clear /var/www/html"; exit 1; }
	sudo systemctl reload nginx || { echo "Failed to reload Nginx"; exit 1; }
	$(DOCKER_COMPOSE) up --build -d db_auth backend || { echo "Failed to start backend containers"; exit 1; }
	$(DOCKER_COMPOSE) run --rm frontend-builder sh -c "rm -rf /frontend/build/* && rm -f pnpm-lock.yaml && pnpm install --no-frozen-lockfile && pnpm run build" || { echo "Frontend build failed"; exit 1; }
	docker run --rm -v poleeducation_build:/frontend/build -v /var/www/html:/nginx-html alpine sh -c "cp -r /frontend/build/* /nginx-html" || { echo "Failed to copy frontend build to Nginx directory"; exit 1; }
	$(DOCKER_COMPOSE) rm -f frontend-builder || { echo "Failed to remove frontend-builder container"; exit 1; }
	sudo systemctl reload nginx || { echo "Failed to reload Nginx after deployment"; exit 1; }
	@echo "Деплой завершён."

# Бэкап базы данных с добавлением даты и времени в имя файла
backup-db:
	@echo "Создание бэкапа базы данных..."
	docker run --rm \
	  -v $(VOLUME_NAME):/data \
	  -v $(BACKUP_DIR):/backup \
	  busybox sh -c "tar czf /backup/poleeducation_db_backup_\`date +%Y-%m-%d_%H-%M-%S\`.tar.gz -C /data ." || { echo "Failed to create database backup"; exit 1; }
	@echo "Бэкап базы данных создан в $(BACKUP_DIR)/poleeducation_db_backup_`date +%Y-%m-%d_%H-%M-%S`.tar.gz"

# Восстановление базы данных из бэкапа
restore-db:
	@echo "Восстановление базы данных из бэкапа..."
	docker stop poleeducation_db || { echo "Failed to stop database container"; exit 1; }
	docker run --rm \
	  -v $(VOLUME_NAME):/var/lib/postgresql/data \
	  -v $(BACKUP_DIR):/backup \
	  busybox tar xzf /backup/poleeducation_db_backup.tar.gz -C /var/lib/postgresql/data || { echo "Failed to restore database from backup"; exit 1; }
	docker start poleeducation_db || { echo "Failed to start database container"; exit 1; }
	docker logs poleeducation_db || { echo "Failed to retrieve database logs"; exit 1; }
	@echo "Восстановление базы данных завершено."

# Очистка папки бэкапов
clean-backups:
	@echo "Очистка старых бэкапов..."
	sudo rm -rf $(BACKUP_DIR)/* || { echo "Failed to clean backup directory"; exit 1; }
	@echo "Папка бэкапов очищена."

# Просмотр последних логов базы данных
db-logs:
	docker logs poleeducation_db || { echo "Failed to retrieve database logs"; exit 1; }

# Скачивание последнего бэкапа с сервера
download-backup:
	@echo "Скачивание последнего бэкапа с сервера..."
	scp $(REMOTE_SERVER):$(BACKUP_DIR)/poleeducation_db_backup.tar.gz $(LOCAL_BACKUP_PATH) || { echo "Failed to download backup"; exit 1; }
	@echo "Последний бэкап скачан в $(LOCAL_BACKUP_PATH)"
