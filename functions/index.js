const functions = require("firebase-functions");
const express = require('express');
const mongoose = require('mongoose');
const Recipe = require('./models/recipe.model');
const User = require('./models/user.model');
const Tip = require('./models/tip.model');
const FavoriteRecipe = require('./models/favorite_recipe.model');
const FavoriteTip = require('./models/favorite_tip.model');
const ObjectId = require('mongodb').ObjectId;

//MongoDB Connection String
const uri = "Mongo connection string";

let conn = null;

// create an instance of express
var app = express(); 


/***************************************************************************
 * Check Connection - Checks to see if there is an active mongoDB Atlas
 * connection active. If not, creates a connection and assigns it to the
 * global conn variable. If there is already an active connection, just
 * return conn and continue with the operation.
 * 
 * Call checkConnection() on each app.get/post/whatever to ensure there is
 * an active Atlas connection before attempting to perform database 
 * operations. The connection should time out on it's own if unused for a 
 * period of time.
****************************************************************************/
async function checkConnection(){
    if (conn == null) {
  
      console.log("No active connection. Connecting to MongoDB...");
  
      conn = mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000
      }).then(() => mongoose);
  
      // awaiting connection after assigning to the `conn` variable
      // to avoid multiple function calls creating new connections
      await conn;
    } else {
      console.log("Connection already exists.");
    }
  
    return conn;
  }

/***************************************************************************
 * Allow CORS headers & access from anywhere
****************************************************************************/
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PATCH, PUT, DELETE, OPTIONS"
    );
    next();
});


/***************************************************************************
 * Get User Id
****************************************************************************/
 app.get('/getUserId/:email', (req, res) => {

  checkConnection(); res.set(('Access-Control-Allow-Origin', '*'));

  let email = new RegExp('.*' + req.params.email +  '.*', 'i');
  
  User.findOne({email: email}).exec((err, user) => {

    if (err){return res.status(500).json({err: err}); }

    if (user) {
      return res.status(200).json({user});
    } else {
      return res.status(200).json({message: "No user found"});
    }
    
  })

});

/***************************************************************************
 * Post User
 ****************************************************************************/
 app.post('/createUser', (req, res) => {

  checkConnection(); res.set(('Access-Control-Allow-Origin', '*'));
  
  
  const user = new User(JSON.parse(req.body));
  
  User.find( { $or: [ { username: user.username }, { email: user.email } ] } ).then((result) => {
    if (result.length > 0){
      return res.status(200).json({message: "Username or email already in use", data: result});
    }

    user.save()
      .then(createdUser => {
          res.status(201).json({
              message: "User added successfully",
              user: createdUser
          });
      })
      .catch(error => {
          return res.status(500).json({err: error});
      })
    
  }).catch((err) => {return res.status(500).json({err: err})});

});


/***************************************************************************
 * Post Recipe
 ****************************************************************************/
  app.post('/addRecipe', (req, res) => {

  checkConnection(); res.set(('Access-Control-Allow-Origin', '*'));
  
  const recipe = new Recipe(JSON.parse(req.body));

recipe.save()
  .then(createdRecipe => {
      res.status(201).json({
          message: "Recipe added successfully",
          recipe: createdRecipe
      });
  })
  .catch(error => {
      return res.status(500).json({err: error});
  })
});


/***************************************************************************
 * Post Favorite Recipe
 ****************************************************************************/
 app.post('/favoriteRecipe', (req, res) => {

  checkConnection(); res.set(('Access-Control-Allow-Origin', '*'));
  
  const favoriteRecipe = new FavoriteRecipe(JSON.parse(req.body));

  favoriteRecipe.save()
  .then(createdFavorite => {
      res.status(201).json({
          message: "Favorite Recipe added successfully",
          favorite: createdFavorite
      });
  })
  .catch(error => {
      return res.status(500).json({err: error});
  })
});


/***************************************************************************
 * Remove Favorite Recipe / Delete Favorite Recipe
 ****************************************************************************/
 app.delete('/removeFavoriteRecipe/:id', (req, res) => {

  checkConnection(); res.set(('Access-Control-Allow-Origin', '*'));
  
  Recipe.findById(req.params.id).then((recipe) => {

    FavoriteRecipe.deleteOne({recipe: new ObjectId(recipe._id)}).exec((err, result) => {
      if (err){return res.status(500).json({err: err}); }
  
      return res.status(204).json({message: "Favorite Deleted"});
    });
    
  }).catch((err) => {return res.status(500).json({err: err})});
  

});

