FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy project files
COPY . ./

# Generate Prisma client during build
RUN npm run build

ENV PORT=4000
ENV NODE_ENV=production

EXPOSE 4000

CMD ["npm", "start"]
