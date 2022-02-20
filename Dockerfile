FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
ADD . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start:prod"]