import { Separator } from "../components/ui/separator";

export const Footer = () => {
  const footerLinks = {
    support: [
      { label: "LapMatch@gmail.com", href: "mailto:LapMatch@gmail.com" },
      { label: "+88015-88888-9999", href: "tel:+8801588889999" },
    ],
    account: [
      { label: "My Account", href: "/profile" },
      { label: "Login / Register", href: "/login" },
    ],
    quickLinks: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms Of Use", href: "#" },
      { label: "FAQ", href: "#" },
      { label: "Contact", href: "/contact" },
    ],
  };

  return (
    <footer className="w-full bg-transparent [background:linear-gradient(90deg,rgba(4,54,74,1)_0%,rgba(0,0,0,1)_100%)] text-white">
        {/* Desktop Footer */}
        <div className="hidden md:flex justify-center gap-[87px] pt-20 px-[135px] pb-16">
          <div className="flex flex-col items-start gap-6">
            <img
              className="w-[100px] h-[100px] object-cover"
              alt="Logo"
              src="/image-57.png"
            />
          </div>
          
          {/* Support Column */}
          <div className="flex flex-col items-start gap-6">
            <h3 className="font-title-20px-medium">Support</h3>
            <div className="flex flex-col items-start gap-4">
              <div className="w-[175px]"></div>
              {footerLinks.support.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="font-title-16px-regular whitespace-nowrap"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Account Column */}
          <div className="flex flex-col items-start gap-6">
            <h3 className="font-title-20px-medium">Account</h3>
            <div className="flex flex-col items-start gap-4">
              {footerLinks.account.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="font-title-16px-regular whitespace-nowrap"
                >
                  {link.label}
                </a>
              ))}
              <div className="font-title-16px-regular whitespace-nowrap"></div>
              <div className="font-title-16px-regular whitespace-nowrap"></div>
              <div className="font-title-16px-regular whitespace-nowrap"></div>
            </div>
          </div>

          <div className="flex flex-col items-start gap-6">
            <h3 className="font-title-20px-medium">Quick Link</h3>
            <div className="flex flex-col items-start gap-4">
              {footerLinks.quickLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="font-title-16px-regular whitespace-nowrap"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-start gap-6">
            <div className="flex flex-col items-start gap-6">
              <div className="font-title-20px-medium whitespace-nowrap"></div>
            </div>
            <div className="flex items-start gap-6">
              <a href="#" aria-label="Facebook">
                <img
                  className="w-6 h-6"
                  alt="Facebook"
                  src="/icon-facebook.svg"
                />
              </a>
              <a href="#" aria-label="Twitter">
                <img
                  className="w-6 h-6"
                  alt="Twitter"
                  src="/icon-twitter.svg"
                />
              </a>
              <a href="#" aria-label="Instagram">
                <img
                  className="w-6 h-6"
                  alt="Instagram"
                  src="/icon-instagram.svg"
                />
              </a>
              <a href="#" aria-label="LinkedIn">
                <img
                  className="w-6 h-6"
                  alt="LinkedIn"
                  src="/icon-linkedin.svg"
                />
              </a>
            </div>
          </div>
        </div>

        {/* Mobile Footer */}
        <div className="md:hidden flex flex-col px-6 pt-10 pb-8">
          <div className="flex justify-center mb-8">
            <img
              className="w-[80px] h-[80px] object-cover"
              alt="Logo"
              src="/image-57.png"
            />
          </div>
          
          {/* Mobile Accordion for links */}
          <div className="space-y-6">
            {/* Support Section */}
            <div className="border-b border-white/20 pb-4">
              <h3 className="font-medium text-lg mb-3">Support</h3>
              <div className="space-y-3">
                {footerLinks.support.map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    className="block text-sm text-white/80"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
            
            {/* Account Section */}
            <div className="border-b border-white/20 pb-4">
              <h3 className="font-medium text-lg mb-3">Account</h3>
              <div className="space-y-3">
                {footerLinks.account.map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    className="block text-sm text-white/80"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
            
            {/* Quick Links Section */}
            <div className="border-b border-white/20 pb-4">
              <h3 className="font-medium text-lg mb-3">Quick Link</h3>
              <div className="space-y-3">
                {footerLinks.quickLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    className="block text-sm text-white/80"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
          
          {/* Social Icons */}
          <div className="flex justify-center gap-6 mt-8">
            <a href="#" aria-label="Facebook">
              <img className="w-6 h-6" alt="Facebook" src="/icon-facebook.svg" />
            </a>
            <a href="#" aria-label="Twitter">
              <img className="w-6 h-6" alt="Twitter" src="/icon-twitter.svg" />
            </a>
            <a href="#" aria-label="Instagram">
              <img className="w-6 h-6" alt="Instagram" src="/icon-instagram.svg" />
            </a>
            <a href="#" aria-label="LinkedIn">
              <img className="w-6 h-6" alt="LinkedIn" src="/icon-linkedin.svg" />
            </a>
          </div>
        </div>

        <Separator className="w-full opacity-50 bg-white/20" />
        
        <div className="py-4 text-center text-sm text-white/60">
          © 2025 LapMatch. All rights reserved.
        </div>
      </footer>
  );
};