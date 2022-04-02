const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController')
const bookController = require('../controllers/bookController')
const reviewController = require('../controllers/reviewController')
const middleware = require('../middleware/auth')
//user
router.post("/register" , UserController.createUserData)

router.post("/login", UserController.loginUser)
//Book 
router.post("/books" ,bookController.createBook)
router.get("/books",bookController.getBook)
router.get("/books/:bookId",middleware.authenticate,bookController.getBookById)

router.put("/PUT/books/:bookId",middleware.authenticate,bookController.updateBooks)
router.delete("/books/:bookId",middleware.authenticate,bookController.deleteById)
//review
router.post( "/books/:bookId/review",reviewController.createReview)
router.put( "/books/:bookId/review/:reviewId",reviewController.UpdateReview)
router.delete( "/books/:bookId/review/:reviewId",reviewController.deleteReview)

module.exports = router;

