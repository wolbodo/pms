# Use phusion/baseimage as base image. To make your builds reproducible, make
# sure you lock down to a specific version, not to `latest`!
# See https://github.com/phusion/baseimage-docker/blob/master/Changelog.md for
# a list of version numbers.
FROM phusion/baseimage:0.9.18

# Use baseimage-docker's init system.
CMD ["/sbin/my_init"]

# Install postgres

ENV PGDATA /usr/local/pgsql/data

RUN locale-gen en_US.UTF-8
RUN echo 'deb http://apt.postgresql.org/pub/repos/apt/ precise-pgdg main' | tee /etc/apt/sources.list.d/pgdg.list
RUN apt-get update
RUN DEBIAN_FRONTEND=noninteractive apt-get install --force-yes -y nginx postgresql-9.5

# Add Postgres to runit
RUN mkdir /etc/service/postgres
ADD database/run_postgres.sh /etc/service/postgres/run
RUN chmod +x /etc/service/postgres/run

# # Setup database initdb
ADD ./database/db-init.sh /docker-entrypoint-initdb.d/01_init_database.sh
RUN chmod +x /docker-entrypoint-initdb.d/01_init_database.sh

# Setup app
ADD frontend /app/frontend
ADD backend /app/backend
ADD database /app/database

ADD nginx/pms.nginx.conf /etc/nginx/sites-enabled/pms.nginx.conf

# Add Nginx to runit
RUN mkdir /etc/service/nginx
ADD nginx/run_nginx.sh /etc/service/nginx/run
RUN chmod +x /etc/service/nginx/run

# Add Backend to runit
RUN mkdir /etc/service/backend
ADD run_backend.sh /etc/service/backend/run
RUN chmod +x /etc/service/backend/run

# Clean up APT when done.
RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*