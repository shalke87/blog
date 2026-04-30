FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

# Compila TypeScript
RUN npm run build

CMD ["npm", "start"]
