FROM nikolaik/python-nodejs:python3.11-nodejs20-slim
LABEL maintainer="Juha Karjalainen <jkarjala@broadinstitute.org>"

RUN apt-get update && apt-get install -y nginx

ARG CONFIG_FILE
WORKDIR /var/www/genetics-results-browser

COPY ./ ./
COPY ${CONFIG_FILE} ./src/config.json
COPY ./nginx.conf /etc/nginx/sites-available/default

RUN pip3 install -r requirements.txt
RUN npm install
RUN npx webpack --mode production

EXPOSE 8080

WORKDIR /mnt/disks/data
CMD service nginx start && /var/www/genetics-results-browser/server/run.py --port 8080
