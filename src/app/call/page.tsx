"use client";
import React, { useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      await api.post("/store/contact", {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phone,
        message: formData.message,
      });

      toast.success("Thank you! Your message has been sent.");

      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        message: "",
      });
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
                  <div className="text-gray-600">info@caterly.com.au</div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="text-[#E03A3E] text-lg">🕒</span>
                <div>
                  <div className="font-semibold">Working Days</div>
                  <div className="text-gray-600">Monday - Saturday</div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL – FORM */}
          <div>
            <h2 className="text-xl font-semibold mb-8">Contact Form</h2>

            <form className="space-y-6" onSubmit={handleSubmit}>

              {/* First & Last Name */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium block mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Enter Here"
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
                    placeholder="Enter Here"
                    className="w-full border border-[#FDECEC] rounded-lg px-4 py-3 text-black placeholder:text-black focus:outline-none focus:ring-1 focus:ring-[#E03A3E]"
                    required
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium block mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter Here"
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
                    placeholder="Enter Here"
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
