FROM node:22-alpine AS deps

WORKDIR /app

COPY package*.json ./
RUN npm ci

FROM node:22-alpine AS build

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

ARG STRAPI_URL=http://backend:1337
ARG STRAPI_PUBLIC_URL=http://localhost:1337
ARG STRAPI_HOME_SLUG=startseite

ENV STRAPI_URL=$STRAPI_URL
ENV STRAPI_PUBLIC_URL=$STRAPI_PUBLIC_URL
ENV STRAPI_HOME_SLUG=$STRAPI_HOME_SLUG

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
