const express = require("express");
const bodyParser = require("body-parser");
const pg = require("pg");
const cors = require("cors");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const db = require("./config");
const session = require("express-session");
const jwt = require("jsonwebtoken");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

db.connect();

const app = express();
const port = 3001;
const saltRounds = 10;

app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/s_signup", (req, res) => {
  const { id, city, pass } = req.body;
  bcrypt.hash(pass, saltRounds, function (err, hash) {
    if (err) {
      console.log(err);
    } else {
      db.query(
        "INSERT INTO seller (seller_id, seller_city, pass) VALUES ($1, $2, $3)",
        [id, city, hash],
        (err, result) => {
          if (err) {
            console.error("Error inserting seller:", err.stack);
            return res.status(500).send({ error: "Error signing up" });
          }
          res.status(200).send("Successfully signed up");
        }
      );
    }
  });
});

app.post("/s_signin", (req, res) => {
  const { id, pass } = req.body;
  console.log("printitng ", id, pass);
  db.query("SELECT * FROM seller WHERE seller_id = $1", [id], (err, result) => {
    if (err) {
      console.error("Error retrieving manufacturer:", err.stack);
      return res.status(500).send({ error: "Error signing in" });
    }
    console.log(result.rows[0]);
    /*if (!seller || seller.pass != pass) {
      return res.status(401).send("Invalid credentials");
    }
      return res.status(200).send("1");*/
    try {
      bcrypt.compare(pass, result.rows[0].pass, function (err, reslt) {
        if (reslt) {
          const accessToken = jwt.sign({ username: result.rows[0].seller_id, role: 'seller' }, 'your_jwt_secret');
          res.status(200).json({ accessToken });
        } else {
          return res.status(402).send("Invalid credentials");
        }
      });
    } catch {

      res.status(401).send("Invalid credentials");


    }
  });
});

app.post("/m_signup", (req, res) => {
  const { id, brand, city, pass } = req.body;
  bcrypt.hash(pass, saltRounds, function (err, hash) {
    if (err) {
      console.log(err);
    } else {
      db.query(
        "INSERT INTO manufacturer (manuf_id, manuf_brand, manuf_city, pass) VALUES ($1, $2, $3, $4)",
        [id, brand, city, hash],
        (err, result) => {
          if (err) {
            console.error("Error inserting manufacturer:", err.stack);
            if (err.code === '23505') {
              return res.status(409).json({ error: "ID or Brand already exists" });
            }
            return res.status(500).json({ error: "Error signing up" });
          }
          //res.render("m_login.ejs");
          res.status(200).json({ message: "success" });
        }
      );
    }
  });
});

app.post("/m_signin", (req, res) => {
  try {
    const { id, pass } = req.body;
    db.query(
      "SELECT * FROM manufacturer WHERE manuf_id = $1",
      [id],
      (err, result) => {
        if (err) {
          console.error("Error retrieving manufacturer:", err.stack);
          return res.status(500).send({ error: "Error signing in" });
        }

        const manufacturer = result.rows[0];
        try {
          bcrypt.compare(pass, manufacturer.pass, function (err, reslt) {
            if (reslt) {
              const accessToken = jwt.sign({ username: manufacturer.manuf_id, role: 'manufacturer' }, 'your_jwt_secret');
              res.status(200).json({ accessToken });
            } else {
              res.status(401).send("Invalid credentials");
            }
          });
        } catch {
          // alert("Very wrong credentials");
          // console.log("wrong very wrong");
          res.status(401).send("Invalid credentials");
        }
      }
    );
  } catch {
    alert("Wrong Credentials!");
  }
});

const authenticateToken = require("./middleware/auth");

app.post("/brand", authenticateToken, (req, res) => {
  const { id } = req.body;
  db.query(
    "SELECT * FROM manufacturer WHERE manuf_id = $1",
    [id],
    (err, result) => {
      if (err) {
        console.error("Error retrieving data", err.stack);
        return res.status(500).send({ error: "error retrieving brand" });
      } else {
        const resp = result.rows[0];

        return res.status(200).send(resp);
      }
    }
  );
});

app.post("/sendEmail", (req, res) => {
  const { brand, prodId, email, consumerCode } = req.body;

  // Update Product Status in DB
  const updateQuery = `
    INSERT INTO product (manufacturer_brand, product_id, status, consumer_email, consumer_code_hash)
    VALUES ($1, $2, 'sold_to_consumer', $3, $4)
    ON CONFLICT (manufacturer_brand, product_id)
    DO UPDATE SET status = 'sold_to_consumer', consumer_email = $3, consumer_code_hash = $4;
  `;

  db.query(updateQuery, [brand, prodId, email, consumerCode], (dbErr, dbRes) => {
    if (dbErr) {
      console.error("Database update error during sale:", dbErr);
      // Decide if we want to stop here. For now, let's log and proceed or fail? 
      // If DB fails, verification won't work. Best to fail.
      return res.status(500).send("Database error recording sale");
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "amolpatilgamer55@gmail.com",
        pass: "oklh mvho syac pkju",
      },
    });

    const mailOptions = {
      from: "amolpatilgamer55@gmail.com",
      to: email,
      subject: `Your consumer code for purchase is ${consumerCode}`,
      text: ` Your consumer code on purchase from ${brand} product-id : ${prodId} is ${consumerCode}`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        return res.sendStatus(500);
      }
      console.log("Email sent & DB Updated: " + info.response);
      console.log(consumerCode);
      return res.sendStatus(200);
    });
  });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

