const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(expressLayouts);
app.set('layout', 'layouts/layout');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/category', (req, res) => {
    const categories = /* 데이터베이스에서 가져온 프로필 데이터 */
    res.render('category', { layout: 'layout', title: '카테고리', categories, sortBy: req.query.sortBy, additionalCss: 'category.css' });
  });
  
  

const port = process.env.PORT || 80;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
