#!/bin/bash

echo "Migration Ran successfully"
# NEW_RELIC_CONFIG_FILE=/scripts/newrelic.ini newrelic-admin run-program gunicorn -w 2 -b 0.0.0.0:8000 --certfile=/scripts/server.crt --keyfile=/scripts/server.key -c /scripts/config.py config.wsgi
gunicorn -w 2 --worker-class="egg:meinheld#gunicorn_worker" -b 0.0.0.0:8000 -c ../deploy/production/config.py config.wsgi
# NEW_RELIC_CONFIG_FILE=/scripts/newrelic.ini newrelic-admin run-program gunicorn -w 2 --worker-class="egg:meinheld#gunicorn_worker" -b 0.0.0.0:8000 -c /scripts/config.py config.wsgi

# NEW_RELIC_CONFIG_FILE=/scripts/newrelic.ini newrelic-admin run-program uwsgi /scripts/uwsgi_config.ini


