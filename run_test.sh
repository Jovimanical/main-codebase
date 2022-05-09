pip install pytest==6.2.4 pytest-django==4.4.0 pytest-mock==3.6.1 pytest-pythonpath==0.7

# export DATABASE_URL=postgres://tuteria:punnisher@127.0.0.1:5430/tuteria
export DATABASE_URL=postgres://tuteria:punnisher@master/tuteria
export DJANGO_CONFIGURATION=StagingDev
export BROKER_URL=redis://redis:6379/
export CELERY_RESULT_BACKEND=redis://redis/
export CLOUDINARY_URL=cloudinary://728568457692931:GUot9JhC1Rol3xfhen7dOLNif_k@tuteria
pytest -s tuteria --create-db
