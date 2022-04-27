FROM gbozee/django_app
MAINTAINER Biola Oyeniyi "gbozee@gmail.com"

ENV REFRESHED_AT 2015-01-01

WORKDIR /home/app

ADD requirements.txt /home/app/requirements.txt
RUN pip install --upgrade pip
RUN pip install -r requirements.txt
RUN pip uninstall -y django-devserver
RUN pip install --upgrade git+git://github.com/dcramer/django-devserver#egg=django-devserver
RUN pip install flower
RUN pip install gunicorn
RUN pip install uwsgi

ADD . /home/app
VOLUME ["/home/app"]

# ENV DATABASE_URL=
# RUN python manage.py migrate
	
EXPOSE 8000

# ENTRYPOINT ["python", "manage.py"]
# CMD ["runserver","0.0.0.0:8000"]
