export interface MockLaptop {
  id: number;
  name: string;
  brand: string;
  image: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  ratingCount: number;
  category: string;
  specs: {
    processor: string;
    ram: string;
    storage: string;
    gpu: string;
    display: string;
    battery: string;
    weight: string;
    os: string;
    ports: string[];
    features: string[];
  };
  description: string;
  inStock: boolean;
  isFavorite?: boolean;
}

export const mockLaptops: MockLaptop[] = [
  {
    id: 1,
    name: "MacBook Pro M3",
    brand: "Apple",
    image: "/laptops/macbook-pro.jpg", // Replace with actual image path
    price: 180000,
    originalPrice: 195000,
    discount: 8,
    rating: 4.8,
    ratingCount: 356,
    category: "Premium",
    specs: {
      processor: "Apple M3 Pro (12-core CPU)",
      ram: "32GB Unified Memory",
      storage: "1TB SSD",
      gpu: "19-core GPU",
      display: "14.2-inch Liquid Retina XDR display",
      battery: "Up to 18 hours",
      weight: "1.55 kg",
      os: "macOS Sonoma",
      ports: ["Thunderbolt 4", "HDMI", "SD card slot", "MagSafe", "3.5mm headphone jack"],
      features: ["TouchID", "ProMotion", "True Tone", "Magic Keyboard", "Force Touch trackpad"]
    },
    description: "The MacBook Pro with M3 chip delivers groundbreaking performance and the world's best laptop display. With all-day battery life and the best combination of ports on a Mac notebook, it's the perfect pro laptop.",
    inStock: true
  },
  {
    id: 2,
    name: "Dell XPS 15",
    brand: "Dell",
    image: "/laptops/dell-xps-15.jpg",
    price: 150000,
    rating: 4.6,
    ratingCount: 289,
    category: "Premium",
    specs: {
      processor: "Intel Core i9-13900H",
      ram: "32GB DDR5",
      storage: "1TB NVMe SSD",
      gpu: "NVIDIA GeForce RTX 4070",
      display: "15.6-inch 3.5K OLED TouchScreen (3456 x 2160)",
      battery: "Up to 12 hours",
      weight: "1.96 kg",
      os: "Windows 11 Pro",
      ports: ["Thunderbolt 4", "USB-C", "SD card reader", "3.5mm headphone jack"],
      features: ["Precision touchpad", "Backlit keyboard", "Windows Hello face recognition", "Dolby Atmos audio"]
    },
    description: "The Dell XPS 15 combines stunning OLED display technology with powerful performance in a premium, compact design ideal for creative professionals.",
    inStock: true
  },
  {
    id: 3,
    name: "HP Victus Gaming",
    brand: "HP",
    image: "/laptops/hp-victus.jpg",
    price: 95000,
    originalPrice: 110000,
    discount: 14,
    rating: 4.3,
    ratingCount: 178,
    category: "Gaming",
    specs: {
      processor: "AMD Ryzen 7 7840H",
      ram: "16GB DDR5",
      storage: "512GB SSD",
      gpu: "NVIDIA GeForce RTX 4060",
      display: "15.6-inch FHD IPS 144Hz",
      battery: "Up to 6 hours",
      weight: "2.29 kg",
      os: "Windows 11 Home",
      ports: ["USB-C", "USB-A", "HDMI", "Ethernet", "3.5mm combo jack"],
      features: ["RGB backlit keyboard", "OMEN Gaming Hub", "DTS:X Ultra audio"]
    },
    description: "The HP Victus delivers essential gaming performance at a value price point, featuring the latest AMD processor and NVIDIA graphics for smooth gameplay.",
    inStock: true
  },
  {
    id: 4,
    name: "Lenovo ThinkPad X1 Carbon",
    brand: "Lenovo",
    image: "/laptops/thinkpad-x1.jpg",
    price: 135000,
    rating: 4.7,
    ratingCount: 245,
    category: "Business",
    specs: {
      processor: "Intel Core i7-1370P",
      ram: "16GB LPDDR5",
      storage: "512GB PCIe SSD",
      gpu: "Intel Iris Xe Graphics",
      display: "14-inch 2.8K OLED (2880 x 1800)",
      battery: "Up to 15 hours",
      weight: "1.12 kg",
      os: "Windows 11 Pro",
      ports: ["Thunderbolt 4", "USB-A", "HDMI", "3.5mm headphone jack"],
      features: ["TrackPoint", "Fingerprint reader", "Webcam privacy shutter", "MIL-STD-810H tested"]
    },
    description: "The legendary ThinkPad X1 Carbon combines premium materials with professional-grade performance and security features in an ultra-light package.",
    inStock: true
  },
  {
    id: 5,
    name: "ASUS ROG Zephyrus G14",
    brand: "ASUS",
    image: "/laptops/rog-zephyrus.jpg",
    price: 120000,
    rating: 4.5,
    ratingCount: 312,
    category: "Gaming",
    specs: {
      processor: "AMD Ryzen 9 7940HS",
      ram: "16GB DDR5",
      storage: "1TB NVMe SSD",
      gpu: "NVIDIA GeForce RTX 4060",
      display: "14-inch QHD+ 165Hz",
      battery: "Up to 10 hours",
      weight: "1.65 kg",
      os: "Windows 11 Home",
      ports: ["USB-C", "USB-A", "HDMI", "3.5mm headphone jack"],
      features: ["AniMe Matrix LED display", "RGB keyboard", "Dolby Atmos", "ROG Intelligent Cooling"]
    },
    description: "The ROG Zephyrus G14 packs exceptional gaming performance into a compact 14-inch design, with AMD's latest processor and RTX graphics.",
    inStock: true
  },
  {
    id: 6,
    name: "Acer Nitro 5",
    brand: "Acer",
    image: "/laptops/acer-nitro.jpg",
    price: 80000,
    originalPrice: 88000,
    discount: 9,
    rating: 4.2,
    ratingCount: 189,
    category: "Gaming",
    specs: {
      processor: "Intel Core i5-13500H",
      ram: "16GB DDR5",
      storage: "512GB SSD",
      gpu: "NVIDIA GeForce RTX 4050",
      display: "15.6-inch FHD 144Hz",
      battery: "Up to 7 hours",
      weight: "2.5 kg",
      os: "Windows 11 Home",
      ports: ["USB-C", "USB-A", "HDMI", "Ethernet", "3.5mm combo jack"],
      features: ["4-zone RGB keyboard", "NitroSense control", "DTS:X Ultra audio"]
    },
    description: "The Acer Nitro 5 offers solid gaming performance at an affordable price point, with the latest Intel processors and RTX 4050 graphics.",
    inStock: true
  },
  {
    id: 7,
    name: "Microsoft Surface Laptop Studio",
    brand: "Microsoft",
    image: "/laptops/surface-studio.jpg",
    price: 165000,
    rating: 4.6,
    ratingCount: 142,
    category: "Premium",
    specs: {
      processor: "Intel Core i7-11370H",
      ram: "32GB LPDDR4x",
      storage: "1TB SSD",
      gpu: "NVIDIA GeForce RTX 3050 Ti",
      display: "14.4-inch PixelSense Flow touch display (2400 x 1600)",
      battery: "Up to 18 hours",
      weight: "1.82 kg",
      os: "Windows 11 Pro",
      ports: ["Thunderbolt 4", "Surface Connect", "3.5mm headphone jack"],
      features: ["Dynamic Woven Hinge", "Surface Slim Pen 2 compatibility", "Windows Hello face authentication"]
    },
    description: "The Surface Laptop Studio features a revolutionary design that transitions from laptop to stage to studio mode, perfect for creative professionals and artists.",
    inStock: true
  },
  {
    id: 8,
    name: "MSI GE76 Raider",
    brand: "MSI",
    image: "/laptops/msi-raider.jpg",
    price: 190000,
    rating: 4.4,
    ratingCount: 167,
    category: "Gaming",
    specs: {
      processor: "Intel Core i9-13980HX",
      ram: "32GB DDR5",
      storage: "2TB NVMe SSD",
      gpu: "NVIDIA GeForce RTX 4080",
      display: "17.3-inch QHD 240Hz",
      battery: "Up to 4 hours",
      weight: "3.0 kg",
      os: "Windows 11 Home",
      ports: ["Thunderbolt 4", "USB-A", "HDMI", "Mini DisplayPort", "SD card reader", "Ethernet"],
      features: ["Per-key RGB keyboard by SteelSeries", "Cooler Boost 5", "MSI Center"]
    },
    description: "The MSI GE76 Raider is a desktop replacement gaming laptop with top-tier performance, featuring the latest Intel HX processor and powerful RTX graphics.",
    inStock: true
  },
  {
    id: 9,
    name: "HP EliteBook 840 G9",
    brand: "HP",
    image: "/laptops/hp-elitebook.jpg",
    price: 105000,
    rating: 4.5,
    ratingCount: 98,
    category: "Business",
    specs: {
      processor: "Intel Core i7-1270P",
      ram: "16GB DDR5",
      storage: "512GB PCIe SSD",
      gpu: "Intel Iris Xe Graphics",
      display: "14-inch FHD IPS 400 nits",
      battery: "Up to 14 hours",
      weight: "1.36 kg",
      os: "Windows 11 Pro",
      ports: ["Thunderbolt 4", "USB-A", "HDMI", "Nano SIM", "3.5mm headphone jack"],
      features: ["HP Sure View privacy screen", "HP Wolf Security", "5G connectivity", "Spill-resistant keyboard"]
    },
    description: "The HP EliteBook 840 G9 is designed for professionals who need security, manageability, and reliability in a sleek, lightweight package.",
    inStock: false
  },
  {
    id: 10,
    name: "LG Gram 17",
    brand: "LG",
    image: "/laptops/lg-gram.jpg",
    price: 125000,
    originalPrice: 140000,
    discount: 11,
    rating: 4.7,
    ratingCount: 122,
    category: "Ultrabook",
    specs: {
      processor: "Intel Core i7-1360P",
      ram: "16GB LPDDR5",
      storage: "1TB NVMe SSD",
      gpu: "Intel Iris Xe Graphics",
      display: "17-inch WQXGA IPS (2560 x 1600)",
      battery: "Up to 19.5 hours",
      weight: "1.35 kg",
      os: "Windows 11 Home",
      ports: ["Thunderbolt 4", "USB-A", "HDMI", "microSD card reader", "3.5mm headphone jack"],
      features: ["Military-grade durability (MIL-STD-810G)", "Full-size backlit keyboard", "Fingerprint reader"]
    },
    description: "Despite its large 17-inch screen, the LG Gram 17 is one of the lightest laptops available, perfect for productivity on the go with exceptional battery life.",
    inStock: true
  }
];

