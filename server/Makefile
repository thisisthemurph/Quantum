up:
	@echo "Migrating database..."
	@go run ./cmd/migrate/. up

down:
	@echo "Rolling back database..."
	@go run ./cmd/migrate/. down

test:
	@echo "Running tests..."
	@go test -v ./...
