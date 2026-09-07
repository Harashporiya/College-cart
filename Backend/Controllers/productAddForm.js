const ProductAdd = require("../Model/productAddForm");
const multer = require("multer");
const {uploadToCloudinary, deleteFromCloudinary} = require("../Config/cloudinary");
const Cart = require("../Model/cartProductAdd");
const storage = multer.memoryStorage()
const { syncProductToPinecone } = require("../Config/pineconeSync");
const { deleteProductFromPinecone } = require("../Config/pineconeSync");

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        // console.log("Received file in multer:", file);
        // const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        // if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        // } else {
        //     cb(new Error('Invalid file type'), false);
        // }
    },
     limits: { fileSize: 5 * 1024 * 1024 } 
})

exports.productAddForm = upload.single('image');

exports.createProduct = async (req, res) => {
    try {

     
        // console.log("file created",req.body)

        const { cloudinaryPublicId,name, brand, category,quantity, selectHostel, hostleName, roomNumber, dayScholarContectNumber, prevAmount, newAmount, description } = req.body;

        if (!req.user?._id) {
            return res.status(401).json({
                success: false,
                message: "User authentication required"
            });
        }

        if (quantity === 0) {
            return res.status(400).json({
                success: false,
                message: "Cannot create product with zero quantity"
            });
        }

        if (!name || !brand || !category || !quantity || !selectHostel || !prevAmount || !newAmount || !description) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        if (selectHostel === "Hostler" && (!hostleName || !roomNumber)) {
            return res.status(400).json({ message: "Hostel name and room number are required for hostlers" });
        }

        if (selectHostel === "Day_Scholar" && !dayScholarContectNumber) {
            return res.status(400).json({ message: "Contact number is required for day scholars" });
        }


        // const image = req.file ? `/assets/${req.file.filename}` : null;
        if (!req.file) {
            return res.status(400).json({ message: "Product image is required" });
        }

        let cloudinaryResult;
        try {
            cloudinaryResult = await uploadToCloudinary(req.file);
            console.log("Cloudinary result:", cloudinaryResult);
            if (!cloudinaryResult) {
                return res.status(400).json({ message: "Image upload failed" });
            }
        } catch (uploadError) {
            console.error("Cloudinary upload error:", uploadError);
            return res.status(500).json({ 
                success: false, 
                message: "Error uploading image",
                error: uploadError.message 
            });
        }

        if(selectHostel === "Hostler"){
            const createProduct = await ProductAdd.create({
                cloudinaryPublicId,
                name,
                brand,
                category,
                quantity,
                selectHostel,
                hostleName,
                roomNumber,
                image:cloudinaryResult.url,
                cloudinaryPublicId: cloudinaryResult.public_id,
                description,
                prevAmount,
                newAmount,
                userId:req.user._id
            })
            await syncProductToPinecone(createProduct);

            return res.status(201).json({ message: "Product created successful!", product: createProduct });
        }

        if(selectHostel === "Day_Scholar"){
            const createProduct = await ProductAdd.create({
                cloudinaryPublicId,
                name,
                brand,
                category,
                quantity,
                selectHostel,
                dayScholarContectNumber,
                image:cloudinaryResult.url,
                cloudinaryPublicId: cloudinaryResult.public_id,
                description,
                prevAmount,
                newAmount,
                userId:req.user._id
            })
             await syncProductToPinecone(createProduct);
            return res.status(201).json({ message: "Product created successful!", product: createProduct });
        }

    } catch (error) {
        console.error("Create product error:", error);
        return res.status(500).json({ success:false, message: "Error during product created" ,error:error.message});
    }
}

exports.getAllProduct = async (req, res) => {
    try {
        // console.log(req.user._id)
        const products = await ProductAdd.find().populate('userId','name profileImage');
        const findProduct = products.filter(user=>
            user.userId._id.toString() !== req.user._id.toString()
        )
        // console.log("userId",findProductUserId)
        //  if(!findProductUserId){ 
            return res.status(200).json({success: true, count: findProduct.length, products:findProduct });
        //  }
        // const products = await ProductAdd.find().populate('userId','name');
        // return res.status(200).json({success: true, count: products.length, products });
    } catch (error) {
        console.error("Get all products error:", error);
        return res.status(500).json({success:false, message: "Error during product fetch",error:error.message });
    }
}


