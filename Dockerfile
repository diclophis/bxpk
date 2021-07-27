FROM ruby:3.0.1

RUN gem install rack

COPY . /var/tmp/app

WORKDIR /var/tmp/app
