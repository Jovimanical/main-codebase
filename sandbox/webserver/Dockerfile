FROM tuteria/django_app

MAINTAINER Biola Oyeniyi "gbozee@gmail.com"

# Version
ENV NGINX_VERSION 1.7.8
ENV NPS_VERSION 1.9.32.2
ENV OPENSSL_VERSION 1.0.1j

# Install Build Tools & Dependence
RUN echo "deb-src http://http.debian.net/debian wheezy main\ndeb-src http://http.debian.net/debian wheezy-updates main\ndeb-src http://security.debian.org/ wheezy/updates main" >> /etc/apt/sources.list

RUN apt-get update && \
    apt-get build-dep nginx-full -y && \
    apt-get install -y build-essential zlib1g-dev libpcre3 libpcre3-dev python && \
    apt-get install wget curl -y && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# ===========
# Build Nginx
# ===========

# Setting Up ENV
ENV MODULE_DIR /usr/src/nginx-modules

# Create Module Directory
RUN mkdir ${MODULE_DIR}

# Download Source
RUN cd /usr/src && \
    wget -q http://nginx.org/download/nginx-${NGINX_VERSION}.tar.gz && \
    tar xzf nginx-${NGINX_VERSION}.tar.gz && \
    rm -rf nginx-${NGINX_VERSION}.tar.gz && \

    cd /usr/src && \
    wget -q http://www.openssl.org/source/openssl-${OPENSSL_VERSION}.tar.gz && \
    tar xzf openssl-${OPENSSL_VERSION}.tar.gz && \
    rm -rf openssl-${OPENSSL_VERSION}.tar.gz && \

    # Install Addational Module
    cd ${MODULE_DIR} && \
    wget -q --no-check-certificate https://github.com/pagespeed/ngx_pagespeed/archive/release-${NPS_VERSION}-beta.tar.gz && \
    tar zxf release-${NPS_VERSION}-beta.tar.gz && \
    rm -rf release-${NPS_VERSION}-beta.tar.gz && \
    cd ngx_pagespeed-release-${NPS_VERSION}-beta/ && \
    wget -q --no-check-certificate https://dl.google.com/dl/page-speed/psol/${NPS_VERSION}.tar.gz && \
    tar zxf ${NPS_VERSION}.tar.gz && \
    rm -rf ${NPS_VERSION}.tar.gz && \

    # Compile Nginx
    cd /usr/src/nginx-${NGINX_VERSION} && \
    ./configure \
    --prefix=/etc/nginx \
    --sbin-path=/usr/sbin/nginx \
    --conf-path=/etc/nginx/nginx.conf \
    --pid-path=/var/run/nginx.pid \
    --lock-path=/var/run/nginx.lock \
    --error-log-path=/var/log/nginx/error.log \
    --http-log-path=/var/log/nginx/access.log \
    --with-http_ssl_module \
    --with-http_realip_module \
    --with-http_flv_module \
    --with-http_mp4_module \
    --with-http_gunzip_module \
    --with-http_gzip_static_module \
    --with-http_secure_link_module \
    --with-http_spdy_module \
    --with-file-aio \
    --with-ipv6 \
    --with-sha1=/usr/include/openssl \
    --with-md5=/usr/include/openssl \
    --with-openssl="../openssl-${OPENSSL_VERSION}" \
    --add-module=${MODULE_DIR}/ngx_pagespeed-release-${NPS_VERSION}-beta && \

    # Install Nginx
    cd /usr/src/nginx-${NGINX_VERSION} && \
    make && make install && \

    # Clear source code to reduce container size
    rm -rf /usr/src/*

RUN pip install j2cli
COPY start /start
RUN chmod +x /start
COPY nginx.tmpl /nginx.tmpl
COPY conf/conf.d /etc/nginx/conf
COPY conf/html /etc/nginx/html

# Forward requests and errors to docker logs
RUN ln -sf /dev/stdout /var/log/nginx/access.log
RUN ln -sf /dev/stderr /var/log/nginx/error.log

VOLUME ["/var/cache/nginx", "/var/cache/ngx_pagespeed"]

EXPOSE 80 443

RUN useradd www && useradd nginx

RUN chown -R app:www-data /etc/nginx/html && \
  chmod -R 0755 /etc/nginx/html

# CMD ["nginx", "-g", "daemon off;"]

CMD /start