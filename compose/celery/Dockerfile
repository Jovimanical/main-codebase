# FROM gbozee/tuteria:latest
FROM registry.gitlab.com/tuteria/tuteria:latest
MAINTAINER Biola Oyeniyi "gbozee@gmail.com"

# Install Supervisor.
RUN \
  apt-get update && \
  apt-get install -y supervisor && \
  rm -rf /var/lib/apt/lists/* && \
  sed -i 's/^\(\[supervisord\]\)$/\1\nnodaemon=true/' /etc/supervisor/supervisord.conf

# Define mountable directories.
VOLUME ["/etc/supervisor/conf.d"]

# Define working directory.
WORKDIR /home/app/source

COPY supervisod.conf /etc/supervisor/conf.d/supervisord.conf
COPY newrelic.ini /newrelic.ini

EXPOSE 5555

# Define default command.
CMD ["supervisord", "-c", "/etc/supervisor/supervisord.conf"]
