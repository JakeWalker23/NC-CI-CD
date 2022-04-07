FROM node

COPY package-lock.json package.json ./

RUN npm install

COPY . .

CMD ["npm", "start"]