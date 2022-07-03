FROM ruby:3.2.0-preview1

RUN gem install rack webrick

COPY . /var/tmp/app

WORKDIR /var/tmp/app
