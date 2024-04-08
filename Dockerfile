ARG NODE_VERSION=20.9.0

FROM node:${NODE_VERSION}-alpine

ENV NODE_ENV production

WORKDIR /usr/src/app

# Install Python
RUN apk --no-cache add python3

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

# Create the uploads directory and set permissions
RUN mkdir -p /usr/src/app/uploads && chown -R node:node /usr/src/app/uploads

USER node

COPY . .

EXPOSE 3000

CMD npm start