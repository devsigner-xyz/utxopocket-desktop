# Use an official Node.js image
FROM node:22.11.0

# Install pnpm globally
RUN npm install -g pnpm

# Set the working directory
WORKDIR /app/backend

# Copy pnpm workspace and lock files
COPY pnpm-workspace.yaml /app/
COPY pnpm-lock.yaml /app/

# Copy the backend package files
COPY backend/package.json ./

# Install dependencies
RUN pnpm install

# Copy the rest of the backend source code
COPY backend/ ./

# Set NODE_ENV (default to development)
ARG NODE_ENV=development
ENV NODE_ENV=$NODE_ENV

# Build the app in production mode
RUN if [ "$NODE_ENV" = "production" ]; then pnpm run build; fi

# Expose port
EXPOSE 3000

# Start the appropriate command based on NODE_ENV
CMD if [ "$NODE_ENV" = "production" ]; \
    then node dist/main.js; \
    else pnpm run start:dev; \
    fi
