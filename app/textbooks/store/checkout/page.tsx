"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  BookOpen, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  ShoppingBag,
  CreditCard,
  Lock,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Tag,
  Minus,
  Plus
} from "lucide-react";
import Link from "next/link";

const getShippingCost = (pincode: string): number => {
  const cleanPin = (pincode || "").trim();
  if (cleanPin.length !== 6 || /\D/.test(cleanPin)) {
    return 0; // Don't charge until a valid 6-digit pincode is typed
  }
  if (cleanPin.startsWith("522")) {
    return 40; // Guntur local (e.g. Gorantla)
  }
  const prefix2 = parseInt(cleanPin.substring(0, 2), 10);
  if (prefix2 >= 50 && prefix2 <= 53) {
    return 60; // Andhra Pradesh & Telangana
  }
  if (cleanPin.startsWith("5") || cleanPin.startsWith("6")) {
    return 80; // Rest of South India (Karnataka, TN, Kerala)
  }
  return 120; // Rest of India (North, East, West)
};

interface TextbookDetails {
  id: string;
  title: string;
  code: string;
  description: string;
  price: number;
  authors: string;
  pages: number;
  isbn: string;
  coverColor: string;
  pdfFileName: string;
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
    coverColor: "from-blue-600 to-indigo-900",
    pdfFileName: "minerals.pdf"
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
    coverColor: "from-purple-600 to-indigo-950",
    pdfFileName: "ml.pdf"
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
    coverColor: "from-sky-700 to-slate-900",
    pdfFileName: "dbms.pdf"
  }
];

