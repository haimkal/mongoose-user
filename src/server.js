const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require ('mongoose')
const app = express();
const port = 4000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const User = mongoose.model ('User', {
	username: {
		type: String,
		required: true,
		minLength: 3,
		maxLength: 18,
		unique: true
	},

	password: {
		type: String,
		required: true,
		minLength: 8,
		maxLength: 16
	},

	gender: {
		type: String,
		enum: ['male', 'female'],
		required: true
	},

	age: {
		type: Number,
		min: 18,
		required: true
	},

	email: {
		type: String, 
		match:/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/ , 
		required: function() {
			return this.age < 70
		}
	},

	createdAt: {
		type: Date,
		default: ()=> new Date(),
	}

	
})

app.put ('/user', (req,res)=> {
	const user = new User(req.body);
	user.save() 
		.then((newUser) => {
			res.status(201).send(newUser)
		})
		.catch((err)=> {
			res.status(400).send(err)
		});
});

app.get('/user', (req, res) => {
	User.find({})
	.then(users=> res.send(users))
	.catch(()=> res.sendStatus(500));
});

app.get('/user/:id', (req, res) => {
	User.findById(req.params.id)
		.then(user=> res.send(user))
		.catch(()=> res.sendStatus(500));
});

app.delete('/user/:id', (req,res)=> {
	User.findByIdAndDelete(req.params.id)
	.then(deletedPost =>{
		if(!deletedPost) {
			res.sendStatus(404);
			return;
		}
		res.sendStatus(204);
	})
	.catch(()=> res.sendStatus(500));
});


app.post('/user/:id', (req,res)=> {  
	User.findByIdAndUpdate(
		req.params.id,
		req.body
	).then(updatedUser => {
		if(!updatedUser) {
			res.sendStatus(404);
			return;	
		}
		res.send(updatedUser).status(200);
	})

	.catch((err)=> {
		res.status(400).send(err)
	})
});








connect();

function listen() {
	app.listen(port, () => console.log(`Server listening on port ${port}!`));
	}

function connect() { // connecting to data base
	mongoose.connect('mongodb://localhost/pinterest', {
		useNewUrlParser: true, 
		useUnifiedTopology: true
	});

	const db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', ()=> {
		console.log('Connected to MongoDB');
		listen();
	});
}