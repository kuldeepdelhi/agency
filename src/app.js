const express = require('express');
const mongoose = require('mongoose')

const bodyParser = require('body-parser')
const app = express();

mongoose.connect('mongodb://localhost:27017/myapp',{useNewUrlParser:true,useUnifiedTopology:true});

const db = mongoose.connection;

db.on('error',console.error.bind(console,'connection error:'));
db.once('open',function(){
    console.log('connected to MongoDb')
})

const categorySchema= new mongoose.Schema({
    name: String
})
const Category = mongoose.model('Category',categorySchema)

const subcategorySchema = new mongoose.Schema({
    name: String,
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }
})

const subcategory = mongoose.model('Subcategory', subcategorySchema)

app.use(bodyParser.json());

app.get('/categories',async (req,res) =>{
    try{
        const categories = await Category.find();
        res.json(categories);

    }catch (err){
        res.status(500).json({
            message:err.message
        })
    }
})

const port = process.env.PORT || 3000;

app.listen(port,() =>{
    console.log(`server running at http://localhost:${port}`)
})