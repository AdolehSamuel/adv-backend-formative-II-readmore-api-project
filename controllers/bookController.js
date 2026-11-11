const Book = require('../models/Book');
const isValidId = require('../utils/isValidId');
const handleError = require('../utils/handleError');
const {
  findMissingFields,
  authorExists,
  findPriceOrYearProblem,
  hasDuplicateTitle,
} = require('../utils/bookRules');
const { findQueryProblem, buildBookFilter, buildBookSort } = require('../utils/bookQuery');

function sendBookNotFound(res, id) {
  return res.status(404).json({ message: `No book found with id ${id}` });
}

async function createBook(req, res) {
  try {
    const missingFields = findMissingFields(req.body);
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(', ')}`,
      });
    }

    const { title, genre, price, publishedYear, author } = req.body;

    const authorIsReal = await authorExists(author);
    if (!authorIsReal) {
      return res.status(400).json({ message: `No author found with id ${author}` });
    }

    const priceOrYearProblem = findPriceOrYearProblem(price, publishedYear);
    if (priceOrYearProblem) {
      return res.status(422).json({ message: priceOrYearProblem });
    }

    const isDuplicate = await hasDuplicateTitle(author, title, null);
    if (isDuplicate) {
      return res.status(409).json({
        message: `This author already has a book called "${title}"`,
      });
    }

    const book = await Book.create({ title, genre, price, publishedYear, author });
    await book.populate('author');

    res.status(201).json(book);
  } catch (error) {
    handleError(res, error);
  }
}

async function getAllBooks(req, res) {
  try {
    const queryProblem = findQueryProblem(req.query);
    if (queryProblem) {
      return res.status(400).json({ message: queryProblem });
    }

    const filter = buildBookFilter(req.query);
    const sort = buildBookSort(req.query);

    const total = await Book.countDocuments(filter);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || total;
    const booksToSkip = (page - 1) * limit;

    const books = await Book.find(filter)
      .sort(sort)
      .skip(booksToSkip)
      .limit(limit)
      .populate('author');

    res.json({
      page: page,
      limit: limit,
      total: total,
      results: books,
    });
  } catch (error) {
    handleError(res, error);
  }
}

async function getBookById(req, res) {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return sendBookNotFound(res, id);
    }

    const book = await Book.findById(id).populate('author');
    if (!book) {
      return sendBookNotFound(res, id);
    }

    res.json(book);
  } catch (error) {
    handleError(res, error);
  }
}

async function updateBook(req, res) {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return sendBookNotFound(res, id);
    }

    const book = await Book.findById(id);
    if (!book) {
      return sendBookNotFound(res, id);
    }

    const title = req.body.title ?? book.title;
    const genre = req.body.genre ?? book.genre;
    const price = req.body.price ?? book.price;
    const publishedYear = req.body.publishedYear ?? book.publishedYear;
    const author = req.body.author ?? book.author.toString();

    const authorIsReal = await authorExists(author);
    if (!authorIsReal) {
      return res.status(400).json({ message: `No author found with id ${author}` });
    }

    const priceOrYearProblem = findPriceOrYearProblem(price, publishedYear);
    if (priceOrYearProblem) {
      return res.status(422).json({ message: priceOrYearProblem });
    }

    const isDuplicate = await hasDuplicateTitle(author, title, id);
    if (isDuplicate) {
      return res.status(409).json({
        message: `This author already has a book called "${title}"`,
      });
    }

    book.title = title;
    book.genre = genre;
    book.price = price;
    book.publishedYear = publishedYear;
    book.author = author;

    await book.save();
    await book.populate('author');

    res.json(book);
  } catch (error) {
    handleError(res, error);
  }
}

async function deleteBook(req, res) {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return sendBookNotFound(res, id);
    }

    const book = await Book.findByIdAndDelete(id);
    if (!book) {
      return sendBookNotFound(res, id);
    }

    res.json({ message: `Book "${book.title}" was deleted` });
  } catch (error) {
    handleError(res, error);
  }
}

module.exports = {
  createBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
};
