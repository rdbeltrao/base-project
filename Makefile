.PHONY: build setup

build:
	turbo build

setup:
	pnpm install
	cp apps/backend/.env.example apps/backend/.env
	cp apps/app/.env.example apps/app/.env
	cp apps/auth/.env.example apps/auth/.env
	cp apps/backoffice/.env.example apps/backoffice/.env
	cp apps/site/.env.example apps/site/.env
	docker-compose up -d
	cd packages/database && pnpm migrate:up && pnpm seed:all && cd ../..
