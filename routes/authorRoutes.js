const express = require('express');
const authorController = require('../controllers/authorController');

const router = express.Router();

router.post('/', authorController.createAuthor);
router.get('/', authorController.getAllAuthors);
router.get('/:id', authorController.getAuthorById);
router.put('/:id', authorController.updateAuthor);
router.delete('/:id', authorController.deleteAuthor);

router.get('/:id/books', authorController.getAuthorBooks);
router.get('/:id/stats', authorController.getAuthorStats);

module.exports = router;
