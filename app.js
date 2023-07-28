const express = require('express');
const bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');
const path = require('path');

const app = express();
const PORT = 3000;

// Sample data for cars
let cars = [
    { id: 1, model: 'Car A', price: 20000, color: 'Red' },
    { id: 2, model: 'Car B', price: 25000, color: 'Blue' },
];

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs'); // Set EJS as the view engine.

// Home Page - List all cars
app.get('/', (req, res) => {
    res.render('index', { cars });
});

// Add New Car Page
app.get('/add', (req, res) => {
    res.render('add');
});

// Validate and Add New Car
app.post(
    '/add', [
        check('id')
        .notEmpty()
        .withMessage('ID is required.')
        .isInt()
        .withMessage('ID must be an integer.')
        .custom((value) => {
            if (cars.find((car) => car.id === parseInt(value))) {
                throw new Error('ID already exists.');
            }
            return true;
        }),
        check('model').notEmpty().withMessage('Model is required.'),
        check('price')
        .notEmpty()
        .withMessage('Price is required.')
        .isInt()
        .withMessage('Price must be an integer.'),
        check('color').notEmpty().withMessage('Color is required.'),
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id, model, price, color } = req.body;
        cars.push({ id: parseInt(id), model, price: parseInt(price), color });

        res.redirect('/');
    }
);

// Update Car Page
app.get('/update/:id', (req, res) => {
    const car = cars.find((car) => car.id === parseInt(req.params.id));
    if (!car) {
        return res.status(404).send('Car not found.');
    }

    res.render('update', { car });
});

// Validate and Update Car
app.post(
    '/update/:id', [
        check('model').notEmpty().withMessage('Model is required.'),
        check('price')
        .notEmpty()
        .withMessage('Price is required.')
        .isInt()
        .withMessage('Price must be an integer.'),
        check('color').notEmpty().withMessage('Color is required.'),
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const car = cars.find((car) => car.id === parseInt(req.params.id));
        if (!car) {
            return res.status(404).send('Car not found.');
        }

        const { model, price, color } = req.body;
        car.model = model;
        car.price = parseInt(price);
        car.color = color;

        res.redirect('/');
    }
);

// Delete Car
app.delete('/delete/:id', (req, res) => {
    const carId = parseInt(req.params.id);
    const index = cars.findIndex((car) => car.id === carId);

    if (index !== -1) {
        cars.splice(index, 1);
        res.sendStatus(200); // Send a success status code (200) if the car was deleted.
    } else {
        res.sendStatus(404); // Send a not found status code (404) if the car ID doesn't exist.
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});