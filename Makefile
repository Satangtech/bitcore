up:
	docker-compose -f docker-compose.fvm.yml up -d && make logs-node

logs-node:
	docker-compose -f docker-compose.fvm.yml logs -f node

restart:
	docker-compose -f docker-compose.fvm.yml restart

down:
	docker-compose -f docker-compose.fvm.yml down -v
