require('dotenv').config();
const express = require('express');
const methodOverride = require('method-override');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const path = require('path');
const passport = require('./config/passportConfig');
const { ensureAuthenticated } = require('./middlewares/authMiddleware');
const multer = require('multer');
const fs = require('fs');
const http = require('http');
const socketIO = require('socket.io');
const socketSetup = require('./socket');
const cookieParser = require("cookie-parser");
const connectFlash = require("connect-flash");
const uploadDir = path.join(__dirname, 'uploads');
const modifiedController = require("./controllers/modifiedController.js");

// 라우트
const creationRoutes = require('./routes/creationRoutes');
const loginRoutes = require("./routes/loginRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const matchingRoutes = require("./routes/matchingRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const mainhomeRoutes = require("./routes/mainhomeRoutes");
const filterRoutes = require("./routes/filterRoutes");
const mainRoutes = require("./routes/mainRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const seniorProfileRoutes = require("./routes/seniorProfileRoutes");
const studentProfileRoutes = require("./routes/studentProfileRoutes");
const keepRoutes = require("./routes/keepRoutes");
const promiseToStdRoutes = require("./routes/promiseToStdRoutes.js");
const promiseToSnRoutes = require("./routes/promiseToSnRoutes.js");
const promiseListRoutes = require("./routes/promiseListRoutes.js");
const reportRoutes = require("./routes/reportRoutes.js");
const appointmentRoutes = require('./routes/appointmentRoutes.js');
const googleRoutes = require('./routes/googleRoutes');
const postRoutes = require("./routes/postRoutes.js");
const postListRoutes = require("./routes/postListRoutes.js");
const chatRoutes = require('./routes/chatRoutes.js');
const promiseRoutes = require('./routes/promiseRoutes.js');
// 컨트롤러
const errorController = require("./controllers/errorController");
const loginController = require("./controllers/loginController");
const mainController = require("./controllers/mainController");
const detailedController = require("./controllers/detailedController");
const oldProfileController = require("./controllers/oldProfileController");
const youngProfileController = require('./controllers/youngProfileController');
const reportController = require("./controllers/reportController.js");
const deleteController = require("./controllers/deleteController.js") //회원 탈퇴 컨트롤러
const promiseController = require('./controllers/promiseController');

const app = express();
app.set("port", process.env.PORT || 3030);

// 서버 생성
const server = http.createServer(app);

// Socket.IO 설정
const io = socketIO(server);

// 소켓 이벤트 설정
//require('./socket')(io);
socketSetup(io); // io 객체를 소켓 모듈에 전달
// 의존성 주입
promiseController.init(io);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, 'views'));

// 모델 관계 설정
const models = [
  require("./models/member"),
  require("./models/studentProfile"),
  require("./models/chatRoom"),
  require("./models/message"),
  require("./models/seniorProfile"),
  require("./models/matching"),
  require("./models/promise"),
  require("./models/review"),
  require("./models/interestField"),
  require("./models/report"),
  require("./models/keep"),
  require("./models/memberChatRoom"),
  require("./models/board"),
  require("./models/post"),
  require("./models/comment")
];

const [Member, StudentProfile, ChatRoom, Message, SeniorProfile, Matching, Promise, Review, InterestField, Report, Keep, MemberChatRoom] = models;

Member.hasOne(StudentProfile, { foreignKey: "memberNum" });
StudentProfile.belongsTo(Member, { foreignKey: "memberNum" });

Member.hasOne(SeniorProfile, { foreignKey: "memberNum" });
SeniorProfile.belongsTo(Member, { foreignKey: "memberNum" });

Member.hasMany(ChatRoom, { foreignKey: "stdNum" });
Member.hasMany(ChatRoom, { foreignKey: "protectorNum" });
ChatRoom.belongsTo(Member, { as: "Student", foreignKey: "stdNum" });
ChatRoom.belongsTo(Member, { as: "Protector", foreignKey: "protectorNum" });

ChatRoom.hasMany(Message, { foreignKey: "roomNum" });
Message.belongsTo(ChatRoom, { foreignKey: "roomNum" });

Message.belongsTo(Member, { as: 'Sender', foreignKey: 'senderNum' });
Message.belongsTo(Member, { as: 'Receiver', foreignKey: 'receiverNum' });