interface CheckoutItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  isbn: string;
  coverImg: string;
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookId = searchParams.get("bookId") || "";
  const orderIdFromUrl = searchParams.get("order_id");

  const [book, setBook] = useState<TextbookDetails | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Verification states
  const [verifyingOrder, setVerifyingOrder] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [verificationFailed, setVerificationFailed] = useState(false);
  const [verifiedOrderDetails, setVerifiedOrderDetails] = useState<any>(null);

  // Step state (1: Customer info, 2: Review, 3: Secure Payment)
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [quantity, setQuantity] = useState(1);
  const [quantityInput, setQuantityInput] = useState("1");

  // Multi-item cart checkout configurations
  const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>([]);
  const [isCartCheckout, setIsCartCheckout] = useState(false);

  // Form inputs
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formCity, setFormCity] = useState("");
  const [formState, setFormState] = useState("");
  const [formCountry, setFormCountry] = useState("India");
  const [formPostalCode, setFormPostalCode] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [couponError, setCouponError] = useState("");

  const [confirmAddressChecked, setConfirmAddressChecked] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showGatewayUpdatePopup, setShowGatewayUpdatePopup] = useState(false);

  // Cashfree SDK state
  const [cashfreeLoaded, setCashfreeLoaded] = useState(false);

  useEffect(() => {
    // Load Cashfree Javascript SDK dynamically
    const scriptId = "cashfree-sdk-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement;
    
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
      script.async = true;
      document.body.appendChild(script);
    }

    const checkLoaded = setInterval(() => {
      if ((window as any).Cashfree) {
        setCashfreeLoaded(true);
        clearInterval(checkLoaded);
      }
    }, 100);

    return () => {
      clearInterval(checkLoaded);
    };
  }, []);

  useEffect(() => {
    // If order_id exists in URL, user just returned from Cashfree checkout screen
    if (orderIdFromUrl) {
      verifyOrderPayment(orderIdFromUrl);
    }

    const hasBookId = !!bookId;
    if (hasBookId) {
      const selected = PUBLISHED_BOOKS.find((b) => b.id === bookId) || PUBLISHED_BOOKS[0];
      setBook(selected);
      let coverImg = "/published_books/covers/minerals.jpg";
      if (selected.id === "2") coverImg = "/published_books/covers/ml.png";
      if (selected.id === "3") coverImg = "/published_books/covers/dbms.jpeg";

      setCheckoutItems([{
        id: selected.id,
        title: selected.title,
        price: selected.price,
        quantity: quantity,
        isbn: selected.isbn,
        coverImg
      }]);
      setIsCartCheckout(false);
    } else {
      const savedCart = localStorage.getItem("lurnexa_store_cart");
      if (savedCart) {
        try {
          const parsed = JSON.parse(savedCart);
          setCheckoutItems(parsed);
          setIsCartCheckout(true);
        } catch (err) {
          console.error("Failed to load cart items:", err);
        }
      }
    }
    setLoading(false);
  }, [bookId, orderIdFromUrl, quantity]);

  // Autofetch Address based on Pincode
  useEffect(() => {
    if (formPostalCode.length === 6) {
      fetch(`https://api.postalpincode.in/pincode/${formPostalCode}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data[0] && data[0].Status === "Success") {
            const postOffice = data[0].PostOffice[0];
            if (postOffice) {
              setFormCity(postOffice.District || postOffice.Taluk || "");
              setFormState(postOffice.State || "");
            }
          }
        })
        .catch((err) => console.error("Error looking up pincode:", err));
    }
  }, [formPostalCode]);

  const verifyOrderPayment = async (orderId: string) => {
    setVerifyingOrder(true);
    setErrorMsg("");
    setVerificationFailed(false);
    try {
      const res = await fetch("/api/payments/cashfree/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId })
      });
      const data = await res.json();
      
      if (res.ok && data.status === "PAID") {
        setVerificationSuccess(true);
        setVerifiedOrderDetails(data.order);
        setStep(3);
        // Clean cart on success
        localStorage.removeItem("lurnexa_store_cart");
      } else {
        setVerificationFailed(true);
        setErrorMsg(data.message || "Payment transaction was declined or not completed.");
      }
    } catch (err) {
      console.error(err);
      setVerificationFailed(true);
      setErrorMsg("Failed to connect to the payment gateway. Please check your connection.");
    } finally {
      setVerifyingOrder(false);
    }
  };

  const handleNextStep = () => {
    const errors: Record<string, string> = {};
    if (!formName.trim()) errors.name = "Full name is required.";
    if (!formEmail.trim() || !/\S+@\S+\.\S+/.test(formEmail)) errors.email = "A valid email address is required.";
    if (!formPhone.trim() || !/^\d{10}$/.test(formPhone.replace(/\D/g, ""))) errors.phone = "A valid 10-digit mobile number is required.";
    if (!formAddress.trim()) errors.address = "Complete shipping address is required.";
    if (!formCity.trim()) errors.city = "City is required.";
    if (!formState.trim()) errors.state = "State is required.";
    if (!formCountry.trim()) errors.country = "Country is required.";
    if (!formPostalCode.trim() || !/^\d{6}$/.test(formPostalCode.trim())) {
      errors.postalCode = "Please enter a valid 6-digit Postal/Pincode.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setStep(2);
  };

  const handleApplyCoupon = () => {
    setCouponError("");
    setCouponSuccess("");
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      setCouponError("Please enter a coupon code.");
      return;
    }

    const hasMinerals = checkoutItems.some(item => item.id === "1");
    if (hasMinerals) {
      setCouponError("Coupons cannot be applied to orders containing the Minerals book.");
      return;
    }

    const isMLCoupon = [
      "LURNEXA-ML-BL26-PALLAVI",
      "LURNEXA-ML-BL26-BALAJI",
      "LURNEXA-ML-BL26-SARITHA"
    ].includes(code);

    const isDBMSCoupon = [
      "LURNEXA-DBMS-BL26-PALLAVI",
      "LURNEXA-DBMS-BL26-BALAJI",
      "LURNEXA-DBMS-BL26-SARITHA"
    ].includes(code);

    if (isMLCoupon) {
      const hasMLBook = checkoutItems.some(item => item.id === "2");
      if (!hasMLBook) {
        setCouponError("This coupon is only valid for the Machine Learning textbook.");
        return;
      }
      setAppliedCoupon(code);
      setCouponSuccess("Coupon applied! 10% discount on Machine Learning textbook.");
    } else if (isDBMSCoupon) {
      const hasDBMSBook = checkoutItems.some(item => item.id === "3");
      if (!hasDBMSBook) {
        setCouponError("This coupon is only valid for the Database Management Systems textbook.");
        return;
      }
      setAppliedCoupon(code);
      setCouponSuccess("Coupon applied! 10% discount on Database Management Systems textbook.");
    } else {
      setCouponError("Invalid coupon code.");
    }
  };

  const handleUpdateItemQty = (id: string, qty: number) => {
    if (qty < 1) return;
    if (isCartCheckout) {
      const updated = checkoutItems.map(item => {
        if (item.id === id) {
          return { ...item, quantity: Math.min(99, qty) };
        }
        return item;
      });
      setCheckoutItems(updated);
      localStorage.setItem("lurnexa_store_cart", JSON.stringify(updated));
    } else {
      setQuantity(Math.min(99, qty));
      setQuantityInput(String(Math.min(99, qty)));
    }
  };

  const triggerCashfreeCheckout = async () => {
    setIsProcessingPayment(true);
    setErrorMsg("");

    const itemSubtotal = checkoutItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    let discount = 0;
    const isMLCoupon = [
      "LURNEXA-ML-BL26-PALLAVI",
      "LURNEXA-ML-BL26-BALAJI",
      "LURNEXA-ML-BL26-SARITHA"
    ].includes((appliedCoupon || "").toUpperCase());

    const isDBMSCoupon = [
      "LURNEXA-DBMS-BL26-PALLAVI",
      "LURNEXA-DBMS-BL26-BALAJI",
      "LURNEXA-DBMS-BL26-SARITHA"
    ].includes((appliedCoupon || "").toUpperCase());

    const hasMinerals = checkoutItems.some(item => item.id === "1");
    if (!hasMinerals) {
      if (isMLCoupon) {
        const mlItem = checkoutItems.find(item => item.id === "2");
        if (mlItem) {
          discount = Math.round((mlItem.price * mlItem.quantity) * 0.10);
        }
      } else if (isDBMSCoupon) {
        const dbmsItem = checkoutItems.find(item => item.id === "3");
        if (dbmsItem) {
          discount = Math.round((dbmsItem.price * dbmsItem.quantity) * 0.10);
        }
      }
    }

    const bookCostAfterDiscount = itemSubtotal - discount;
    const gstVal = 0;
    const shippingVal = getShippingCost(formPostalCode);
    const totalAmount = bookCostAfterDiscount + gstVal + shippingVal;

    try {
      const res = await fetch("/api/payments/cashfree/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId: isCartCheckout ? "CART" : checkoutItems[0].id,
          bookTitle: isCartCheckout 
            ? checkoutItems.map(i => `${i.title} (x${i.quantity})`).join(", ") 
            : checkoutItems[0].title,
          price: totalAmount,
          customerName: formName,
          customerEmail: formEmail,
          customerPhone: formPhone,
          shippingAddress: formAddress,
          city: formCity,
          state: formState,
          country: formCountry,
          postalCode: formPostalCode,
          couponCode: appliedCoupon,
          discountAmount: discount,
          gstAmount: gstVal,
          shippingAmount: shippingVal,
          subtotal: bookCostAfterDiscount,
          quantity: isCartCheckout ? checkoutItems.reduce((acc, i) => acc + i.quantity, 0) : quantity
        })
      });

      const orderData = await res.json();
      if (!res.ok) {
        setErrorMsg(orderData.error || "Failed to initialize payment.");
        setIsProcessingPayment(false);
        return;
      }

      if (!(window as any).Cashfree) {
        setErrorMsg("Cashfree Payment SDK failed to load. Please refresh the page.");
        setIsProcessingPayment(false);
        return;
      }

      const isProduction = process.env.NEXT_PUBLIC_CASHFREE_ENV === "production";
      const cashfree = (window as any).Cashfree({
        mode: isProduction ? "production" : "sandbox"
      });

      cashfree.checkout({
        paymentSessionId: orderData.payment_session_id,
        redirectTarget: "_self"
      });

    } catch (err) {
      console.error(err);
      setErrorMsg("Checkout connection failed. Please check your network connection.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // 1. ORDER CONFIRMATION SCREEN
  if (verificationSuccess && verifiedOrderDetails) {
    return (
      <div className="max-w-xl mx-auto bg-white border border-[#E2E8F0] rounded-2xl p-8 shadow-md text-center space-y-6 mt-10">
        <div className="h-16 w-16 bg-[#E6F4EA] text-[#10B981] rounded-full flex items-center justify-center mx-auto border border-[#10B981]/25 shadow-sm">
          <CheckCircle2 size={32} />
        </div>
        <div className="space-y-2">
          <span className="text-[10px] text-[#10B981] font-extrabold uppercase tracking-widest bg-[#E6F4EA] px-2.5 py-1 rounded-md border border-[#10B981]/25">
            Payment Successful
          </span>
          <h2 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">Order Confirmed</h2>
          <p className="text-xs text-[#64748B] max-w-sm mx-auto leading-relaxed">
            Thank you for your purchase. Your printed copy is now being prepared for shipment.
          </p>
        </div>

        <div className="bg-slate-50 p-5 rounded-xl border border-[#E2E8F0] text-left text-xs space-y-3 font-semibold text-slate-700">
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span>Order Number</span>
            <span className="text-[#0F172A] font-bold">{verifiedOrderDetails.order_id}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span>Transaction ID</span>
            <span className="text-[#0F172A] font-mono font-bold text-right truncate pl-4">{verifiedOrderDetails.cashfree_payment_id || 'CF_MOCK_TXN'}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span>Book Purchased</span>
            <span className="text-[#0F172A] font-bold text-right truncate pl-4">{book?.title || "Multiple Items"}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span>Quantity</span>
            <span className="text-[#0F172A] font-bold">{verifiedOrderDetails.quantity || 1}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span>Total Paid</span>
            <span className="text-fuchsia-600 font-bold">₹{verifiedOrderDetails.amount}</span>
          </div>
          <div className="flex justify-between pb-1">
            <span>Tracking Status</span>
            <span className="text-[#10B981] font-bold bg-[#E6F4EA] px-2 py-0.5 rounded">PREPARING FOR SHIPMENT</span>
          </div>
        </div>

        <div className="bg-slate-50 p-5 rounded-xl border border-[#E2E8F0] text-left text-xs space-y-1.5 text-slate-700 font-semibold">
          <p className="text-[#0F172A] font-bold mb-1 uppercase tracking-wider text-[10px]">Shipping Address</p>
          <p className="text-[#64748B] leading-relaxed">
            {verifiedOrderDetails.customer_name}<br/>
            {verifiedOrderDetails.shipping_address}<br/>
            {verifiedOrderDetails.city}, {verifiedOrderDetails.state}, {verifiedOrderDetails.country} - {verifiedOrderDetails.shipping_pincode}
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/textbooks/store"
            className="w-full inline-block bg-[#0F172A] hover:bg-slate-850 text-white font-bold text-sm py-3 rounded-xl shadow-sm transition-all text-center"
          >
            Return to Bookstore
          </Link>
        </div>
      </div>
    );
  }

  // 1.5. ORDER FAILURE SCREEN
  if (verificationFailed) {
    return (
      <div className="max-w-xl mx-auto bg-white border border-[#E2E8F0] rounded-2xl p-8 shadow-md text-center space-y-6 mt-10">
        <div className="h-16 w-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-100 shadow-sm">
          <AlertCircle size={32} />
        </div>
        <div className="space-y-2">
          <span className="text-[10px] text-red-600 font-extrabold uppercase tracking-widest bg-red-50 px-2.5 py-1 rounded-md border border-red-200">
            Order Unsuccessful
          </span>
          <h2 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">Payment Verification Failed</h2>
          <p className="text-xs text-[#64748B] max-w-sm mx-auto leading-relaxed">
            {errorMsg || "We were unable to complete your order. Either the transaction was declined, cancelled, or the payment gateway could not be reached."}
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              setVerificationFailed(false);
              setStep(1);
              router.replace(bookId ? `/textbooks/store/checkout?bookId=${bookId}` : `/textbooks/store/checkout`);
            }}
            className="flex-1 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold text-sm py-3 rounded-xl shadow-sm transition-all"
          >
            Try Checkout Again
          </button>
          <Link
            href="/textbooks/store"
            className="flex-1 inline-block bg-slate-50 hover:bg-slate-100 border border-[#E2E8F0] text-[#0F172A] font-bold text-sm py-3 rounded-xl text-center transition-all font-semibold"
          >
            Return to Store
          </Link>
        </div>
      </div>
    );
  }

  // 2. LOADER
  if (loading || verifyingOrder) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="h-10 w-10 border-4 border-fuchsia-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-[#64748B] text-sm font-semibold">
          {verifyingOrder ? "Verifying prepaid payment status..." : "Loading checkout details..."}
        </p>
      </div>
    );
  }

  // Checkout price Calculations
  const itemSubtotal = checkoutItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  let discount = 0;
  const isMLCoupon = [
    "LURNEXA-ML-BL26-PALLAVI",
    "LURNEXA-ML-BL26-BALAJI",
    "LURNEXA-ML-BL26-SARITHA"
  ].includes((appliedCoupon || "").toUpperCase());

  const isDBMSCoupon = [
    "LURNEXA-DBMS-BL26-PALLAVI",
    "LURNEXA-DBMS-BL26-BALAJI",
    "LURNEXA-DBMS-BL26-SARITHA"
  ].includes((appliedCoupon || "").toUpperCase());

  const hasMinerals = checkoutItems.some(item => item.id === "1");
  if (!hasMinerals) {
    if (isMLCoupon) {
      const mlItem = checkoutItems.find(item => item.id === "2");
      if (mlItem) {
        discount = Math.round((mlItem.price * mlItem.quantity) * 0.10);
      }
    } else if (isDBMSCoupon) {
      const dbmsItem = checkoutItems.find(item => item.id === "3");
      if (dbmsItem) {
        discount = Math.round((dbmsItem.price * dbmsItem.quantity) * 0.10);
      }
    }
  }

  const bookCostAfterDiscount = itemSubtotal - discount;
  const gstVal = 0;
  const shippingVal = getShippingCost(formPostalCode);
  const totalAmount = bookCostAfterDiscount + gstVal + shippingVal;

  return (
    <div className="max-w-6xl mx-auto mt-4 sm:mt-8 px-4 sm:px-6 pb-20">
      {showGatewayUpdatePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 border border-slate-100 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto border border-orange-100 animate-bounce">
              <AlertCircle size={32} />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-slate-900">System Update</h3>
              <p className="text-sm text-slate-600 leading-relaxed font-semibold">
                Our payment gateway is currently undergoing scheduled updates to support the LURNEXA PUBLICATIONS PRIVATE LIMITED entity.
              </p>
              <p className="text-xs text-slate-400 font-bold italic">
                Please try again later. We apologize for the inconvenience.
              </p>
            </div>

            <button
              onClick={() => setShowGatewayUpdatePopup(false)}
              className="w-full py-3.5 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-extrabold rounded-xl text-sm transition-all active:scale-95 shadow-lg shadow-fuchsia-200/50"
            >
              Close
            </button>
          </div>
        </div>
      )}
      
      {/* Back button */}
      <Link 
        href="/textbooks/store"
        className="inline-flex items-center gap-1.5 text-[#64748B] hover:text-[#0F172A] font-bold text-sm mb-6 transition-all"
      >
        <ArrowLeft size={16} />
        <span>Return to Bookstore</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Side: Steps Form */}
        <div className="lg:col-span-7 bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E2E8F0] pb-4 gap-4">
            <h2 className="text-xl font-bold text-[#0F172A] tracking-tight">Checkout</h2>
            <div className="flex flex-wrap gap-2">
              <span className={`text-[10px] sm:text-xs font-bold px-2.5 sm:px-3 py-1.5 rounded-md ${step === 1 ? 'bg-fuchsia-600 text-white shadow-sm' : 'bg-slate-100 text-[#64748B]'}`}>
                1. Information
              </span>
              <span className={`text-[10px] sm:text-xs font-bold px-2.5 sm:px-3 py-1.5 rounded-md ${step === 2 ? 'bg-fuchsia-600 text-white shadow-sm' : 'bg-slate-100 text-[#64748B]'}`}>
                2. Review
              </span>
              <span className={`text-[10px] sm:text-xs font-bold px-2.5 sm:px-3 py-1.5 rounded-md ${step === 3 ? 'bg-fuchsia-600 text-white shadow-sm' : 'bg-slate-100 text-[#64748B]'}`}>
                3. Secure Payment
              </span>
            </div>
          </div>

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-start gap-3 shadow-sm">
              <AlertCircle className="shrink-0 mt-0.5 text-red-600" size={16} />
              <div className="text-sm font-semibold">{errorMsg}</div>
            </div>
          )}

          {step === 1 && (
            // STEP 1: Customer Information
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <User size={14} className="text-[#64748B]" /> Full Name
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Enter full name"
                  className={`w-full bg-white border ${formErrors.name ? 'border-red-400 focus:border-red-500' : 'border-[#E2E8F0] focus:border-fuchsia-500'} text-[#0F172A] rounded-xl px-4 py-3 text-sm focus:outline-none shadow-sm`}
                />
                {formErrors.name && <p className="text-red-500 text-xs mt-1 font-semibold">{formErrors.name}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Mail size={14} className="text-[#64748B]" /> Email Address
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="name@university.edu"
                    className={`w-full bg-white border ${formErrors.email ? 'border-red-400 focus:border-red-500' : 'border-[#E2E8F0] focus:border-fuchsia-500'} text-[#0F172A] rounded-xl px-4 py-3 text-sm focus:outline-none shadow-sm`}
                  />
                  {formErrors.email && <p className="text-red-500 text-xs mt-1 font-semibold">{formErrors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Phone size={14} className="text-[#64748B]" /> Mobile Number (10-Digit)
                  </label>
                  <input
                    type="tel"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className={`w-full bg-white border ${formErrors.phone ? 'border-red-400 focus:border-red-500' : 'border-[#E2E8F0] focus:border-fuchsia-500'} text-[#0F172A] rounded-xl px-4 py-3 text-sm focus:outline-none shadow-sm`}
                  />
                  {formErrors.phone && <p className="text-red-500 text-xs mt-1 font-semibold">{formErrors.phone}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <MapPin size={14} className="text-[#64748B]" /> Complete Shipping Address
                </label>
                <textarea
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="Street Address, Building, Landmark"
                  rows={2}
                  className={`w-full bg-white border ${formErrors.address ? 'border-red-400 focus:border-red-500' : 'border-[#E2E8F0] focus:border-fuchsia-500'} text-[#0F172A] rounded-xl px-4 py-3 text-sm focus:outline-none shadow-sm resize-none`}
                />
                {formErrors.address && <p className="text-red-500 text-xs mt-1 font-semibold">{formErrors.address}</p>}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1.5">Pincode</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={formPostalCode}
                    onChange={(e) => setFormPostalCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="6-digits"
                    className={`w-full bg-white border ${formErrors.postalCode ? 'border-red-400 focus:border-red-500' : 'border-[#E2E8F0] focus:border-fuchsia-500'} text-[#0F172A] rounded-xl px-4 py-3 text-sm focus:outline-none shadow-sm`}
                  />
                  {formErrors.postalCode && <p className="text-red-500 text-xs mt-1 font-semibold">{formErrors.postalCode}</p>}
                </div>

                <div className="col-span-1">
                  <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1.5">City</label>
                  <input
                    type="text"
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    placeholder="City"
                    className={`w-full bg-white border ${formErrors.city ? 'border-red-400 focus:border-red-500' : 'border-[#E2E8F0] focus:border-fuchsia-500'} text-[#0F172A] rounded-xl px-4 py-3 text-sm focus:outline-none shadow-sm`}
                  />
                  {formErrors.city && <p className="text-red-500 text-xs mt-1 font-semibold">{formErrors.city}</p>}
                </div>

                <div className="col-span-1">
                  <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1.5">State</label>
                  <input
                    type="text"
                    value={formState}
                    onChange={(e) => setFormState(e.target.value)}
                    placeholder="State"
                    className={`w-full bg-white border ${formErrors.state ? 'border-red-400 focus:border-red-500' : 'border-[#E2E8F0] focus:border-fuchsia-500'} text-[#0F172A] rounded-xl px-4 py-3 text-sm focus:outline-none shadow-sm`}
                  />
                  {formErrors.state && <p className="text-red-500 text-xs mt-1 font-semibold">{formErrors.state}</p>}
                </div>

                <div className="col-span-1">
                  <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Globe size={14} /> Country
                  </label>
                  <input
                    type="text"
                    value={formCountry}
                    onChange={(e) => setFormCountry(e.target.value)}
                    placeholder="Country"
                    className={`w-full bg-white border ${formErrors.country ? 'border-red-400 focus:border-red-500' : 'border-[#E2E8F0] focus:border-fuchsia-500'} text-[#0F172A] rounded-xl px-4 py-3 text-sm focus:outline-none shadow-sm`}
                  />
                  {formErrors.country && <p className="text-red-500 text-xs mt-1 font-semibold">{formErrors.country}</p>}
                </div>
              </div>

              <button
                onClick={handleNextStep}
                className="w-full mt-6 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold text-sm py-3.5 rounded-xl shadow-sm transition-all"
              >
                Proceed to Order Review
              </button>
            </div>
          )}

          {step === 2 && (
            // STEP 2: Order Review
            <div className="space-y-6">
              
              {/* Delivery info summary block */}
              <div className="bg-slate-50 p-6 border border-[#E2E8F0] rounded-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                  <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin size={14} className="text-fuchsia-600" />
                    <span>Shipping Destination</span>
                  </h4>
                  <button 
                    onClick={() => setStep(1)} 
                    className="text-xs font-bold text-fuchsia-600 hover:underline animate-pulse"
                  >
                    Edit Address
                  </button>
                </div>
                <div className="text-sm space-y-2 font-semibold text-slate-700">
                  <p><span className="text-[#64748B] w-24 inline-block">Recipient:</span> {formName}</p>
                  <p><span className="text-[#64748B] w-24 inline-block">Contact:</span> {formPhone}</p>
                  <p><span className="text-[#64748B] w-24 inline-block">Email:</span> {formEmail}</p>
                  <p><span className="text-[#64748B] w-24 inline-block">Address:</span> {formAddress}</p>
                  <p><span className="text-[#64748B] w-24 inline-block">Location:</span> {formCity}, {formState}, {formCountry} - {formPostalCode}</p>
                </div>
              </div>

              {/* Coupon input */}
              <div className="bg-white p-6 border border-[#E2E8F0] rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
                  <Tag size={14} className="text-[#64748B]" /> Apply Coupon Code
                </h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Enter Coupon Code"
                    disabled={!!appliedCoupon}
                    className="flex-grow bg-slate-50 border border-[#E2E8F0] text-[#0F172A] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-fuchsia-500"
                  />
                  {appliedCoupon ? (
                    <button
                      onClick={() => {
                        setAppliedCoupon("");
                        setCouponSuccess("");
                        setCouponInput("");
                      }}
                      className="bg-red-50 hover:bg-red-100 text-red-700 font-bold text-sm px-5 rounded-xl border border-red-200"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      onClick={handleApplyCoupon}
                      className="bg-[#0F172A] hover:bg-slate-850 text-white font-bold text-sm px-6 rounded-xl transition-all"
                    >
                      Apply
                    </button>
                  )}
                </div>
                {couponError && <p className="text-red-500 text-xs font-semibold">{couponError}</p>}
                {couponSuccess && <p className="text-[#10B981] text-xs font-semibold">{couponSuccess}</p>}
              </div>

              {/* Confirmation checkbox */}
              <div className="flex items-start gap-2.5 pt-2">
                <input 
                  type="checkbox"
                  id="confirm-shipping"
                  checked={confirmAddressChecked}
                  onChange={(e) => setConfirmAddressChecked(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-fuchsia-600 focus:ring-fuchsia-500 cursor-pointer"
                />
                <label htmlFor="confirm-shipping" className="text-sm text-slate-600 font-semibold select-none cursor-pointer">
                  I confirm my shipping information is correct.
                </label>
              </div>

              {/* Step 2 buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3.5 border border-[#E2E8F0] hover:bg-slate-50 text-slate-700 hover:text-[#0F172A] rounded-xl text-sm font-bold transition-all"
                >
                  Go Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!confirmAddressChecked}
                  className={`flex-grow py-3.5 text-white font-bold rounded-xl text-sm shadow-sm transition-all flex items-center justify-center gap-1.5 ${
                    confirmAddressChecked ? 'bg-fuchsia-600 hover:bg-fuchsia-700' : 'bg-slate-300 cursor-not-allowed'
                  }`}
                >
                  <Lock size={14} />
                  <span>Proceed to Payment</span>
                </button>
              </div>

            </div>
          )}

          {step === 3 && (
            // STEP 3: Secure Payment
            <div className="space-y-6">
              
              <div className="border border-[#E2E8F0] rounded-xl p-6 text-center space-y-4">
                <div className="h-14 w-14 bg-fuchsia-50 text-fuchsia-600 rounded-full flex items-center justify-center mx-auto border border-fuchsia-100">
                  <CreditCard size={28} />
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-[#0F172A]">Pay Securely via Cashfree</h3>
                  <p className="text-sm text-[#64748B] max-w-sm mx-auto">
                    Supported payment modes: UPI, Credit/Debit Card, Net Banking, and Wallets.
                  </p>
                </div>

                {/* Security badges block */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 max-w-md mx-auto">
                  <div className="bg-slate-50 p-3 rounded-lg border border-[#E2E8F0] text-xs font-bold text-[#64748B] flex flex-col items-center gap-1">
                    <ShieldCheck size={16} className="text-[#10B981]" />
                    <span>SSL Secured</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-[#E2E8F0] text-xs font-bold text-[#64748B] flex flex-col items-center gap-1">
                    <ShieldCheck size={16} className="text-[#10B981]" />
                    <span>PCI DSS Compliant</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-[#E2E8F0] text-xs font-bold text-[#64748B] flex flex-col items-center gap-1">
                    <ShieldCheck size={16} className="text-[#10B981]" />
                    <span>Cashfree Secure</span>
                  </div>
                </div>
              </div>

              {/* Payment trigger buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-3.5 border border-[#E2E8F0] hover:bg-slate-50 text-slate-700 hover:text-[#0F172A] rounded-xl text-sm font-bold transition-all"
                >
                  Back to Review
                </button>
                <button
                  onClick={triggerCashfreeCheckout}
                  disabled={isProcessingPayment}
                  className="flex-grow py-3.5 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-extrabold rounded-xl text-sm shadow-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <Lock size={14} />
                  <span>{isProcessingPayment ? "Redirecting..." : `Pay Now (₹${totalAmount})`}</span>
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Right Side: Order summary preview details */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-[#0F172A] tracking-tight border-b border-[#E2E8F0] pb-3 uppercase">Order Summary</h3>
            
            {/* Textbooks list preview block */}
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
              {checkoutItems.map((item) => (
                <div key={item.id} className="flex gap-4 border-b border-[#E2E8F0] pb-4 last:border-b-0 last:pb-0">
                  <div className="shrink-0 h-24 w-16 rounded-lg bg-gradient-to-tr from-slate-100 to-fuchsia-50/30 flex items-center justify-center overflow-hidden relative border border-[#E2E8F0]/30 shadow-sm p-1">
                    <div className="relative h-full aspect-[1/1.4] shadow-[0_4px_8px_-2px_rgba(0,0,0,0.2)] rounded-r overflow-hidden">
                      <img
                        src={item.coverImg}
                        className="w-full h-full object-cover"
                        alt={item.title}
                      />
                      <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-r from-black/25 via-black/5 to-transparent" />
                    </div>
                  </div>
                  <div className="space-y-1.5 flex-grow">
                    <span className="text-[9px] text-fuchsia-600 font-bold uppercase tracking-wider bg-fuchsia-50 px-2 py-0.5 rounded border border-fuchsia-200/50 inline-block">
                      Physical Printed Book
                    </span>
                    <h4 className="text-xs font-bold text-[#0F172A] line-clamp-1 leading-tight">{item.title}</h4>
                    <p className="text-[10px] text-[#64748B] font-semibold">ISBN: {item.isbn}</p>

                    {/* Quantity Selector inside Checkout */}
                    <div className="flex items-center gap-1.5 mt-2 bg-slate-50 border border-[#E2E8F0] rounded-lg px-2 py-0.5 w-max">
                      <span className="text-[9px] font-bold text-[#64748B] uppercase tracking-wider">Qty:</span>
                      <button
                        type="button"
                        disabled={item.quantity <= 1 || step === 3 || isProcessingPayment}
                        onClick={() => handleUpdateItemQty(item.id, item.quantity - 1)}
                        className="w-5 h-5 flex items-center justify-center rounded bg-white border border-[#E2E8F0] text-slate-600 text-xs font-extrabold"
                      >
                        -
                      </button>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={item.quantity}
                        onChange={(e) => {
                          const valStr = e.target.value.replace(/\D/g, "");
                          if (valStr === "") return;
                          handleUpdateItemQty(item.id, parseInt(valStr, 10));
                        }}
                        disabled={step === 3 || isProcessingPayment}
                        className="w-6 text-center text-xs font-black text-[#0F172A] bg-transparent border-0 p-0 focus:outline-none focus:ring-0"
                      />
                      <button
                        type="button"
                        disabled={item.quantity >= 99 || step === 3 || isProcessingPayment}
                        onClick={() => handleUpdateItemQty(item.id, item.quantity + 1)}
                        className="w-5 h-5 flex items-center justify-center rounded bg-white border border-[#E2E8F0] text-slate-600 text-xs font-extrabold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pricing breakdown list */}
            <div className="space-y-4 text-sm font-semibold text-slate-700 border-t border-[#E2E8F0] pt-4">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="text-[#0F172A] font-bold">₹{itemSubtotal}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[#10B981] font-bold">
                  <span>Coupon Discount ({appliedCoupon})</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping Charges</span>
                <span className="text-[#0F172A] font-bold">
                  {shippingVal > 0 ? `₹${shippingVal}` : "Enter Pincode"}
                </span>
              </div>
              <div className="border-t border-[#E2E8F0] pt-4 flex justify-between text-sm font-extrabold text-[#0F172A]">
                <span>Total Amount</span>
                <span className="text-fuchsia-600 text-lg font-black">₹{totalAmount}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans pb-16 antialiased selection:bg-fuchsia-500/10 selection:text-fuchsia-600">
      {/* Hero Header Area */}
      <div className="bg-white border-b border-[#E2E8F0] pt-10 pb-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-fuchsia-50 border border-fuchsia-100 text-fuchsia-600 text-[10px] font-bold uppercase tracking-wider mb-3">
              <ShoppingBag size={12} className="text-fuchsia-600" />
              <span>Checkout Page</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#0F172A]">
              Complete Your Purchase
            </h1>
          </div>
        </div>
      </div>

      <Suspense fallback={
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="h-10 w-10 border-4 border-fuchsia-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-800 text-sm font-semibold">Loading checkout details...</p>
        </div>
      }>
        <CheckoutContent />
      </Suspense>

    </div>
  );
}
