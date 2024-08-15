var express = require('express');
var router = express.Router();
const request = require('request');
var Todo = require('../models/Todo');
//
function create_timestamp(){
    return parseInt(new Date().getTime() / 1000);
}
//this is rending the page without getting data from mongoDB
router.get('/list', function(req, res, next) {
    res.render('todo/list');
});
//this is the API to query the list
router.get('/read_list', function(req, res, next) {
    var todo = new Todo();
    todo.find(
        {},
        {limit:req.query.limit?req.query.limit:10},   //default is 10 item
        '',
        {created_time: -1}, //latest come first
        function(results){
            // console.log(results);
            res.json(results);
        });
});
//POST request
router.post('/create_new', async (req, res, next) => {
    var todo = new Todo();
    // if (req.body[''])
    todo.create(
        {
            "id": req.body['id'],
            "title": req.body['title'],
            "categorical": req.body['categorical'],
            "is_active": true,
            "created_time": create_timestamp()
        },
        function(results){
            if (results.error) {
                console.log(results.error);
                res.status(500).json({ error: 'An error occurred' });
            } else if (results.duplicate) {
                res.status(400).json({ error: 'Item with the same name already exists' });
            } else {
                res.json(results);
            }
            // res.send(results);
        });
});
//PUT request
router.put('/update_me', function(req, res, next) {
    var todo = new Todo();
    todo.update(
        {id: req.body['id']},
        {title: req.body['title']},
        function(results){
            if (results.error) {
                console.log(results.error);
                res.status(500).json({ error: 'An error occurred' });
            } else {
                res.json(results);
            }
        });
});

router.delete('/delete', function(req, res, next) {
    var todo = new Todo();
    todo.delete(
        {id: req.body['id']},
        function(results){
            if (results.error) {
                console.log(results.error);
                res.status(500).json({ error: 'An error occurred' });
            } else {
                res.json(results);
            }
        });
});

router.post("/deactive", function (req, res, next) {
  var todo = new Todo();
  todo.update({ id: req.body["id"] }, { is_active: false }, function (results) {
    if (results.error) {
      console.log(results.error);
      res.status(500).json({ error: "An error occurred" });
    } else {
      res.json(results);
    }
  });
});

module.exports = router;
