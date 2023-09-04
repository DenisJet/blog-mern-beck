import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import {} from 'dotenv/config';

import { registerValidation, loginValidation, postCreateValidation } from './validations.js';
import { checkAuth, handleValidationErrors } from './utils/index.js';
import { PostController, UserController } from './controllers/index.js';

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('DB OK'))
  .catch((err) => console.log('DB error', err));

const app = express();

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, 'uploads');
  },
  filename: (_, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/auth/login', loginValidation, handleValidationErrors, UserController.login);
app.post('/auth/register', registerValidation, handleValidationErrors, UserController.register);
app.get('/auth/me', checkAuth, UserController.getMe);

app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
  res.json({ url: `/uploads/${req.file.originalname}` });
});

app.get('/posts', PostController.getAll);
app.get('/posts/:id', PostController.getOne);
app.post('/posts', checkAuth, postCreateValidation, handleValidationErrors, PostController.create);
app.delete('/posts/:id', checkAuth, PostController.remove);
app.patch(
  '/posts/:id',
  checkAuth,
  postCreateValidation,
  handleValidationErrors,
  PostController.update
);

app.listen(process.env.PORT, (err) => {
  if (err) {
    return console.error(err);
  }

  console.log('Server OK');
});
