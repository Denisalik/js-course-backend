FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
ADD . .
RUN npm run build
RUN npm audit fix
CMD ["npm", "run", "start:prod"]