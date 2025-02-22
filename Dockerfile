# Stage 1: Build the application
FROM node:22.6 AS builder

# Set the working directory
WORKDIR /app

# Copy the package.json and yarn.lock files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install

# Copy the rest of the application code
COPY . .

# Download the assets for the application
RUN yarn fetch-assets

# Build the application
RUN yarn build

# Stage 2: Serve the built files
FROM python:3.11-slim

# Set the working directory
WORKDIR /app

# Copy the built files from the builder stage
COPY --from=builder /app/dist /app

# User
RUN groupadd -r botc && useradd -r -g botc -d /app -c "BOTC User" -s /bin/bash botc
RUN chown -R botc:botc /app
USER botc:botc


# Expose the port the app runs on
EXPOSE 8000

# Start the Python HTTP server and bind to all interfaces
CMD ["python3", "-m", "http.server", "8000", "--bind", "0.0.0.0"]