/***************************************************************************
 * Update Recipe
 ****************************************************************************/
 app.patch('/updateRecipe/:id', (req, res) => {
  const recipeId = req.params.id;
  let updatedRecipe = null;

  Recipe.findById(recipeId)
      .then(recipe => {
          if (!recipe) {
              const error = new Error('Could not find recipe.');
              error.statusCode = 404;
              throw error;
          }

          const newRecipe = new Recipe(JSON.parse(req.body));

          recipe.name = newRecipe.name;
          recipe.description = newRecipe.description;
          recipe.ingredients = newRecipe.ingredients;
          recipe.directions = newRecipe.directions;
          recipe.notes = newRecipe.notes;
          recipe.tags = newRecipe.tags;
          recipe.user = newRecipe.user;
          recipe.date = newRecipe.date;
          recipe.imgUrl = newRecipe.imgUrl;

          updatedRecipe = recipe;
          
          return recipe.save();
      })
      .then(result => {
          res.status(200).json({ message: 'Recipe updated!', recipe: updatedRecipe });
      })
      .catch(err => {
          return res.status(500).json({err: err});
      });
 });


/***************************************************************************
 * Post Tip
 ****************************************************************************/
 app.post('/addTip', (req, res) => {

  checkConnection(); res.set(('Access-Control-Allow-Origin', '*'));
  
  const tip = new Tip(JSON.parse(req.body));

tip.save()
  .then(createdTip => {
      res.status(201).json({
          message: "Tip added successfully",
          recipe: createdTip
      });
  })
  .catch(error => {
      return res.status(500).json({err: error});
  })
});


/***************************************************************************
 * Post Favorite Tip
 ****************************************************************************/
 app.post('/favoriteTip', (req, res) => {

  checkConnection(); res.set(('Access-Control-Allow-Origin', '*'));
  
  const favoriteTip = new FavoriteTip(JSON.parse(req.body));

  favoriteTip.save()
  .then(createdFavorite => {
      res.status(201).json({
          message: "Favorite Tip added successfully",
          favorite: createdFavorite
      });
  })
  .catch(error => {
      return res.status(500).json({err: error});
  })
});


/***************************************************************************
 * Remove Favorite Tip / Delete Favorite Tip
 ****************************************************************************/
 app.delete('/removeFavoriteTip/:id', (req, res) => {

  checkConnection(); res.set(('Access-Control-Allow-Origin', '*'));
  
  Tip.findById(req.params.id).then((tip) => {

    FavoriteTip.deleteOne({tip: new ObjectId(tip._id)}).exec((err, result) => {
      if (err){return res.status(500).json({err: err}); }
  
      return res.status(204).json({message: "Favorite Deleted"});
    });
    
  }).catch((err) => {return res.status(500).json({err: err})});
  

});


/***************************************************************************
 * Update Tip
 ****************************************************************************/
 app.patch('/updateTip/:id', (req, res) => {
  const tipId = req.params.id;

  Tip.findById(tipId)
      .then(tip => {
          if (!tip) {
              const error = new Error('Could not find tip.');
              error.statusCode = 404;
              throw error;
          }

          const newTip = new Tip(JSON.parse(req.body));

          tip.title = newTip.title;
          tip.description = newTip.description;

          return tip.save();
      })
      .then(result => {
          res.status(200).json({ message: 'Tip updated!' });
      })
      .catch(err => {
          return res.status(500).json({err: err});
      });
 });


/***************************************************************************
 * Get Recipes - The basic get recipes from the initial view of view-recipes
 * Limit to 10, sorted by newest first
 ****************************************************************************/
app.get('/getRecipes/:offset', (req, res) => {

  checkConnection(); res.set(('Access-Control-Allow-Origin', '*'));

  Recipe.find().skip(parseInt(req.params.offset)).limit(10).sort({_id: '-1'}).exec((err, recipes) => {

    if (err){return res.status(500).json({err: err}); }

    if (recipes[0]) {
      return res.status(200).json({recipes});
    } else {
      return res.status(200).json({message: "No recipes found"});
    }
    
  })

});


/***************************************************************************
 * Get Favorite Recipes
 ****************************************************************************/
 app.get('/getFavoriteRecipes/:id/:offset', (req, res) => {

  checkConnection(); res.set(('Access-Control-Allow-Origin', '*'));

  FavoriteRecipe.find({user: new ObjectId(req.params.id)}).skip(parseInt(req.params.offset)).sort({_id: '-1'}).exec((err, recipes) => {

    if (err){return res.status(500).json({err: err}); }

    if (recipes[0]) {
      return res.status(200).json({recipes});
    } else {
      return res.status(200).json({message: "No favorite recipes found"});
    }
    
  })

});


