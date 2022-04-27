docker build -f compose/django/Dockerfile -t=registry.gitlab.com/tuteria/tuteria/staging .
docker push registry.gitlab.com/tuteria/tuteria/staging
# cd /home/sama/tuteria && docker build -f compose/celery/Dockerfile -t=registry.gitlab.com/tuteria/tuteria/celery compose/celery
# docker push registry.gitlab.com/tuteria/tuteria/celery
# cd ~/projects/tuteria/ && docker build -f compose/django/Dockerfile -t=gbozee/tuteria .
