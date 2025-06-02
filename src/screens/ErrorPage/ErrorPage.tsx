import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { JSX } from "react";

export const ErrorPage = (): JSX.Element => {
  const navigate = useNavigate();


  return (
    <div className="bg-white min-h-screen">
      <Header />
      
      <section className="py-16">
        <div className="max-w-[1440px] mx-auto px-6 flex flex-col items-center justify-center">
          <h1 className="text-6xl font-bold mb-8">404 Not Found</h1>
          <p className="text-xl text-gray-600 mb-12">Your visited page not found. You may go home page.</p>
          <Button 
            className="bg-[#04364A] hover:bg-[#032a38] text-white px-6 py-3"
            onClick={() => navigate('/')}
          >
            Back to home page
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};
