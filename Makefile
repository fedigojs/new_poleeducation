build-and-deploy:
	# Остановка всех контейнеров
	docker-compose -f docker-compose.prod.yml down
	# Запуск всех контейнеров, кроме frontend-builder
	docker-compose -f docker-compose.prod.yml up -d db_auth backend
	# Сборка фронтенда
	docker-compose -f docker-compose.prod.yml run --rm frontend-builder
	# Копирование сборки в директорию Nginx
	docker run --rm \
	  -v build:/frontend/build \
	  -v /var/www/html:/nginx-html \
	  debian sh -c "cp -r /frontend/build/* /nginx-html"
	# Удаление только контейнера frontend-builder
	docker-compose -f docker-compose.prod.yml rm -f frontend-builder
