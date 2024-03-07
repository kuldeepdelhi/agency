const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();


mongoose.connect('mongodb://localhost:27017/myapp', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('connected to MongoDB');
});


const categorySchema = new mongoose.Schema({
    name: String,
    subcategories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subcategory'
    }]
});

const subcategorySchema = new mongoose.Schema({
    name: String,
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }
});


const Category = mongoose.model('Category', categorySchema);
const Subcategory = mongoose.model('Subcategory', subcategorySchema);


app.use(bodyParser.json());



app.post('/categories', async (req, res) => {
    try {
        const category = new Category({
            name: req.body.name
        });
        const newCategory = await category.save();
        res.status(201).json(newCategory);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


app.get('/categories', async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


app.get('/categories/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json(category);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


app.put('/categories/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        category.name = req.body.name;
        const updatedCategory = await category.save();
        res.json(updatedCategory);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


app.delete('/categories/:id', async (req, res) => {
    try {
        const deletedCategory = await Category.findByIdAndRemove(req.params.id);
        if (!deletedCategory) {
            return res.status(404).json({ message: 'Category not found' });
        }
        // Remove references from subcategories
        await Subcategory.deleteMany({ category: req.params.id });
        res.json({ message: 'Category deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});



app.post('/subcategories', async (req, res) => {
    try {
        const subcategory = new Subcategory({
            name: req.body.name,
            category: req.body.categoryId
        });
        const newSubcategory = await subcategory.save();
        await Category.findByIdAndUpdate(req.body.categoryId, { $push: { subcategories: newSubcategory._id } });
        res.status(201).json(newSubcategory);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


app.get('/subcategories', async (req, res) => {
    try {
        const subcategories = await Subcategory.find();
        res.json(subcategories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/subcategories/:id', async (req, res) => {
    try {
        const subcategory = await Subcategory.findById(req.params.id);
        if (!subcategory) {
            return res.status(404).json({ message: 'Subcategory not found' });
        }
        res.json(subcategory);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


app.put('/subcategories/:id', async (req, res) => {
    try {
        const subcategory = await Subcategory.findById(req.params.id);
        if (!subcategory) {
            return res.status(404).json({ message: 'Subcategory not found' });
        }
        subcategory.name = req.body.name;
        const updatedSubcategory = await subcategory.save();
        res.json(updatedSubcategory);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


app.delete('/subcategories/:id', async (req, res) => {
    try {
        const deletedSubcategory = await Subcategory.findByIdAndRemove(req.params.id);
        if (!deletedSubcategory) {
            return res.status(404).json({ message: 'Subcategory not found' });
        }
    
        await Category.updateOne({ _id: deletedSubcategory.category }, { $pull: { subcategories: deletedSubcategory._id } });
        res.json({ message: 'Subcategory deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
