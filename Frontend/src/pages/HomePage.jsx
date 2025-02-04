import React from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-100">
     
      {/* Hero Section */}
      <header className="bg-blue-600 text-white py-20 text-center">
        <h1 className="text-5xl font-bold">Welcome to the Booking System</h1>
        <p className="mt-4 text-lg">Book, manage, and track your bookings effortlessly.</p>
        <Link to="/register" className="mt-6 inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200">
          Get Started
        </Link>
      </header>

      {/* Features Section */}
      <section className="py-16 px-8 text-center container mx-auto">
        <h2 className="text-3xl font-semibold">Why Choose Us?</h2>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[ 
            { title: "Easy Booking", desc: "Book your tickets in a few clicks." },
            { title: "Secure Payments", desc: "Safe and reliable payment methods." },
            { title: "24/7 Support", desc: "We are here to assist you anytime." },
            { title: "Real-time Tracking", desc: "Track your bus in real-time." },
            { title: "Best Prices", desc: "Affordable pricing with great offers." },
            { title: "User-friendly Interface", desc: "Seamless experience for all users." }
          ].map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold">{feature.title}</h3>
              <p className="mt-2 text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-200 py-16 text-center container mx-auto">
        <h2 className="text-3xl font-semibold">What Our Users Say</h2>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 px-8">
          {[ 
            { quote: "The best booking experience! Super easy and fast.", name: "Jane Doe" },
            { quote: "Customer support is fantastic. Highly recommended!", name: "John Smith" },
            { quote: "Affordable and reliable. I always book my trips here.", name: "Emily Johnson" },
            { quote: "Real-time tracking helped me plan my journey better.", name: "Michael Brown" }
          ].map((testimonial, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-lg">
              <p className="text-lg italic">"{testimonial.quote}"</p>
              <p className="mt-2 font-bold">- {testimonial.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-8 text-center container mx-auto">
        <h2 className="text-3xl font-semibold">Frequently Asked Questions</h2>
        <div className="mt-8 text-left max-w-3xl mx-auto">
          {[ 
            { question: "How do I book a ticket?", answer: "Simply go to the booking page, choose your route, select a seat, and proceed with payment." },
            { question: "Can I cancel my booking?", answer: "Yes, you can cancel your booking up to 24 hours before departure for a full refund." },
            { question: "What payment methods do you accept?", answer: "We accept credit/debit cards, PayPal, and digital wallets." }
          ].map((faq, index) => (
            <div key={index} className="mb-6">
              <h3 className="text-xl font-bold">{faq.question}</h3>
              <p className="mt-2 text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-blue-600 text-white py-16 text-center">
        <h2 className="text-3xl font-semibold">Get in Touch</h2>
        <p className="mt-4 text-lg">Have questions? Contact our support team anytime.</p>
        <p className="mt-2 text-lg">Email: support@bookingsystem.com | Phone: +1 234 567 890</p>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white text-center py-6">
        <p>&copy; {new Date().getFullYear()} Booking System. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;
