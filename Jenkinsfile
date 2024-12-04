node {
	def app
	stage('Clone repository') {
		git 'https://github.com/yina00/open-source-NoGeutNoGeut.git'
	}
	stage('Build image') {
		app = docker.build("cyn1018/nogeutnogeut")
	}
	stage('Test image') {
		app.inside {
			sh sh '''
    mkdir -p /tmp/jenkins_test
    echo "깃허브 변경 트리거 젠킨스파일 인식 성공!" > /tmp/jenkins_test/success.txt
    cat /tmp/jenkins_test/success.txt
'''
		}
	}
	stage('Push image') {
		docker.withRegistry('https://registry.hub.docker.com','cyn1018') {
			app.push("${env.BUILD_NUMBER}")
			app.push("latest")
		}
	}
}
