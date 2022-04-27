
FROM python:3.6
# FROM revolutionsystems/python:3.6.3-wee-optimized-lto

# RUN sudo apt-get install python3.6-dev
# Clone the conf files into the docker container
COPY requirements.txt /home/app/
# Install requirements
RUN pip install -U pip
# RUN pip install -r /home/app/requirements/production.txt
RUN pip install -r /home/app/requirements.txt

ADD code /home/app/code

WORKDIR /home/app
# run startup scripts which copies staticfiles, run migration and starts server
CMD ["uvicorn","--host", "0.0.0.0", "code:app"]

EXPOSE 8000
