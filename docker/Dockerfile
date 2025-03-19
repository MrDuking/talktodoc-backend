# Build stage
FROM node:20.13.1-alpine AS build-stage
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install
COPY . .
RUN yarn build

# Production stage
FROM node:20.13.1-alpine AS production
WORKDIR /app
COPY --from=build-stage /app/dist ./dist
COPY --from=build-stage /app/node_modules ./node_modules
COPY --from=build-stage /app/protos ./protos 
EXPOSE 3000
CMD ["node", "dist/main.js"]