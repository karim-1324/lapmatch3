import React, { JSX, useState } from "react";
import { Button } from "../../components/ui/button";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { Input } from "../../components/ui/input";

export const ContactPage = (): JSX.Element => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate successful submission
      setSuccess("Your message has been sent. We'll contact you within 24 hours.");
      setFormData({
        name: "",
        email: "",
        message: "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="bg-white min-h-screen">
     <Header showSearch={false} showProfile={true} />
      <section className="py-16">
        <div className="max-w-[1440px] mx-auto px-6">
          <h1 className="text-3xl font-bold mb-12 text-center">Contact Us</h1>
          
          <div className="grid grid-cols-2 gap-16">
            {/* Left Column - Contact Info */}
            <div>
              <div className="mb-12">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-[#04364A] rounded-full p-2">
                    <img src="/icons-phone.png" alt="Phone" className="w-9 h-9 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Call To Us</h3>
                    <p className="text-gray-600">We are available 24/7, 7 days a week.</p>
                    <p className="text-gray-600">Phone: +88015-88888-9999</p>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-[#04364A] rounded-full p-2">
                    <img src="/icons-mail.png" alt="Email" className="w-9 h-9 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Write To US</h3>
                    <p className="text-gray-600">Fill out our form and we will contact you within 24 hours.</p>
                    <p className="text-gray-600">Emails: customer@laptopFinder.com</p>
                    <p className="text-gray-600">Emails: support@laptopFinder.com</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Column - Contact Form */}
            <div>
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                  {success}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md"
                    placeholder="Name"
                  />
                </div>
                
                <div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md"
                    placeholder="Email"
                  />
                </div>
                
                <div>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md h-32"
                    placeholder="Write something..."
                  />
                </div>
                
                <Button 
                  type="submit"
                  className="bg-[#04364A] hover:bg-[#032a38] text-white px-6 py-3"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};