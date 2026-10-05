FROM nginx:1.27-alpine

# Remove default configuration
RUN rm -rf /etc/nginx/conf.d/default.conf

# Copy master configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy virtual hosts
COPY conf.d/ /etc/nginx/conf.d/

# Copy custom static error pages
COPY html/ /usr/share/nginx/html/

# Expose standard web ports
EXPOSE 80 443

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
