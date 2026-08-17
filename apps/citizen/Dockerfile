FROM node:20-alpine

WORKDIR /app/apps/citizen

COPY apps/citizen/package.json ./
RUN npm install

COPY apps/citizen/ ./
COPY shared/ ../../shared/

EXPOSE 5174

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
