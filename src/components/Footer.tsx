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
    <footer className="w-full h-[440px] mt-12 bg-transparent [background:linear-gradient(90deg,rgba(4,54,74,1)_0%,rgba(0,0,0,1)_100%)] text-text">
        <div className="flex justify-center gap-[87px] pt-20 px-[135px]">
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

        <div className="flex flex-col items-center gap-4 absolute bottom-16 left-0 opacity-40 w-full">
          <Separator className="w-full opacity-50 bg-[url(/line-1.svg)] bg-cover bg-[50%_50%]" />
        </div>
      </footer>
  );
};