
const express = require('express');
const methodOverride = require('method-override');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const path = require('path');
const passport = require('./config/passportConfig');
const multer = require('multer');
const http = require('http');
const fs = require('fs');
const socketIo = require('socket.io');
const cookieParser = require("cookie-parser");
const expressValidator = require("express-validator");
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
const studentProfileRoutes = require("./routes/studentProfileRoutes"); //68 추가
const keepRoutes = require("./routes/keepRoutes");
const promiseToStdRoutes = require("./routes/promiseToStdRoutes.js");
const promiseToSnRoutese = require("./routes/promiseToSnRoutes.js");
const promiseListRoutes = require("./routes/promiseListRoutes.js");
const reportRoutes = require("./routes/reportRoutes.js");
const appointmentRoutes = require('./routes/appointmentRoutes.js');
// 컨트롤러
const errorController = require("./controllers/errorController");
const loginController = require("./controllers/loginController");
const mainController = require("./controllers/mainController");
const detailedController = require("./controllers/detailedController");
const oldProfileController = require("./controllers/oldProfileController");
const youngProfileController = require('./controllers/youngProfileController'); //68 추가
const reportController=require("./controllers/reportController.js");
const app = express();
app.set("port", process.env.PORT || 8080);


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, 'views'));

//모델 관계 설정
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
  require("./models/memberChatRoom")
];

const [Member, StudentProfile, ChatRoom, Message, SeniorProfile, Matching, Promise, Review, InterestField, Report, Keep, MemberChatRoom] = models;

//모델 관계 설정
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

//학생 - 약속 - 노인 (N:M)
StudentProfile.belongsToMany(SeniorProfile, { through: Promise, foreignKey: "stdNum" });
SeniorProfile.belongsToMany(StudentProfile, { through: Promise, foreignKey: "seniorNum" });
//매칭 - 약속 관계 (1:1)
Promise.hasOne(Matching, { foreignKey: 'promiseNum' });
Matching.belongsTo(Promise, { foreignKey: 'promiseNum' });
//매칭 - 후기 관계 (1:N)
Matching.hasMany(Review, { foreignKey: 'matchingNum' });
Review.belongsTo(Matching, { foreignKey: 'matchingNum' });

app.use(methodOverride("_method", { methods: ["POST", "GET"] }));
app.use(express.json());

//이미지 업로드
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

//디렉토리가 존재하지 않으면 생성
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('업로드 디렉토리를 생성했습니다:', uploadDir);
}

app.use('/uploads', express.static('uploads'));
app.use(express.static(path.join(__dirname, 'public')));

//세션
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

//라우트 설정
app.use('/', mainhomeRoutes);
app.use('/filter', filterRoutes);
app.get("/login", loginController.login);
app.post("/login", loginController.postLogin);
app.get("/main", mainController.mainRender);
app.get('/logout', loginController.logout);
app.get("/Detail", detailedController.myDetail);
app.get("/Detail/profile", detailedController.detail);
app.get("/Detail/Senior", detailedController.oldDetail);
app.use('/senior', seniorProfileRoutes); //시니어 프로필 라우터 추가
app.use('/Creation', creationRoutes);
app.get("/modified", modifiedController.modified);
//app.get("/Update/Senior", oldProfileController.modifiedSeniorProfile);
app.post("/Update/Senior", upload.single('profileImage'), oldProfileController.updateSeniorProfile);
app.use("/student", studentProfileRoutes); // 68 수정
app.post("/edit/student", upload.single('profileImage'), youngProfileController.updateStudentProfile);
app.get("/reportexample", (req, res) => {
    res.render("reportexample");
});
app.use("/", categoryRoutes);
app.use("/", loginRoutes);
app.use("/", filterRoutes);
app.use("/", uploadRoutes);
app.use("/", matchingRoutes);
app.use("/", keepRoutes);
app.use("/", creationRoutes);
app.use('/review', reviewRoutes);
app.use('/review', reviewRoutes);
app.use('/promiseToStd', promiseToStdRoutes);
app.use('/promiseTosn', promiseToSnRoutese)
app.use('/promiseList', promiseListRoutes);
app.use('/', appointmentRoutes);

//라우트 설정
app.use('/', reportRoutes); //reportRoutes 추가

app.use(errorController.pageNotFoundError);
app.use(errorController.internalServerError);

//데이터베이스 동기화 및 서버 시작
const server = app.listen(app.get("port"), () => {
  console.log(`Server running at http://localhost:${app.get("port")}`);
});
