# Dockerfile for OPI-LC
FROM node:20-alpine

WORKDIR /app
COPY brc20/api/package*.json ./
RUN npm install

COPY brc20/api/ ./
COPY manage.sh ./
RUN chmod +x manage.sh

EXPOSE 3003
CMD ["./manage.sh", "start"]