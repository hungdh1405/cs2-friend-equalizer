PM ?= pnpm
WRANGLER_CONFIG ?= wrangler.toml
BUILD_WRANGLER_CONFIG ?= .output/server/wrangler.json

.PHONY: help dev build test setup deploy change-pin clear-changelog

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*## "}; {printf "%-14s %s\n", $$1, $$2}'

dev: ## Local dev server (KV falls back to fs, no Cloudflare account needed)
	$(PM) run dev

build: ## Production build (outputs to .output/)
	$(PM) run build

test: ## Run the Vitest suite (balancing algorithms)
	$(PM) run test

setup: ## One-time Cloudflare provisioning: create the KV namespace + push secrets from .env
	@npx wrangler whoami
	@if grep -q 'REPLACE_WITH_KV_NAMESPACE_ID' $(WRANGLER_CONFIG) 2>/dev/null; then \
		echo "Creating KV namespace..."; \
		npx wrangler kv namespace create cs2-friend-equalizer-kv --binding CS2_KV --config $(WRANGLER_CONFIG); \
		echo ">>> Copy the printed id into $(WRANGLER_CONFIG)'s [[kv_namespaces]] block, then re-run 'make setup'."; \
		exit 1; \
	else \
		echo "KV namespace already configured in $(WRANGLER_CONFIG), skipping."; \
	fi
	@test -f .env || (echo ".env not found — copy .env.example to .env first."; exit 1)
	@PIN=$$(grep '^NUXT_APP_PIN=' .env | cut -d= -f2); \
	SESSION_PW=$$(grep '^NUXT_SESSION_PASSWORD=' .env | cut -d= -f2); \
	echo "$$PIN" | npx wrangler secret put NUXT_APP_PIN --config $(WRANGLER_CONFIG); \
	echo "$$SESSION_PW" | npx wrangler secret put NUXT_SESSION_PASSWORD --config $(WRANGLER_CONFIG)
	@echo "Cloudflare setup complete. Run 'make deploy' next."

deploy: build ## Build then deploy to Cloudflare Workers
	npx wrangler deploy --config $(BUILD_WRANGLER_CONFIG)

change-pin: ## make change-pin PIN=123456 -- validates 6 digits, then rotates the live secret + updates .env/.dev.vars
	@if [ -z "$(PIN)" ]; then echo "Usage: make change-pin PIN=123456"; exit 1; fi
	@echo "$(PIN)" | grep -Eq '^[0-9]{6}$$' || (echo "PIN must be exactly 6 digits"; exit 1)
	@echo "$(PIN)" | npx wrangler secret put NUXT_APP_PIN --config $(WRANGLER_CONFIG)
	@node -e "\
		const fs = require('fs'); \
		for (const file of ['.env', '.dev.vars']) { \
			if (!fs.existsSync(file)) continue; \
			const updated = fs.readFileSync(file, 'utf8').replace(/^NUXT_APP_PIN=.*$$/m, 'NUXT_APP_PIN=$(PIN)'); \
			fs.writeFileSync(file, updated); \
		} \
	"
	@echo "PIN rotated. Local .env/.dev.vars updated to match."

clear-changelog: ## Permanently delete every change-log entry from the live KV namespace
	@npx wrangler kv key delete "changelog:index" --binding=CS2_KV --config=$(WRANGLER_CONFIG) --remote
	@echo "Change log cleared."
