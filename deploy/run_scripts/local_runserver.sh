#!/bin/bash

cd /home/app

python manage.py collectstatic --noinput
# python manage.py migrate
echo "Migration Ran successfully"
python manage.py runserver 0.0.0.0:8000
# python manage.py runserver 0.0.0.0:8000
