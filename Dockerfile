# Stage 1: Build frontend and backend
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Install Node.js and npm
RUN apt-get update && apt-get install -y curl gnupg && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    node --version && npm --version

# Copy backend pom.xml and download dependencies
COPY backend/pom.xml backend/pom.xml
RUN cd backend && mvn dependency:go-offline -q

# Copy frontend package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy all source code
COPY . .

# Build frontend (output to backend/src/main/resources/static/)
RUN npm run build

# Build backend
RUN cd backend && mvn package -DskipTests -q

# Stage 2: Run the application
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/backend/target/*.jar app.jar
EXPOSE 8080
ENV PORT=8080
ENTRYPOINT ["java", "-jar", "app.jar"]
