#!/bin/bash

cd /home/app/source
python manage.py collectstatic --noinput
python manage.py migrate djcelery --fake 
# python manage.py migrate --noinput
echo "Migration Ran successfully"
# echo y|python manage.py rebuild_index
#NEW_RELIC_CONFIG_FILE=/scripts/newrelic.ini newrelic-admin run-program gunicorn -w 2 -b 0.0.0.0:8000 -c /scripts/config.py config.wsgi
