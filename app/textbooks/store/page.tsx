"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  BookOpen, 
  Lock, 
  FileText, 
  ShoppingBag, 
  ArrowLeft, 
  CheckCircle2, 
  Truck, 
  ShieldCheck, 
  Award,
  Sparkles,
  Search,
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingCart
} from "lucide-react";
import Link from "next/link";

interface TextbookDetails {
  id: string;
  title: string;
  code: string;
  description: string;
  price: number;
  authors: string;
  pages: number;
  isbn: string;
  pdfFileName: string;
  tag?: string; // e.g. "Best Seller", "Trending", "Staff Pick"
  stockStatus: "in-stock" | "low-stock" | "out-of-stock";
  stockCount?: number;
}

const PUBLISHED_BOOKS: TextbookDetails[] = [
  {
    id: "1",
    title: "Indian Mineral Import Policy Options: An Economywide Analysis",
    code: "MP",
    description: "This study presents a comprehensive and data-driven examination of India's mineral import landscape, offering a distinctive economy-wide perspective. By integrating long-term trade trends with advanced simulation and modelling techniques, it evaluates the real economic implications of mineral import decisions on output, employment, prices, and trade dynamics. Covering a wide spectrum of critical minerals and situating India within the global resource ecosystem, the study provides a balanced and policy-relevant framework for understanding the interplay between domestic production and strategic imports.",
    price: 999,
    authors: "Badri Narayanan Gopalakrishnan, Vishnu Dasgupta, Kannan Kumar",
    pages: 88,
    isbn: "978-81-685077-7-7",
    pdfFileName: "minerals.pdf",
    tag: "Trending",
    stockStatus: "in-stock"
  },
  {
    id: "2",
    title: "MACHINE LEARNING: A STRUCTURED APPROACH TO ALGORITHMS AND INTELLIGENT SYSTEMS",
    code: "ML",
    description: "This book offers a systematic and in-depth exploration of machine learning, designed to help readers build a strong foundation while progressing toward advanced applications. It begins by introducing the core principles of machine learning, including data representation, statistical thinking, and the fundamental paradigms of supervised, unsupervised, and reinforcement learning.",
    price: 700,
    authors: "Dr. Halavath Balaji, Jogu Saritha, Pallavi B",
    pages: 231,
    isbn: "978-81-685077-3-9",
    pdfFileName: "ml.pdf",
    tag: "Best Seller",
    stockStatus: "in-stock"
  },
  {
    id: "3",
    title: "DATABASE MANAGEMENT SYSTEMS: CONCEPTS, DESIGN AND IMPLEMENTATION",
    code: "DB",
    description: "This textbook provides a comprehensive and structured introduction to the fundamental concepts, design principles, and implementation techniques of Database Management Systems (DBMS). It is designed to guide learners from foundational topics such as data models and relational theory to advanced areas including SQL, schema refinement (normalization), and transaction management.",
    price: 750,
    authors: "Dr. Halavath Balaji, Jogu Saritha, Pallavi B",
    pages: 248,
    isbn: "978-81-685077-5-3",
    pdfFileName: "dbms.pdf",
    tag: "Staff Pick",
    stockStatus: "in-stock"
  },
  {
    id: "5",
    title: "PRINCIPLES OF MICROECONOMICS FOR BUSINESS AND MANAGEMENT",
    code: "PM",
    description: "This textbook provides a comprehensive and structured introduction to the core principles of microeconomics tailored for business and management. It covers demand and supply analysis, consumer behavior, production theory, market structures, factor pricing, and real-world managerial decision making.",
    price: 600,
    authors: "Dr. Aruna Kumar Dash",
    pages: 277,
    isbn: "978-81-685077-1-5",
    pdfFileName: "microeconomics.pdf",
    tag: "New Release",
    stockStatus: "in-stock"
  },
  {
    id: "6",
    title: "FOUNDATIONS OF ARTIFICIAL INTELLIGENCE: CONCEPTS, TECHNIQUES AND APPLICATIONS",
    code: "AI",
    description: "This book provides a comprehensive foundation in Artificial Intelligence, exploring intelligent agents, state-space search algorithms, knowledge representation, machine learning paradigms, reasoning systems, and ethical AI implications for next-generation intelligent applications.",
    price: 499,
    authors: "Dr. P. Manikandan, Dr. P. Renukadevi, Dr. J. Nashreen Begum, Dr. D. Banumathy",
    pages: 142,
    isbn: "978-81-685077-4-6",
    pdfFileName: "ai.pdf",
    tag: "New Release",
    stockStatus: "in-stock"
  }
];

