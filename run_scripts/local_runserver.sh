#!/bin/bash

cd /home/app

python manage.py collectstatic --noinput
su -m app -c "python manage.py migrate"
echo "Migration Ran successfully"
python manage.py runserver 0.0.0.0:8000
