

// ----- IMPORTS -----
const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const mongoose = require("mongoose");

// ----- EXPRESS APP INIT -----
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ----- MONGODB CONNECTION -----
mongoose
  .connect(
    "mongodb+srv://nagaraj:nagaraj123@cluster0.tmxhm9e.mongodb.net/lionlogic"
  )
  .then(() => {
    console.log("✅ Connected to MongoDB");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });

// ----- MONGOOSE SCHEMA -----
const AdminSchema = new mongoose.Schema({
  email: String,
  password: String,
  role: String, // admin or customer
});

const Admin = mongoose.model("admin", AdminSchema);

// ----- MULTER CONFIG -----
const storage = multer.memoryStorage();
// const upload = multer({ storage });
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // or "uploads/gallery/" if needed
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const upload = multer({ storage: diskStorage }); // ✅ New config

// ----- NODEMAILER CONFIG -----
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "nagaraja.nagas.2003@gmail.com",
    pass: "hwsx keex wbry qcan",
  },
  tls: {
    rejectUnauthorized: false,
  },
});
const JobSchema = new mongoose.Schema({
  name: String,
  title: String,
  description: String,
  qualifications: String,
  field: String,
  skills: String,
  location: String,
  type: String,
  salary: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Job = mongoose.model("job", JobSchema);
const GalleryImageSchema = new mongoose.Schema({
  url: String,
  text: String, // ➕ Add this line
  folder: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const GalleryImage = mongoose.model("galleryImage", GalleryImageSchema);

const StudentApplicationSchema = new mongoose.Schema({
  name: String,
  mobile: String,
  email: String,
  gender: String,
  dob: String,
  education: String,
  percentage: String,
  skills: String,
  jobTitle: String, // ✅ Add this lin
  resumeFilename: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const StudentApplication = mongoose.model("studentApplication", StudentApplicationSchema);




// Student testimonial and achivements 
const AchievementSchema = new mongoose.Schema({
  img: String, // image path
  title: String,
  desc: String,
  createdAt: { type: Date, default: Date.now }
});
const Achievement = mongoose.model("achievement", AchievementSchema);

const TestimonialSchema = new mongoose.Schema({
  img: String,
  name: String,
  desc: String,
  company: String,
  month: String,
  day: String,
  createdAt: { type: Date, default: Date.now }
});
const Testimonial = mongoose.model("testimonial", TestimonialSchema);



// Upload Student Achievement
app.post("/api/achievements", upload.single("img"), async (req, res) => {
  const { title, desc } = req.body;
  const imgPath = req.file ? `/uploads/${req.file.filename}` : "";

  const newAch = new Achievement({ img: imgPath, title, desc });
  await newAch.save();
  res.status(201).json({ message: "Achievement saved", achievement: newAch });
});

// Get All Achievements
app.get("/api/achievements", async (req, res) => {
  const achievements = await Achievement.find().sort({ createdAt: -1 });
  res.json(achievements);
});

// Upload Testimonial
app.post("/api/testimonials", upload.single("img"), async (req, res) => {
  const { name, desc, company, month, day } = req.body;
  const imgPath = req.file ? `/uploads/${req.file.filename}` : "";

  const newTestimonial = new Testimonial({
    img: imgPath, name, desc, company, month, day
  });
  await newTestimonial.save();
  res.status(201).json({ message: "Testimonial saved", testimonial: newTestimonial });
});

// Get All Testimonials
app.get("/api/testimonials", async (req, res) => {
  const testimonials = await Testimonial.find().sort({ createdAt: -1 });
  res.json(testimonials);
});

// DELETE Achievement
app.delete("/api/achievements/:id", async (req, res) => {
  try {
    await Achievement.findByIdAndDelete(req.params.id);
    res.json({ message: "Achievement deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete achievement" });
  }
});

// UPDATE Achievement
app.put("/api/achievements/:id", upload.single("img"), async (req, res) => {
  const { title, desc } = req.body;
  const updateData = { title, desc };
  if (req.file) updateData.img = `/uploads/${req.file.filename}`;
  try {
    const updated = await Achievement.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update achievement" });
  }
});

// DELETE Testimonial
app.delete("/api/testimonials/:id", async (req, res) => {
  try {
    await Testimonial.findByIdAndDelete(req.params.id);
    res.json({ message: "Testimonial deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete testimonial" });
  }
});

// UPDATE Testimonial
app.put("/api/testimonials/:id", upload.single("img"), async (req, res) => {
  const { name, desc, company, month, day } = req.body;
  const updateData = { name, desc, company, month, day };
  if (req.file) updateData.img = `/uploads/${req.file.filename}`;
  try {
    const updated = await Testimonial.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update testimonial" });
  }
});


// === Submit Student Application ===
app.post("/api/students/apply", upload.single("latestResume"), async (req, res) => {
  try {
    const {
  name,
  mobile,
  email,
  gender,
  dob,
  education,
  percentage,
  skills,
  jobTitle, // ✅ Add this
} = req.body;


    const resumeFilename = req.file ? req.file.filename : "";

    const application = new StudentApplication({
  name,
  mobile,
  email,
  gender,
  dob,
  education,
  percentage,
  skills,
  resumeFilename,
  jobTitle, // ✅ THIS LINE IS MISSING IN YOUR CURRENT CODE
});


    await application.save();

    res.status(201).json({ message: "Application submitted", application });
  } catch (error) {
    console.error("Error saving application:", error);
    res.status(500).json({ message: "Failed to submit application" });
  }
});

// === Get All Student Applications (for Admin View) ===
app.get("/api/students/applications", async (req, res) => {
  try {
    const applications = await StudentApplication.find().sort({ createdAt: -1 });
    console.log("std",applications)
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch applications", error });
  }
});




// Upload image to gallery
app.post("/api/gallery", upload.single("image"), async (req, res) => {
  const folder = req.body.folder || "default";
  const text = req.body.text || ""; // ➕ get the text

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const newImage = new GalleryImage({
    url: `http://localhost:${PORT}/uploads/${req.file.filename}`,
    folder,
    text, // ➕ store text in DB
  });

  await newImage.save();
  res.status(201).json({ message: "Image uploaded", image: newImage });
});



// Add to your backend file (e.g., server.js or models.js)

const SliderSchema = new mongoose.Schema({
  imageUrl: String,
  text: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Slider = mongoose.model("Slider", SliderSchema);

//Blog Start
const BlogSchema = new mongoose.Schema({
  title: String,
  caption: String,
  description: String,
  subParts: [String],
  imagePath: String, // <-- matches here
  createdAt: { type: Date, default: Date.now },
});

const Blog = mongoose.model('Blog', BlogSchema);

// Blog upload route
app.post("/api/blogs", upload.single("image"), async (req, res) => {
  try {
    console.log("File:", req.file);
    console.log("Body:", req.body);

    const { title, caption, description, subParts } = req.body;
    const imagePath = req.file ? req.file.filename : null; // use imagePath

    const newBlog = new Blog({
      title,
      caption,
      description,
      subParts: JSON.parse(subParts), // make sure frontend sends as JSON string
      imagePath, // ✅ use correct key
    });

    await newBlog.save();
    res.status(201).json({ message: "Blog created successfully", blog: newBlog });
  } catch (error) {
    console.error("Error creating blog:", error);
    res.status(500).json({ message: "Server error while creating blog" });
  }
});



app.get("/api/blogs", async (req, res) => {
  const blogs = await Blog.find().sort({ createdAt: -1 });
  res.json(blogs);
});

app.get("/api/blogs/:id", async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) return res.status(404).json({ message: "Not found" });
  res.json(blog);
});

app.delete("/api/blogs/:id", async (req, res) => {
  await Blog.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted successfully" });
});


app.put("/api/blogs/:id", upload.single("image"), async (req, res) => {
  try {
    const { title, caption, description, subParts } = req.body;
    const imageUrl = req.file ? req.file.filename : null;

    const updatedData = {
      title,
      caption,
      description,
      subParts: JSON.parse(subParts),
    };

    if (imageUrl) {
      updatedData.imagePath = imageUrl;
    }

    const blog = await Blog.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    res.json({ message: "Blog updated", blog });
  } catch (error) {
    console.error("Error updating blog:", error);
    res.status(500).json({ message: "Server error while updating blog" });
  }
});

//Blog ends


// Upload a new slider
app.post("/api/sliders", upload.single("image"), async (req, res) => {
  try {
    const text = req.body.text || "";

    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const slider = new Slider({
      imageUrl: `http://localhost:${PORT}/uploads/${req.file.filename}`,
      text,
    });

    await slider.save();
    res.status(201).json({ message: "Slider added successfully", slider });
  } catch (err) {
    console.error("Slider upload error:", err);
    res.status(500).json({ message: "Failed to upload slider" });
  }
});

// Get all sliders
app.get("/api/sliders", async (req, res) => {
  try {
    const sliders = await Slider.find().sort({ createdAt: -1 });
    res.json(sliders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch sliders" });
  }
});

// Delete slider by ID
app.delete("/api/sliders/:id", async (req, res) => {
  try {
    await Slider.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Slider deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete error", error: err.message });
  }
});



// Get all gallery images
app.get("/api/gallery", async (req, res) => {
  const { folder } = req.query;
  const filter = folder ? { folder } : {};
  const images = await GalleryImage.find(filter).sort({ createdAt: -1 });
  res.json(images);
});

// Delete image by ID
app.delete("/api/gallery/:id", async (req, res) => {
  try {
    await GalleryImage.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Image deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete error", error: err.message });
  }
});

// Create a new job
app.post("/api/jobs", async (req, res) => {
  try {
    const job = new Job(req.body);
    await job.save();
    res.status(201).json({ message: "Job posted successfully", job });
  } catch (error) {
    console.error("Error posting job:", error);
    res.status(500).json({ message: "Failed to post job" });
  }
});

// Get all jobs
app.get("/api/jobs", async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.status(200).json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ message: "Failed to fetch jobs" });
  }
});

// Update a job by ID
app.put("/api/jobs/:id", async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ message: "Job updated", job });
  } catch (err) {
    res.status(500).json({ message: "Error updating job", error: err.message });
  }
});

