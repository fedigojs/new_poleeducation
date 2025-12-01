# Переменные
DOCKER_COMPOSE = docker compose -f docker-compose.prod.yml
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
	if ! sudo systemctl is-active --quiet nginx; then \
		sudo systemctl start nginx || { echo "Failed to start Nginx"; exit 1; }; \
	fi
	sudo systemctl reload nginx || { echo "Failed to reload Nginx"; exit 1; }
	$(DOCKER_COMPOSE) up --build -d db_auth backend || { echo "Failed to start backend containers"; exit 1; }
	$(DOCKER_COMPOSE) run --rm frontend-builder sh -c "rm -rf /frontend/build/* && npm install && npm run build" || { echo "Frontend build failed"; exit 1; }
	docker run --rm -v poleeducation_build:/frontend/build -v /var/www/html:/nginx-html alpine sh -c "cp -r /frontend/build/* /nginx-html" || { echo "Failed to copy frontend build to Nginx directory"; exit 1; }
	$(DOCKER_COMPOSE) rm -f frontend-builder || { echo "Failed to remove frontend-builder container"; exit 1; }
	sudo systemctl reload nginx || { echo "Failed to reload Nginx after deployment"; exit 1; }
	@echo "Деплой завершён."

# SSL Certificate Generation and Installation
generate-ssl:
	@echo "Generating SSL certificate for $(DOMAIN)..."
	sudo apt update && sudo apt install -y certbot python3-certbot-nginx || { echo "Failed to install Certbot"; exit 1; }
	sudo certbot --nginx -d $(DOMAIN) --email $(EMAIL) --agree-tos --non-interactive || { echo "Failed to generate SSL certificate"; exit 1; }
	sudo systemctl reload nginx || { echo "Failed to reload Nginx"; exit 1; }
	@echo "SSL certificate installed successfully!"

# Auto-renew SSL Certificate
renew-ssl:
	@echo "Renewing SSL certificate..."
	sudo certbot renew --quiet || { echo "Failed to renew SSL certificate"; exit 1; }
	sudo systemctl reload nginx || { echo "Failed to reload Nginx"; exit 1; }
	@echo "SSL certificate renewed successfully."

# Деплой только фронтенда на сервере (сборка в Docker)
deploy-frontend-prod:
	@echo "Деплой фронтенда на сервере..."
	@echo "Очистка старой версии..."
	sudo rm -rf /var/www/html/* || { echo "Failed to clear /var/www/html"; exit 1; }
	@echo "Сборка фронтенда в Docker контейнере..."
	$(DOCKER_COMPOSE) run --rm frontend-builder sh -c "rm -rf /frontend/build/* && npm install && npm run build" || { echo "Frontend build failed"; exit 1; }
	@echo "Копирование build в /var/www/html/..."
	docker run --rm -v poleeducation_build:/frontend/build -v /var/www/html:/nginx-html alpine sh -c "cp -r /frontend/build/* /nginx-html" || { echo "Failed to copy frontend build to Nginx directory"; exit 1; }
	@echo "Удаление контейнера frontend-builder..."
	$(DOCKER_COMPOSE) rm -f frontend-builder 2>/dev/null || true
	docker container prune -f || true
	@echo "Перезагрузка Nginx..."
	sudo systemctl reload nginx || { echo "Failed to reload Nginx"; exit 1; }
	@echo "Фронтенд успешно задеплоен! ✅"

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

# Восстановление базы данных из бэкапа для dev окружения
restore-db-dev:
	@echo "Восстановление базы данных из бэкапа для dev окружения..."
	@LATEST_BACKUP=$$(ls -t ./db_backups/*.tar.gz 2>/dev/null | head -1); \
	if [ -z "$$LATEST_BACKUP" ]; then \
		echo "Бэкапы не найдены в ./db_backups/"; \
		exit 1; \
	fi; \
	echo "Используется бэкап: $$LATEST_BACKUP"; \
	docker-compose -f docker-compose.dev.yml stop db_auth || { echo "Failed to stop database"; exit 1; }; \
	docker run --rm \
		-v poleeducationinua_db_data:/var/lib/postgresql/data \
		-v $$(pwd)/db_backups:/backups \
		busybox sh -c "rm -rf /var/lib/postgresql/data/* && tar xzf /backups/$$(basename $$LATEST_BACKUP) -C /var/lib/postgresql/data" || { echo "Failed to restore backup"; exit 1; }; \
	docker-compose -f docker-compose.dev.yml start db_auth || { echo "Failed to start database"; exit 1; }; \
	sleep 3; \
	docker logs poleeducation_db; \
	echo "Восстановление базы данных завершено."

# Создание бэкапа для dev окружения
backup-db-dev:
	@echo "Создание бэкапа базы данных для dev окружения..."
	@mkdir -p ./db_backups
	docker run --rm \
		-v poleeducationinua_db_data:/data \
		-v $$(pwd)/db_backups:/backups \
		busybox sh -c "tar czf /backups/poleeducation_db_backup_$$(date +%Y-%m-%d_%H-%M-%S).tar.gz -C /data ." || { echo "Failed to create backup"; exit 1; }
	@echo "Бэкап создан в ./db_backups/poleeducation_db_backup_$$(date +%Y-%m-%d_%H-%M-%S).tar.gz"

# Применение миграций на проде
migrate-prod:
	@echo "Применение миграций на проде..."
	$(DOCKER_COMPOSE) exec backend sh -c "cd /app && npx sequelize-cli db:migrate" || { echo "Failed to run migrations"; exit 1; }
	@echo "Миграции применены успешно."

# Откат последней миграции на проде
migrate-undo-prod:
	@echo "Откат последней миграции на проде..."
	$(DOCKER_COMPOSE) exec backend sh -c "cd /app && npx sequelize-cli db:migrate:undo" || { echo "Failed to undo migration"; exit 1; }
	@echo "Миграция отменена."

# Локальная сборка фронтенда (для экономии RAM на проде)
build-frontend-local:
	@echo "Сборка фронтенда локально..."
	cd frontend && npm run build || { echo "Frontend build failed"; exit 1; }
	@echo "Фронтенд собран в ./frontend/build"

# Деплой только фронтенда с локальной сборкой
deploy-frontend-local:
	@echo "Деплой фронтенда с локальной сборкой..."
	@if [ ! -d "./frontend/build" ]; then \
		echo "Build директория не найдена. Запустите 'make build-frontend-local' сначала."; \
		exit 1; \
	fi
	@echo "Копирование build на сервер..."
	rsync -avz --delete ./frontend/build/ $(REMOTE_SERVER):/var/www/html/ || { echo "Failed to deploy frontend"; exit 1; }
	ssh $(REMOTE_SERVER) "sudo systemctl reload nginx" || { echo "Failed to reload Nginx"; exit 1; }
	@echo "Фронтенд задеплоен успешно."

# Полный деплой с локальной сборкой фронтенда (экономит RAM на сервере)
deploy-with-local-build:
	@echo "Деплой backend и применение миграций..."
	$(DOCKER_COMPOSE) down || { echo "Failed to stop containers"; exit 1; }
	$(DOCKER_COMPOSE) up --build -d db_auth backend || { echo "Failed to start backend"; exit 1; }
	@echo "Ожидание запуска базы данных..."
	sleep 5
	$(MAKE) migrate-prod
	@echo "Сборка фронтенда локально..."
	$(MAKE) build-frontend-local
	@echo "Деплой фронтенда..."
	$(MAKE) deploy-frontend-local
	@echo "Деплой завершен."
