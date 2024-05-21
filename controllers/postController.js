const Post = require('../models/Post'); // Assuming you have a Post model

// Create a post
exports.createPost = async (req, res) => {
  try {
    const { text, media } = req.body;

    // Create a new post
    const post = new Post({
      user: req.user._id, // Assuming authenticated user's ID is set in req.user._id
      text,
      media
    });

    // Save the post to the database
    await post.save();

    res.status(201).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all posts
exports.getPosts = async (req, res) => {
  try {
    // Get all posts
    const posts = await Post.find().populate('user', 'username').populate('comments');

    res.status(200).json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get a single post by ID
exports.getPost = async (req, res) => {
  try {
    const postId = req.params.id;

    // Find the post by ID
    const post = await Post.findById(postId).populate('user', 'username').populate('comments');

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.status(200).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Like a post
exports.likePost = async (req, res) => {
  try {
    const postId = req.params.id;

    // Check if the post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if the user has already liked the post
    if (post.likes.includes(req.user._id)) {
      return res.status(400).json({ error: 'You have already liked this post' });
    }

    // Add user's ID to the likes array
    post.likes.push(req.user._id);
    await post.save();

    res.status(200).json({ message: 'Post liked successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Unlike a post
exports.unlikePost = async (req, res) => {
  try {
    const postId = req.params.id;

    // Check if the post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if the user has already liked the post
    if (!post.likes.includes(req.user._id)) {
      return res.status(400).json({ error: 'You have not liked this post' });
    }

    // Remove user's ID from the likes array
    post.likes = post.likes.filter(userId => userId.toString() !== req.user._id.toString());
    await post.save();

    res.status(200).json({ message: 'Post unliked successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Comment on a post
exports.commentPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const { text } = req.body;

    // Check if the post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Create a new comment
    const comment = {
      user: req.user._id, // Assuming authenticated user's ID is set in req.user._id
      text
    };

    // Add the comment to the post's comments array
    post.comments.push(comment);
    await post.save();

    res.status(201).json({ message: 'Comment added successfully', comment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = exports;
