const express=require("express");
const app=express();
const parser=require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
app.use(parser.urlencoded({extended : true}))
app.set("view engine","ejs");

app.use(express.static("public"))

mongoose.connect("mongodb+srv://admin-username:password@cluster0.i5yyk.mongodb.net/todolistDB",{useNewUrlParser:true});

var today= new Date()

var options = { weekday: 'long', month: 'long', day: 'numeric' };

var day=today.toLocaleDateString("en-US",options);

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

const ListSchema ={
  name: String,
  items:[itemsSchema]
};

const List = mongoose.model("List", ListSchema);

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

app.get("/:customListName",function(req,res){
  const customListName=_.capitalize(req.params.customListName);

  List.findOne({name:customListName},function(err, foundList){
    if(!err){
      if(!foundList){
        const list=new List({
          name:customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      }
      else {
        res.render("list",{KindOfDay:foundList.name ,item:foundList.items});
      }
    }
  });


})

app.post("/",function(req,res){
  const itemName=req.body.input;
  const listName=req.body.list;

  const item4 = new Item({
    name:itemName
  });

  if(listName===day){
    item4.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item4);
      foundList.save();
      res.redirect("/"+listName);
    });
  }
});

app.post("/delete",function(req,res){
  const itemDelete = req.body.checkbox;
  const listName= req.body.listName;

if(listName===day){

  Item.findByIdAndRemove(itemDelete,function(err){
    if(err){
      console.log(err);
    }
    else {
      console.log("Successfully Deleted checked item!")
      res.redirect("/");
    }
  });

}else{
  List.findOneAndUpdate({name:listName},{$pull:{items:{_id:itemDelete}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
  });
}

});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port,function(req,res){
  console.log("The server has started!");
});
