FROM node:20-alpine

WORKDIR /app

# Függőségek telepítése (cache réteg)
COPY package*.json ./
RUN npm install

# Forráskód másolása
COPY . .

EXPOSE 5173

# Vite dev szerver – host 0.0.0.0 hogy Docker-en kívülről is elérhető legyen
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
