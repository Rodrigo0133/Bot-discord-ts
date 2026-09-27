FROM node:24.21.0

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY ./src ./src
COPY ./assets ./assets

RUN npm run build

EXPOSE 3000

CMD ["node", "dist/index.js"]
