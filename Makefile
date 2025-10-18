.PHONY: build clean run down logs help

help: ## Show this help message
	@echo 'Usage:'
	@echo '  make [COMMAND]'
	@echo ''
	@echo 'Commands:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-20s %s\n", $$1, $$2}'

build: ## Build docker images
	docker-compose build --parallel
  
clean: ## Clean up containers, images, and volumes
	docker-compose down --remove-orphans
	docker system prune -f

run: clean ## Run the application with logs
	docker-compose up -d
	docker-compose logs -f

down: ## Stop and remove containers
	docker-compose down

logs: ## View service logs
	docker-compose logs -f