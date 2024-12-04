# Base image 선택
FROM node

# 필수 패키지 설치
RUN apt-get update && apt-get install -y \
    && apt-get clean

# 작업 디렉토리 설정 및 소스 복사
WORKDIR /noguet
COPY . /noguet

# 프로젝트 의존성 설치
RUN npm install

# 애플리케이션 실행
CMD ["node", "main.js"]

