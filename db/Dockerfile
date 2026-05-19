FROM postgres:16-alpine

ENV POSTGRES_DB=sportshop
ENV POSTGRES_USER=sportshop
ENV POSTGRES_PASSWORD=sportshop

COPY init.sql /docker-entrypoint-initdb.d/init.sql
