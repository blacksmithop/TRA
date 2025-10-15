.PHONY: build clean run

# Build Docker images in parallel
build:
	docker build -f api.Dockerfile -t api-image .
	docker build -f frontend.Dockerfile -t frontend-image .

# Clean up orphan containers
clean:
	docker rm -f $$(docker ps -q -f "status=exited") 2>/dev/null || true

# Run the containers
run: clean
	docker run -d -p 8000:8000 api-image
	docker run -d -p 3000:3000 frontend-image