interface CartItem {
  id: string;
  title: string;
  price: number;
  coverImg: string;
  quantity: number;
  format?: 'physical' | 'soft';
  plan?: string;
}

const getSoftCopyPrice = (plan: string, bookId?: string): number => {
  if (bookId === "6") {
    if (plan === "book_only") return 259;
    if (plan === "caselet") return 60;
    if (plan === "book_caselet") return 295;
    if (plan === "book_portal") return 259;
    if (plan === "book_caselet_portal") return 329;
    if (plan === "complete") return 200;
    if (plan === "placements") return 150;
    if (plan === "practice") return 80;
    return 259;
  }
  if (bookId === "5") {
    if (plan === "book_only") return 370;
    if (plan === "caselet") return 80;
    if (plan === "book_caselet") return 405;
    if (plan === "book_portal") return 539;
    if (plan === "book_caselet_portal") return 589;
    if (plan === "complete") return 200;
    if (plan === "placements") return 150;
    if (plan === "practice") return 80;
  }
  let price = 399;
  switch (plan) {
    case "book_only": price = 230; break;
    case "caselet": price = 60; break;
    case "book_caselet": price = 265; break;
    case "book_portal": price = 399; break;
    case "book_caselet_portal": price = 449; break;
    case "complete": price = 200; break;
    case "placements": price = 150; break;
    case "practice": price = 80; break;
    default: price = 399;
  }
  if (bookId === "2" || bookId === "3") {
    if (bookId === "3") {
      if (plan === "book_only") return 300;
      if (plan === "book_caselet") return 335;
      if (plan === "book_portal") return 469;
      if (plan === "book_caselet_portal") return 519;
    }
    return price + 20;
  }
  return price;
};

