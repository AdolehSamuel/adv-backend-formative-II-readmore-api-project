function calculateAuthorStats(author, books) {
  const bookCount = books.length;

  if (bookCount === 0) {
    return {
      author: author.name,
      bookCount: 0,
      averagePrice: null,
      cheapestBook: null,
      mostExpensiveBook: null,
    };
  }

  let totalPrice = 0;
  let cheapestBook = books[0];
  let mostExpensiveBook = books[0];

  for (const book of books) {
    totalPrice = totalPrice + book.price;

    if (book.price < cheapestBook.price) {
      cheapestBook = book;
    }

    if (book.price > mostExpensiveBook.price) {
      mostExpensiveBook = book;
    }
  }

  const averagePrice = totalPrice / bookCount;
  const roundedAveragePrice = Math.round(averagePrice * 100) / 100;

  return {
    author: author.name,
    bookCount: bookCount,
    averagePrice: roundedAveragePrice,
    cheapestBook: cheapestBook.title,
    mostExpensiveBook: mostExpensiveBook.title,
  };
}

module.exports = calculateAuthorStats;
