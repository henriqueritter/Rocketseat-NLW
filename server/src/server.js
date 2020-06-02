"use strict";
exports.__esModule = true;
var express_1 = require("express");
var app = express_1["default"]();
app.get('/users', function (response, request) {
    console.log('helo');
});
app.listen(3333);
