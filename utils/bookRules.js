const Author = require('../models/Author');
const Book = require('../models/Book');
const isValidId = require('./isValidId');

const REQUIRED_BOOK_FIELDS = ['title', 'genre', 'price', 'publishedYear', 'author'];
const OLDEST_ALLOWED_YEAR = 1450;

function findMissingFields(body) {
  const missingFields = [];

  for (const field of REQUIRED_BOOK_FIELDS) {
    const value = body[field];
    const isMissing = value === undefined || value === null || value === '';

    if (isMissing) {
      missingFields.push(field);
    }
  }

  return missingFields;
}

async function authorExists(authorId) {
  if (!isValidId(authorId)) {
    return false;
  }

  const author = await Author.findById(authorId);
  return author !== null;
}

function findPriceOrYearProblem(price, publishedYear) {
  const currentYear = new Date().getFullYear();

  if (price <= 0) {
    return 'Price must be greater than 0';
  }

  if (publishedYear > currentYear) {
    return `Published year cannot be later than ${currentYear}`;
  }

  if (publishedYear < OLDEST_ALLOWED_YEAR) {
    return `Published year cannot be earlier than ${OLDEST_ALLOWED_YEAR}`;
  }

  return null;
}

async function hasDuplicateTitle(authorId, title, bookIdToSkip) {
  const authorBooks = await Book.find({ author: authorId });
  const newTitle = String(title).trim().toLowerCase();

  for (const book of authorBooks) {
    const isTheSameBook = book._id.toString() === bookIdToSkip;
    if (isTheSameBook) {
      continue;
    }

    const existingTitle = book.title.toLowerCase();
    if (existingTitle === newTitle) {
      return true;
    }
  }

  return false;
}

module.exports = {
  findMissingFields,
  authorExists,
  findPriceOrYearProblem,
  hasDuplicateTitle,
};
