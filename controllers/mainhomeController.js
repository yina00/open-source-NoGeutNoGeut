exports.connect = (req, res) => {
  res.render("mainHome", { user: req.session.user || null });
};
