# ReadMore API Design Notes

## How to run

1. Copy `.env.example` to `.env` and put your MongoDB connection string in it.
2. Run `npm install`.
3. Run `npm run dev`.

## Project structure

- `models/` holds the Author and Book schemas. Book stores the author's id and references the Author model.
- `routes/` only maps URLs to controller functions.
- `controllers/` reads the request, applies the rules, talks to the database and picks the status code.
- `utils/` holds small helpers that the controllers use, so the controllers stay short and nothing is repeated.

## Status codes

| Code | When |
| ---- | ---- |
| 400 | Missing required fields, an author id that does not exist, or bad query params |
| 404 | No author or book with that id |
| 409 | Duplicate title for the same author, or deleting an author who still has books |
| 422 | Price is zero or negative, or published year is in the future or before 1450 |

## Requirement 1: No orphan books

`required: true` on the author field only checks that some value was sent. It does not check that the id belongs to a real author, because MongoDB does not check references between collections. So the controller looks the author up first and returns 400 if they do not exist.

## Requirement 2: No duplicate titles per author

The check only looks at books by the same author, so two different authors can both have a book called "Home". Titles are compared in lowercase so "the silent sea" and "The Silent Sea" count as the same. On update, the book being updated is skipped so it does not clash with itself.

## Requirement 3: Price and year

Checked in the controller before saving, and returns 422 with a message saying exactly what is wrong.

## Requirement 4: Deleting an author (Option A, block the delete)

If the author still has books, the API returns 409 and nothing is deleted.

Why:
- Nothing is ever lost by accident. Books are the store's products and may already have been sold, so their records matter for orders, receipts and reports.
- Cascade (Option B) would silently wipe out books, including ones customers already bought.
- Reassign (Option C) would make books show the wrong author, which is misleading to customers.
- Blocking makes the person deleting stop and decide what should happen to the books.

Downside:
- It is less convenient. To remove an author, someone must first delete or move each of their books, which is extra work.

## Requirement 5: Search and filter

The filter object starts empty, and each query param is added only if it was sent. So:

- No params: `{}`, which returns every book.
- Only genre: `{ genre: "Thriller" }`
- Only minPrice: `{ price: { $gte: 10 } }`
- Both prices: `{ price: { $gte: 10, $lte: 30 } }`

Sort only accepts price, title or publishedYear. Order is asc by default.

## Requirement 6: Author stats

When the author has no books, `bookCount` is 0 and the other values are `null`. An average price of 0 would wrongly suggest the books are free, so `null` is more honest because there is nothing to average.

## Challenge: Pagination

`GET /books` accepts `page` and `limit`. If they are not sent, every matching book is returned on page 1. The response always has `page`, `limit`, `total` and `results`.