exports.getAllProfileProductUserCreate = async (req,res)=>{
    const {id} = req.params
    try {
        // The mismatch case used to fall through the `if` below without sending
        // anything at all, so the request hung until the client gave up rather
        // than failing fast.
        if(!id || id !== req.user._id.toString()){
            return res.status(403).json({ success: false, message: "Unauthorized access" });
        }

        // Was `ProductAdd.find()` - every product in the database, each one
        // hydrated into a Mongoose document and populated - followed by a JS
        // filter down to this user's own items. Now an indexed query for
        // exactly those items.
        const products = await ProductAdd.find({ userId: req.user._id })
            .populate('userId','name')
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({success: true, count: products.length, products });
    } catch (error) {
        console.error("Get all products error:", error);
        return res.status(500).json({success:false, message: "Error during product fetch",error:error.message });
    }
}


exports.updateStockZeroAndOne = async (req, res) => {
    try {
        const cartItems = await Cart.find();
        const products = await ProductAdd.find().populate('userId', 'name');

        const filteredCartItems = cartItems.filter(item =>
            products.some(product => product._id.toString() === item.productId.toString())
        );

        if (filteredCartItems.length > 0) {
          
            const productQuantityMap = new Map();

            products.forEach(product => {
                productQuantityMap.set(product._id.toString(), {
                    totalQuantity: product.quantity,
                    cartQuantity: 0
                });
            });

            filteredCartItems.forEach(item => {
                const productId = item.productId.toString();
                if (productQuantityMap.has(productId)) {
                    const data = productQuantityMap.get(productId);
                    data.cartQuantity += item.quantity || 0;
                    productQuantityMap.set(productId, data);
                }
            });
            
            const updatePromises = Array.from(productQuantityMap.entries()).map(([productId, data]) => {
                const remainingQuantity = data.totalQuantity - data.cartQuantity;
                return ProductAdd.updateOne(
                    { _id: productId },
                    { $set: { stock: remainingQuantity <= 0 ? 0 : 1 } }
                );
            });
            const updateResults = await Promise.all(updatePromises);
            const totalUpdates = updateResults.reduce((sum, result) => sum + result.modifiedCount, 0);

            return res.status(200).json({
                success: true,
                message: "Stock updated successfully",
                updatedProducts: totalUpdates
            });
        } else {
            const resetResult = await ProductAdd.updateMany(
                {},
                { $set: { stock: 1 } }
            );

            return res.status(200).json({
                success: true,
                message: "All products stock reset to 1",
                updatedProducts: resetResult.modifiedCount
            });
        }
    } catch (error) {
        console.error("Stock update error:", error);
        return res.status(500).json({
            success: false,
            message: "Error updating stock",
            error: error.message
        });
    }
};

exports.getPublicProducts = async (req, res) => {
    try {
        const products = await ProductAdd.find().select("name prevAmount newAmount image category stock"); 
        return res.status(200).json({ success: true, count: products.length, products });
    } catch (error) {
        console.error("Get public products error:", error);
        return res.status(500).json({ success: false, message: "Error during product fetch", error: error.message });
    }
};

exports.getProductById = async (req, res) => {
    const {id}=req.params
    try {
        const product = await ProductAdd.findOne({
            _id:id
        }).populate('userId','name profileImage');
        if (!product) {
            return res.status(404).json({success:false, message: "Product not found" });
        }
        return res.status(200).json({ success:true, product })
    } catch (error) {
        console.error("Get product by ID error:", error);
        return res.status(500).json({success:false, message: "Error during fetch id data", error:error.message });
    }
}

