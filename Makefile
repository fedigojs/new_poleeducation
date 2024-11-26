build-and-deploy:
	docker-compose -f docker-compose.prod.yml run --rm frontend-builder
	docker run --rm \
	  -v build:/frontend/build \
	  -v /var/www/html:/nginx-html \
	  alpine sh -c "cp -r /frontend/build/* /nginx-html"
	docker-compose down -v
