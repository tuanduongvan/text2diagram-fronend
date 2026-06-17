# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
RUN apk add --no-cache git openssh
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
# Build arguments for environment variables
ARG VITE_BACKEND_URL
ARG VITE_PLANTUML_PARSER_URL

# Set environment variables for build time
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
ENV VITE_PLANTUML_PARSER_URL=$VITE_PLANTUML_PARSER_URL

RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
