FROM node:lts-bookworm

COPY . /helioview

WORKDIR /helioview

RUN npm install

ENTRYPOINT [ "npm", "run", "test"]