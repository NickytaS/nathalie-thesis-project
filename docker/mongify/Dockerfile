FROM ruby:3.2

# Install dependencies for MySQL and MongoDB drivers
RUN apt-get update -qq && apt-get install -y \
    build-essential \
    libmariadb-dev-compat \
    libmariadb-dev \
    default-libmysqlclient-dev

# Install mongify gem
RUN gem install mongify mysql2

WORKDIR /app

ENTRYPOINT ["mongify"]
