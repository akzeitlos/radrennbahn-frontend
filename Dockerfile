#############################
# 👉 Development Stage
#############################
FROM node:22-alpine AS dev

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--host"]

#############################
# 👉 Production Stage
#############################
FROM node:22-alpine AS prod

WORKDIR /app

COPY package*.json ./
RUN npm install -g serve && npm install

COPY . .

# VITE_API_URL wird zur Build-Zeit eingebrannt
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
