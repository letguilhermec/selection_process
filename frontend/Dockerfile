FROM node:18-alpine

WORKDIR /app/frontend

COPY . .

RUN npm install && npm run build

CMD ["npm", "start"]
