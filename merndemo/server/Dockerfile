FROM node:20

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY server/ ./server/

EXPOSE 5000

CMD ["node", "server/server.js"]