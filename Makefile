build-and-deploy:
	# Остановка всех контейнеров
	docker-compose -f docker-compose.prod.yml down --remove-orphans

	# Удаление всех volumes, кроме poleeducation_db_data
	docker volume ls --format '{{.Name}}' | grep -v '^poleeducation_db_data$' | xargs -r docker volume rm

	# Запуск всех контейнеров, кроме frontend-builder
	docker-compose -f docker-compose.prod.yml up -d db_auth backend
	# Сборка фронтенда
	docker-compose -f docker-compose.prod.yml run --rm frontend-builder
	# Копирование сборки в директорию Nginx
	docker run --rm \
	  -v poleeducation_build:/frontend/build \
	  -v /var/www/html:/nginx-html \
	  alpine sh -c "cp -r /frontend/build/* /nginx-html"
	# Удаление только контейнера frontend-builder
	docker-compose -f docker-compose.prod.yml rm -f frontend-builder
	# Перезагрузка Nginx
	sudo systemctl reload nginx
