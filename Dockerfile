FROM node:24-alpine AS deps
WORKDIR /app/basic-api
COPY basic-api/package*.json ./
RUN npm ci

FROM node:24-alpine AS build
WORKDIR /app/basic-api
COPY --from=deps /app/basic-api/node_modules ./node_modules
COPY basic-api/ ./
RUN npx prisma generate
RUN npm run build

FROM node:24-alpine AS production
WORKDIR /app/basic-api
ENV NODE_ENV=production
COPY basic-api/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/basic-api/dist ./dist
COPY --from=build /app/basic-api/generated ./generated
COPY --from=build /app/basic-api/prisma ./prisma
USER node
EXPOSE 3000
CMD ["node", "dist/src/main.js"]