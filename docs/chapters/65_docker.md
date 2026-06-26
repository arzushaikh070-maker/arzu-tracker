# 65. Docker

All services containerized:
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/.next ./.next
CMD ["npm", "start"]
```

---
[← Previous Chapter](64_cicd.md) | [Index](../index.md) | [Next Chapter →](66_kubernetes.md)
