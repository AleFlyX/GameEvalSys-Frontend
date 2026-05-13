FROM nginxinc/nginx-unprivileged:1.29-alpine

COPY deploy/cd/nginx.conf /etc/nginx/templates/default.conf.template
COPY deploy/cd/dist /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
