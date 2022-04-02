
const bookModel = require("../models/bookModel")
const userModel = require("../models/userModel")
const reviewModel = require("../models/reviewModel")
let  moment = require('moment');
const { default: mongoose } = require("mongoose");
const jwt = require("jsonwebtoken")



const isValid = function (value) {
    if (typeof value == undefined || value == null || value.length == 0) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true

}
const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}

const isValidObjectId = function(objectId){
    return mongoose.Types.ObjectId.isValid(objectId)
}


const createBook = async function (req, res) {
    try {
        data = req.body
        const {
            title,
            excerpt,
            userId,
            ISBN,
            category,
            subcategory,
            reviews,
            deletedAt,
            isDeleted,
            releasedAt
        } = data
        


        let isValidUser = await userModel.findById(userId)
        if(!isValidUser){
            return res.status(400).send({status:false,msg:"user doesnot exist with this userId !"})
        }
        //if(req.body.userId==req.decodedToken.userId)

        if (!isValidRequestBody(data)){
            return res.status(400).send({ status: false, msg: "plz enter some data" })
        }
        if(!isValid(title)){
            return res.status(400).send({status:false, msg:"title  is required" })
        }
        const duplicateTitle = await bookModel.findOne({title:data.title})
       
        if(duplicateTitle){
            return res.status(400).send({status:false, msg:"duplicate key title"})
        }
        if(!isValid(excerpt)){
            return res.status(400).send({status:false, msg:"excerpt  is required" })
        }
        if(!isValid(userId)){
            return res.status(400).send({status:false, msg:"userId is required" })
        }
        let id = await userModel.findById({_id:data.userId})
        if(!id) {
            return res.status(400).send({status:false, msg: "user id doesn't exist"})
        }
        if(!isValidObjectId(userId)){
            return res.status(400).send({status:false,msg:'userId is invalid ,please provide a valid userId'})
        }
         let token = req.headers["x-auth-token"]
                if (!token) {
                    return res.status(400).send({ status: false, msg: "token Must Be Present , You Have To Login First" })
                }
        
                let decodeToken = jwt.verify(token, "Group4")
                if (!decodeToken) {
                    return res.status(401).send({ status: false, msg: "Invalid Token" })
                }
        
        if(!isValid(ISBN)){
            return res.status(400).send({status:false, msg:"ISBN is required" })
        }
        const duplicateISBN = await bookModel.findOne({ISBN:data.ISBN})
        if
        (duplicateISBN){
            return res.status(400).send({status:false, msg:"duplicate key ISBN"})
        }
        if(!isValid(category)){
            return res.status(400).send({status:false, msg:"category is required" })
        }
        if(!isValid(subcategory)){
            return res.status(400).send({status:false, msg:"subcategory is required" })
        }
        if(!isValid(releasedAt)){
            return res.status(400).send({status:false, msg:"releasedAt is required" })
        }
        //validations
        if (!/((\d{4}[\/-])(\d{2}[\/-])(\d{2}))/.test(releasedAt)) {
            return res.status(400).send({ status: false, message: ' date should be "YYYY-MM-DD\" ' })
        }
        
        if(isDeleted==true){
        (/((\d{4}[\/-])(\d{2}[\/-])(\d{2}))/.test(isDeleted)) 
            return res.status(400).send({ status: false, data: deletedAt })
        }
        const isValid1 = function(value){
            if(typeof value == undefined||value==null||value.length==0)
            return false
            if(typeof value=='string'&& value.trim().length===0) return false
            if(typeof value==='number'&&'array') return true
        }
        if(!isValid1(reviews)){
            return res.status(400).send({status:false,msg:"please enter in number"})
        }

        let saveData = await bookModel.create(data);
        res.status(201).send({ status: true, data: saveData, msg: "succefully Created" })
    }

catch (err) {
    return res.status(500).send({ status: false, msg: err.message })
}
}
//2

const getBook = async function (req, res) {
    try {
        const filterQuery = { isDeleted: false, deletedAt: null }
        const queryParams = req.query
        const { userId, category, subcategory } = queryParams
        if (isValid(userId)) {
            filterQuery['userId'] = userId                  //crate data in array form
        }
        if(!isValidObjectId(bookId)){
            return res.status(400).send({status:false,msg:'please provide a valid bookId'})
        }
        if (isValid(category)) {
            filterQuery['category'] = category.trim()
        }
        if (isValid(subcategory)) {
            filterQuery['subcategory'] = subcategory.trim()
        }
        const books = await bookModel.find(filterQuery).select({ book_id: 1, title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 })
        if (books.length === 0) {
            return res.status(404).send({ status: false, msg: "Invalid Data" })
            
        } 
        let x = books.length
        if (userId || category ||subcategory) {
            let sortedBooks = await bookModel.find({ $and: [{ isDeleted: false, deletedAt: null }, { $or: [{ userId: userId, isDeleted: false }, { category: category }, { subcategory: subcategory }] }] }).sort({ "title": 1 })
            return res.status(200).send({ status: true,total:x, data: sortedBooks, msg: "Sorted Book By Title"})
        }
        
        return res.status(200).send({ status: true, total:x,  data: books });

    } catch (error) {
        return res.status(500).send({ status: "failed", msg: error.message })
    }

}

