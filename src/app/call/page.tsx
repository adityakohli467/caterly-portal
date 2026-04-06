"use client";
import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";

const generateCaptcha = () => Math.floor(1000 + Math.random() * 9000).toString();

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [captchaCode, setCaptchaCode] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");

  useEffect(() => {
    setCaptchaCode(generateCaptcha());
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (captchaInput !== captchaCode) {
      toast.error("Captcha does not match. Please try again.");
      setCaptchaCode(generateCaptcha());
      setCaptchaInput("");
      return;
    }

    setLoading(true);
    try {
      await api.post("/store/contact", {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phone,
        message: formData.message,
      });

      toast.success("Thank you for contacting us. One of our experts will be with you shortly.");

      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        message: "",
      });
      setCaptchaInput("");
      setCaptchaCode(generateCaptcha());
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to send message. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white text-black min-h-screen">

      {/* Main Contact Section */}
      <section className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-16 items-start">

          {/* LEFT PANEL */}
          <div>
            <h1 className="text-3xl font-bold mb-4">Get in Touch</h1>
            <p className="text-gray-600 leading-relaxed mb-10 max-w-md">
              We'd love to hear from you. Whether you have questions about our services,
              need catering for an event, or just want to say hello, don't hesitate to reach out.
              Our team is here to help you create something extraordinary.
            </p>

            <div className="space-y-8 text-sm">
              <div className="flex items-start gap-4">
                <span className="text-[#E03A3E] text-lg">📍</span>
                <div>
                  <div className="font-semibold">Address</div>
                  <div className="text-gray-600">
                    75 Dorcas St, South Melbourne 3205
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="text-[#E03A3E] text-lg">📞</span>
                <div>
                  <div className="font-semibold">Phone</div>
                  <div className="text-gray-600">1300 827 286</div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="text-[#E03A3E] text-lg">✉️</span>
                <div>
                  <div className="font-semibold">Email</div>
                  <div className="text-gray-600">catering@caterly.com.au </div>
                </div>
              </div>

              {/* <div className="flex items-start gap-4">
                <span className="text-[#E03A3E] text-lg">🕒</span>
                <div>
                  <div className="font-semibold">Working Days</div>
                  <div className="text-gray-600">Monday - Saturday</div>
                </div>
              </div> */}
            </div>
          </div>

          {/* RIGHT PANEL – FORM */}
          <div>
            <h2 className="text-xl font-semibold mb-8">Contact Form</h2>

            <form className="space-y-6" onSubmit={handleSubmit}>

              {/* First & Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium block mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    // placeholder="Enter Here"
                    className="w-full border border-[#FDECEC] rounded-lg px-4 py-3 text-black placeholder:text-black focus:outline-none focus:ring-1 focus:ring-[#E03A3E]"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium block mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    // placeholder="Enter Here"
                    className="w-full border border-[#FDECEC] rounded-lg px-4 py-3 text-black placeholder:text-black focus:outline-none focus:ring-1 focus:ring-[#E03A3E]"
                    required
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium block mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    // placeholder="Enter Here"
                    className="w-full border border-[#FDECEC] rounded-lg px-4 py-3 text-black placeholder:text-black focus:outline-none focus:ring-1 focus:ring-[#E03A3E]"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium block mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    // placeholder="Enter Here"
                    className="w-full border border-[#FDECEC] rounded-lg px-4 py-3 text-black placeholder:text-black focus:outline-none focus:ring-1 focus:ring-[#E03A3E]"
                    required
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="text-sm font-medium block mb-2">
                  Message
                </label>
                <textarea
                  rows={4}
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Add Message"
                  className="w-full border border-[#FDECEC] rounded-lg px-4 py-3 text-black placeholder:text-black resize-none focus:outline-none focus:ring-1 focus:ring-[#E03A3E]"
                  required
                />
              </div>

              {/* Captcha */}
              <div>
                <label className="text-sm font-medium block mb-2">Captcha</label>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center justify-center min-w-[90px] border-2 border-dashed border-[#E03A3E] px-4 py-3 rounded-md select-none">
                    <span className="text-[#E03A3E] font-bold text-lg tracking-widest">{captchaCode}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCaptchaCode(generateCaptcha())}
                    className="text-xs text-[#E03A3E] underline whitespace-nowrap"
                  >
                    Refresh
                  </button>
                  <input
                    type="text"
                    required
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    placeholder="Enter captcha"
                    className="flex-1 min-w-[140px] border border-[#FDECEC] rounded-lg px-4 py-3 text-black placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#E03A3E]"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#E03A3E] hover:bg-[#cc3236] text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
              >
                {loading ? "Sending..." : "Submit"}
              </button>

            </form>
          </div>

        </div>
      </section>

      {/* MAP */}
      <section className="w-full h-[380px] mt-6">
        <iframe
          className="w-full h-full border-0"
          src="https://www.google.com/maps?q=South+Melbourne+3205&output=embed"
          loading="lazy"
        ></iframe>
      </section>
    </div>
  );
}
