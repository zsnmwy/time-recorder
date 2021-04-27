FROM base_image;

# Using in dev
ADD ./ /home/admin/app
WORKDIR /home/admin/app
RUN npm install
ENTRYPOINT /usr/sbin/sshd && \
mkdir tempAsset && \
npm run build && \
node bundle/index.js 