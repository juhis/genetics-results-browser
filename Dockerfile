FROM nikolaik/python-nodejs:python3.11-nodejs20-slim
LABEL maintainer="Juha Karjalainen <jkarjala@broadinstitute.org>"

RUN apt-get update && apt-get install -y nginx libz-dev libbz2-dev liblzma-dev zlib1g-dev libpcre2-dev libpcre3-dev libssl-dev libcurl4-openssl-dev bzip2 gcc g++ make

ARG CONFIG_FILE
ARG HTSLIB_VER=1.21
WORKDIR /var/www/genetics-results-browser

RUN curl -LO https://github.com/samtools/htslib/releases/download/${HTSLIB_VER}/htslib-${HTSLIB_VER}.tar.bz2 && \
    tar -xvjf htslib-${HTSLIB_VER}.tar.bz2 && cd htslib-${HTSLIB_VER} && \
    ./configure && make && make install && cd .. && rm -rf htslib-${HTSLIB_VER}*

COPY requirements.txt ./
RUN pip3 install -r requirements.txt

COPY ./ ./
COPY ${CONFIG_FILE} ./src/config.json
COPY ./nginx.conf /etc/nginx/sites-available/default

RUN npm install
RUN npx webpack --mode production

EXPOSE 8080

WORKDIR /mnt/disks/data
CMD service nginx start && /var/www/genetics-results-browser/server/run.py --port 8081
