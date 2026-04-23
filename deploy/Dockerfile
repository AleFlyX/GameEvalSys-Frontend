FROM node:20-alpine AS build

WORKDIR /app

# 换淘宝源
RUN npm config set registry https://registry.npmmirror.com

# 分离依赖和源码，利用 Docker 缓存
COPY package*.json ./
RUN npm ci && npm cache clean --force

COPY . .
RUN npm run build

# 若想直接使用本地dist文件，不需要build,则注释掉上半部分(1 - 9行)
FROM nginx:1.28-alpine

COPY deploy/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/deploy/dist /usr/share/nginx/html
# 若想直接使用本地dist文件,则注释掉上面两行,并取消下面一行的注释
# COPY deploy/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
