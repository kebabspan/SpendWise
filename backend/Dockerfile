FROM node:20-alpine

WORKDIR /app

# Frissítjük az npm-et
RUN npm install -g npm@latest @nestjs/cli

# Függőségek telepítése (cache réteg)
COPY package*.json ./
RUN npm install

# Forráskód másolása
COPY . .

EXPOSE 3001

# Alapértelmezett indítás (docker-compose felülírja a command-dal)
CMD ["npm", "run", "start:dev"]
