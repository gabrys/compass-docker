FROM bitnami/minideb:buster
RUN install_packages build-essential libffi-dev ruby-dev rubygems
RUN gem update --no-document --system
RUN gem install --no-document compass

ENV LANG=C.UTF-8 LC_ALL=C.UTF-8
WORKDIR /compass/workdir
