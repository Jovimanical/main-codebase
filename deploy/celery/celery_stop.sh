#!/bin/bash
PYTHON=/path/to/bin/python
PID_FOLDER=/path/to/pid/

$PYTHON -m celery multi stopwait worker1 --pidfile=${PID_FOLDER}celerycam.pid
$PYTHON -m celery multi stopwait worker1 --pidfile=${PID_FOLDER}celery_beat.pid
$PYTHON -m celery multi stopwait worker1 --pidfile=${PID_FOLDER}celery_worker.pid