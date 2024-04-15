FROM nikolaik/python-nodejs:python3.11-nodejs20-slim
LABEL maintainer="Juha Karjalainen <jkarjala@broadinstitute.org>"

ARG CONFIG_FILE
WORKDIR /opt/browser

RUN npm install -D webpack-cli

COPY ./ ./
COPY ${CONFIG_FILE} ./src/config.json

RUN pip3 install -r requirements.txt
RUN npm install
RUN npx webpack --mode production

EXPOSE 8080

WORKDIR /mnt/disks/data
CMD /opt/browser/server/run.py
