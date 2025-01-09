# Use an official Node.js image
FROM node:22.11.0

# Install pnpm globally
RUN npm install -g pnpm

# Set the working directory
WORKDIR /app/frontend

# Copy pnpm workspace and lock files
COPY pnpm-workspace.yaml /app/
COPY pnpm-lock.yaml /app/

# Copy the frontend package files
COPY frontend/package.json ./

# Install dependencies
RUN pnpm install

# Copy the rest of the frontend source code
COPY frontend/ ./

# Set NODE_ENV (default to development)
ARG NODE_ENV=development
ENV NODE_ENV=$NODE_ENV

# Build the app in production mode
RUN if [ "$NODE_ENV" = "production" ]; then pnpm run build; fi

# Expose port
EXPOSE 5173

# Start the appropriate command based on NODE_ENV
CMD if [ "$NODE_ENV" = "production" ]; \
    then pnpm run preview; \
    else pnpm run dev; \
    fi
