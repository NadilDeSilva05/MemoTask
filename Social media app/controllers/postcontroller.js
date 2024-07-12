// controllers/postController.js
const Post = require('../models/post');
const User = require('../models/user');

exports.createPost = async (req, res) => {
    const { text } = req.body;
    try {
        const newPost = new Post({
            user: req.user.id,
            text
        });
        await newPost.save();
        res.status(201).json({ message: 'Post created successfully', post: newPost });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getPosts = async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 }).populate('user', 'username');
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.likePost = async (req, res) => {
    const { postId } = req.params;
    try {
        let post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        if (post.likes.includes(req.user.id)) {
            return res.status(400).json({ message: 'Post already liked' });
        }
        post.likes.push(req.user.id);
        await post.save();
        res.json({ message: 'Post liked successfully', post });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.commentPost = async (req, res) => {
    const { postId } = req.params;
    const { text } = req.body;
    try {
        let post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        const newComment = {
            user: req.user.id,
            text
        };
        post.comments.unshift(newComment);
        await post.save();
        res.json({ message: 'Comment added successfully', post });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deletePost = async (req, res) => {
    const { postId } = req.params;
    try {
        let post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        if (post.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }
        await post.remove();
        res.json({ message: 'Post deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
