const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const app = express();

// EJS 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Express-EJS-Layouts 미들웨어 설정
app.use(expressLayouts);
app.set('layout', 'layouts/layout'); // 기본 레이아웃 파일 설정

// 정적 파일 제공 설정
app.use(express.static(path.join(__dirname, 'public')));

// 라우트 설정
app.get('/', (req, res) => {
  res.render('index');
});

app.get('/category', (req, res) => {
    const categories = /* 데이터베이스에서 가져온 프로필 데이터 */
    res.render('category', { layout: 'layout', title: '카테고리', categories, sortBy: req.query.sortBy, additionalCss: 'category.css' });
  });
  
  

// 서버 시작
const port = process.env.PORT || 80;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
