FROM node:22-alpine AS builder

WORKDIR /myapp

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL = $VITE_API_BASE_URL

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build



FROM nginx

RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /myapp/dist  /usr/share/nginx/html

RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d

EXPOSE 80