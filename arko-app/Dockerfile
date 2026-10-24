FROM node:22-alpine
WORKDIR /app
COPY package.json server.mjs ./
COPY public ./public
COPY data/dld-area-stats.json data/catalog.json data/dld-market.json ./data/
ENV PORT=3000 DATA_DIR=/data
VOLUME /data
EXPOSE 3000
USER node
CMD ["node", "server.mjs"]