// Delete a job by ID
app.delete("/api/jobs/:id", async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Job deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting job", error: err.message });
  }
});


// ----- LOGIN ROUTE -----
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log("Login attempt:", email, password);
    const user = await Admin.findOne({ password: password });
    console.log("User found:", user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid password" });
    }

    return res.status(200).json({
      message: "Login successful",
      role: user.role,
      email: user.email,
      userId: user._id,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// ----- CAREER ROUTE -----
app.post("/send-career", upload.single("resume"), (req, res) => {
  const { name, email, phone } = req.body;
  const resume = req.file;

  if (!name || !email || !phone || !resume) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const mailOptions = {
    from: email,
    to: "nn1528523@gmail.com",
    subject: "New Career Application",
    text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}`,
    attachments: [
      {
        filename: resume.originalname,
        content: resume.buffer,
      },
    ],
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err)
      return res
        .status(500)
        .json({ message: "Failed to send application", error: err.message });
    return res
      .status(200)
      .json({
        message: "Application submitted successfully",
        info: info.response,
      });
  });
});

// ----- CONTACT ROUTE -----
app.post("/contact", (req, res) => {
  const { name, email, subject, message, budget = 'Not specified', timeline = 'Not specified' } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: "Required fields missing." });
  }

  const mailOptions = {
    from: email,
    to: "nn1528523@gmail.com",
    subject: `New Contact Form Submission: ${subject}`,
    text: `
Name: ${name}
Email: ${email}
Subject: ${subject}
Budget: ${budget}
Timeline: ${timeline}
Message: ${message}
    `,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error("Email send error:", err.message);
      return res.status(500).json({ message: "Failed to send message", error: err.message });
    }

    return res.status(200).json({ message: "Message sent successfully", info: info.response });
  });
});






// ----- FEEDBACK ROUTE -----
app.post("/send-feedback", (req, res) => {
  const { name, email, phone, address, feedback } = req.body;
  if (!name || !email || !phone || !address || !feedback) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const mailOptions = {
    from: email,
    to: "nn1528523@gmail.com",
    subject: "New Feedback Form Submission",
    text: `\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nAddress: ${address}\nFeedback: ${feedback}`,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err)
      return res
        .status(500)
        .json({ message: "Failed to send feedback", error: err.message });
    return res
      .status(200)
      .json({ message: "Feedback sent successfully", info: info.response });
  });
});

// ----- STATIC FILE SERVING -----
app.use(express.static(path.join(__dirname, "/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname + "/dist/index.html"));
});

// ----- START SERVER -----
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
