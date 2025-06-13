import mongoose from 'mongoose';

// Replace this with your actual connection string
const MONGODB_URI = 'mongodb+srv://mohamedhmm001:TjdlGZJdQqgfYoRl@cluster0.m19jwdf.mongodb.net/MC?retryWrites=true&w=majority&appName=Cluster0';

// Target seller ID
const sellerId = new mongoose.Types.ObjectId('681cdb75bf071c36025b9d4b');

const products = [
  {
    name: "NZXT H7 Elite Mid Tower Case",
    description: "Mid-tower PC case with tempered glass panels, excellent airflow, and cable management.",
    price: 179.99,
    salePrice: null,
    stock: 30,
    isAvailable: true,
    category: "Electronics",
    tags: ["pc-case", "chassis", "gaming"],
    image: ["https://m.media-amazon.com/images/I/51NiFmcBGyL._AC_UF894,1000_QL80_.jpg"],
    rating: 4,
    reviews: [{
      userId: new mongoose.Types.ObjectId('680becbed8e2df4e5773466b'),
      rating: 4,
      comment: "Looks sleek and has great airflow, but a bit heavy.",
      createdAt: new Date(1698710400000),
    }],
    createdAt: new Date(1745611966392),
    updatedAt: new Date(1745611966392),
    user: sellerId,
  },
  {
    name: "AMD Ryzen 9 7950X",
    description: "16-core, 32-thread high-performance desktop processor with boosted clock speeds up to 5.7GHz.",
    price: 699.99,
    salePrice: 649.99,
    stock: 20,
    isAvailable: true,
    category: "Electronics",
    tags: ["cpu", "processor", "pc-build"],
    image: ["https://trivico.la/images/products/detail/AMD-Ryzen-9-7950X-DTA308.jpg"],
    rating: 5,
    reviews: [{
      userId: new mongoose.Types.ObjectId('680becbed8e2df4e5773466d'),
      rating: 5,
      comment: "Incredible performance for gaming and productivity!",
      createdAt: new Date(1698624000000),
    }],
    createdAt: new Date(1745611966393),
    updatedAt: new Date(1745611966393),
    user: sellerId,
  },
  {
    name: "Corsair RM850x 850W Gold PSU",
    description: "Fully modular 850W power supply with 80+ Gold efficiency.",
    price: 129.99,
    salePrice: 119.99,
    stock: 60,
    isAvailable: true,
    category: "Electronics",
    tags: ["psu", "power-supply", "pc-build"],
    image: ["https://images.anandtech.com/doci/13220/CORSAIR_RM850X_01.jpg"],
    rating: 5,
    reviews: [{
      userId: new mongoose.Types.ObjectId('680becbed8e2df4e5773466d'),
      rating: 5,
      comment: "Reliable and quiet PSU for my rig.",
      createdAt: new Date(1698451200000),
    }],
    createdAt: new Date(1745611966394),
    updatedAt: new Date(1745611966394),
    user: sellerId,
  },
  {
    name: "Corsair Vengeance LPX 32GB DDR5",
    description: "32GB DDR5 RAM with speeds up to 6000MHz for high-performance systems.",
    price: 199.99,
    salePrice: 179.99,
    stock: 50,
    isAvailable: true,
    category: "Electronics",
    tags: ["ram", "memory", "pc-build"],
    image: ["https://img.overclockers.co.uk/images/MEM-CRS-01177/199c39eee682e20eb50529972d05cd6c.jpg"],
    rating: 5,
    reviews: [{
      userId: new mongoose.Types.ObjectId('680becbed8e2df4e5773466d'),
      rating: 5,
      comment: "Fast and reliable memory for my build.",
      createdAt: new Date(1698278400000),
    }],
    createdAt: new Date(1745611966394),
    updatedAt: new Date(1745611966394),
    user: sellerId,
  },
  {
    name: "ASUS ROG Strix Z790-E Gaming WiFi",
    description: "High-end motherboard with PCIe 5.0 support and built-in WiFi 6E.",
    price: 449.99,
    salePrice: null,
    stock: 35,
    isAvailable: true,
    category: "Electronics",
    tags: [],
    image: ["https://dlcdnwebimgs.asus.com/gain/A14B0E0C-2EF6-4A28-9E30-089DCE5BF278/w717/h525"],
    rating: 0,
    reviews: [],
    createdAt: new Date(1745611966395),
    updatedAt: new Date(1745611966395),
    user: sellerId,
  },
  {
    name: "NZXT Kraken X63 RGB Liquid Cooler",
    description: "Liquid CPU cooler with RGB lighting and efficient cooling performance.",
    price: 149.99,
    salePrice: null,
    stock: 40,
    isAvailable: true,
    category: "Electronics",
    tags: ["cpu-cooler", "cooling", "rgb"],
    image: ["https://www.maxframe.dz/gla-adminer/uploads/image/672893982EA5E.jpg"],
    rating: 4,
    reviews: [{
      userId: new mongoose.Types.ObjectId('680becbed8e2df4e5773466b'),
      rating: 4,
      comment: "Keeps my CPU cool and looks great!",
      createdAt: new Date(1698364800000),
    }],
    createdAt: new Date(1745611966394),
    updatedAt: new Date(1745611966394),
    user: sellerId,
  },
  {
    name: "NVIDIA GeForce RTX 4090",
    description: "High-performance GPU with ray tracing and AI acceleration.",
    price: 1599.99,
    salePrice: null,
    stock: 25,
    isAvailable: true,
    category: "Electronics",
    tags: ["gpu", "graphics-card", "gaming"],
    image: ["https://www.club386.com/wp-content/uploads/2022/09/4090-FE.jpg"],
    rating: 5,
    reviews: [{
      userId: new mongoose.Types.ObjectId('680becbed8e2df4e5773466b'),
      rating: 5,
      comment: "Best GPU for 4K gaming!",
      createdAt: new Date(1698105600000),
    }],
    createdAt: new Date(1745611966395),
    updatedAt: new Date(1745611966395),
    user: sellerId,
  },
  {
    name: "ASUS ROG Strix Z790-E Gaming WiFi",
    description: "High-end motherboard with PCIe 5.0 support and built-in WiFi 6E.",
    price: 449.99,
    salePrice: 399.99,
    stock: 35,
    isAvailable: true,
    category: "Electronics",
    tags: ["motherboard", "pc-build", "gaming"],
    image: ["https://dlcdnwebimgs.asus.com/gain/A14B0E0C-2EF6-4A28-9E30-089DCE5BF278/w717/h525"],
    rating: 4,
    reviews: [{
      userId: new mongoose.Types.ObjectId('680becbed8e2df4e5773466d'),
      rating: 4,
      comment: "Great features but a bit pricey.",
      createdAt: new Date(1698192000000),
    }],
    createdAt: new Date(1745611966395),
    updatedAt: new Date(1745611966395),
    user: sellerId,
  }
];

// Define schema with strict: false to allow any shape
const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model('Product', productSchema, 'products');

// Seed function
const seedProducts = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    await Product.insertMany(products);
    console.log('Products inserted successfully!');
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
};

seedProducts();
