FROM node:18-slim

WORKDIR /app

# Tools for health checks and DB wait
RUN apt-get update && \
	apt-get install -y --no-install-recommends bash netcat-openbsd ca-certificates && \
	rm -rf /var/lib/apt/lists/*

COPY package*.json ./
# Usamos npm install para permitir inclusão de novas dependências sem travar no package-lock
RUN npm install

COPY . .

COPY entrypoint.sh /app/entrypoint.sh
RUN sed -i 's/\r$//' /app/entrypoint.sh && chmod +x /app/entrypoint.sh

RUN npm run build

EXPOSE 3000

CMD ["/app/entrypoint.sh"]