// These are brand and category lists matching the laptops above
export const mockBrands = [
  { id: "apple", label: "Apple" },
  { id: "dell", label: "Dell" },
  { id: "hp", label: "HP" },
  { id: "lenovo", label: "Lenovo" },
  { id: "asus", label: "ASUS" },
  { id: "acer", label: "Acer" },
  { id: "microsoft", label: "Microsoft" },
  { id: "msi", label: "MSI" },
  { id: "lg", label: "LG" }
];

export const mockCategories = [
  { id: "premium", label: "Premium" },
  { id: "gaming", label: "Gaming" },
  { id: "business", label: "Business" },
  { id: "ultrabook", label: "Ultrabook" }
];

// Sample placeholder images if you don't have real ones
export const placeholderImages = {
  "/laptops/macbook-pro.jpg": "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp14-spacegray-select-202310?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1697311054290",
  "/laptops/dell-xps-15.jpg": "https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/notebooks/xps-notebooks/xps-15-9530/media-gallery/black/notebook-xps-15-9530-t-black-gallery-1.psd?fmt=png-alpha&pscan=auto&scl=1&wid=4000&hei=2800&qlt=100,1&resMode=sharp2&size=4000,2800",
  "/laptops/hp-victus.jpg": "https://ssl-product-images.www8-hp.com/digmedialib/prodimg/lowres/c08201104.png",
  "/laptops/thinkpad-x1.jpg": "https://www.lenovo.com/medias/lenovo-laptops-thinkpad-x1-carbon-gen-11-series-front-forward-facing.png?context=bWFzdGVyfHJvb3R8OTAzMDZ8aW1hZ2UvcG5nfGg3My9oNGIvMTUwMTY1NTQ2ODEzNzQucG5nfDFkM2RiYzc3ZWVkZmEyZWQ0YzJhZmIxYzBiNmMxMTY0MzQ5YTkzM2QzMjFjZjI4ZjliNzUyMDZmYWY5ZDdjN2I",
  "/laptops/rog-zephyrus.jpg": "https://dlcdnwebimgs.asus.com/gain/234E5081-5259-4E87-81CB-45F052F1BD12",
  "/laptops/acer-nitro.jpg": "https://static.acer.com/up/Resource/Acer/Laptops/Nitro_5/Images/20220330/Nitro-5-AN515-58-rgbkb-photogallery-1.png",
  "/laptops/surface-studio.jpg": "https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RWHHu4",
  "/laptops/msi-raider.jpg": "https://storage-asset.msi.com/global/picture/image/feature/nb/RaiderGE76/GE76-12UH-laptop.png",
  "/laptops/hp-elitebook.jpg": "https://ssl-product-images.www8-hp.com/digmedialib/prodimg/lowres/c07956307.png",
  "/laptops/lg-gram.jpg": "https://www.lg.com/us/images/laptops/md08000021/gallery/desktop-01.jpg"
};