const reviewModel = require("../models/reviewModel")
const bookModel = require("../models/bookModel")
const { default: mongoose } = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId


const isValid = function (value) {
    if (typeof value == undefined || value == null || value.length == 0) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true

}

const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}
const isValidObjectId = function (ObjectId) {
    return mongoose.Types.ObjectId.isValid(ObjectId)
}

//1
const createReview = async function (req, res) {
    try {
        let data = req.body
        let bookId1 = req.params.bookId
        const {

            bookId,
            reviewedBy,
            review,
            rating,
            reviewedAt,
            isDeleted

        } = data


        if (!(bookId == bookId1)) {
            return res.status(400).send({ status: false, msg: "bookId is not matches" })
        }
        
        //     return res.status(400).send({ status: false, msg: "its not valid book id" })
        // }


        if (!isValid(bookId1)) {
            return res.status(400).send({ status: false, msg: "Give bookId in params" })
        }

        if (!isValid(bookId)) {
            return res.status(400).send({ status: false, msg: "book id require" })
        }
        
        if (!isValid(reviewedBy)) {
            return res.status(400).send({ status: false, msg: "reviewedBy require" })
        }
        
        if (!isValid(rating)) {
            return res.status(400).send({ status: false, msg: "rating require" })
        }

        if (!([1, 2, 3, 4, 5].includes(Number(rating)))) {
            return res.status(400).send({ status: false, msg: "Rating should be from 1,2,3,4,5 this values" })

        }
        if (!isValid(reviewedAt)) {
            return res.status(400).send({ status: false, msg: "reviewedAt require" })
        }

        //let Id = req.params.bookId


        let savedData = await reviewModel.create(data)
        res.status(201).send({ status: true, msg: "succesfully run", data: savedData })
    }
    catch (err) {
        console.log("This is the error.", err.message)
        res.status(500).send({ msg: "error", error: err.message })
    }


}

//2
const UpdateReview = async function (req, res) {

    try {
        let update = {}
        let bookId = req.params.bookId
        let reviewId = req.params.reviewId
        let reviewData = req.body
        if (!(isValid(bookId) && isValidObjectId(bookId))) {
            return res.status(400).send({ status: false, msg: "bookId is not valid" })
        }

        if (!(isValid(reviewId) && isValidObjectId(reviewId))) {
            return res.status(400).send({ status: false, msg: "reviewId is not valid" })
        }

        let book = await bookModel.findOne({ _id: bookId, isDeleted: false })
        if (!book) {
            return res.status(400).send({ status: false, msg: "book not exist can't update it's review !!!!" })
        }

        let revieww = await reviewModel.findOne({ _id: reviewId, isDeleted: false })

        if (!revieww) {
            return res.status(400).send({ status: false, msg: "review not exist can't update it !!" })
        }

        if (!isValidRequestBody(reviewData)) {
            return res.status(400).send({ status: false, message: ' Review update body is empty' })

        }

        let { reviewedBy, rating, review } =reviewData
        if (reviewedBy) {
            if (!isValid(reviewedBy)) {
                return res.status(400).send({ status: false, message: 'reviewedBy is not valid value ' })
            }
            update["reviewedBy"] = reviewedBy         //reviewedBy key generate ho jayegi on the array form
        }
        if (review) {
            if (!isValid(review)) {
                return res.status(400).send({ status: false, message: 'review is not valid value ' })
            }
            update["review"] = review             //review ==key=value   o/p=[]
        }
        if (rating) {
            if (!([1, 2, 3, 4, 5].includes(Number(rating)))) {
                return res.status(400).send({ status: false, msg: "Rating should be from 1,2,3,4,5 this values" })

            }
            update["rating"] = rating
        }
        book = book.toObject()
        let updated = await reviewModel.findOneAndUpdate({ _id: reviewId, isDeleted: false }, { $set: { reviewedBy: reviewData.reviewedBy, review: reviewData.review, rating: reviewData.rating } }, { new: true })

        if (!updated) {
            book.body = 'not review found for this book'
            return res.status(404).send({ status: false, msg: book })

        }
        book.reviewData = updated
        return res.status(200).send({ status:true, data: book })
    }

    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
  }
}






const deleteReview = async function (req, res) {

try{

    
    let { bookId, reviewId } = req.params
    let book = await bookModel.findOne({ _id: bookId, isDeleted: false })
    if (!book) {
        return res.status(404).send({ status: false, msg: "review with this bookId not present" })

    }
    let review1 = await reviewModel.findOne({ _id: reviewId, isDeleted: false })
    if (!review1) {
        return res.status(404).send({ status: false, msg: " this reviewId not found" })
    }
    if (!isValid(bookId)) {
        return res.status(400).send({ status: false, msg: " bookId is invalid" })
    }
    if (!isValidObjectId(bookId)) {
        return res.status(400).send({ status: false, msg: " reviewId is invalid" })
    }
    if (!isValid(reviewId)) {
        return res.status(400).send({ status: false, msg: " bookId is invalid" })
    }
    if (!isValidObjectId(reviewId)) {
        return res.status(400).send({ status: false, msg: " reviewId is invalid" })
    }
    

    let deleteData = await reviewModel.findOneAndUpdate({ _id: reviewId, isDeleted: false }, { $set: { isDeleted: true, deletedAt:Date.now() } }, { new: true })
        let reviewCountDec = await bookModel.findOneAndUpdate({ _id: bookId, isDeleted: false }, { $inc: { reviews: -1 } })
        return res.status(200).send({ status:true, msg: deleteData })
    }




catch (err) {

    console.log(err)
    res.status(500).send({ status: false, error: err.message })
}

}





module.exports.createReview = createReview
module.exports.UpdateReview = UpdateReview
module.exports.deleteReview = deleteReview