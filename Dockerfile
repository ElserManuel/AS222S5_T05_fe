# Etapa de construcción
FROM node:20-alpine AS builder

# Directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar el código fuente
COPY . .

# Construir la aplicación
RUN npm run build

# Verificar el contenido exacto del directorio dist
RUN ls -la dist && echo "Contenido de dist:" && cd dist && ls -la

# Etapa de producción
FROM nginx:alpine

# Copiar la configuración personalizada de nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar los archivos construidos desde la etapa anterior
COPY --from=builder /app/dist/gorseia/* /usr/share/nginx/html/

# Exponer el puerto 80
EXPOSE 80

# Iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