StudentProfile.belongsToMany(SeniorProfile, { through: Promise, foreignKey: "stdNum" });
SeniorProfile.belongsToMany(StudentProfile, { through: Promise, foreignKey: "seniorNum" });

Promise.hasOne(Matching, { foreignKey: 'promiseNum' });
Matching.belongsTo(Promise, { foreignKey: 'promiseNum' });

Matching.hasMany(Review, { foreignKey: 'matchingNum' });
Review.belongsTo(Matching, { foreignKey: 'matchingNum' });

app.use(methodOverride("_method", { methods: ["POST", "GET"] }));
app.use(express.json());

// 이미지 업로드
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// 디렉토리가 존재하지 않으면 생성
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('업로드 디렉토리를 생성했습니다:', uploadDir);
}

app.use('/uploads', express.static('uploads'));
app.use(express.static(path.join(__dirname, 'public')));

// 세션
app.use(cookieParser("secretCuisine123"));
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false,
  store: new FileStore({ path: './sessions' })
}));
app.use(connectFlash());

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.currentUser = req.user || null;
  next();
});

// 라우트 설정
app.use('/', mainhomeRoutes);
app.use('/filter', filterRoutes);
app.use('/', loginRoutes); // 기존 로그인 라우터
app.use('/', googleRoutes); // 구글 로그인 라우터
app.use('/main', mainController.mainRender);
app.get('/logout', loginController.logout);
app.get('/Detail', detailedController.myPage);
//탈퇴 하기 기능
app.post("/Detail/goodbye", deleteController.board_delete, deleteController.record_delete, deleteController.user_delete);
app.get('/Detail/profile', detailedController.detail);
app.get('/Detail/Senior', detailedController.oldDetail);
app.use('/senior', seniorProfileRoutes);
app.use('/Creation', creationRoutes);
app.get('/modified', modifiedController.modified);
app.post('/Update/Senior', upload.single('profileImage'), oldProfileController.updateSeniorProfile);
app.use('/student', studentProfileRoutes);
app.post('/edit/student', upload.single('profileImage'), youngProfileController.updateStudentProfile);
app.get('/reportexample', (req, res) => {
    res.render("reportexample");
});
app.use('/', categoryRoutes);
app.use('/', uploadRoutes);
app.use('/', matchingRoutes);
app.use('/', keepRoutes);
app.use('/', creationRoutes);
app.use('/review', reviewRoutes);
app.use('/promiseToStd', promiseToStdRoutes);
app.use('/promiseTosn', promiseToSnRoutes);
app.use('/promiseList', promiseRoutes);
app.use('/chat', chatRoutes);
app.use('/promise', promiseRoutes);
app.use('/', appointmentRoutes);
app.use('/', reportRoutes);
app.use('/postList', postListRoutes);
app.use('/post', postRoutes);

app.get('/complete-profile', ensureAuthenticated, async (req, res) => {
  try {
    const user = await Member.findOne({ where: { memberNum: req.session.userID } });

    if (!user) {
      console.log('사용자를 찾을 수 없습니다.');
      return res.redirect('/login');
    }

    if (user.profileCreationStatus) {
      return res.redirect('/main');
    }

    res.render('completeProfile', { user });
  } catch (error) {
    console.error('오류 발생:', error);
    res.redirect('/error');
  }
});

app.post('/complete-profile', ensureAuthenticated, async (req, res) => {
    try {
        console.log('요청 본문:', req.body);

        const { age, userType } = req.body;

        const user = await Member.findOne({ where: { memberNum: req.session.userID } });

        if (!user) {
            console.log('사용자를 찾을 수 없습니다.');
            return res.redirect('/complete-profile');
        }

        user.age = age;
        user.userType = userType;
        user.profileCreationStatus = false;

        const result = await user.save();
        console.log('저장 결과:', result);
        req.session.user = user;
        req.session.userID = user.memberNum;
        req.session.userType = user.userType;

        res.redirect('/creation');
    } catch (error) {
        console.error('오류 발생:', error);
        res.redirect('/complete-profile');
    }
});

app.use(errorController.pageNotFoundError);
app.use(errorController.internalServerError);

// 서버 시작
server.listen(app.get("port"), () => {
  console.log(`Server running at http://localhost:${app.get("port")}`);
});

// io 객체를 내보내기
module.exports = { io, server };