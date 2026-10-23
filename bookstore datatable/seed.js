require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Author = require('./models/Author');
const Category = require('./models/Category');
const Book = require('./models/Book');
const Order = require('./models/Order');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([User, Author, Category, Book, Order].map((m) => m.deleteMany({})));

  await User.create([
    { name: 'Admin', email: 'admin@bookstore.com', password: 'admin123', role: 'admin' },
    { name: 'Customer', email: 'user@bookstore.com', password: 'user123' },
  ]);

  const [fiction, tech, selfhelp] = await Category.create([
    { name: 'Fiction', description: 'Novels and stories' },
    { name: 'Technology', description: 'Programming and computing' },
    { name: 'Self-Help', description: 'Personal development' },
  ]);

  const [rowling, martin, clear] = await Author.create([
    { name: 'J.K. Rowling', country: 'UK', birthYear: 1965 },
    { name: 'Robert C. Martin', country: 'USA', birthYear: 1952 },
    { name: 'James Clear', country: 'USA', birthYear: 1986 },
  ]);

  await Book.create([
    { title: "Harry Potter and the Philosopher's Stone", isbn: '9780747532699', author: rowling._id, category: fiction._id, price: 499, stock: 25, publishedYear: 1997, rating: 4.8 },
    { title: 'Clean Code', isbn: '9780132350884', author: martin._id, category: tech._id, price: 899, stock: 15, publishedYear: 2008, rating: 4.6 },
    { title: 'Atomic Habits', isbn: '9780735211292', author: clear._id, category: selfhelp._id, price: 599, stock: 40, publishedYear: 2018, rating: 4.7 },
  ]);

  console.log('Seeded. Admin: admin@bookstore.com / admin123 | User: user@bookstore.com / user123');
  process.exit(0);
})();
