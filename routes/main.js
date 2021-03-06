var router = require('express').Router();
var Product = require('../models/product');
var Cart = require('../models/cart');


function paginate(req,res,next){
    var perPage = 9;
    var page = req.params.page;

    Product
    .find()
    .skip(perPage * page)
    .limit(perPage)
    .populate('category')
    .exec(function(err,products){
        if(err) return next(err);
        res.render('main/product-main',{
            products: products,
            pages: count / perPage
        });
    }); 
}
//Create mapping creates bridge between product databse and elastic search replica set
Product.createMapping(function(err, mapping){
    if(err){
        console.log("error creating mapping");
        console.log(err);
    }else{
        console.log("Mapping created");
        console.log(mapping);
    }
});

//This will replicate all the data in put it in elastic search
var stream = Product.synchronize();
var count = 0;

stream.on('data',function(){
    count++;
});

stream.on('close',function(){
    console.log("Indexed "+count+" documents");
});

stream.on('error',function(err){
    console.log(err);
});

router.get('/cart', function(req, res, next) {
    Cart
        .findOne({ owner: req.user._id })
        .populate('items.item')
        .exec(function(err, foundCart) {
            if (err) return next(err);
            res.render('main/cart', {
                foundCart: foundCart,
                message: req.flash('remove')
            });
        });
});

router.post('/remove', function(req, res, next) {
    Cart.findOne({ owner: req.user._id }, function(err, foundCart) {
        foundCart.items.pull(String(req.body.item));

        foundCart.total = (foundCart.total - parseFloat(req.body.price)).toFixed(2);
        foundCart.save(function(err, found) {
            if (err) return next(err);
            req.flash('remove', 'Successfully removed');
            res.redirect('/cart');
        });
    });
});

router.post('/product/:product_id', function(req, res, next) {
    Cart.findOne({ owner: req.user._id }, function(err, cart) {
        cart.items.push({
            item: req.body.product_id,
            price: parseFloat(req.body.priceValue),
            quantity: parseInt(req.body.quantity)
        });

        cart.total = (cart.total + parseFloat(req.body.priceValue)).toFixed(2);

        cart.save(function(err) {
            if (err) return next(err);
            return res.redirect('/cart');
        });
    });
});

router.post('/search',function(req,res,next){
    res.redirect('/search?q='+ req.body.q);
});

router.get('/search', function(req, res, next) {
    if (req.query.q) {
      Product.search({
        query_string: { query: req.query.q}
      }, function(err, results) {
        if (err) return next(err);
        var data = results.hits.hits.map(function(hit) {
          return hit;
        });
        res.render('main/search-results', {
          query: req.query.q,
          data: data
        });
      });
    }
  });

router.get('/', function (req,res,next) {
    if(req.user){
        paginate(req, res, next);
    }else{
        res.render('main/home');
    }
});

router.get('/page/:page', function(req,res,next){
    paginate(req,res,next);
});

router.get('/products/:id',function(req,res,next){
    console.log(req.params.id);
    //Finding the product by the category id and populating the category fied with its id and name and 
    //rendering the category page.
    Product
    .find({ category: req.params.id })
    .populate('category')
    .exec(function(err,products){
        if(err) return next(err);

        res.render('main/category',{
            products: products
        });
    });
});

router.get('/product/:id',function(req,res,next){
    Product.findById({_id:req.params.id},function(err,product){
        if(err) return next(err);

        res.render('main/product',{
            product:product
        });
    });
});

// Product.search({
//     query_string: {query: "Computer"}
// },function(err,results){
//     if(err) return next(err);
//     console.log(results);
//     var data = results.hits.hits.map(function(hit){
//         return hit;
//     });
//     console.log(data[0]);
// });
module.exports = router;