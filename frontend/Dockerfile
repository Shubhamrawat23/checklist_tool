FROM node:22-alpine AS builder

WORKDIR /myapp

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build



FROM nginx

RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /myapp/dst  /usr/share/nginx/html

EXPOSE 80