/***************************************************************************
 * Populate Get Favorite Recipes
 ****************************************************************************/
 app.get('/getFavoriteRecipes/populate/:id/:offset', (req, res) => {

  checkConnection(); res.set(('Access-Control-Allow-Origin', '*'));

  FavoriteRecipe.find({user: new ObjectId(req.params.id)}).limit(10).skip(parseInt(req.params.offset)).sort({_id: '-1'}).populate("recipe").exec((err, recipes) => {

    if (err){return res.status(500).json({err: err}); }

    if (recipes[0]) {
      return res.status(200).json({recipes});
    } else {
      return res.status(200).json({message: "No favorite recipes found"});
    }
    
  })

});


/***************************************************************************
 * Get Single Recipe - Gets one recipe for use in the view-recipes page
 ****************************************************************************/
 app.get('/getSingleRecipe/:id', (req, res) => {

  checkConnection(); res.set(('Access-Control-Allow-Origin', '*'));

  let recipeId = new ObjectId(req.params.id);
  
  Recipe.findById(recipeId).populate("user").exec((err, recipe) => {
    if (err){return res.status(500).json({err: err}); }

    FavoriteRecipe.findOne({recipe: recipe._id}).exec((err, favorite) => {
      if (err){return res.status(500).json({err: err}); }

      if (recipe) {
        if (favorite){
          return res.status(200).json({recipe, favorite});
        }
        return res.status(200).json({recipe});
      } else {
        return res.status(200).json({message: "Recipe not found"});
      }
    });
    
  })

});

/***************************************************************************
 * Get My Recipes - Gets recipes submitted by user
****************************************************************************/
 app.get('/getMyRecipes/:email/:offset', (req, res) => {

  checkConnection(); res.set(('Access-Control-Allow-Origin', '*'));

  User.findOne({email: req.params.email}).then((user) => {

    Recipe.find({user: new ObjectId(user._id)}).limit(10).skip(parseInt(req.params.offset)).sort({_id: '-1'}).exec((err, recipes) => {
      if (err){return res.status(500).json({err: err}); }
  
      if (recipes[0]) {
        return res.status(200).json({recipes});
      } else {
        return res.status(200).json({message: "Recipes not found"});
      }
      
    })
  }).catch((err) => {return res.status(500).json({err: err})})

});


/***************************************************************************
 * Delete Recipe
 ****************************************************************************/
 app.delete('/deleteRecipe/:id', (req, res) => {

  checkConnection(); res.set(('Access-Control-Allow-Origin', '*'));

  Recipe.findByIdAndRemove(req.params.id).exec((err, result) => {
    if (err){return res.status(500).json({err: err}); }

    FavoriteRecipe.deleteOne({recipe: req.params.id}).exec((err, result2) => {
      if (err){return res.status(500).json({err: err}); }

      return res.status(204).json({message: "Recipe Deleted"});
    })
    
  })

});


/***************************************************************************
 * Search Recipes - Searches all recipes
****************************************************************************/
app.get('/searchAllRecipes/:searchTerm/:offset', (req, res) => {

  checkConnection(); res.set(('Access-Control-Allow-Origin', '*'));
  /*
    Case insensitive search through recipe:
      *name, 
      *description (substring),
       ingredients (title, array of ingredients),
       directions (title, array of steps),
      *notes (substring),
      *tags (find in array)
  */
      let term = new RegExp('.*' + req.params.searchTerm +  '.*', 'i');

    Recipe.find(
        {
          $or:[
            {name: term},
            {description: {$regex: term}},
            {ingredients: {$elemMatch: {title: term}}},
            {"ingredients.ingredients": {$in: [term]}},
            {directions: {$elemMatch: {title: term}}},
            {"directions.steps": {$in: [term]}},
            {notes: {$regex: term}},
            {tags: {$in: [term]}}
          ]
        })
        .limit(10)
        .skip(parseInt(req.params.offset))
        .sort({_id: '-1'}).exec((err, recipes) => {
          if (err){return res.status(500).json({err: err}); }
      
          if (recipes[0]) {
            return res.status(200).json({recipes});
          } else {
            return res.status(200).json({message: "Recipes not found"});
          }
    })
});



