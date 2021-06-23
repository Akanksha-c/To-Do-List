const express=require("express");
const app=express();
const parser=require("body-parser");
const mongoose = require("mongoose");
app.use(parser.urlencoded({extended : true}))
app.set("view engine","ejs");

app.use(express.static("public"))

mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser:true});

const itemsSchema = {
  name : String
};

const Item = mongoose.model(
  "Item",itemsSchema);

const item1 = new Item({
  name:"Welcome to your ToDoList!"
});

const item2=new Item({
  name:"Hit the + button to add a new item!"
});

const item3=new Item({
  name:"<-- Hit this to delete an item!"
});

const defaultItems = [item1,item2,item3];

var items=[];

app.get("/",function(req,res){

  Item.find({},function(err , foundItems){

    if(foundItems.length===0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }
        else {
          console.log("Successfully inserted!");
        }
      });
      res.redirect("/");
    }

    res.render("list",{KindOfDay:day,item:foundItems});
  });

  var today= new Date()

  var options = { weekday: 'long', month: 'long', day: 'numeric' };

  var day=today.toLocaleDateString("en-US",options);


});

app.post("/",function(req,res){
  const itemName=req.body.input;

  const item4 = new Item({
    name:itemName
  });

  item4.save();

  res.redirect("/");
});

app.post("/delete",function(req,res){
  const itemDelete = req.body.checkbox;
  console.log(itemDelete);

  Item.findByIdAndRemove(itemDelete,function(err){
    if(err){
      console.log(err);
    }
    else {
      console.log("Successfully Deleted checked item!")
      res.redirect("/");
    }
  })
})

app.listen(3000,function(req,res){
  console.log("The server has started!");
});
