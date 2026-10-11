# Base stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Cài đặt dependencies (bao gồm devDependencies để build)
RUN npm install --legacy-peer-deps

# Copy toàn bộ mã nguồn
COPY . .

# Build ứng dụng NestJS sang dist/
RUN npm run build

# ---------------------------------------------
# Production stage (Tối ưu kích thước image nhẹ nhất)
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Chỉ cài production dependencies
RUN npm install --omit=dev --legacy-peer-deps

# Copy file build từ builder
COPY --from=builder /app/dist ./dist

EXPOSE 4000

CMD ["node", "dist/main.js"]