/***************************************************************************
 * Search My Recipes - Searches recipes submitted by user
****************************************************************************/
app.get('/searchMyRecipes/:email/:searchTerm/:offset', (req, res) => {

  checkConnection(); res.set(('Access-Control-Allow-Origin', '*'));
  let term = new RegExp('.*' + req.params.searchTerm +  '.*', 'i');

  User.findOne({email: req.params.email}).then((user) => {

    Recipe.find(
      {
        user: new ObjectId(user._id),
        $or:[
          {name: term},
          {description: {$regex: term}},
          {ingredients: {$elemMatch: {title: term}}},
          {"ingredients.ingredients": {$in: [term]}},
          {directions: {$elemMatch: {title: term}}},
          {"directions.steps": {$in: [term]}},
          {notes: {$regex: term}},
          {tags: {$in: [term]}}
        ]
      })
      .limit(10)
      .skip(parseInt(req.params.offset))
      .sort({_id: '-1'}).exec((err, recipes) => {
        if (err){return res.status(500).json({err: err}); }

        if (recipes[0]) {
          return res.status(200).json({recipes});
        } else {
          return res.status(200).json({message: "Recipes not found"});
        }
    })
  }).catch((err) => {return res.status(500).json({err: err})})

});



/***************************************************************************
 * Search Favorite Recipes
 ****************************************************************************/
 app.get('/searchFavoriteRecipes/:id/:searchTerm/:offset', (req, res) => {

   checkConnection(); res.set(('Access-Control-Allow-Origin', '*'));
   let term = new RegExp('.*' + req.params.searchTerm +  '.*', 'i');

   //Returns just the recipe ids for favorites
   FavoriteRecipe.find({user: new ObjectId(req.params.id)}).distinct('recipe').exec((err, favorites) => {
    if (err){ res.status(500).send({err: err}); }

    var oids = [];
      favorites.forEach(function(item){
      oids.push(new ObjectId(item));
    });

    Recipe.find(
      {
        _id: {$in : oids},
        $or:[
          {name: term},
          {description: {$regex: term}},
          {ingredients: {$elemMatch: {title: term}}},
          {"ingredients.ingredients": {$in: [term]}},
          {directions: {$elemMatch: {title: term}}},
          {"directions.steps": {$in: [term]}},
          {notes: {$regex: term}},
          {tags: {$in: [term]}}
        ]
      })
      .limit(10)
      .skip(parseInt(req.params.offset))
      .sort({_id: '-1'}).exec((err, recipes) => {
        if (err){ res.status(500).send({err: err}); }

        if (recipes[0]){
          return res.status(200).json({recipes});
        } else {
          return res.status(200).json({message: "Recipes not found"});
        }
        
      });
    
   });
});



/***************************************************************************
 * Get Tips - The basic get tips from the initial view of quick-tips
 * Limit to 10
 ****************************************************************************/
 app.get('/getTips/:offset', (req, res) => {

  checkConnection(); res.set(('Access-Control-Allow-Origin', '*'));

  Tip.find().skip(parseInt(req.params.offset)).limit(10).exec((err, tips) => {

    if (err){return res.status(500).json({err: err}); }

    if (tips[0]) {
      return res.status(200).json({tips});
    } else {
      return res.status(200).json({message: "No tips found"});
    }
    
  })

});


/***************************************************************************
 * Get Favorite Tips
 ****************************************************************************/
 app.get('/getFavoriteTips/:id/:offset', (req, res) => {

  checkConnection(); res.set(('Access-Control-Allow-Origin', '*'));

  FavoriteTip.find({user: new ObjectId(req.params.id)}).skip(parseInt(req.params.offset)).sort({_id: '-1'}).exec((err, tips) => {

    if (err){return res.status(500).json({err: err}); }

    if (tips[0]) {
      return res.status(200).json({tips});
    } else {
      return res.status(200).json({message: "No favorite tips found"});
    }
    
  })

});


/***************************************************************************
 * Populate Get Favorite Tips
 ****************************************************************************/
 app.get('/getFavoriteTips/populate/:id/:offset', (req, res) => {

  checkConnection(); res.set(('Access-Control-Allow-Origin', '*'));

  FavoriteTip.find({user: new ObjectId(req.params.id)}).sort({_id: '-1'}).limit(10).skip(parseInt(req.params.offset)).populate("tip").exec((err, tips) => {

    if (err){return res.status(500).json({err: err}); }

    if (tips[0]) {
      return res.status(200).json({tips});
    } else {
      return res.status(200).json({message: "No favorite tips found"});
    }
    
  })

});


/***************************************************************************
 * Get Single Tip - Gets one tip for use in the view-tip page
 ****************************************************************************/
 app.get('/getSingleTip/:id', (req, res) => {

  checkConnection(); res.set(('Access-Control-Allow-Origin', '*'));

  let tipId = new ObjectId(req.params.id);
  
  Tip.findById(tipId).exec((err, tip) => {

    if (err){return res.status(500).json({err: err}); }

    FavoriteTip.findOne({tip: tip._id}).exec((err, favorite) => {
      if (err){return res.status(500).json({err: err}); }

      if (tip) {
        if (favorite){
          return res.status(200).json({tip, favorite});
        }
        return res.status(200).json({tip});
      } else {
        return res.status(200).json({message: "Tip not found"});
      }
    });
    
  })

});


