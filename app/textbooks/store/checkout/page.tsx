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
  Plus,
  Copy,
  Check,
  Sparkles,
  Compass,
  Truck,
  Receipt
} from "lucide-react";
import Link from "next/link";
import { getColleges, createUser, getAllUsers, getBookCode, TextbookUser, College, getAllAccessIds, setStorageItem, AllowedAccessId, getCoupons, initDb, Coupon } from "@/lib/dbClient";

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

const getSoftCopyPrice = (plan: string, bookId?: string): number => {
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
  const [copied, setCopied] = useState(false);

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

  // College list & custom entry
  const [collegesList, setCollegesList] = useState<College[]>([]);
  const [selectedCollegeCode, setSelectedCollegeCode] = useState("");
  const [customCollegeName, setCustomCollegeName] = useState("");
  const [generatedAccessId, setGeneratedAccessId] = useState("");

  const format = searchParams.get("format") || "physical";
  const plan = searchParams.get("plan") || "physical";

  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [couponError, setCouponError] = useState("");
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);

  useEffect(() => {
    initDb();
    fetch("/api/textbooks/db/sync")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.coupons) {
          setAvailableCoupons(data.coupons);
        } else {
          setAvailableCoupons(getCoupons());
        }
      })
      .catch(() => {
        setAvailableCoupons(getCoupons());
      });
  }, []);

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
    setCollegesList(getColleges());

    const hasBookId = !!bookId;
    if (hasBookId) {
      const selected = PUBLISHED_BOOKS.find((b) => b.id === bookId) || PUBLISHED_BOOKS[0];
      setBook(selected);
      let coverImg = "/portal_coverpages/minerals.jpg";
      if (selected.id === "2") coverImg = "/portal_coverpages/ml.png";
      if (selected.id === "3") coverImg = "/portal_coverpages/dbms.jpeg";

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

  const registerPurchasedPortalUser = (
    name: string,
    email: string,
    phone: string,
    collegeName: string,
    collegeCode: string,
    bookId: string,
    planStr: string,
    existingAccessId?: string
  ) => {
    // Generate Access ID
    let generatedId = existingAccessId;
    if (!generatedId) {
      const subjectCode = getBookCode(bookId) || "GEN";
      const cleanCollegeCode = (collegeCode && collegeCode !== "others") ? collegeCode.toUpperCase() : "OT";
      const randomDigits = Math.floor(10000 + Math.random() * 90000);
      generatedId = `LS${subjectCode}${cleanCollegeCode}${randomDigits}`;
    }

    // Create textbook user mapping
    const newUser: TextbookUser = {
      name: name,
      mobileNumber: phone,
      bookId: bookId,
      role: 'student',
      collegeName: collegeName,
      collegeEmail: email,
      isActive: true,
      accessId: generatedId,
      plan: planStr as any,
      purchasedBooks: [bookId]
    };

    // Pre-approve Access ID in allowed_access_ids first so createUser validation passes
    const allowedIds = getAllAccessIds();
    if (!allowedIds.some((item: AllowedAccessId) => item.accessId.toUpperCase() === generatedId!.toUpperCase())) {
      allowedIds.push({
        accessId: generatedId!,
        bookId: bookId,
        role: 'student',
        collegeCode: (collegeCode && collegeCode !== "others") ? collegeCode.toUpperCase() : "OT"
      });
      setStorageItem('lurnexa_allowed_access_ids', allowedIds);
    }

    // Save to database
    createUser(newUser);
    return generatedId;
  };

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

        if (data.order?.access_id) {
          setGeneratedAccessId(data.order.access_id);
        }
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
    
    // College validation
    if (!selectedCollegeCode) {
      errors.college = "College Name is required.";
    } else if (selectedCollegeCode === "others" && !customCollegeName.trim()) {
      errors.college = "Custom College Name is required.";
    }

    // Address validation for all checkouts
    if (!formAddress.trim()) errors.address = "Complete shipping address is required.";
    if (!formCity.trim()) errors.city = "City is required.";
    if (!formState.trim()) errors.state = "State is required.";
    if (!formCountry.trim()) errors.country = "Country is required.";
    if (formCountry.trim().toLowerCase() !== "india") {
      errors.country = "Shipping is only available within India.";
    }
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

    // Dynamic Coupon Check
    const matchedCoupon = availableCoupons.find(c => c.code.toUpperCase() === code);
    if (matchedCoupon) {
      const targetBookId = matchedCoupon.bookId;
      const hasMatchedBook = checkoutItems.some(item => item.id === targetBookId);
      if (!hasMatchedBook) {
        setCouponError(`This coupon is only valid for a specific textbook in the store.`);
        return;
      }

      const applicableFormat = matchedCoupon.applicableFormat || 'both';
      if (applicableFormat === 'soft' && format !== 'soft') {
        setCouponError("This coupon code is only applicable for the Soft Copy format.");
        return;
      }
      if (applicableFormat === 'physical' && format !== 'physical') {
        setCouponError("This coupon code is only applicable for the Hard Copy format.");
        return;
      }

      setAppliedCoupon(code);
      setCouponSuccess(`Coupon applied! ${matchedCoupon.discountPercentage}% discount on the applicable textbook.`);
      return;
    }

    const hasMinerals = checkoutItems.some(item => item.id === "1");
    const isMineralsCoupon = code === "LP_BVK_MINERAL_26";

    if (isMineralsCoupon) {
      if (!hasMinerals) {
        setCouponError("This coupon is only valid for the Minerals book.");
        return;
      }
      setAppliedCoupon(code);
      setCouponSuccess("Coupon applied! 10% discount on Minerals book.");
      return;
    }

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
      setCouponSuccess(`Coupon applied! ${format === "soft" ? "4%" : "10%"} discount on Machine Learning textbook.`);
    } else if (isDBMSCoupon) {
      const hasDBMSBook = checkoutItems.some(item => item.id === "3");
      if (!hasDBMSBook) {
        setCouponError("This coupon is only valid for the Database Management Systems textbook.");
        return;
      }
      setAppliedCoupon(code);
      setCouponSuccess(`Coupon applied! ${format === "soft" ? "4%" : "10%"} discount on Database Management Systems textbook.`);
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

    let itemSubtotal = 0;
    let discount = 0;
    let gstVal = 0;
    let shippingVal = 0;
    let onlineFeeVal = 0;
    let totalAmount = 0;

    if (format === "soft") {
      const qty = isCartCheckout ? checkoutItems.reduce((acc, i) => acc + i.quantity, 0) : quantity;
      itemSubtotal = getSoftCopyPrice(plan, isCartCheckout ? checkoutItems[0]?.id : bookId) * qty;

      // Check dynamic coupon first
      const dynamicCoupon = availableCoupons.find(c => c.code.toUpperCase() === (appliedCoupon || "").toUpperCase());
      if (dynamicCoupon && (dynamicCoupon.applicableFormat === 'both' || dynamicCoupon.applicableFormat === 'soft')) {
        const targetBookId = dynamicCoupon.bookId;
        const targetItem = checkoutItems.find(item => item.id === targetBookId) || (isCartCheckout ? undefined : { id: bookId, quantity });
        if (targetItem) {
          discount = Math.round((getSoftCopyPrice(plan, targetItem.id) * targetItem.quantity) * (dynamicCoupon.discountPercentage / 100));
        }
      } else {
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

        if (isMLCoupon) {
          const mlItem = checkoutItems.find(item => item.id === "2");
          if (mlItem) {
            discount = Math.round((getSoftCopyPrice(plan, mlItem.id) * mlItem.quantity) * 0.04);
          }
        } else if (isDBMSCoupon) {
          const dbmsItem = checkoutItems.find(item => item.id === "3");
          if (dbmsItem) {
            discount = Math.round((getSoftCopyPrice(plan, dbmsItem.id) * dbmsItem.quantity) * 0.04);
          }
        }
      }

      const itemCostAfterDiscount = itemSubtotal - discount;
      gstVal = Math.round(itemCostAfterDiscount * 0.18);
      onlineFeeVal = Math.round((itemCostAfterDiscount + gstVal) * 0.02);
      totalAmount = itemCostAfterDiscount + gstVal + onlineFeeVal;
      itemSubtotal = itemCostAfterDiscount;
    } else {
      itemSubtotal = checkoutItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

      // Check dynamic coupon first
      const dynamicCoupon = availableCoupons.find(c => c.code.toUpperCase() === (appliedCoupon || "").toUpperCase());
      if (dynamicCoupon && (dynamicCoupon.applicableFormat === 'both' || dynamicCoupon.applicableFormat === 'physical')) {
        const targetBookId = dynamicCoupon.bookId;
        const targetItem = checkoutItems.find(item => item.id === targetBookId);
        if (targetItem) {
          discount = Math.round((targetItem.price * targetItem.quantity) * (dynamicCoupon.discountPercentage / 100));
        }
      } else {
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

        const isMineralsCoupon = (appliedCoupon || "").toUpperCase() === "LP_BVK_MINERAL_26";

        const hasMinerals = checkoutItems.some(item => item.id === "1");
        if (isMineralsCoupon && hasMinerals) {
          const minItem = checkoutItems.find(item => item.id === "1");
          if (minItem) {
            discount = Math.round((minItem.price * minItem.quantity) * 0.10);
          }
        } else if (!hasMinerals) {
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
      }

      const bookCostAfterDiscount = itemSubtotal - discount;
      shippingVal = getShippingCost(formPostalCode) || 50;
      totalAmount = bookCostAfterDiscount + shippingVal;
      itemSubtotal = bookCostAfterDiscount;
    }

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
          shippingAddress: format === "soft" ? "Soft Copy Access" : formAddress,
          city: format === "soft" ? "Online" : formCity,
          state: format === "soft" ? "Online" : formState,
          country: format === "soft" ? "India" : formCountry,
          postalCode: format === "soft" ? "000000" : formPostalCode,
          couponCode: appliedCoupon,
          discountAmount: discount,
          gstAmount: gstVal,
          shippingAmount: shippingVal,
          subtotal: itemSubtotal,
          quantity: isCartCheckout ? checkoutItems.reduce((acc, i) => acc + i.quantity, 0) : quantity,
          format: format,
          plan: plan,
          collegeCode: selectedCollegeCode
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
    const isSoftCopy = format === "soft" || verifiedOrderDetails.shipping_address === "Soft Copy Access";

    const copyToClipboard = () => {
      if (generatedAccessId) {
        navigator.clipboard.writeText(generatedAccessId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    };

    return (
      <div className="max-w-2xl mx-auto my-8 sm:my-12 px-4 animate-in fade-in slide-in-from-bottom-6 duration-500">
        <div className="relative overflow-hidden bg-white border border-slate-100 rounded-3xl shadow-2xl p-6 sm:p-10 text-center space-y-8">
          
          {/* Subtle Decorative Background Glows */}
          <div className={`absolute -top-24 -left-24 w-48 h-48 rounded-full blur-3xl opacity-20 ${isSoftCopy ? 'bg-fuchsia-500' : 'bg-emerald-500'}`} />
          <div className={`absolute -bottom-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-20 ${isSoftCopy ? 'bg-indigo-500' : 'bg-teal-500'}`} />

          {/* Icon Badge */}
          <div className="relative">
            <div className={`h-20 w-20 mx-auto rounded-2xl flex items-center justify-center shadow-lg border transform hover:scale-105 transition-all duration-300 ${
              isSoftCopy 
                ? 'bg-fuchsia-50 border-fuchsia-100 text-fuchsia-600 shadow-fuchsia-100/50' 
                : 'bg-emerald-50 border-emerald-100 text-emerald-600 shadow-emerald-100/50'
            }`}>
              {isSoftCopy ? <Sparkles size={38} className="animate-pulse" /> : <Truck size={38} />}
            </div>
            <span className={`absolute bottom-0 right-[42%] translate-x-1.5 translate-y-1 h-6 w-6 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold ${
              isSoftCopy ? 'bg-fuchsia-600' : 'bg-emerald-600'
            }`}>
              ✓
            </span>
          </div>

          {/* Header */}
          <div className="space-y-3">
            <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-full border ${
              isSoftCopy 
                ? 'bg-fuchsia-50/70 text-fuchsia-700 border-fuchsia-200/50' 
                : 'bg-emerald-50/70 text-emerald-700 border-emerald-200/50'
            }`}>
              Payment Successful
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {isSoftCopy ? "Portal Access Activated!" : "Your Textbook Order is Placed!"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              {isSoftCopy 
                ? "Your digital textbook access plan has been successfully activated. Grab your Access ID below to start learning immediately."
                : "Thank you for supporting Lurnexa Publications! Your printed book is being prepared and will ship to your address shortly."}
            </p>
          </div>

          {/* Soft Copy Special Action Box */}
          {isSoftCopy && generatedAccessId && (
            <div className="bg-gradient-to-br from-indigo-50/80 via-fuchsia-50/50 to-white p-6 rounded-2xl border border-indigo-100/60 text-left space-y-4 shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] text-indigo-600 font-extrabold uppercase tracking-widest">Digital Entry Ticket</span>
                  <h4 className="text-sm font-bold text-slate-800">Your Student Access ID</h4>
                </div>
                <button
                  onClick={copyToClipboard}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-sm ${
                    copied 
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                      : 'bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50/50'
                  }`}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied" : "Copy ID"}
                </button>
              </div>

              {/* Huge Access ID Display */}
              <div className="bg-white/80 backdrop-blur-sm border border-indigo-100 rounded-xl px-5 py-4 flex items-center justify-between shadow-inner">
                <span className="font-mono text-2xl font-black text-indigo-600 tracking-wider select-all">{generatedAccessId}</span>
                <span className="bg-indigo-650 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-bounce">Active</span>
              </div>

              <div className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                💡 <strong>Important Note:</strong> Keep this Access ID safe! You will need to use this Access ID to create your student account in the portal.
              </div>
            </div>
          )}

          {/* Hard Copy Delivery Timeline Progress Tracker */}
          {!isSoftCopy && (
            <div className="bg-slate-50/70 p-6 rounded-2xl border border-slate-200/50 text-left space-y-4">
              <span className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-widest block">Delivery Timeline</span>
              
              {/* Tracker visual */}
              <div className="grid grid-cols-4 gap-2 relative mt-2">
                <div className="absolute top-[18px] left-[12%] right-[12%] h-0.5 bg-slate-200 z-0" />
                <div className="absolute top-[18px] left-[12%] w-[25%] h-0.5 bg-emerald-500 z-0" />
                
                <div className="flex flex-col items-center text-center z-10">
                  <div className="h-9 w-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-emerald-200">
                    ✓
                  </div>
                  <span className="text-[10px] font-bold text-slate-900 mt-2">Confirmed</span>
                </div>
                <div className="flex flex-col items-center text-center z-10">
                  <div className="h-9 w-9 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold text-xs shadow-sm">
                    📦
                  </div>
                  <span className="text-[10px] font-bold text-slate-800 mt-2">Preparing</span>
                </div>
                <div className="flex flex-col items-center text-center z-10">
                  <div className="h-9 w-9 rounded-full bg-slate-105 text-slate-400 flex items-center justify-center font-bold text-xs">
                    🚚
                  </div>
                  <span className="text-[10px] font-medium text-slate-400 mt-2">Shipped</span>
                </div>
                <div className="flex flex-col items-center text-center z-10">
                  <div className="h-9 w-9 rounded-full bg-slate-105 text-slate-400 flex items-center justify-center font-bold text-xs">
                    🏠
                  </div>
                  <span className="text-[10px] font-medium text-slate-400 mt-2">Delivered</span>
                </div>
              </div>
            </div>
          )}

          {/* Receipt Info Panel */}
          <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 text-left space-y-3.5">
            <div className="flex items-center gap-1.5 border-b border-slate-200/60 pb-2.5">
              <Receipt size={16} className="text-slate-400" />
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Order Summary</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-slate-600">
              <div className="space-y-3">
                <div className="flex justify-between border-b border-slate-100/60 pb-1.5">
                  <span>Order Number</span>
                  <span className="text-slate-900 font-bold">{verifiedOrderDetails.order_id}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100/60 pb-1.5">
                  <span>Transaction ID</span>
                  <span className="text-slate-900 font-mono font-bold truncate pl-2 max-w-[140px]">{verifiedOrderDetails.cashfree_payment_id || 'CF_MOCK_TXN'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100/60 pb-1.5">
                  <span>Book Title</span>
                  <span className="text-slate-900 font-bold text-right truncate pl-4 max-w-[140px]" title={book?.title || "Multiple Items"}>{book?.title || "Multiple Items"}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between border-b border-slate-100/60 pb-1.5">
                  <span>Quantity</span>
                  <span className="text-slate-900 font-bold">{verifiedOrderDetails.quantity || 1}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100/60 pb-1.5">
                  <span>Amount Paid</span>
                  <span className="text-slate-900 font-bold text-fuchsia-600">₹{verifiedOrderDetails.amount}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100/60 pb-1.5">
                  <span>Access Type</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                    isSoftCopy ? 'bg-fuchsia-100 text-fuchsia-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {isSoftCopy ? 'Soft Copy' : 'Printed Book'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Details Card: Portal Registration Info or Shipping Address */}
          <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 text-left space-y-3">
            <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest block">
              {isSoftCopy ? "Portal Registration Credentials" : "Delivery Address Details"}
            </span>

            <div className="text-xs font-semibold text-slate-700 space-y-1">
              <p className="text-slate-900 font-extrabold text-sm">{verifiedOrderDetails.customer_name}</p>
              
              {isSoftCopy ? (
                <div className="space-y-1 text-slate-500 font-semibold pt-1">
                  <div><strong>Email: </strong>{verifiedOrderDetails.customer_email}</div>
                  <div><strong>Phone: </strong>{verifiedOrderDetails.customer_phone}</div>
                </div>
              ) : (
                <div className="text-slate-500 font-semibold pt-1 leading-relaxed">
                  {verifiedOrderDetails.shipping_address}<br/>
                  {verifiedOrderDetails.city}, {verifiedOrderDetails.state}, {verifiedOrderDetails.country} - {verifiedOrderDetails.shipping_pincode}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-4">
            {isSoftCopy ? (
              <>
                <Link
                  href="/textbooks/portal/signup"
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-700 hover:to-fuchsia-700 text-white font-extrabold text-sm py-4 rounded-2xl shadow-lg shadow-indigo-100 hover:shadow-indigo-200 transition-all text-center flex items-center justify-center gap-1.5"
                >
                  <Compass size={16} />
                  Go to Student Signup
                </Link>
                <Link
                  href="/textbooks/store"
                  className="flex-1 bg-slate-50 hover:bg-slate-105 border border-slate-200 text-slate-800 font-extrabold text-sm py-4 rounded-2xl transition-all text-center"
                >
                  Return to Bookstore
                </Link>
              </>
            ) : (
              <Link
                href="/textbooks/store"
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm py-4 rounded-2xl shadow-lg shadow-emerald-100 hover:shadow-emerald-200 transition-all text-center flex items-center justify-center gap-1.5"
              >
                Return to Bookstore
              </Link>
            )}
          </div>
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
  let itemSubtotal = 0;
  let discount = 0;
  let gstVal = 0;
  let shippingVal = 0;
  let onlineFeeVal = 0;
  let totalAmount = 0;

  if (format === "soft") {
    const qty = isCartCheckout ? checkoutItems.reduce((acc, i) => acc + i.quantity, 0) : quantity;
    itemSubtotal = getSoftCopyPrice(plan, isCartCheckout ? checkoutItems[0]?.id : bookId) * qty;

    // Check dynamic coupon first
    const dynamicCoupon = availableCoupons.find(c => c.code.toUpperCase() === (appliedCoupon || "").toUpperCase());
    if (dynamicCoupon && (dynamicCoupon.applicableFormat === 'both' || dynamicCoupon.applicableFormat === 'soft')) {
      const targetBookId = dynamicCoupon.bookId;
      const targetItem = checkoutItems.find(item => item.id === targetBookId) || (isCartCheckout ? undefined : { id: bookId, quantity });
      if (targetItem) {
        discount = Math.round((getSoftCopyPrice(plan, targetItem.id) * targetItem.quantity) * (dynamicCoupon.discountPercentage / 100));
      }
    } else {
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

      if (isMLCoupon) {
        const mlItem = checkoutItems.find(item => item.id === "2");
        if (mlItem) {
          discount = Math.round((getSoftCopyPrice(plan, mlItem.id) * mlItem.quantity) * 0.04);
        }
      } else if (isDBMSCoupon) {
        const dbmsItem = checkoutItems.find(item => item.id === "3");
        if (dbmsItem) {
          discount = Math.round((getSoftCopyPrice(plan, dbmsItem.id) * dbmsItem.quantity) * 0.04);
        }
      }
    }

    const itemCostAfterDiscount = itemSubtotal - discount;
    gstVal = Math.round(itemCostAfterDiscount * 0.18);
    onlineFeeVal = Math.round((itemCostAfterDiscount + gstVal) * 0.02);
    totalAmount = itemCostAfterDiscount + gstVal + onlineFeeVal;
    itemSubtotal = itemCostAfterDiscount;
  } else {
    itemSubtotal = checkoutItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    // Check dynamic coupon first
    const dynamicCoupon = availableCoupons.find(c => c.code.toUpperCase() === (appliedCoupon || "").toUpperCase());
    if (dynamicCoupon && (dynamicCoupon.applicableFormat === 'both' || dynamicCoupon.applicableFormat === 'physical')) {
      const targetBookId = dynamicCoupon.bookId;
      const targetItem = checkoutItems.find(item => item.id === targetBookId);
      if (targetItem) {
        discount = Math.round((targetItem.price * targetItem.quantity) * (dynamicCoupon.discountPercentage / 100));
      }
    } else {
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

      const isMineralsCoupon = (appliedCoupon || "").toUpperCase() === "LP_BVK_MINERAL_26";

      const hasMinerals = checkoutItems.some(item => item.id === "1");
      if (isMineralsCoupon && hasMinerals) {
        const minItem = checkoutItems.find(item => item.id === "1");
        if (minItem) {
          discount = Math.round((minItem.price * minItem.quantity) * 0.10);
        }
      } else if (!hasMinerals) {
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
    }

    const bookCostAfterDiscount = itemSubtotal - discount;
    shippingVal = getShippingCost(formPostalCode) || 50;
    totalAmount = bookCostAfterDiscount + shippingVal;
    itemSubtotal = bookCostAfterDiscount;
  }

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
                  College Name
                </label>
                <select
                  value={selectedCollegeCode}
                  onChange={(e) => setSelectedCollegeCode(e.target.value)}
                  className={`w-full bg-white border ${formErrors.college ? 'border-red-400 focus:border-red-500' : 'border-[#E2E8F0] focus:border-fuchsia-500'} text-[#0F172A] rounded-xl px-4 py-3 text-sm focus:outline-none shadow-sm`}
                >
                  <option value="">-- Select College --</option>
                  {collegesList.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                  <option value="others">Others</option>
                </select>
                {formErrors.college && <p className="text-red-500 text-xs mt-1 font-semibold">{formErrors.college}</p>}
              </div>

              {selectedCollegeCode === "others" && (
                <div>
                  <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
                    Custom College Name
                  </label>
                  <input
                    type="text"
                    value={customCollegeName}
                    onChange={(e) => setCustomCollegeName(e.target.value)}
                    placeholder="Enter your college name"
                    className="w-full bg-white border border-[#E2E8F0] focus:border-fuchsia-500 text-[#0F172A] rounded-xl px-4 py-3 text-sm focus:outline-none shadow-sm"
                  />
                </div>
              )}

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
                    disabled
                    className="w-full bg-slate-100 border border-[#E2E8F0] text-[#0F172A] rounded-xl px-4 py-3 text-sm focus:outline-none shadow-sm cursor-not-allowed"
                  />
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
                    <span>{format === "physical" ? "Shipping & Delivery Info" : "Billing & Registration Info"}</span>
                  </h4>
                  <button 
                    onClick={() => setStep(1)} 
                    className="text-xs font-bold text-fuchsia-600 hover:underline animate-pulse"
                  >
                    Edit Info
                  </button>
                </div>
                <div className="text-sm space-y-2 font-semibold text-slate-700">
                  <p><span className="text-[#64748B] w-24 inline-block">Name:</span> {formName}</p>
                  <p><span className="text-[#64748B] w-24 inline-block">Contact:</span> {formPhone}</p>
                  <p><span className="text-[#64748B] w-24 inline-block">Email:</span> {formEmail}</p>
                  <p>
                    <span className="text-[#64748B] w-24 inline-block">College:</span>{" "}
                    {selectedCollegeCode === "others"
                      ? customCollegeName
                      : (collegesList.find((c) => c.code === selectedCollegeCode)?.name || "General")}
                  </p>
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
              {format === "soft" ? (
                <>
                  <div className="flex justify-between">
                    <span>GST Tax (18%)</span>
                    <span className="text-[#0F172A] font-bold">₹{gstVal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Online Charges (2%)</span>
                    <span className="text-[#0F172A] font-bold">₹{onlineFeeVal}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between">
                  <span>Shipping Charges</span>
                  <span className="text-[#0F172A] font-bold">
                    {shippingVal > 0 ? `₹${shippingVal}` : "Enter Pincode"}
                  </span>
                </div>
              )}
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
