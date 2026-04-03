.PHONY: help build test deploy lint install clean dev typecheck

# KDS Platform — Makefile
# Usage: make <target>

help: ## Show available commands
	@echo "╔══════════════════════════════════════════╗"
	@echo "║  KDS Platform — Available Commands       ║"
	@echo "╚══════════════════════════════════════════╝"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[33m%-15s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies
	npm install

dev: ## Start development server
	npm run dev

build: ## Build for production
	npm run build

test: ## Run tests (placeholder — add your test runner)
	@echo "No test runner configured yet."
	@echo "Add Jest/Vitest and run: npm test"
	@echo "For now, running type check + lint instead:"
	npx tsc --noEmit --skipLibCheck
	npm run lint

lint: ## Run ESLint
	npm run lint

typecheck: ## Run TypeScript type checks
	npx tsc --noEmit --skipLibCheck

deploy: ## Deploy to Hostinger (requires SSH key setup)
	@echo "🚀 Deploying to Hostinger..."
	./deploy.sh

clean: ## Remove build artifacts
	rm -rf .next
	rm -rf out
	rm -rf node_modules/.cache
	@echo "✓ Cleaned build artifacts"