/***************************************************************************
 * Get My Tips - Gets tips submitted by user
****************************************************************************/
app.get('/getMyTips/:email/:offset', (req, res) => {

  checkConnection(); res.set(('Access-Control-Allow-Origin', '*'));

  User.findOne({email: req.params.email}).then((user) => {

    Tip.find({user: new ObjectId(user._id)}).limit(10).skip(parseInt(req.params.offset)).exec((err, tips) => {
      if (err){return res.status(500).json({err: err}); }
  
      if (tips[0]) {
        return res.status(200).json({tips});
      } else {
        return res.status(200).json({message: "Tips not found"});
      }
      
    })
  }).catch((err) => {return res.status(500).json({err: err})})

});


/***************************************************************************
 * Delete Tip
 ****************************************************************************/
 app.delete('/deleteTip/:id', (req, res) => {

  checkConnection(); res.set(('Access-Control-Allow-Origin', '*'));

  Tip.findByIdAndRemove(req.params.id).exec((err, result) => {
    if (err){return res.status(500).json({err: err}); }

    FavoriteTip.deleteOne({tip: req.params.id}).exec((err, result2) => {
      if (err){return res.status(500).json({err: err}); }

      return res.status(204).json({message: "Tip Deleted"});
    });
    
  })

});



/***************************************************************************
 * Search Tips - Searches all tips
****************************************************************************/
app.get('/searchAllTips/:searchTerm/:offset', (req, res) => {

  checkConnection(); res.set(('Access-Control-Allow-Origin', '*'));
  /*
    Case insensitive search through tip:
      *title (substring), 
      *description (substring)
  */
      let term = new RegExp('.*' + req.params.searchTerm +  '.*', 'i');

    Tip.find(
        {
          $or:[
            {title: {$regex: term}},
            {description: {$regex: term}},
          ]
        })
        .limit(10)
        .skip(parseInt(req.params.offset))
        .sort({_id: '-1'}).exec((err, tips) => {
          if (err){return res.status(500).json({err: err}); }
      
          if (tips[0]) {
            return res.status(200).json({tips});
          } else {
            return res.status(200).json({message: "Tips not found"});
          }
    })
});



/***************************************************************************
 * Search My Tips - Searches tips submitted by user
****************************************************************************/
app.get('/searchMyTips/:email/:searchTerm/:offset', (req, res) => {

  checkConnection(); res.set(('Access-Control-Allow-Origin', '*'));
  let term = new RegExp('.*' + req.params.searchTerm +  '.*', 'i');

  User.findOne({email: req.params.email}).then((user) => {

    Tip.find(
      {
        $or:[
          {title: {$regex: term}},
          {description: {$regex: term}},
        ]
      })
      .limit(10)
      .skip(parseInt(req.params.offset))
      .sort({_id: '-1'}).exec((err, tips) => {
        if (err){return res.status(500).json({err: err}); }

        if (tips[0]) {
          return res.status(200).json({tips});
        } else {
          return res.status(200).json({message: "Tips not found"});
        }
    })
  }).catch((err) => {return res.status(500).json({err: err})})

});



/***************************************************************************
 * Search Favorite Tips
 ****************************************************************************/
 app.get('/searchFavoriteTips/:id/:searchTerm/:offset', (req, res) => {

   checkConnection(); res.set(('Access-Control-Allow-Origin', '*'));
   let term = new RegExp('.*' + req.params.searchTerm +  '.*', 'i');

   //Returns just the tip ids for favorites
   FavoriteTip.find({user: new ObjectId(req.params.id)}).distinct('tip').exec((err, favorites) => {
    if (err){ res.status(500).send({err: err}); }

    var oids = [];
      favorites.forEach(function(item){
      oids.push(new ObjectId(item));
    });

    Tip.find(
      {
        _id: {$in : oids},
        $or:[
          {title: {$regex: term}},
          {description: {$regex: term}},
        ]
      })
      .limit(10)
      .skip(parseInt(req.params.offset))
      .sort({_id: '-1'}).exec((err, tips) => {
        if (err){ res.status(500).send({err: err}); }

        if (tips[0]){
          return res.status(200).json({tips});
        } else {
          return res.status(200).json({message: "Tips not found"});
        }
        
      });
    
   });
});



//Export routes as api.
exports.api = functions.https.onRequest(app);
