FROM node:12

# Create app directory
WORKDIR /app

# Install app dependencies
COPY . /app

RUN sh /app/install-redis.sh

RUN npm install

# Bundle app source

EXPOSE 5000

CMD ["sh", "-c", "redis-server > /dev/null 2>&1 & node server.js"]