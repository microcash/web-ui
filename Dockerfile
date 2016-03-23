FROM debian:jessie

RUN useradd -s /bin/sh microcash

WORKDIR /opt/microcash
CMD /opt/microcash/mc64

COPY settings.txt ./

VOLUME /opt/microcash/network
VOLUME /opt/microcash/wallets

EXPOSE 8080
EXPOSE 777

COPY mc64 ./
COPY web ./web/

RUN chown -R microcash:microcash .
USER microcash
