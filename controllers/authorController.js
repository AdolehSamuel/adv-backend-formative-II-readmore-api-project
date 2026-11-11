const Author = require('../models/Author');
const Book = require('../models/Book');
const isValidId = require('../utils/isValidId');
const handleError = require('../utils/handleError');
const calculateAuthorStats = require('../utils/calculateAuthorStats');

async function findAuthorById(id) {
  if (!isValidId(id)) {
    return null;
  }

  return Author.findById(id);
}

function sendAuthorNotFound(res, id) {
  return res.status(404).json({ message: `No author found with id ${id}` });
}

async function createAuthor(req, res) {
  try {
    const { name, country, bio } = req.body;

    const author = await Author.create({ name, country, bio });

    res.status(201).json(author);
  } catch (error) {
    handleError(res, error);
  }
}

async function getAllAuthors(req, res) {
  try {
    const authors = await Author.find();

    res.json(authors);
  } catch (error) {
    handleError(res, error);
  }
}

async function getAuthorById(req, res) {
  try {
    const { id } = req.params;

    const author = await findAuthorById(id);
    if (!author) {
      return sendAuthorNotFound(res, id);
    }

    res.json(author);
  } catch (error) {
    handleError(res, error);
  }
}

async function updateAuthor(req, res) {
  try {
    const { id } = req.params;
    const { name, country, bio } = req.body;

    const author = await findAuthorById(id);
    if (!author) {
      return sendAuthorNotFound(res, id);
    }

    if (name !== undefined) {
      author.name = name;
    }

    if (country !== undefined) {
      author.country = country;
    }

    if (bio !== undefined) {
      author.bio = bio;
    }

    await author.save();

    res.json(author);
  } catch (error) {
    handleError(res, error);
  }
}

async function deleteAuthor(req, res) {
  try {
    const { id } = req.params;

    const author = await findAuthorById(id);
    if (!author) {
      return sendAuthorNotFound(res, id);
    }

    const bookCount = await Book.countDocuments({ author: id });
    if (bookCount > 0) {
      return res.status(409).json({
        message: `Cannot delete ${author.name} because they still have ${bookCount} book(s). Delete or move those books first.`,
      });
    }

    await author.deleteOne();

    res.json({ message: `Author ${author.name} was deleted` });
  } catch (error) {
    handleError(res, error);
  }
}

async function getAuthorBooks(req, res) {
  try {
    const { id } = req.params;

    const author = await findAuthorById(id);
    if (!author) {
      return sendAuthorNotFound(res, id);
    }

    const books = await Book.find({ author: id }).populate('author');

    res.json(books);
  } catch (error) {
    handleError(res, error);
  }
}

async function getAuthorStats(req, res) {
  try {
    const { id } = req.params;

    const author = await findAuthorById(id);
    if (!author) {
      return sendAuthorNotFound(res, id);
    }

    const books = await Book.find({ author: id });
    const stats = calculateAuthorStats(author, books);

    res.json(stats);
  } catch (error) {
    handleError(res, error);
  }
}

module.exports = {
  createAuthor,
  getAllAuthors,
  getAuthorById,
  updateAuthor,
  deleteAuthor,
  getAuthorBooks,
  getAuthorStats,
};
