FROM node:22-alpine AS build
RUN corepack enable && corepack prepare pnpm@10.15.0 --activate
WORKDIR /app
COPY package.json .npmrc ./
RUN pnpm install
COPY . .
RUN pnpm build --configuration=render

FROM nginx:alpine
COPY --from=build /app/dist/alquilerauto-frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