export default function BookstorePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [publishedPdfs, setPublishedPdfs] = useState<string[]>([]);
  const [selectedBookForPreview, setSelectedBookForPreview] = useState<TextbookDetails | null>(null);
  const [mounted, setMounted] = useState(false);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Plan Selection States
  const [selectedBookForPurchase, setSelectedBookForPurchase] = useState<TextbookDetails | null>(null);
  const [purchaseFormat, setPurchaseFormat] = useState<"physical" | "soft" | null>(null);
  const [selectedSoftOption, setSelectedSoftOption] = useState<string>("book_portal"); // default
  const [selectedPortalOnlyOption, setSelectedPortalOnlyOption] = useState<string>("complete");
  const [modalMode, setModalMode] = useState<'buy' | 'cart'>('buy');

  useEffect(() => {
    setMounted(true);
    fetchPublishedBooks();
    // Load Cart from localStorage
    const savedCart = localStorage.getItem("lurnexa_store_cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (err) {
        console.error("Failed to parse cart storage:", err);
      }
    }
  }, []);

  useEffect(() => {
    if (selectedBookForPurchase?.id === "1") {
      setPurchaseFormat("physical");
    }
    if (selectedBookForPurchase?.id === "6") {
      setSelectedSoftOption("book_only");
    }
    if (selectedBookForPurchase?.id === "2") {
      if (["caselet", "book_caselet", "book_caselet_portal"].includes(selectedSoftOption)) {
        setSelectedSoftOption("book_portal");
      }
    }
  }, [selectedBookForPurchase]);

  const saveCartToStorage = (updatedCart: CartItem[]) => {
    setCart(updatedCart);
    localStorage.setItem("lurnexa_store_cart", JSON.stringify(updatedCart));
  };

  const fetchPublishedBooks = async () => {
    try {
      const res = await fetch("/api/textbooks/published");
      if (res.ok) {
        const data = await res.json();
        setPublishedPdfs(data.files || []);
      }
    } catch (err) {
      console.error("Failed to fetch published books:", err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage("");
    }, 3000);
  };

  // Cart Handlers
  const handleAddToCart = (book: TextbookDetails, format: 'physical' | 'soft' = 'physical', plan: string = 'physical', price?: number) => {
    let coverImg = "/portal_coverpages/minerals.jpg";
    if (book.id === "2") coverImg = "/portal_coverpages/ml.png";
    if (book.id === "3") coverImg = "/portal_coverpages/dbms.jpeg";
    if (book.id === "5") coverImg = "/portal_coverpages/microeconomics.jpeg";
    if (book.id === "6") coverImg = "/portal_coverpages/ai.jpg";

    const finalPrice = price !== undefined ? price : book.price;
    const planLabel = format === "physical" ? "Physical Copy" : `Soft Copy - ${plan.replace(/_/g, " ").toUpperCase()}`;
    const displayTitle = `${book.title} (${planLabel})`;

    const existingIdx = cart.findIndex(item => item.id === book.id && (item as any).format === format && (item as any).plan === plan);
    if (existingIdx !== -1) {
      const updated = [...cart];
      updated[existingIdx].quantity += 1;
      saveCartToStorage(updated);
    } else {
      const newItem: CartItem = {
        id: book.id,
        title: displayTitle,
        price: finalPrice,
        coverImg,
        quantity: 1,
        format,
        plan
      } as any;
      saveCartToStorage([...cart, newItem]);
    }
    showToast(`"${book.title.slice(0, 30)}..." added to cart!`);
  };

  const handleRemoveFromCart = (bookId: string) => {
    const updated = cart.filter(item => item.id !== bookId);
    saveCartToStorage(updated);
  };

  const handleUpdateQuantity = (bookId: string, qty: number) => {
    if (qty < 1) {
      handleRemoveFromCart(bookId);
      return;
    }
    const updated = cart.map(item => {
      if (item.id === bookId) {
        return { ...item, quantity: Math.min(99, qty) };
      }
      return item;
    });
    saveCartToStorage(updated);
  };

  // Cart Calculations
  const cartSubtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const isSoftCart = cart.some(item => (item as any).format === "soft");
  const cartGst = isSoftCart ? Math.round(cartSubtotal * 0.18) : 0;
  const cartOnlineFee = isSoftCart ? Math.round((cartSubtotal + cartGst) * 0.02) : 0;
  const cartShipping = isSoftCart ? 0 : 50;
  const cartTotal = cartSubtotal + cartGst + cartOnlineFee + cartShipping;
  const totalCartQty = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Filter books list
  const filteredBooks = PUBLISHED_BOOKS.filter(book => {
    const matchesSearch = 
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.authors.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.isbn.includes(searchQuery);
    
    if (activeCategory === "All") return matchesSearch;
    if (activeCategory === "Best Sellers") return matchesSearch && book.tag === "Best Seller";
    if (activeCategory === "New Releases") return matchesSearch; // All published textbooks are new releases
    if (activeCategory === "Trending") return matchesSearch && book.tag === "Trending";
    return matchesSearch;
  });

  const isSynchronized = publishedPdfs.includes("minerals.pdf");

  if (!mounted) {
    return <div className="min-h-screen bg-[#F8FAFC]" />;
  }

  return (
    <div suppressHydrationWarning className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans pb-24 antialiased selection:bg-fuchsia-500/10 selection:text-fuchsia-600">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-lg border border-slate-800 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 size={16} className="text-[#10B981]" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* 1. HERO HEADER AREA */}
      <div className="bg-white border-b border-[#E2E8F0] pt-12 pb-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-fuchsia-50 border border-fuchsia-100 text-fuchsia-600 text-[10px] font-extrabold uppercase tracking-wider">
              <ShoppingBag size={12} />
              <span>Academic Textbook Store</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#0F172A] leading-tight">
              Lurnexa Publications
            </h1>
            <p className="text-[#64748B] text-sm max-w-2xl font-medium">
              Browse and order peer-reviewed academic works. We publish high-quality physical textbooks and deliver them nationwide.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link 
              href="/textbooks"
              className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-[#64748B] hover:text-[#0F172A] px-4 py-2.5 rounded-lg text-xs font-bold border border-[#E2E8F0] transition-all shadow-sm shrink-0"
            >
              <ArrowLeft size={14} />
              <span>Back to Textbooks</span>
            </Link>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative bg-[#0F172A] hover:bg-slate-850 text-white font-bold p-3 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
            >
              <ShoppingCart size={16} />
              {totalCartQty > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-fuchsia-600 text-white text-[9px] font-black rounded-full h-5 w-5 flex items-center justify-center border border-white">
                  {totalCartQty}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-10">
        
        {/* Category Controls & Search */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-8">
          {/* Tabs */}
          <div className="bg-[#F1F5F9] p-1 rounded-xl flex gap-1 self-start">
            {["All", "Best Sellers", "New Releases", "Trending"].map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeCategory === category
                    ? "bg-white text-[#0F172A] shadow-sm"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative flex-grow max-w-md">
            <input
              type="text"
              placeholder="Search by title, author, or ISBN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#E2E8F0] text-[#0F172A] rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-fuchsia-500 shadow-sm"
            />
            <Search size={14} className="absolute left-3.5 top-3.5 text-[#64748B]" />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-3.5 text-[#64748B] hover:text-slate-800"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="h-10 w-10 border-4 border-fuchsia-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-[#64748B] text-sm font-semibold">Loading bookstore catalog...</p>
          </div>
        ) : !isSynchronized ? (
          <div className="max-w-md mx-auto text-center py-20 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm">
            <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-[#0F172A] mb-2">Bookstore Synchronizing</h3>
            <p className="text-[#64748B] text-xs px-6">
              Our bookstore catalog is currently synchronizing. Please check back in a few moments.
            </p>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="max-w-md mx-auto text-center py-20 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm">
            <Search size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-[#0F172A] mb-2">No Textbooks Found</h3>
            <p className="text-[#64748B] text-xs px-6">
              We couldn't find any textbooks matching your search criteria. Try modifying your keywords.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBooks.map((bookItem) => {
              let coverImg = "/portal_coverpages/minerals.jpg";
              if (bookItem.id === "2") coverImg = "/portal_coverpages/ml.png";
              if (bookItem.id === "3") coverImg = "/portal_coverpages/dbms.jpeg";
              if (bookItem.id === "5") coverImg = "/portal_coverpages/microeconomics.jpeg";
              if (bookItem.id === "6") coverImg = "/portal_coverpages/ai.jpg";

              return (
                <div 
                  key={bookItem.id} 
                  className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group relative"
                >
                  {/* Promo Tag */}
                  {bookItem.tag && (
                    <span className="absolute top-3 right-3 z-10 text-[8px] text-white font-extrabold uppercase tracking-wider bg-fuchsia-600 px-2 py-0.5 rounded shadow-sm">
                      {bookItem.tag}
                    </span>
                  )}

                  <div className="space-y-4">
                    {/* Cover presentation */}
                    <div 
                      onClick={() => setSelectedBookForPreview(bookItem)}
                      className="w-full aspect-[4/5] rounded-xl bg-gradient-to-tr from-slate-100 to-fuchsia-50/40 flex items-center justify-center border border-[#E2E8F0]/50 shadow-inner relative hover:scale-[1.01] transition-all duration-300 cursor-pointer overflow-hidden p-5"
                    >
                      <div className="relative h-full aspect-[1/1.4] shadow-[0_10px_20px_-5px_rgba(0,0,0,0.15)] rounded-r overflow-hidden transition-transform duration-300 group-hover:scale-[1.02]">
                        <img 
                          src={coverImg}
                          className="w-full h-full object-cover"
                          alt={bookItem.title}
                        />
                        <div className="absolute inset-y-0 left-0 w-2.5 bg-gradient-to-r from-black/20 via-black/5 to-transparent" />
                        <div className="absolute inset-y-0 left-2.5 w-[1px] bg-white/10" />
                      </div>
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-white text-[10px] font-bold text-[#0F172A] px-3 py-2 rounded-lg flex items-center gap-1 shadow-md">
                          <FileText size={10} className="text-fuchsia-600" /> Preview Sample
                        </span>
                      </div>
                    </div>

                    {/* Meta & Info */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center gap-2">
                        {bookItem.stockStatus === "low-stock" ? (
                          <span className="text-[8px] text-amber-600 font-extrabold uppercase tracking-widest bg-amber-50 border border-amber-200/50 px-1.5 py-0.5 rounded">
                            Only {bookItem.stockCount || 2} Left
                          </span>
                        ) : bookItem.stockStatus === "out-of-stock" ? (
                          <span className="text-[8px] text-red-600 font-extrabold uppercase tracking-widest bg-red-50 border border-red-200/50 px-1.5 py-0.5 rounded">
                            Out of Stock
                          </span>
                        ) : (
                          <span className="text-[8px] text-emerald-600 font-extrabold uppercase tracking-widest bg-emerald-50 border border-emerald-200/50 px-1.5 py-0.5 rounded">
                            In Stock
                          </span>
                        )}
                        <span className="text-[8px] text-[#64748B] font-mono bg-slate-50 px-1.5 py-0.5 rounded border border-[#E2E8F0]">
                          ISBN: {bookItem.isbn}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-[#0F172A] line-clamp-2 leading-snug group-hover:text-fuchsia-600 transition-colors duration-200 h-10" title={bookItem.title}>
                        {bookItem.title}
                      </h3>

                      <p className="text-[11px] text-[#64748B] font-semibold line-clamp-1">
                        By {bookItem.authors}
                      </p>

                      <p className="text-[11px] text-[#64748B] line-clamp-2 leading-relaxed">
                        {bookItem.description}
                      </p>
                    </div>
                  </div>

                  {/* Pricing and CTAs */}
                  <div className="pt-4 mt-4 border-t border-[#E2E8F0] space-y-3">
                    <div className="flex items-baseline justify-between">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-lg font-black text-[#0F172A]">₹{bookItem.price}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setSelectedBookForPurchase(bookItem);
                          setPurchaseFormat(null);
                          setModalMode("cart");
                        }}
                        className="bg-slate-50 hover:bg-slate-100 border border-[#E2E8F0] text-[#0F172A] font-bold py-2 rounded-xl text-[10px] text-center flex items-center justify-center gap-1 transition-all"
                      >
                        <ShoppingCart size={12} className="text-[#64748B]" />
                        <span>Add to Cart</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedBookForPurchase(bookItem);
                          setPurchaseFormat(null);
                          setModalMode("buy");
                        }}
                        className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold py-2 rounded-xl text-[10px] text-center flex items-center justify-center gap-1 transition-all active:scale-98"
                      >
                        <ShoppingBag size={12} />
                        <span>Buy Now</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. PDF PREVIEW MODAL */}
      {selectedBookForPreview && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2E8F0] rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative">
            
            {/* Header */}
            <div className="p-5 border-b border-[#E2E8F0] flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-8 rounded bg-gradient-to-br from-fuchsia-600 to-fuchsia-800 flex items-center justify-center font-mono text-[8px] font-black text-white shrink-0">
                  {selectedBookForPreview.code}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0F172A] line-clamp-1">{selectedBookForPreview.title}</h3>
                  <p className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider">
                    Contents Preview & Details (Protected)
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedBookForPreview(null)}
                className="text-[#64748B] hover:text-[#0F172A] p-2 rounded-lg bg-slate-100 hover:bg-slate-200 border border-[#E2E8F0] transition-all font-bold text-xs"
              >
                ✕ Close
              </button>
            </div>

            {/* Content area */}
            <div className="flex-grow flex flex-col md:flex-row min-h-[450px] max-h-[75vh] overflow-hidden bg-slate-50">
              
              {/* Left Details Panel */}
              <div className="w-full md:w-[320px] p-5 bg-white border-r border-[#E2E8F0] flex flex-col justify-between overflow-y-auto space-y-4 shrink-0">
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    <span className="text-[8px] text-fuchsia-600 font-extrabold uppercase tracking-widest bg-fuchsia-50 border border-fuchsia-200/50 px-1.5 py-0.5 rounded">
                      Peer-Reviewed
                    </span>
                    <span className="text-[8px] text-[#64748B] font-bold uppercase tracking-widest bg-slate-50 border border-[#E2E8F0] px-1.5 py-0.5 rounded">
                      ISBN: {selectedBookForPreview.isbn}
                    </span>
                  </div>

                  <h3 className="text-sm font-extrabold text-[#0F172A] leading-snug">
                    {selectedBookForPreview.title}
                  </h3>

                  <div className="text-[10px] font-semibold text-[#64748B]">
                    By <span className="text-[#0F172A] font-bold">{selectedBookForPreview.authors}</span>
                  </div>

                  <p className="text-[11px] text-[#64748B] leading-relaxed">
                    {selectedBookForPreview.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-[10px] py-2.5 border-y border-[#E2E8F0]">
                    <div>
                      <span className="block text-[8px] font-bold text-[#64748B] uppercase tracking-wider">Pages</span>
                      <span className="font-semibold text-[#0F172A]">{selectedBookForPreview.pages} Pages</span>
                    </div>
                    <div>
                      <span className="block text-[8px] font-bold text-[#64748B] uppercase tracking-wider">Language</span>
                      <span className="font-semibold text-[#0F172A]">English</span>
                    </div>
                  </div>
                </div>

                  <div className="space-y-2 pt-2">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl font-black text-[#0F172A]">₹{selectedBookForPreview.price}</span>
                    </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setSelectedBookForPurchase(selectedBookForPreview);
                        setSelectedBookForPreview(null);
                        setPurchaseFormat(null);
                        setModalMode("cart");
                      }}
                      className="bg-slate-50 hover:bg-slate-100 border border-[#E2E8F0] text-[#0F172A] font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 transition-all"
                    >
                      <ShoppingCart size={14} className="text-[#64748B]" />
                      <span>Add to Cart</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedBookForPurchase(selectedBookForPreview);
                        setSelectedBookForPreview(null);
                        setPurchaseFormat(null);
                        setModalMode("buy");
                      }}
                      className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-extrabold text-xs py-2.5 rounded-xl shadow transition-all block text-center"
                    >
                      Buy Book Options
                    </button>
                  </div>
                </div>
              </div>

              {/* Right PDF Viewer Panel */}
              <div className="flex-grow p-4 bg-slate-100 flex flex-col justify-between overflow-hidden">
                <iframe 
                  src={`/published_books/previews/${selectedBookForPreview.pdfFileName || "minerals.pdf"}#toolbar=0&navpanes=0`}
                  className="w-full h-full min-h-[350px] border-0 rounded-xl shadow-sm bg-white"
                  title="Sample Book PDF Viewer"
                />
                <div className="bg-white p-2.5 border border-[#E2E8F0] flex items-center gap-2 mt-2 rounded-xl shrink-0">
                  <Lock size={12} className="text-fuchsia-600 shrink-0" />
                  <p className="text-[9px] text-[#64748B] font-semibold leading-normal">
                    This sample preview contains selected pages only. Complete textbook will be delivered via tracked physical parcel post-payment.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 4. SLIDE OVER CART DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-sm transition-opacity" onClick={() => setIsCartOpen(false)} />
          
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full border-l border-[#E2E8F0]">
              
              {/* Cart Header */}
              <div className="p-6 border-b border-[#E2E8F0] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart size={18} className="text-fuchsia-600" />
                  <h2 className="text-base font-bold text-[#0F172A]">Shopping Cart ({totalCartQty})</h2>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-grow overflow-y-auto p-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                    <ShoppingCart size={40} className="text-slate-300" />
                    <p className="text-xs font-semibold text-[#64748B]">Your cart is currently empty</p>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors"
                    >
                      Browse Books
                    </button>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="flex gap-4 p-3 border border-[#E2E8F0] rounded-2xl bg-white">
                      <div className="h-20 w-14 shrink-0 rounded-lg overflow-hidden border border-slate-100 shadow-sm relative p-1 bg-slate-50">
                        <img src={item.coverImg} alt={item.title} className="w-full h-full object-cover rounded" />
                      </div>
                      <div className="flex-grow flex flex-col justify-between space-y-2">
                        <div>
                          <h4 className="text-xs font-bold text-[#0F172A] line-clamp-1 leading-tight">{item.title}</h4>
                          <span className="text-xs font-extrabold text-fuchsia-600 mt-1 block">₹{item.price}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          {/* Quantity control */}
                          <div className="flex items-center bg-slate-50 border border-[#E2E8F0] rounded-lg px-1.5 py-0.5">
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              className="p-0.5 text-slate-500 hover:text-slate-900 transition-colors"
                            >
                              <Minus size={10} />
                            </button>
                            <input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={item.quantity}
                              onChange={(e) => {
                                const valStr = e.target.value.replace(/\D/g, "");
                                if (valStr === "") return;
                                handleUpdateQuantity(item.id, parseInt(valStr, 10));
                              }}
                              className="w-6 text-center text-[10px] font-black text-[#0F172A] bg-transparent border-0 p-0 focus:ring-0 focus:outline-none"
                            />
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              className="p-0.5 text-slate-500 hover:text-slate-900 transition-colors"
                            >
                              <Plus size={10} />
                            </button>
                          </div>

                          {/* Delete Item */}
                          <button
                            onClick={() => handleRemoveFromCart(item.id)}
                            className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Cart Footer */}
              {cart.length > 0 && (
                <div className="border-t border-[#E2E8F0] bg-slate-50 p-6 space-y-4 font-semibold text-xs text-slate-700">
                  <div className="space-y-2.5">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="text-[#0F172A] font-bold">₹{cartSubtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST Tax (18%)</span>
                      <span className="text-[#0F172A] font-bold">₹{cartGst}</span>
                    </div>
                    {isSoftCart && (
                      <div className="flex justify-between">
                        <span>Online Processing Fee (2%)</span>
                        <span className="text-[#0F172A] font-bold">₹{cartOnlineFee}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Shipping Charge</span>
                      <span className="text-[#0F172A] font-bold">₹{cartShipping}</span>
                    </div>
                    <div className="border-t border-[#E2E8F0] pt-3 flex justify-between text-[#0F172A] font-extrabold text-sm">
                      <span>Grand Total</span>
                      <span className="text-fuchsia-600 font-black">₹{cartTotal}</span>
                    </div>
                  </div>

                  <Link
                    href={`/textbooks/store/checkout?format=${cart[0]?.format || 'physical'}&plan=${cart[0]?.plan || 'physical'}`}
                    className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-extrabold text-xs py-3 rounded-xl shadow transition-all block text-center mt-2"
                  >
                    Proceed to Checkout
                  </Link>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* 5. BUY OPTIONS SELECTION MODAL */}
      {selectedBookForPurchase && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#E2E8F0] rounded-3xl w-full max-w-xl shadow-2xl p-6 relative animate-scaleIn flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 shrink-0">
              <div>
                <h3 className="text-lg font-black text-slate-900">Choose Purchase Option</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-0.5">{selectedBookForPurchase.title}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedBookForPurchase(null);
                  setPurchaseFormat(null);
                }}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-1">
              {/* Selector Card Choice */}
              <div className={`grid gap-4 ${selectedBookForPurchase?.id === "1" ? "grid-cols-1 max-w-xs mx-auto" : "grid-cols-2"}`}>
                <div
                  onClick={() => setPurchaseFormat("physical")}
                  className={`border-2 rounded-2xl p-4 cursor-pointer transition-all flex flex-col items-center gap-2 hover:border-fuchsia-500/50 ${
                    purchaseFormat === "physical"
                      ? "border-fuchsia-600 bg-fuchsia-50/20"
                      : "border-slate-200"
                  }`}
                >
                  <ShoppingBag size={24} className={purchaseFormat === "physical" ? "text-fuchsia-600" : "text-slate-400"} />
                  <span className="text-xs font-bold text-slate-900">Physical Copy</span>
                  <span className="text-[10px] text-slate-500 font-medium text-center">Printed textbook delivered by parcel. Shipping charges apply.</span>
                </div>

                {selectedBookForPurchase?.id !== "1" && (
                  <div
                    onClick={() => setPurchaseFormat("soft")}
                    className={`border-2 rounded-2xl p-4 cursor-pointer transition-all flex flex-col items-center gap-2 hover:border-fuchsia-500/50 ${
                      purchaseFormat === "soft"
                        ? "border-fuchsia-600 bg-fuchsia-50/20"
                        : "border-slate-200"
                    }`}
                  >
                    <BookOpen size={24} className={purchaseFormat === "soft" ? "text-fuchsia-600" : "text-slate-400"} />
                    <span className="text-xs font-bold text-slate-900">Soft Copy & Portal</span>
                    <span className="text-[10px] text-slate-500 font-medium text-center">Read online in student portal with screenshot blocking. GST & online fees apply.</span>
                  </div>
                )}
              </div>

              {/* Soft Copy Sub-plans */}
              {purchaseFormat === "soft" && (
                <div className="space-y-4 bg-slate-50/70 p-4 border border-slate-100 rounded-2xl animate-fadeIn">
                  <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Plan Package</span>
                  
                  <div className="space-y-2.5">
                    <label className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-200 cursor-pointer hover:border-fuchsia-500/30">
                      <input
                        type="radio"
                        name="softPlan"
                        checked={selectedSoftOption === "book_only" || selectedBookForPurchase?.id === "6"}
                        onChange={() => setSelectedSoftOption("book_only")}
                        className="accent-fuchsia-600"
                      />
                      <div className="flex-1 flex justify-between text-xs font-bold text-slate-900">
                        <span>Book Only</span>
                        <span className="text-fuchsia-600">₹{getSoftCopyPrice("book_only", selectedBookForPurchase?.id)}</span>
                      </div>
                    </label>

                    {selectedBookForPurchase?.id !== "6" && selectedBookForPurchase?.id !== "2" && (
                      <label className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-200 cursor-pointer hover:border-fuchsia-500/30">
                        <input
                          type="radio"
                          name="softPlan"
                          checked={selectedSoftOption === "caselet"}
                          onChange={() => setSelectedSoftOption("caselet")}
                          className="accent-fuchsia-600"
                        />
                        <div className="flex-1 flex justify-between text-xs font-bold text-slate-900">
                          <span>Caselet Only</span>
                          <span className="text-fuchsia-600">₹{getSoftCopyPrice("caselet", selectedBookForPurchase?.id)}</span>
                        </div>
                      </label>
                    )}

                    {selectedBookForPurchase?.id !== "6" && selectedBookForPurchase?.id !== "2" && (
                      <label className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-200 cursor-pointer hover:border-fuchsia-500/30">
                        <input
                          type="radio"
                          name="softPlan"
                          checked={selectedSoftOption === "book_caselet"}
                          onChange={() => setSelectedSoftOption("book_caselet")}
                          className="accent-fuchsia-600"
                        />
                        <div className="flex-1 flex justify-between text-xs font-bold text-slate-900">
                          <span>Book + Caselet</span>
                          <span className="text-fuchsia-600">₹{getSoftCopyPrice("book_caselet", selectedBookForPurchase?.id)}</span>
                        </div>
                      </label>
                    )}

                    {selectedBookForPurchase?.id !== "6" && (
                      <label className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-200 cursor-pointer hover:border-fuchsia-500/30">
                        <input
                          type="radio"
                          name="softPlan"
                          checked={selectedSoftOption === "book_portal"}
                          onChange={() => setSelectedSoftOption("book_portal")}
                          className="accent-fuchsia-600"
                        />
                        <div className="flex-1 flex justify-between text-xs font-bold text-slate-900">
                          <span>Book + Portal Access</span>
                          <span className="text-fuchsia-600">₹{getSoftCopyPrice("book_portal", selectedBookForPurchase?.id)}</span>
                        </div>
                      </label>
                    )}

                    {selectedBookForPurchase?.id !== "6" && (
                      <div className="border-t border-slate-200 pt-2.5">
                        <label className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-200 cursor-pointer hover:border-fuchsia-500/30">
                          <input
                            type="radio"
                            name="softPlan"
                            checked={selectedSoftOption === "only_portal"}
                            onChange={() => setSelectedSoftOption("only_portal")}
                            className="accent-fuchsia-600"
                          />
                          <div className="flex-1 flex justify-between text-xs font-bold text-slate-900">
                            <span>Only Portal Access</span>
                            <span className="text-fuchsia-500/40 text-[10px] font-medium">Customize features below</span>
                          </div>
                        </label>

                          {selectedSoftOption === "only_portal" && (
                            <div className="mt-2 pl-6 space-y-2 animate-fadeIn bg-white/70 p-3 rounded-2xl border border-slate-100/80">
                              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                                <input
                                  type="radio"
                                  name="portalOnlyType"
                                  checked={selectedPortalOnlyOption === "complete"}
                                  onChange={() => setSelectedPortalOnlyOption("complete")}
                                  className="accent-fuchsia-600"
                                />
                                <div className="flex-1 flex justify-between">
                                  <span>Complete Portal</span>
                                  <span className="text-fuchsia-600">₹{getSoftCopyPrice("complete", selectedBookForPurchase?.id)}</span>
                                </div>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                                <input
                                  type="radio"
                                  name="portalOnlyType"
                                  checked={selectedPortalOnlyOption === "placements"}
                                  onChange={() => setSelectedPortalOnlyOption("placements")}
                                  className="accent-fuchsia-600"
                                />
                                <div className="flex-1 flex justify-between">
                                  <span>Placements Feature Only</span>
                                  <span className="text-fuchsia-600">₹{getSoftCopyPrice("placements", selectedBookForPurchase?.id)}</span>
                                </div>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                                <input
                                  type="radio"
                                  name="portalOnlyType"
                                  checked={selectedPortalOnlyOption === "practice"}
                                  onChange={() => setSelectedPortalOnlyOption("practice")}
                                  className="accent-fuchsia-600"
                                />
                                <div className="flex-1 flex justify-between">
                                  <span>Coding Practice Questions Only</span>
                                  <span className="text-fuchsia-600">₹{getSoftCopyPrice("practice", selectedBookForPurchase?.id)}</span>
                                </div>
                              </label>
                            </div>
                          )}
                        </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-slate-100 flex gap-2 shrink-0">
              <button
                onClick={() => {
                  setSelectedBookForPurchase(null);
                  setPurchaseFormat(null);
                }}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl text-xs font-bold transition-all text-center"
              >
                Cancel
              </button>
              <button
                disabled={!purchaseFormat}
                onClick={() => {
                  if (!selectedBookForPurchase) return;
                  const finalPlan = purchaseFormat === "physical" 
                    ? "physical" 
                    : (selectedSoftOption === "only_portal" ? selectedPortalOnlyOption : selectedSoftOption);
                  
                  if (modalMode === "cart") {
                    let finalPrice = selectedBookForPurchase.price;
                    if (purchaseFormat === "soft") {
                      finalPrice = getSoftCopyPrice(finalPlan, selectedBookForPurchase.id);
                    }
                    handleAddToCart(selectedBookForPurchase, purchaseFormat || "physical", finalPlan, finalPrice);
                    setSelectedBookForPurchase(null);
                    setPurchaseFormat(null);
                  } else {
                    router.push(`/textbooks/store/checkout?bookId=${selectedBookForPurchase.id}&format=${purchaseFormat}&plan=${finalPlan}`);
                  }
                }}
                className="flex-grow py-2.5 bg-fuchsia-600 hover:bg-fuchsia-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg transition-all text-center"
              >
                {modalMode === "cart" ? "Add to Cart" : "Proceed to Checkout"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
