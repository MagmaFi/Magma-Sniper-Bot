FROM node:16
WORKDIR /app

COPY app /app

RUN npm install
CMD [ "npm", "start" ]
