# Use phusion/baseimage as base image. To make your builds reproducible, make
# sure you lock down to a specific version, not to `latest`!
# See https://github.com/phusion/baseimage-docker/blob/master/Changelog.md for
# a list of version numbers.
FROM phusion/baseimage:0.9.18

# Use baseimage-docker's init system.
CMD ["/sbin/my_init"]

# Install postgres
RUN locale-gen en_US.UTF-8
RUN echo 'deb http://apt.postgresql.org/pub/repos/apt/ precise-pgdg main' | tee /etc/apt/sources.list.d/pgdg.list
RUN apt-get update
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y postgresql-9.5

# Configure postgres
RUN mkdir -p /usr/local/pgsql/data
RUN chown postgres:postgres /usr/local/pgsql/data
RUN su - postgres -c '/usr/lib/postgresql/9.5/bin/initdb -D /usr/local/pgsql/data/'

# Adjust PostgreSQL configuration so that remote connections to the
# database are possible
# VERY INSECURE! Configure your own users for a production app
RUN echo "local pms pms trust" >> /usr/local/pgsql/data/pg_hba.conf

# And add ``listen_addresses`` to ``/usr/local/pgsql/data/postgresql.conf``
RUN echo "listen_addresses='*'" >> /usr/local/pgsql/data/postgresql.conf

# Add Postgres to runit
RUN mkdir /etc/service/postgres
ADD run_postgres.sh /etc/service/postgres/run
RUN chown root /etc/service/postgres/run

# Clean up APT when done.
RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*