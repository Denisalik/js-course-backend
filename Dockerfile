FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
ADD . .
RUN npm run build
CMD ["npm", "run", "start:prod"]