exports.productDeleteById = async (req, res) => {
    const {id} = req.params;
    try {
        const product = await ProductAdd.findById({
            _id:id
        })
        if (!product) {
            return res.status(404).json({success:false, message: "Product not found" });
        }
        if(product.cloudinaryPublicId){
            await deleteFromCloudinary(product.cloudinaryPublicId)
        }

        await product.deleteOne();
          await deleteProductFromPinecone(product._id);

        return res.status(200).json({success:true, message: "Product delete successfull" })
    } catch (error) {
        console.error("Delete product error:", error);
        return res.status(500).json({ message: "Error during delete id data", error:error.message });
    }
}

async function handleProductDeletion(product) {
    if (product.cloudinaryPublicId) {
        await deleteFromCloudinary(product.cloudinaryPublicId);
    }
    await product.deleteOne();
}

exports.updateProduct = async (req, res) => {
    const {id} = req.params;
    const {
        name, brand, category, quantity, selectHostel, hostleName, roomNumber,
        dayScholarContectNumber, prevAmount, newAmount, description
    } = req.body;

    try {
        const product = await ProductAdd.findById(id);
        if (!product) {
            return res.status(404).json({success:false, message: "Product not found" });
        }

        // There was no ownership check here, and the update payload wrote
        // `userId: req.user._id` unconditionally - so any signed-in user could
        // edit any listing in the marketplace and become its owner in the
        // process. The owner is now verified and never reassigned.
        if (String(product.userId) !== String(req.user._id)) {
            return res.status(403).json({ success: false, message: "You can only update your own products" });
        }

        if (Number(quantity) === 0) {
            await handleProductDeletion(product);
            return res.status(200).json({
                success: true,
                deleted: true,
                message: "Product deleted successfully because quantity reached zero"
            });
        }

        const set = { name, brand, category, quantity, selectHostel, description, prevAmount, newAmount };
        const unset = {};

        // The two student types own different contact fields. The previous
        // version built a separate update object per branch and simply left the
        // other branch's fields in place, so a listing switched from Hostler to
        // Day_Scholar kept its old hostel and room number on the document.
        if (selectHostel === "Hostler") {
            set.hostleName = hostleName;
            set.roomNumber = roomNumber;
            unset.dayScholarContectNumber = "";
        } else if (selectHostel === "Day_Scholar") {
            set.dayScholarContectNumber = dayScholarContectNumber;
            unset.hostleName = "";
            unset.roomNumber = "";
        } else {
            // Neither branch matched, which used to mean the handler returned
            // nothing at all: the client waited on a response that was never
            // sent instead of being told what was wrong.
            return res.status(400).json({
                success: false,
                message: "Student type must be either Hostler or Day_Scholar"
            });
        }

        if (req.file) {
            const cloudinaryResult = await uploadToCloudinary(req.file);
            if (!cloudinaryResult) {
                return res.status(400).json({ success:false, message: "Image upload failed" });
            }

            // The new URL goes into the update payload. It used to be assigned
            // onto `req.body` *after* req.body had already been destructured
            // into consts, and `image` was not among the fields written to the
            // document anyway - so a replacement image was uploaded, the old
            // asset was deleted from Cloudinary, and the product kept pointing
            // at the file that had just been removed. Updating a product with a
            // new photo left it with a broken image.
            set.image = cloudinaryResult.url;
            set.cloudinaryPublicId = cloudinaryResult.public_id;

            if (product.cloudinaryPublicId) {
                await deleteFromCloudinary(product.cloudinaryPublicId);
            }
        }

        const payload = Object.keys(unset).length ? { $set: set, $unset: unset } : { $set: set };

        const updateProduct = await ProductAdd.findByIdAndUpdate(id, payload, {
            new: true,
            runValidators: true
        }).populate("userId","name");

        await syncProductToPinecone(updateProduct);

        return res.status(200).json({success:true, message: "Product update successfull", updateProduct })
    } catch (error) {
        console.error("Update product error:", error);
        return res.status(500).json({success:false, message: "Error during update",error:error.message })
    }
}