FROM node:22-alpine AS build

WORKDIR /app

RUN apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev vips-dev git

COPY package*.json ./
RUN npm ci

COPY . .

ENV NODE_ENV=production
ENV NODE_OPTIONS=--max-old-space-size=4096
RUN npm run build
RUN npm prune --omit=dev

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=1337

RUN apk add --no-cache vips

COPY --from=build /app ./

EXPOSE 1337

CMD ["npm", "run", "start"]
