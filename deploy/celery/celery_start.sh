#!/bin/bash
PYTHON=/path/to/bin/python
PROJECT_FOLDER=/project_dir/project/
PID_FOLDER=/path/to/pid/
LOGS_FOLDER=/path/to/logs/
BEAT_SHEDULE_FILE=/path/to/shedule/celerybeat-schedule  # celery beat need to store the last run times of the tasks in a local database file

$PYTHON ${PROJECT_FOLDER}manage.py celery worker --concurrency=1 --detach --pidfile=${PID_FOLDER}celery_worker.pid --logfile=${LOGS_FOLDER}celery_worker.log
$PYTHON ${PROJECT_FOLDER}manage.py celery beat --detach --pidfile=${PID_FOLDER}celery_beat.pid --logfile=${LOGS_FOLDER}celery_beat.log -s ${BEAT_SHEDULE_FILE}
$PYTHON ${PROJECT_FOLDER}manage.py celerycam --frequency=10.0 --detach --pidfile=${PID_FOLDER}celerycam.pid --logfile=${LOGS_FOLDER}celerycam.log