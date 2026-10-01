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
	cd apps/web && pnpm build
	$(PY) scripts/check_links.py

dev:
	@echo "Run 'make api' and 'make web' in two terminals."

