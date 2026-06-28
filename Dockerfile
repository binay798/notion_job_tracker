# STAGE: Development
FROM node:22-alpine

# Port to listen on
EXPOSE 8000

# Copy app and install packages
WORKDIR /app
COPY . /app/
COPY ./public/defaultResume.txt /app/public/

RUN mkdir public
RUN touch public/favicon.ico
ENV ROOT_PATH=/app

RUN npm install

# Default app commands
CMD ["npm", "run", "start:prod"]


