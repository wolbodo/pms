FROM ubuntu

# Update apt for node and postgres
 
RUN locale-gen en_US.UTF-8
RUN apt-get update && apt-get install -y curl lsb-release
RUN sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt/ `lsb_release -cs`-pgdg main" >> /etc/apt/sources.list.d/pgdg.list'
RUN curl -q -L https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
RUN curl -sL https://deb.nodesource.com/setup_6.x | bash -

# Install forego
ADD https://github.com/jwilder/forego/releases/download/v0.16.1/forego /usr/local/bin/forego
RUN chmod u+x /usr/local/bin/forego

RUN DEBIAN_FRONTEND=noninteractive apt-get update &&  apt-get install -yyy nginx inotify-tools build-essential curl nodejs gcc-multilib libssl-dev libreadline-dev bison flex postgresql-server-dev-9.5

# Install rust
RUN curl -f -L https://static.rust-lang.org/rustup.sh -O && sh rustup.sh --channel=nightly --disable-sudo

ADD nginx/pms.nginx.conf /etc/nginx/sites-available/default

RUN npm set progress=false

RUN mkdir /app
WORKDIR /app

CMD ["forego", "start", "-r"]