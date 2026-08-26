FROM node:20-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg curl ca-certificates python3 \
  && curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp \
     -o /usr/local/bin/yt-dlp \
  && chmod a+rx /usr/local/bin/yt-dlp \
  && yt-dlp --version \
  && ffmpeg -version | head -n 1 \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 CMD curl --fail http://localhost:8080/api/health || exit 1
CMD ["node", "dist/server.cjs"]
