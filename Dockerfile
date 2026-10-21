FROM node:22-alpine

RUN apk add --no-cache curl
WORKDIR /app
COPY --chown=node:node server.js ./server.js
RUN node --check server.js
ENV NODE_ENV=production PORT=3000
USER node
EXPOSE 3000
HEALTHCHECK --interval=5s --timeout=3s --start-period=0s --retries=2 \
  CMD curl --fail --silent --show-error --max-time 3 --noproxy '*' http://127.0.0.1:3000/health >/dev/null || exit 1
CMD ["node", "server.js"]
