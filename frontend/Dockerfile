FROM node:18-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Use Docker environment for API URL
COPY .env.docker .env

RUN npm run build

EXPOSE 3001

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "3001"]
