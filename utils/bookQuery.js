const isValidId = require('./isValidId');

const ALLOWED_SORT_FIELDS = ['price', 'title', 'publishedYear'];
const ALLOWED_ORDERS = ['asc', 'desc'];

function isNumber(value) {
  return !isNaN(Number(value));
}

function isPositiveWholeNumber(value) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0;
}

function findQueryProblem(query) {
  if (query.minPrice !== undefined && !isNumber(query.minPrice)) {
    return 'minPrice must be a number';
  }

  if (query.maxPrice !== undefined && !isNumber(query.maxPrice)) {
    return 'maxPrice must be a number';
  }

  if (query.author && !isValidId(query.author)) {
    return 'author must be a valid author id';
  }

  if (query.sort && !ALLOWED_SORT_FIELDS.includes(query.sort)) {
    return `sort must be one of: ${ALLOWED_SORT_FIELDS.join(', ')}`;
  }

  if (query.order && !ALLOWED_ORDERS.includes(query.order)) {
    return 'order must be asc or desc';
  }

  if (query.page !== undefined && !isPositiveWholeNumber(query.page)) {
    return 'page must be a whole number greater than 0';
  }

  if (query.limit !== undefined && !isPositiveWholeNumber(query.limit)) {
    return 'limit must be a whole number greater than 0';
  }

  return null;
}

function escapeSearchText(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildBookFilter(query) {
  const filter = {};

  if (query.genre) {
    filter.genre = query.genre;
  }

  if (query.author) {
    filter.author = query.author;
  }

  if (query.search) {
    const safeSearchText = escapeSearchText(query.search);
    filter.title = { $regex: safeSearchText, $options: 'i' };
  }

  const hasMinPrice = query.minPrice !== undefined;
  const hasMaxPrice = query.maxPrice !== undefined;

  if (hasMinPrice || hasMaxPrice) {
    filter.price = {};
  }

  if (hasMinPrice) {
    filter.price.$gte = Number(query.minPrice);
  }

  if (hasMaxPrice) {
    filter.price.$lte = Number(query.maxPrice);
  }

  return filter;
}

function buildBookSort(query) {
  const sort = {};

  if (!query.sort) {
    return sort;
  }

  const direction = query.order === 'desc' ? -1 : 1;
  sort[query.sort] = direction;

  return sort;
}

module.exports = {
  findQueryProblem,
  buildBookFilter,
  buildBookSort,
};
