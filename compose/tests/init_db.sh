 #!/usr/bin/env bash

/etc/init.d/postgresql start # starting the service
sudo -u postgres sh -c 'createuser tuteria & createdb tuteria' # creating a root user
sudo -u postgres psql -c "ALTER USER tuteria PASSWORD 'punnisher';" # setting up the root password
sudo -u postgres psql -c "ALTER USER tuteria WITH SUPERUSER;" # ensure user can create db
