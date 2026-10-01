PY = python
export PYTHONPATH := packages/core;apps/api

validate:
	$(PY) scripts/validate.py

api:
	cd apps/api && $(PY) -m uvicorn suffeffix_api.main:app --port 8000 --reload

web:
	cd apps/web && pnpm dev

test:
	$(PY) -m pytest packages/core/tests apps/api/tests -q

schema:
	$(PY) scripts/export_schema.py

stats:
	$(PY) scripts/build_stats.py

site-data:
	$(PY) scripts/export_site.py
	$(PY) scripts/export_downloads.py

site: site-data
	$(PY) scripts/check_brand.py
	cd apps/web && pnpm build
	$(PY) scripts/check_links.py

preview:
	node deploy/preview.mjs

deploy: site
	@test -n "$(HOST)" || (echo 'usage: make deploy HOST=deploy@your-server'; exit 1)
	bash deploy/deploy.sh $(HOST)

dev:
	@echo "Run 'make api' and 'make web' in two terminals."