// Cloudinary Configuration
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const streamifier = require('streamifier');

// Configure Cloudinary with environment variables
// Ensure these appear in your .env as CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Create product_images table if not exists with image_url_2
db.query(`
    CREATE TABLE IF NOT EXISTS product_images (
        product_id VARCHAR(255) PRIMARY KEY,
        image_url TEXT,
        image_url_2 TEXT,
        brand_id VARCHAR(255)
    )
`, (err, res) => {
  if (err) console.error("Error creating product_images table:", err);
  else {
    console.log("product_images table ready");
    // Migration: Add image_url_2 if it doesn't exist
    db.query(`ALTER TABLE product_images ADD COLUMN IF NOT EXISTS image_url_2 TEXT`, (alterErr, alterRes) => {
      if (alterErr) console.error("Error adding image_url_2 column:", alterErr);
      else console.log("product_images table migrated (image_url_2 added)");
    });
  }
});

// Endpoint to upload image to Cloudinary
app.post("/upload-image", upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).send("No file uploaded");

  // Validate Cloudinary Config
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error("Cloudinary credentials missing in .env");
    return res.status(500).json({ error: "Server Configuration Error: Cloudinary credentials missing" });
  }

  try {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "sole_guard_products" },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return res.status(500).send({ error: "Cloudinary upload failed", details: error });
        }
        res.json({ url: result.secure_url });
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
  } catch (e) {
    console.error("Error creating upload stream:", e);
    res.status(500).json({ error: "Internal Server Error during upload initialization" });
  }
});

// Endpoint to link product ID to Image URL
// Endpoint to link product ID to Image URL(s)
app.post("/save-product-image", (req, res) => {
  const { productId, brandId, imageUrl, imageUrl2 } = req.body;
  const img2 = imageUrl2 || null; // Handle optional second image

  // 1. Save Images
  const imageQuery = "INSERT INTO product_images (product_id, image_url, image_url_2, brand_id) VALUES ($1, $2, $3, $4) ON CONFLICT (product_id) DO UPDATE SET image_url = $2, image_url_2 = $3";

  db.query(imageQuery, [productId, imageUrl, img2, brandId], (err, result) => {
    if (err) {
      console.error("Error saving product image:", err);
      return res.status(500).send("Error saving image data");
    }

    // 2. Create Product Entry in Product Table if not exists
    const productQuery = `
      INSERT INTO product (manufacturer_brand, product_id, status)
      VALUES ($1, $2, 'manufactured')
      ON CONFLICT (manufacturer_brand, product_id) DO NOTHING;
    `;

    db.query(productQuery, [brandId, productId], (prodErr, prodRes) => {
      if (prodErr) {
        console.error("Error creating product record:", prodErr);
        // We could define this as critical, but since image saved, maybe 200 with warning log? 
        // For consistency, let's return 500 so client knows something went wrong.
        return res.status(500).send("Error creating product record");
      }
      res.status(200).send("Product & Images saved successfully");
    });
  });
});

// Endpoint to get product image
app.get("/product-image/:id", (req, res) => {
  const productId = req.params.id;
  db.query(
    "SELECT image_url, image_url_2 FROM product_images WHERE product_id = $1",
    [productId],
    (err, result) => {
      if (err) {
        console.error("Error fetching product image:", err);
        return res.status(500).send("Error fetching image");
      }
      if (result.rows.length > 0) {
        res.json({
          imageUrl: result.rows[0].image_url,
          imageUrl2: result.rows[0].image_url_2
        });
      } else {
        res.status(404).send("Image not found");
      }
    }
  );
});

// Endpoint to fetch manufacturer's products
app.get("/manufacturer/products/:brand", (req, res) => {
  const brand = req.params.brand;
  db.query(
    "SELECT * FROM product_images WHERE brand_id = $1",
    [brand],
    (err, result) => {
      if (err) {
        console.error("Error fetching products:", err);
        return res.status(500).send("Error fetching products");
      }
      res.json(result.rows);
    }
  );
});

// Endpoint to fetch all sellers
app.get("/all-sellers", (req, res) => {
  db.query(
    "SELECT * FROM seller",
    (err, result) => {
      if (err) {
        console.error("Error fetching sellers:", err);
        return res.status(500).send("Error fetching sellers");
      }
      res.json(result.rows);
    }
  );
});

// Endpoint to check product status
app.get("/product-status", (req, res) => {
  const { brand, product_id } = req.query;

  if (!brand || !product_id) {
    return res.status(400).json({ error: "Missing brand or product_id" });
  }

  const query = `
    SELECT p.status, p.consumer_email, c.name as customer_name
    FROM product p
    LEFT JOIN customer c ON p.consumer_email = c.email
    WHERE p.manufacturer_brand = $1 AND p.product_id = $2
  `;

  db.query(query, [brand, product_id], (err, result) => {
    if (err) {
      console.error("Error fetching product status:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    const product = result.rows[0];
    res.json({
      status: product.status,
      soldTo: product.status === 'sold_to_consumer' ? product.customer_name : null
    });
  });
});

