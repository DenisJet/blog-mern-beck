import PostModel from '../models/post.js';

export const getAllNew = async (req, res) => {
  try {
    const posts = await PostModel.find()
      .sort({ createdAt: -1 })
      .populate({ path: 'user', select: ['fullName', 'avatarUrl'] })
      .exec();

    res.json(posts);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить статьи',
    });
  }
};

export const getAllPopular = async (req, res) => {
  try {
    const posts = await PostModel.find()
      .sort({ viewsCount: -1 })
      .populate({ path: 'user', select: ['fullName', 'avatarUrl'] })
      .exec();

    res.json(posts);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить статьи',
    });
  }
};

export const getLastTags = async (req, res) => {
  try {
    const posts = await PostModel.find().limit(5).exec();
    const tags = posts
      .map((obj) => obj.tags)
      .flat()
      .slice(0, 5);

    res.json(tags);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить тэги',
    });
  }
};

export const getOne = async (req, res) => {
  try {
    const postId = req.params.id;

    PostModel.findOneAndUpdate(
      { _id: postId },
      { $inc: { viewsCount: 1 } },
      { returnDocument: 'after' }
    )
      .populate({ path: 'user', select: ['fullName', 'avatarUrl'] })
      .then((doc) => {
        if (!doc) {
          return res.status(404).json({
            message: 'Статья не найдена',
          });
        }

        res.json(doc);
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).json({
          message: 'Не удалось вернуть статью',
        });
      });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить статью',
    });
  }
};

export const create = async (req, res) => {
  try {
    const doc = new PostModel({
      title: req.body.title,
      text: req.body.text,
      tags: req.body.tags.split(','),
      imageUrl: req.body.imageUrl,
      user: req.userId,
    });

    const post = await doc.save();
    res.json(post);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось создать статью',
    });
  }
};

export const remove = async (req, res) => {
  try {
    const postId = req.params.id;

    PostModel.findOneAndDelete({ _id: postId })
      .then((doc) => {
        if (!doc) {
          return res.status(404).json({
            message: 'Статья не найдена',
          });
        }

        res.json({ success: true });
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).json({
          message: 'Не удалось удалить статью',
        });
      });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить статью',
    });
  }
};

export const update = async (req, res) => {
  try {
    const postId = req.params.id;

    await PostModel.updateOne(
      { _id: postId },
      {
        title: req.body.title,
        text: req.body.text,
        tags: req.body.tags.split(','),
        imageUrl: req.body.imageUrl,
        user: req.userId,
      }
    );

    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось обновить статью',
    });
  }
};

export const postComment = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await PostModel.findOne({ _id: postId });

    await PostModel.updateOne(
      { _id: postId },
      {
        comments: [
          ...post.comments,
          {
            user: {
              fullName: req.body.user.fullName,
              avatarUrl: req.body.user.avatarUrl,
            },
            text: req.body.text,
          },
        ],
      }
    );

    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось оставить комментарий',
    });
  }
};
