FROM python:3.6


# FROM revolutionsystems/python:3.6.3-wee-optimized-lto
ENV PYTHONUNBUFFERED 1
# Requirements have to be pulled and installed here, otherwise caching won't work
RUN apt-get update && apt-get install -y git build-essential

ENV REFRESHED_AT 2015-01-01

RUN useradd -m -G sudo app

RUN pip install -U pip 


RUN mkdir -p /root/.ssh/ /scripts && pip install -U setuptools

# Copy over private key, and set permissions
COPY deploy/production/id_rsa /root/.ssh/

# Create known_hosts
RUN touch /root/.ssh/known_hosts && \
    ssh-keyscan bitbucket.org >> /root/.ssh/known_hosts

# Clone the conf files into the docker container
COPY requirements/ /home/app/requirements
# Install requirements
RUN pip install -U pip==19.1
# RUN pip install -r /home/app/requirements/production.txt
RUN pip install -r /home/app/requirements/python3.txt
RUN pip install tablib==0.14.0
RUN pip install sentry-sdk==1.5.1

COPY tuteria/ /home/app/source
COPY deploy/production/invoke.sh /scripts/
COPY deploy/production/invoke1.sh /scripts/
COPY deploy/production/config.py /scripts/
COPY deploy/production/newrelic.ini /scripts/
COPY deploy/production/uwsgi_config.ini /scripts/
COPY deploy/production/server.crt /scripts/
COPY deploy/production/server.key /scripts/
RUN chmod +x /scripts/invoke.sh
RUN chmod +x /scripts/invoke1.sh

WORKDIR /home/app/source

RUN mkdir -p /var/tuteria && mkdir -p /var/tuteria_media && usermod -a -G www-data app && chgrp -R www-data /var/tuteria && chmod -R g+w /var/tuteria && chgrp -R www-data /var/tuteria_media && chmod -R g+w /var/tuteria_media

VOLUME ["/tmp","/var/tuteria","/var/tuteria_media"]
# run startup scripts which copies staticfiles, run migration and starts server
CMD ["/scripts/invoke.sh"]

EXPOSE 8000
EXPOSE 9191
