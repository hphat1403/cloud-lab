# Stage 1: Build React App
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

RUN npm run build

# Stage 2: Serve React App bằng Nginx
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

# Đổi tên nginx.conf tương ứng với tên file thực tế bạn tạo ở client/
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]