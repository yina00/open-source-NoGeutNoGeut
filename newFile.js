const express = require("express");
const { router } = require("./main.js");

router.use(
  express.urlencoded({
    extended: false
  })
);
