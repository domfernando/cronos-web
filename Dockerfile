# FROM node:16-alpine

# WORKDIR /usr/src/app

# COPY package*.json ./

# RUN npm install

# COPY . .

# EXPOSE 3000

# CMD [ "node", "src/server.js" ]

# Etapa 1: Build

FROM node:16-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Etapa 2: Runtime
FROM node:16-alpine

WORKDIR /app

COPY --from=build /app .

EXPOSE 3000

CMD ["node", "src/server.js"]
