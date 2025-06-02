import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
// import { ChatbotButton } from "../../components/ChatbotButton";
import { FaLinkedin } from "react-icons/fa";
import { JSX } from "react";

export const AboutPage = (): JSX.Element => {
  const teamMembers = [
    {
      name: "Karim Gamal",
      linkedin: "https://linkedin.com/in/ahmed-mohamed"
    },
    {
      name: "Ahmed Hamed",
      linkedin: "https://linkedin.com/in/sara-ahmed"
    },
    {
      name: "Marvin Nasser",
      linkedin: "https://linkedin.com/in/omar-ali"
    },
    {
      name: "Mohamed Abu El Kassem",
      linkedin: "https://linkedin.com/in/nour-hassan"
    },
    {
      name: "Farah Elhinawy",
      linkedin: "https://linkedin.com/in/youssef-ibrahim"
    },
    {
      name: "Ebtisam Hussien",
      linkedin: "https://linkedin.com/in/laila-mahmoud"
    }
  ];

  return (
    <div className="bg-white min-h-screen">
      <Header showSearch={false} showProfile={true} />

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-[#f0f4f8] to-[#e6f0f8]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-[#04364A] mb-4">About Us</h1>
            <div className="w-24 h-1 bg-[#176B87] mx-auto mb-8"></div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
            <div className="space-y-6 text-gray-700 text-lg">
              <p>
                <strong className="text-[#04364A]">Who We Are:</strong><br />
                We are a group of Computer Science graduates who are passionate about technology, user experience, and making smart choices simple. LapMatch is the result of our senior project — a blend of AI innovation and practical design aimed at solving a real-world problem.
              </p>

              <p>
                <strong className="text-[#04364A]">What We Do:</strong><br />
                LapMatch is a smart web-based platform powered by Artificial Intelligence. Instead of overwhelming users with hundreds of options, we ask simple, targeted questions about their intended usage, budget, and location — then recommend the best laptops that match their needs.
              </p>

              <p>
                <strong className="text-[#04364A]">Why We Do It:</strong><br />
                We've all been there — searching endlessly for the "perfect laptop," confused by specs, reviews, and inconsistent advice. We created LapMatch to take the guesswork out of the process and help users make confident decisions without being tech experts.
              </p>

              <p>
                <strong className="text-[#04364A]">Our Mission:</strong><br />
                To help users find their perfect laptop through intelligent, fast, and reliable recommendations — tailored to their personal needs, preferences, and budget.
              </p>

              <p>
                <strong className="text-[#04364A]">What Makes Us Different:</strong>
                <ul className="list-disc list-inside ml-6 mt-2">
                  <li>AI-powered, personalized suggestions</li>
                  <li>Clean, user-friendly interface</li>
                  <li>Designed for all user types — from students to professionals</li>
                  <li>Support for different price ranges and local markets</li>
                  <li>Transparent, unbiased results — no marketing tricks</li>
                </ul>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#04364A]">Meet Our Team</h2>
            <div className="w-24 h-1 bg-[#176B87] mx-auto mt-4 mb-8"></div>
            <p className="text-gray-600">
              Computer Science Dipartment, Faculty of Science, Alexandria University.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-8 text-center hover:shadow-lg transition-shadow">
                <div className="w-20 h-20 bg-gradient-to-r from-[#04364A] to-[#176B87] rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  {member.name.split(' ').map(name => name[0]).join('')}
                </div>
                <h3 className="text-xl font-bold text-[#04364A] mb-1">{member.name}</h3>
                <a 
                  href={member.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-[#176B87] hover:text-[#04364A] transition-colors"
                >
                  <FaLinkedin className="w-5 h-5 mr-2" />
                  LinkedIn Profile
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* <ChatbotButton /> */}
      <Footer />
    </div>
  );
};