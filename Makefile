PM ?= pnpm
WRANGLER_CONFIG ?= wrangler.toml
BUILD_WRANGLER_CONFIG ?= .output/server/wrangler.json

.PHONY: help dev dev-restart build test setup deploy change-pin clear-changelog

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*## "}; {printf "%-14s %s\n", $$1, $$2}'

dev: ## Local dev server (KV falls back to fs, no Cloudflare account needed)
	$(PM) run dev

dev-restart: ## Kill any running dev server (incl. the @nuxt/cli wrapper) and start fresh in the background — use after editing .env/.dev.vars, not Ctrl-C+rerun
	@pkill -9 -f "@nuxt/cli" 2>/dev/null || true
	@pkill -9 -f "nuxt.mjs dev" 2>/dev/null || true
	@pkill -9 -f "workerd serve" 2>/dev/null || true
	@for i in $$(seq 1 20); do lsof -i :3000 >/dev/null 2>&1 || break; sleep 0.25; done
	@nohup $(PM) dev > /tmp/nuxt-dev.log 2>&1 & disown
	@sleep 1
	@echo "Dev server restarting in the background — tail -f /tmp/nuxt-dev.log to watch it come up."

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
	BOT_TOKEN=$$(grep '^NUXT_DISCORD_BOT_TOKEN=' .env | cut -d= -f2); \
	PUBLIC_KEY=$$(grep '^NUXT_DISCORD_PUBLIC_KEY=' .env | cut -d= -f2); \
	CHANNEL_ID=$$(grep '^NUXT_DISCORD_CHANNEL_ID=' .env | cut -d= -f2); \
	echo "$$PIN" | npx wrangler secret put NUXT_APP_PIN --config $(WRANGLER_CONFIG); \
	echo "$$SESSION_PW" | npx wrangler secret put NUXT_SESSION_PASSWORD --config $(WRANGLER_CONFIG); \
	echo "$$BOT_TOKEN" | npx wrangler secret put NUXT_DISCORD_BOT_TOKEN --config $(WRANGLER_CONFIG); \
	echo "$$PUBLIC_KEY" | npx wrangler secret put NUXT_DISCORD_PUBLIC_KEY --config $(WRANGLER_CONFIG); \
	echo "$$CHANNEL_ID" | npx wrangler secret put NUXT_DISCORD_CHANNEL_ID --config $(WRANGLER_CONFIG)
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
