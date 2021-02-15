FROM centos:8

ENV SOURCE_DIRECTORY /root/project
COPY . $SOURCE_DIRECTORY
WORKDIR $SOURCE_DIRECTORY

RUN \
    yum -y groupinstall -y "Development Tools" && \
    yum -y update && \
    yum -y install python2 && \
    cp /usr/bin/python2 /usr/bin/python && \
    curl --silent --location https://rpm.nodesource.com/setup_15.x | bash - && \
    curl --silent --location https://dl.yarnpkg.com/rpm/yarn.repo | tee /etc/yum.repos.d/yarn.repo && \
    rpm --import https://dl.yarnpkg.com/rpm/pubkey.gpg && \
    yum -y install nodejs yarn && \
    yarn && \
    yarn build
