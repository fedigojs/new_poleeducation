build-and-deploy:
	# Остановка всех контейнеров
	docker-compose -f docker-compose.prod.yml down --remove-orphans || { echo "Failed to stop containers"; exit 1; }

	# Очистка кешей Docker
	docker system prune -af || { echo "Failed to prune Docker caches"; exit 1; }

	# Очистка папки /var/www/html
	sudo rm -rf /var/www/html/* || { echo "Failed to clear /var/www/html"; exit 1; }

	# Перезагрузка Nginx
	sudo systemctl reload nginx || { echo "Failed to reload Nginx"; exit 1; }

	# Запуск всех контейнеров, кроме frontend-builder
	docker-compose -f docker-compose.prod.yml up -d db_auth backend || { echo "Failed to start backend containers"; exit 1; }

	# Очистка старой сборки во временном томе
	docker-compose -f docker-compose.prod.yml run --rm frontend-builder sh -c "rm -rf /frontend/build/*" || { echo "Failed to clear old frontend build"; exit 1; }

	# Сборка фронтенда
	docker-compose -f docker-compose.prod.yml run --rm frontend-builder sh -c "pnpm install && pnpm run build" || { echo "Frontend build failed"; exit 1; }

	# Копирование сборки в директорию Nginx
	docker run --rm \
	  -v poleeducation_build:/frontend/build \
	  -v /var/www/html:/nginx-html \
	  alpine sh -c "cp -r /frontend/build/* /nginx-html" || { echo "Failed to copy frontend build to Nginx directory"; exit 1; }

	# Удаление только контейнера frontend-builder
	docker-compose -f docker-compose.prod.yml rm -f frontend-builder || { echo "Failed to remove frontend-builder container"; exit 1; }

	# Перезагрузка Nginx
	sudo systemctl reload nginx || { echo "Failed to reload Nginx after deployment"; exit 1; }
