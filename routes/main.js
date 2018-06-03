var router = require('express').Router();

router.get('/', function (req,res) {
    res.render('main/home');
});

router.get('/product/:id',function(req,res,next){
    //Finding the product by the category id and populating the category fied with its id and name and 
    //rendering the category page
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

module.exports = router;