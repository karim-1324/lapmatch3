import React, { useState, useEffect, JSX } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";

export const ProfilePage = (): JSX.Element => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isGoogleUser, setIsGoogleUser] = useState(false);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      navigate('/signup');
      return;
    }

    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setFormData(prev => ({
        ...prev,
        name: user.username || "",
        email: user.email || "",
      }));
      

      const authMethod = localStorage.getItem('authMethod');
      setIsGoogleUser(authMethod === 'google');
    }
  }, [navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    

    if (!isGoogleUser && (formData.newPassword || formData.confirmNewPassword || formData.currentPassword)) {
      if (!formData.currentPassword) {
        setError("Current password is required to change password");
        return;
      }
      
      if (formData.newPassword !== formData.confirmNewPassword) {
        setError("New passwords do not match");
        return;
      }
      
      if (formData.newPassword.length < 8) {
        setError("New password must be at least 8 characters long");
        return;
      }
    }

    try {
      setIsLoading(true);
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error("Authentication token not found");
      }
      
      const userData = localStorage.getItem('user');
      if (!userData) {
        throw new Error("User data not found");
      }
      
      const user = JSON.parse(userData);
      
      const updateData: any = {
        username: formData.name,
      };
      
      if (!isGoogleUser) {
        updateData.email = formData.email;
      }
      
      if (!isGoogleUser && formData.newPassword && formData.currentPassword) {
        updateData.current_password = formData.currentPassword;
        updateData.new_password = formData.newPassword;
      }
      
      const response = await fetch(`http://localhost:8000/server/api/auth/profile/${user.id}/`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }
      
      const updatedUser = await response.json();
      
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const newUserData = {
        ...currentUser,
        username: updatedUser.user.username
      };
      localStorage.setItem('user', JSON.stringify(newUserData));
      
      setSuccess("Your profile has been updated successfully");
      
      setFormData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <Header showSearch={false} showProfile={false} />

      <section className="py-16">
        <div className="max-w-[1440px] mx-auto px-6">
          <h1 className="text-3xl font-bold mb-8">Edit Your Profile</h1>
          
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
          
          {isGoogleUser && (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
              You're signed in with Google.
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  User Name
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-8">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  disabled={isGoogleUser}
                  readOnly={isGoogleUser}
                />
                {isGoogleUser && (
                  <p className="text-sm text-gray-500 mt-1">
                    Email cannot be changed for Google accounts
                  </p>
                )}
              </div>
            </div>
            
            {!isGoogleUser && (
              <>
                <h2 className="text-xl font-bold mt-8 mb-4">Password Changes</h2>
                
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    placeholder="Enter your current password"
                  />
                </div>
                
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    placeholder="Enter new password"
                  />
                </div>
                
                <div>
                  <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <Input
                    id="confirmNewPassword"
                    name="confirmNewPassword"
                    type="password"
                    value={formData.confirmNewPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    placeholder="Confirm new password"
                  />
                </div>
              </>
            )}
            
            <div className="flex justify-end space-x-4 mt-8">
              <Button
                type="button"
                variant="outline"
                className="px-6"
                onClick={() => navigate('/')}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-[#04364A] hover:bg-[#032a38] text-white px-6"
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </section>
      <Footer />
    </div>
  );
};
