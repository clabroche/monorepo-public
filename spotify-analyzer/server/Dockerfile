FROM alpine:3.14
RUN apk --no-cache add nodejs npm yarn
ARG NPM_TOKEN 
ARG PACKAGE_VERSION
WORKDIR /core
RUN echo -e "\n//npm.pkg.github.com/:_authToken=${NPM_TOKEN}" >> .npmrc
RUN echo -e "\n@clabroche:registry=https://npm.pkg.github.com" >> .npmrc
RUN yarn add "@clabroche/spotify-analyzer-server@${PACKAGE_VERSION}"
RUN rm -f .npmrc

# Add your source files
CMD ./node_modules/.bin/spotify-analyzer-server
