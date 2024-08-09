exports.mainRender = (req, res) => {
    console.log('현재 사용자:', req.user);
    if (!req.user) {
        return res.redirect('/login');
    }
    res.render("mainHome", { user: req.user });
};
