.PHONY: build clean run down logs

build:
	docker-compose build --parallel
  
clean:
	docker-compose down --remove-orphans
	docker system prune -f

run: clean
	docker-compose up -d
	docker-compose logs -f

down:
	docker-compose down

# View logs
logs:
	docker-compose logs -f