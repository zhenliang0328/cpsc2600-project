const express = require('express');
const app = express();

const connection = require('./db/connection.js');

connection.once('open', () => {
	const server = app.listen(process.env.PORT, () => {
		console.log("Connected and listening");
	});
});

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const Food = require('./models/Food.js');
const MealPlan = require('./models/MealPlan.js');
const User = require('./models/User.js');
const FoodType = require('./models/FoodType.js');

//Food API
app.post('/api/v1/foods', (req, res) => {
	let newFood = new Food({
		name: req.body.name,
		unitNum: req.body.unitNum,
		unitStr: req.body.unitStr,
		fat: req.body.fat,
		carb: req.body.carb,
		protein: req.body.protein,
		type: req.body.type
	});
	newFood.save()
		.then(result => {
			res.set('content-location', `/api/v1/foods/${newFood._id}`);
			res.status(201).json({
				data: newFood,
				url: `/api/v1/foods/${newFood._id}`
			})
		})
		.catch(error => res.status(500).send(error));
})

app.get('/api/v1/foods', (req, res) => {
	Food.find({}).exec()
		.then(results => {
			res.status(200).json(results);
		})
		.catch(error => res.status(500).send(error));
});
app.get('/api/v1/foods/:id', (req, res) => {
	Food.find({ _id: req.params.id }).exec()
		.then(result => {
			res.status(200).json(result);
		})
		.catch(error => res.status(500).send(error));
});

//Meal API
app.post('/api/v1/mealplans', (req, res) => {
	let newMPlan = new MealPlan({
		name: req.body.name,
		foods: req.body.foods
	});
	newMPlan.save()
		.then(result => {
			res.set('content-location', `/api/v1/mealplans/${newMPlan._id}`);
			res.status(201).json({
				data: newMPlan,
				url: `/api/v1/mealplans/${newMPlan._id}`
			})
		})
		.catch(error => res.status(500).send(error));
})

app.get('/api/v1/mealplans', (req, res) => {
	MealPlan.find({}).exec()
		.then(results => {
			res.status(200).json(results);
		})
		.catch(error => res.status(500).send(error));
});
app.get('/api/v1/mealplans/:id', (req, res) => {
	MealPlan.find({ _id: req.params.id })
		.populate("foods._food")
		.exec()
		.then(results => {
			res.status(200).json(results);
		})
		.catch(error => res.status(500).send(error));
});


app.patch('/api/v1/mealplans/updateFoods/:mealplanId', (req, res) => {
	MealPlan.findOneAndUpdate(
		{ _id: req.params.mealplanId }
		, { foods: req.body }
		, { new: true }
	).populate("foods._food")
		.exec()
		.then((result) => {
			res.status(200).json(result);
		})
		.catch(error => res.status(500).send(error));
})

app.delete('/api/v1/mealplans/delete/:mealplanId', (req, res) => {
	MealPlan.deleteOne({ _id: req.params.mealplanId })
		.exec()
		.then((result) => {
			res.status(200).json(result);
		})
		.catch(error => res.status(500).send(error));
})



//User API
app.post('/api/v1/users', (req, res) => {
	let newUser = new User({
		name: req.body.name,
		mealPlans: []
	});
	newUser.save()
		.then(result => {
			res.set('content-location', `/api/v1/users/${newUser._id}`);
			res.status(201).json({
				data: newUser,
				url: `/api/v1/users/${newUser._id}`
			})
		})
		.catch(error => res.status(500).send(error));
})

app.get('/api/v1/users', (req, res) => {
	User.find({}).exec()
		.then(results => {
			res.status(200).json(results);
		})
		.catch(error => res.status(500).send(error));
});
app.get('/api/v1/users/:userId', (req, res) => {
	User.find({ _id: req.params.userId })
		.populate('mealPlans')
		.exec()
		.then(result => {
			res.status(200).json(result);
		})
		.catch(error => res.status(500).send(error));
});

// app.patch('/api/v1/users/addMealPlan/:userId', (req, res) => {
// 	User.findOne({ "_id": req.params.userId })
// 		.exec((error, user) => {
// 			if (error)
// 				res.status(500).json(error);
// 			else if (user == null)
// 				res.status(201).json({
// 					message: "No user with current _id found!"
// 				});
// 			else {
// 				user.mealPlans.push(req.body);
// 				user.save(error => {
// 					if (error)
// 						res.status(500).json(error);
// 				})
// 			}
// 		})

// })

app.patch('/api/v1/users/updateMPs/:userId', (req, res) => {
	User.findOneAndUpdate(
		{ _id: req.params.userId }
		, { mealPlans: req.body }
		, { new: true }
	).populate("mealPlans")
		.exec()
		.then((result) => {
			console.dir(req.body)
			console.dir(result)
			res.status(200).json(result);
		})
		.catch(error => res.status(500).send(error));
})

app.patch('/api/v1/users/deleteMealPlan/:userId', (req, res) => {
	User.find({ _id: req.params.userId }, (user) => {
		user.mealPlans.forEach((mealPlan, i) => {
			if (mealPlan._id === req.body._id)
				user.mealPlans.slice(i, 0);
		})
	})
		.catch(error => res.status(500).send(error));
})

app.delete('/api/v1/users/delete/:userId', (req, res) => {
	MealPlan.deleteOne({ _id: req.params.mealplanId })
		.catch(error => res.status(500).send(error));
})

//Food Type API
app.post('/api/v1/foodtypes', (req, res) => {
	let newType = new User({
		name: req.body.name
	});
	newType.save()
		.then(result => {
			res.set('content-location', `/api/v1/foodtypes/${newType._id}`);
			res.status(201).json({
				data: newType,
				url: `/api/v1/foodtypes/${newType._id}`
			})
		})
		.catch(error => res.status(500).send(error));
})

app.get('/api/v1/foodtypes', (req, res) => {
	FoodType.find({}).exec()
		.then(results => {
			res.status(200).json(results);
		})
		.catch(error => res.status(500).send(error));
});



