"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.filter_product = exports.search_product = exports.get_ic_rating = exports.rate_ic = exports.rate_star = exports.edit_product_details = exports.delete_product = exports.list_my_products = exports.list_single_product = exports.list_all_product = exports.add_product = void 0;
const product_model_1 = __importDefault(require("../model/product_model"));
const like_model_1 = __importDefault(require("../model/like_model"));
const comment_model_1 = __importDefault(require("../model/comment_model"));
const seller_model_1 = __importDefault(require("../model/seller_model"));
const rating_model_1 = __importDefault(require("../model/rating_model"));
const like_service_1 = require("../utils/like_service");
const error_handler_1 = require("../middleware/error_handler");
const helper_1 = require("../utils/helper");
const add_product = async function (req, res, next) {
    try {
        //use req.user from auth
        //this is the same as req.user in JavaScript but with type safety
        const user = req.user;
        if (!user) {
            return next((0, error_handler_1.bad_request)("User not authenticate to do this operation"));
        }
        const files = req.files;
        //fix later
        const imagePaths = files
            ? files.map((file) => `http://localhost:2020/uploads/products/${file.filename}`)
            : [];
        const product_features = typeof req.body.product_features === "string"
            ? JSON.parse(req.body.product_features)
            : [];
        const shipping_info = typeof req.body.shipping_info === "string"
            ? JSON.parse(req.body.shipping_info)
            : [];
        const product_policies = typeof req.body.product_policies === "string"
            ? JSON.parse(req.body.product_policies)
            : [];
        const newProduct = new product_model_1.default({
            product_title: req.body.product_title,
            product_description: req.body.product_description,
            product_price: req.body.product_price,
            product_quantity: req.body.product_quantity,
            product_image: imagePaths,
            product_category: req.body.product_category,
            product_features,
            shipping_info,
            product_policies,
            product_view_count: 0,
            product_user: user._id,
        });
        await newProduct.save();
        return res
            .status(200)
            .json({ success: true, data: newProduct, message: "Product Added" });
    }
    catch (err) {
        //return error from Schema
        if (err.name === "ValidationError") {
            return next((0, error_handler_1.bad_request)(err.message));
        }
        //return intertal 500
        return next((0, error_handler_1.internal)(err.message));
    }
};
exports.add_product = add_product;
const list_all_product = async function (req, res, next) {
    try {
        const user_id = req.user ? String(req.user._id) : "";
        // 1. Fetch products + user
        const products = await product_model_1.default.find({})
            .populate("product_user", "_id user_username")
            .lean();
        if (products.length === 0) {
            return res.status(200).json({
                success: true,
                data: [],
                message: "List All Products",
            });
        }
        const productIds = products.map((p) => p._id);
        const userIds = products.map((p) => p.product_user?._id).filter(Boolean);
        // 2. LIKE COUNTS
        const likeCounts = await like_model_1.default.aggregate([
            { $match: { product: { $in: productIds } } },
            { $group: { _id: "$product", total: { $sum: 1 } } },
        ]);
        const likeMap = {};
        likeCounts.forEach((item) => {
            likeMap[String(item._id)] = item.total;
        });
        // 3. COMMENT COUNTS
        const commentCounts = await comment_model_1.default.aggregate([
            { $match: { product: { $in: productIds } } },
            { $group: { _id: "$product", total: { $sum: 1 } } },
        ]);
        const commentMap = {};
        commentCounts.forEach((item) => {
            commentMap[String(item._id)] = item.total;
        });
        // 4. USER LIKE STATUS
        const userLikedSet = new Set();
        if (user_id) {
            const userLikes = await like_model_1.default.find({
                user: user_id,
                product: { $in: productIds },
            }).lean();
            userLikes.forEach((like) => {
                userLikedSet.add(String(like.product));
            });
        }
        // 5. FETCH SELLERS (IMPORTANT PART)
        const sellers = await seller_model_1.default.find({
            user_id: { $in: userIds },
            seller_status: "active",
        }).lean();
        const sellerMap = new Map(sellers.map((s) => [String(s.user_id), s]));
        //FINAL RESPONSE
        const finalProducts = products
            .map((p) => {
            const { avgStars, avgIC } = (0, helper_1.compute_display_rating)(p);
            const ranking_score = (0, helper_1.compute_ranking_score)(p);
            return {
                ...p,
                seller: sellerMap.get(String(p.product_user?._id)) || null,
                like_count: likeMap[String(p._id)] || 0,
                comment_count: commentMap[String(p._id)] || 0,
                liked_by_user: userLikedSet.has(String(p._id)),
                product_view_count: p.product_view_count ?? 0,
                // display values
                avgStars: Math.round(avgStars),
                avgIC: Math.round(avgIC),
                // internal only
                ranking_score,
            };
        })
            .sort((a, b) => b.ranking_score - a.ranking_score)
            .map(({ ranking_score, ...rest }) => rest);
        return res.status(200).json({
            success: true,
            data: finalProducts,
            message: "List All Products",
        });
    }
    catch (err) {
        if (err.name === "ValidationError") {
            return next((0, error_handler_1.bad_request)(err.message));
        }
        return next((0, error_handler_1.internal)(err.message));
    }
};
exports.list_all_product = list_all_product;
const list_single_product = async function (req, res, next) {
    try {
        const user_id = req.user ? String(req.user._id) : "";
        const product_id = req.params.id;
        if (!product_id) {
            return next((0, error_handler_1.not_found)(`Cannot find product_id: ${product_id}`));
        }
        //view count
        const product = await product_model_1.default.findByIdAndUpdate(product_id, { $inc: { product_view_count: 1 } }, { new: true })
            .populate("product_user", "user_username user_email")
            .lean();
        if (!product) {
            return next((0, error_handler_1.not_found)("Product not found"));
        }
        const { avgIC, avgStars } = (0, helper_1.compute_display_rating)(product);
        const like_count = await (0, like_service_1.get_product_like_count)(product_id);
        const comment_count = await comment_model_1.default.countDocuments({ product: product_id });
        let liked_by_user = false;
        if (user_id) {
            liked_by_user = !!(await (0, like_service_1.user_liked_product)(user_id, product_id));
        }
        return res.status(200).json({
            success: true,
            data: {
                ...product,
                like_count,
                comment_count,
                liked_by_user,
                avgStars: Math.round(avgStars),
                avgIC: Math.round(avgIC),
            },
            message: "List Single Product",
        });
    }
    catch (err) {
        if (err.name === "ValidationError")
            return next((0, error_handler_1.bad_request)(err.message));
        return next((0, error_handler_1.internal)(err.message));
    }
};
exports.list_single_product = list_single_product;
const list_my_products = async function (req, res, next) {
    try {
        const user_id = req.user?._id;
        if (!user_id)
            return next((0, error_handler_1.unauthorized)("Not authenticated"));
        const products = await product_model_1.default.find({
            product_user: user_id,
        }).lean();
        if (products.length === 0) {
            return res.status(200).json({
                success: true,
                data: [],
                message: "List My Products",
            });
        }
        const productIds = products.map((p) => p._id);
        // LIKE COUNTS
        const likeCounts = await like_model_1.default.aggregate([
            { $match: { product: { $in: productIds } } },
            { $group: { _id: "$product", total: { $sum: 1 } } },
        ]);
        const likeMap = {};
        likeCounts.forEach((i) => (likeMap[String(i._id)] = i.total));
        // COMMENT COUNTS
        const commentCounts = await comment_model_1.default.aggregate([
            { $match: { product: { $in: productIds } } },
            { $group: { _id: "$product", total: { $sum: 1 } } },
        ]);
        const commentMap = {};
        commentCounts.forEach((i) => (commentMap[String(i._id)] = i.total));
        const finalProducts = products.map((p) => {
            const { avgIC, avgStars } = (0, helper_1.compute_display_rating)(p);
            return {
                ...p,
                // social
                like_count: likeMap[String(p._id)] || 0,
                comment_count: commentMap[String(p._id)] || 0,
                // analytics
                product_view_count: p.product_view_count ?? 0,
                // ratings
                avgIC: Number(avgIC.toFixed(2)),
                avgStars: Number(avgStars.toFixed(2)),
            };
        });
        return res.status(200).json({
            success: true,
            data: finalProducts,
            message: "List My Products",
        });
    }
    catch (err) {
        return next((0, error_handler_1.internal)(err.message));
    }
};
exports.list_my_products = list_my_products;
const delete_product = async function (req, res, next) {
    try {
        const user_id = req.user._id;
        const product_id = req.params.id;
        if (!product_id) {
            return next((0, error_handler_1.not_found)("product not found"));
        }
        //delete product, and its commments and likes
        const product = await product_model_1.default.findOneAndDelete({
            _id: product_id,
            product_user: user_id,
        });
        if (!product) {
            return next((0, error_handler_1.not_found)("Product not found"));
        }
        await comment_model_1.default.deleteMany({
            product: product_id,
        });
        await like_model_1.default.deleteMany({
            product: product_id,
        });
        return res.status(200).json({
            success: true,
            message: "Product deleted",
            data: product,
        });
    }
    catch (err) {
        if (err.name === "ValidationError")
            return next((0, error_handler_1.bad_request)(err.message));
        return next((0, error_handler_1.internal)(err.message));
    }
};
exports.delete_product = delete_product;
const edit_product_details = async function (req, res, next) {
    try {
        const user_id = req.user._id;
        const product_id = req.params.id;
        if (!product_id) {
            return next((0, error_handler_1.not_found)("product not found"));
        }
        if (!user_id) {
            return next((0, error_handler_1.unauthorized)("Unauthorised"));
        }
        const update_product = await product_model_1.default.findOneAndUpdate({
            _id: product_id,
            product_user: user_id,
        }, req.body, { new: true });
        if (!update_product) {
            return next((0, error_handler_1.not_found)("Product not found"));
        }
        return res.status(200).json({
            success: true,
            message: "Product updated",
            data: update_product,
        });
    }
    catch (err) {
        if (err.name === "ValidationError")
            return next((0, error_handler_1.bad_request)(err.message));
        return next((0, error_handler_1.internal)(err.message));
    }
};
exports.edit_product_details = edit_product_details;
//rating
const rate_star = async function (req, res, next) {
    try {
        const user = req.user;
        const product_id = req.params.id;
        const { stars } = req.body;
        if (!user) {
            return next((0, error_handler_1.unauthorized)("Not authorised"));
        }
        if (stars < 0 || stars > 10) {
            return next((0, error_handler_1.bad_request)("Star must be between 0 and 10"));
        }
        const product = await product_model_1.default.findById(product_id);
        if (!product) {
            return next((0, error_handler_1.not_found)("Product not found"));
        }
        const rating = await rating_model_1.default.findOne({
            product: product_id,
            user: user._id,
        });
        if (rating && rating.stars !== undefined) {
            const diff = stars - rating.stars;
            rating.stars = stars;
            await rating.save();
            await product_model_1.default.findByIdAndUpdate(product_id, {
                $inc: { product_user_rating_sum: diff },
            });
        }
        else {
            if (rating) {
                rating.stars = stars;
                await rating.save();
            }
            else {
                await rating_model_1.default.create({
                    product: product_id,
                    user: user._id,
                    stars,
                });
            }
            await product_model_1.default.findByIdAndUpdate(product_id, {
                $inc: {
                    product_user_rating_sum: stars,
                    product_user_rating_count: 1,
                },
            });
        }
        return res.status(200).json({
            success: true,
            message: "Stars rating submitted",
        });
    }
    catch (err) {
        return next((0, error_handler_1.internal)(err.message));
    }
};
exports.rate_star = rate_star;
const rate_ic = async function (req, res, next) {
    try {
        const user = req.user;
        const product_id = req.params.id;
        const { ic } = req.body;
        if (!user) {
            return next((0, error_handler_1.unauthorized)("Not authenticated"));
        }
        if (typeof ic !== "number" || ic < 0 || ic > 10) {
            return next((0, error_handler_1.bad_request)("IC must be between 0 and 5"));
        }
        const product = await product_model_1.default.findById(product_id);
        if (!product) {
            return next((0, error_handler_1.not_found)("Product not found"));
        }
        const rating = await rating_model_1.default.findOne({
            product: product_id,
            user: user._id,
        });
        // UPDATE EXISTING
        if (rating && rating.ic !== undefined) {
            const diff = ic - rating.ic;
            rating.ic = ic;
            await rating.save();
            await product_model_1.default.findByIdAndUpdate(product_id, {
                $inc: { product_ic_rating_sum: diff },
            });
        }
        // CREATE OR ADD IC FIELD
        else {
            if (rating) {
                rating.ic = ic;
                await rating.save();
            }
            else {
                await rating_model_1.default.create({
                    product: product_id,
                    user: user._id,
                    ic,
                });
            }
            await product_model_1.default.findByIdAndUpdate(product_id, {
                $inc: {
                    product_ic_rating_sum: ic,
                    product_ic_rating_count: 1,
                },
            });
        }
        return res.status(200).json({
            success: true,
            message: "IC rating submitted",
        });
    }
    catch (err) {
        return next((0, error_handler_1.internal)(err.message));
    }
};
exports.rate_ic = rate_ic;
const get_ic_rating = async function (req, res, next) {
    try {
        const user = req.user;
        const product_id = req.params.id;
        if (!user) {
            return next((0, error_handler_1.unauthorized)("Not authenticated"));
        }
        const product = await product_model_1.default.findById(product_id).select("product_ic_rating_sum product_ic_rating_count product_user_rating_sum product_user_rating_count");
        if (!product) {
            return next((0, error_handler_1.not_found)("Product not found"));
        }
        const { avgIC, avgStars } = (0, helper_1.compute_display_rating)(product);
        const rating = await rating_model_1.default.findOne({
            product: product_id,
            user: user._id,
        });
        const userIC = rating?.ic ?? null;
        return res.status(200).json({
            success: true,
            userIC,
            avgIC: Number(avgIC.toFixed(2)),
            avgStars: Number(avgStars.toFixed(2)),
            count: product.product_ic_rating_count,
        });
    }
    catch (err) {
        return next((0, error_handler_1.internal)(err.message));
    }
};
exports.get_ic_rating = get_ic_rating;
//search
const search_product = async function (req, res, next) {
    try {
        const q = String(req.query.q || "").trim();
        const page = Number(req.query.page || 0);
        const limit = 20;
        const filter = {};
        if (q.length > 0 && q.length < 3) {
            filter.product_title = {
                $regex: "^" + q,
                $options: "i",
            };
        }
        else if (q.length >= 3) {
            filter.$text = { $search: q };
        }
        let query = product_model_1.default.find(filter);
        if (q.length >= 3) {
            query = query
                .select({ score: { $meta: "textScore" } })
                .sort({ score: { $meta: "textScore" } });
        }
        else {
            query = query.sort({ product_view_count: -1 });
        }
        const products = await query
            .skip(page * limit)
            .limit(limit)
            .lean();
        return res.json({
            page,
            count: products.length,
            results: products,
        });
    }
    catch (err) {
        return next((0, error_handler_1.internal)(err.message));
    }
};
exports.search_product = search_product;
//filters
const filter_product = async function (req, res) {
    try {
        const { minPrice, maxPrice, minIC, maxIC, minLikes, minViews, stock } = req.query;
        const filter = {};
        if (minPrice || maxPrice) {
            filter.product_price = {};
        }
        if (minPrice) {
            filter.product_price.$gte = Number(minPrice);
        }
        if (maxPrice) {
            filter.product_price.$lte = Number(maxPrice);
        }
        if (minIC || maxIC) {
            filter.score = {};
        }
        if (minIC) {
            filter.score.$gte = Number(minIC);
        }
        if (maxIC) {
            filter.score.$lte = Number(maxIC);
        }
        if (minLikes) {
            filter.like_count = { $gte: Number(minLikes) };
        }
        if (minViews) {
            filter.product_view_count = { $gte: Number(minViews) };
        }
        if (stock === "in") {
            filter.product_quantity = { $gt: 0 };
        }
        if (stock === "out") {
            filter.product_quantity = 0;
        }
        const products = await product_model_1.default.find(filter)
            .populate("product_user")
            .sort({ createdAt: -1 });
        res.json({
            success: true,
            data: products,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Filter failed",
        });
    }
};
exports.filter_product = filter_product;