//3
const getBookById = async function (req, res) {
    try {
        let bookId = req.params.bookId;

        if (!bookId) { return res.status(400).send({ msg: "please provide book ID." }) }

        if(!isValidObjectId(bookId)){
            return res.status(400).send({status:false,msg:'please provide a valid bookId'})
        }

        let bookDetails = await bookModel.findById(bookId);

        if (!bookDetails) return res.status(404).send({ status: false, msg: "No such book exists" });

        if(!isValidObjectId(bookId)){
            return res.status(400).send({status:false,msg:'please provide a valid bookId'})
        }

        let data = JSON.parse(JSON.stringify(bookDetails)) // DEEP CLONNING 

        const book_id = bookDetails._id

        let reviews = await reviewModel.find({ bookId: book_id }).select({ _id: true, bookId: true, reviewedBy: true, reviewedAt: true, rating: true, review: true })
        if (bookDetails.isDeleted == true) return res.status(404).send({ status: false, msg: "sorry! book is already deleted" });
        data = { _id: bookDetails._id, title: bookDetails.title, excerpt: bookDetails.excerpt, userId: bookDetails.userId, category: bookDetails.category, subcategory: bookDetails.subcategory, isDeleted: bookDetails.isDeleted, reviews: bookDetails.reviews, releasedAT: bookDetails.releasedAT, createdAt: bookDetails.createdAt, updatedAt: bookDetails.updatedAt }
        data.reviewsData = [...reviews]
        let x = reviews.length
        res.status(200).send({ status: true,total:x, msg: "book list", data: data });
    } catch (err) {
        console.log("This is the error.", err.message)
        res.status(500).send({ msg: "error", error: err.message })
    }
}


//4
const updateBooks = async function (req, res) {
    try {
      const bookId = req.params.bookId
      const dataForUpdation = req.body
  
      if (!isValid(bookId)) {
        res.status(400).send({ status: false, message: "Please , provide bookId in path params" })
        return
      }

      if(!isValidObjectId(bookId)){
          return res.status(400).send({status:false,msg:'please provide a valid bookId'})
      }

      if (!(/^[0-9a-fA-F]{24}$/.test(bookId))) {
        res.status(400).send({ status: false, message: 'book doesnot exist with this bookId' })
        return
      }
  
      const book = await bookModel.findOne({ _id: bookId, isDeleted: false })
  
      if (!Object.keys(book) > 0) {
        res.status(404).send({ status: false, message: "No data found" })
        return
      }

      if(!isValidRequest(dataForUpdation)) {
        return res.status(400).send({status: false, message: 'please provide data for updation'})
      }

      const {title, excerpt, ISBN, releasedAt} = dataForUpdation
  
        if (!isValid(title)) {
          res.status(400).send({ status: false, message: 'please provide title' })
          return
        }
  
        const duplicateTitle = await bookModel.findOne({title: title})
        if (duplicateTitle) {
          res.status(400).send({ status: false, message: "This title already in use ,please provide another one" })
          return
        }
      
        if (!isValid(excerpt)) {
          res.status(400).send({ status: false, message: 'please provide excerpt' })
          return
        }
    
        if (!isValid(ISBN)) {
          res.status(400).send({ status: false, message: 'please provide ISBN' })
          return
        }
    
        

        const duplicateISBN = await bookModel.findOne({ ISBN:ISBN })
        if (duplicateISBN) {
          res.status(400).send({ status: false, message: "This ISBN already in use ,please provide another one" })
          return
        }

        if (!isValid(releasedAt)) {
          res.status(400).send({ status: false, message: 'please provide releasedAt' })
          return
        }
        if (!(/^((?:19|20)[0-9][0-9])-(0?[1-9]|1[012])-(0?[1-9]|[12][0-9]|3[01])/.test(releasedAt))) {
          return res.status(400).send({ status: false, message: 'please provide valid date in format (YYYY-MM-DD)' })
        }

        const updateData = {title, excerpt, ISBN, releasedAt: moment(releasedAt)}
   
      const updatedBook = await bookModel.findOneAndUpdate({ _id: bookId }, {...updateData}, { new: true })
      let x = updatedBook.length
      return res.status(200).send({ status: true,total:x, message: "Book updated successfully", data: updatedBook })
    }
    catch (err) {
      console.log(err)
      res.status(500).send({ status: false, msg: err.message })
    }
  }




//5

const deleteById = async function (req, res) {
   
    try{
    
           let Id = req.params.bookId
           if(!isValid(Id)){
               return res.status(400).send({status:false, msg:"plz provide bookId"})
           }
           if(!isValidObjectId(Id)){
               return res.status(400).send({status:false, msg: 'Its not valid Id'})
           }
   
           let ifExists = await bookModel.findById(Id)
           if(!isValidObjectId(ifExists)){
               return res.status(400).send({status:false, msg: 'Its not valid Id'})
           }
   
           if (!ifExists) {
               return res.status(404).send({ Status: false, msg: "Data Not Found" })
           }
           let data = { isDeleted: true, deletedAt: moment() }
           if (ifExists.isDeleted !== true) {
   
        const deleteBook= await bookModel.findOneAndUpdate({ bookId: ifExists, isDeleted: false }, { $set: data }, { new: true })
               return res.status(200).send({ status: true, msg: deleteBook })
   
           } else {
               return res.status(400).send({ status: false, msg: "already deleted" })
           }
   
   
       } catch (err) {
           res.status(500).send({ status: false, msg: err.message })
       }
   }


module.exports.createBook = createBook
module.exports.getBook=getBook
module.exports.getBookById=getBookById
module.exports.updateBooks=updateBooks
module.exports.deleteById=deleteById

