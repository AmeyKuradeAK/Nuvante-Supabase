"use client";
import React from "react";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useUser, useClerk } from "@clerk/nextjs";
import { useAlert } from "@/context/AlertContext";
import { useRouter } from "next/navigation";
import { ShoppingCart, Heart, User as UserIcon, Package, LogOut } from "lucide-react";

const logo_l = "/logo_l.svg";
const logo_r = "/logo_r.svg";
const search = "/search.svg";
const heart = "/heart.svg";
const cart = "/cart.svg";
const animated_logo = "/nuv_1.webm";
const User = "/user.svg";
const Orders = "/orders.svg";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Products", href: "/Products" },
  { name: "About", href: "/about" },
  { name: "Support", href: "/support" },
  { name: "Contact", href: "/Contact" },
];

//* used <Image> instead of <img> and <Link> instead of <a>
//* Otherwise standard implementation of a navbar.

export default function Navbar() {
  const [open, setOpen] = useState<Boolean>(false);
  const desktopVideoRef = useRef<HTMLVideoElement>(null);
  const mobileVideoRef = useRef<HTMLVideoElement>(null);
  const { showAlert } = useAlert();
  const { signOut } = useClerk();
  const router = useRouter();
  const user = useUser();

  // Force video play on component mount and handle iOS autoplay restrictions
  useEffect(() => {
    const playVideo = async (videoElement: HTMLVideoElement | null) => {
      if (videoElement) {
        try {
          // Reset video to start
          videoElement.currentTime = 0;
          
          // Set additional iOS-friendly attributes
          videoElement.setAttribute('webkit-playsinline', 'true');
          videoElement.setAttribute('playsinline', 'true');
          videoElement.muted = true;
          videoElement.loop = true;
          
          // Try to play the video
          const playPromise = videoElement.play();
          
          if (playPromise !== undefined) {
            await playPromise;
          }
        } catch (error) {
          // If autoplay fails, we'll handle it in the click event
          console.log("Autoplay prevented, will play on user interaction");
          
          // Try alternative approach for iOS
          setTimeout(() => {
            if (videoElement && videoElement.paused) {
              videoElement.play().catch(() => {
                // Final fallback - the video will play on user interaction
              });
            }
          }, 100);
        }
      }
    };

    // Play both videos with a slight delay
    setTimeout(() => {
      playVideo(desktopVideoRef.current);
      playVideo(mobileVideoRef.current);
    }, 100);

    // Add event listeners for user interaction to ensure video plays
    const handleUserInteraction = () => {
      playVideo(desktopVideoRef.current);
      playVideo(mobileVideoRef.current);
      
      // Remove listeners after first interaction
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('scroll', handleUserInteraction);
    };

    // Listen for various user interactions
    document.addEventListener('touchstart', handleUserInteraction, { passive: true });
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('scroll', handleUserInteraction, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('scroll', handleUserInteraction);
    };
  }, []);

  const handleNavbar = () => {
    setOpen(!open);
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    if (!user.isSignedIn) {
      e.preventDefault();
      showAlert("Please sign in to access your profile", "warning");
      setTimeout(() => {
        router.push("/sign-in");
      }, 2000);
    }
  };

  const handleCartClick = (e: React.MouseEvent) => {
    if (!user.isSignedIn) {
      e.preventDefault();
      showAlert("Please sign in to access your cart", "warning");
      setTimeout(() => {
        router.push("/sign-in");
      }, 2000);
    }
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    if (!user.isSignedIn) {
      e.preventDefault();
      showAlert("Please sign in to access your wishlist", "warning");
      setTimeout(() => {
        router.push("/sign-in");
      }, 2000);
    }
  };

  const handleOrdersClick = (e: React.MouseEvent) => {
    if (!user.isSignedIn) {
      e.preventDefault();
      showAlert("Please sign in to access your orders", "warning");
      setTimeout(() => {
        router.push("/sign-in");
      }, 2000);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      showAlert("Logged out successfully", "success");
      router.push("/");
    } catch (error) {
      showAlert("Error logging out", "error");
    }
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement>, isMobile: boolean = false) => {
    // Fallback to static logo if video fails to load
    const target = e.target as HTMLVideoElement;
    const img = document.createElement('img');
    img.src = '/logo.png';
    img.alt = 'Nuvante Logo';
    img.width = 85;
    img.height = 85;
    img.className = 'p-1 md:w-[95px] md:h-[95px] object-contain cursor-pointer';
    img.onclick = () => { window.location.href = "/"; };
    target.parentNode?.replaceChild(img, target);
  };

  const handleLogoClick = () => {
    window.location.href = "/";
  };

  return (
    <>
      <div
        className={`navbar_wrapper navbar_main pb-1 w-full ${
          open ? "h-[420px]" : "h-[100px]"
        } lg:overflow-visible lg:flex overflow-y-hidden hidden relative transition-all duration-300 ease-out`}
      >
        <div className="flex font-bold uppercase lg:justify-between justify-start lg:flex-row flex-col lg:items-center mt-4 navbar w-[90%] mx-auto">
          <div
            className="navbar-brand flex items-center cursor-pointer w-fit"
            onClick={handleLogoClick}
          >
            <video
              ref={desktopVideoRef}
              src={animated_logo}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              disablePictureInPicture
              controls={false}
              width={85}
              height={85}
              className="p-1 md:w-[95px] md:h-[95px] object-contain cursor-pointer"
              style={{ 
                pointerEvents: 'none',
                WebkitBackfaceVisibility: 'hidden'
              } as React.CSSProperties}
              onError={handleVideoError}
              onLoadedData={() => {
                // Ensure video plays when loaded
                if (desktopVideoRef.current) {
                  desktopVideoRef.current.play().catch(() => {
                    // Autoplay prevented, will play on user interaction
                  });
                }
              }}
            />
          </div>
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-600 hover:text-[#DB4444] transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>
          
          <div className="flex lg:flex-row items-center gap-4">
            <Link href="/Wishlist" className="hidden lg:flex items-center gap-2" onClick={handleWishlistClick}>
              <Heart className="h-6 w-6" />
              <span className="text-sm font-medium lg:hidden">Wishlist</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/Cart" onClick={handleCartClick}>
                <ShoppingCart className="h-6 w-6" />
              </Link>
              <Link href="/orders" className="hidden lg:flex" onClick={handleOrdersClick}>
                <Package className="h-6 w-6" />
              </Link>
              <Link href="/Profile" onClick={handleProfileClick}>
                <UserIcon className="h-6 w-6" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`navbar_responsive lg:hidden flex flex-col py-3 relative transition-all duration-200 ease-out ${
          open ? 'pb-6' : ''
        }`}
      >
        <div className="flex justify-between items-center px-4">
          <div
            onClick={handleNavbar}
            className="hamburger_responsive lg:hidden flex-col gap-1 cursor-pointer flex p-2"
          >
            <div className={`line w-5 h-[2px] bg-black transition-transform duration-100 ${open ? 'rotate-45 translate-y-1.5' : ''}`}></div>
            <div className={`line w-5 h-[2px] bg-black transition-opacity duration-100 ${open ? 'opacity-0' : ''}`}></div>
            <div className={`line w-5 h-[2px] bg-black transition-transform duration-100 ${open ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
          </div>
          <div
            className="navbar-brand flex items-center cursor-pointer w-fit"
            onClick={handleLogoClick}
          >
            <video
              ref={mobileVideoRef}
              src={animated_logo}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              disablePictureInPicture
              controls={false}
              width={85}
              height={85}
              className="p-1 md:w-[95px] md:h-[95px] object-contain cursor-pointer"
              style={{ 
                pointerEvents: 'none',
                WebkitBackfaceVisibility: 'hidden'
              } as React.CSSProperties}
              onError={(e) => handleVideoError(e, true)}
              onLoadedData={() => {
                // Ensure video plays when loaded
                if (mobileVideoRef.current) {
                  mobileVideoRef.current.play().catch(() => {
                    // Autoplay prevented, will play on user interaction
                  });
                }
              }}
            />
          </div>
          <div className="flex items-center gap-4">
            <Link href="/Cart" className="text-gray-600 hover:text-[#DB4444]" onClick={handleCartClick}>
              <ShoppingCart className="h-6 w-6" />
            </Link>
            <Link href="/Profile" className="text-gray-600 hover:text-[#DB4444]" onClick={handleProfileClick}>
              <UserIcon className="h-6 w-6" />
            </Link>
          </div>
        </div>
        
        {/* Menu Items Container - Inline menu that pushes content down */}
        {open && (
          <div 
            className="bg-white border-t border-gray-200 shadow-sm animate-fade-in-up"
          >
            <div className="px-4 py-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  {navigation.slice(0, 2).map((item) => (
                    <Link 
                      key={item.name}
                      href={item.href} 
                      className="block hover:text-[#DB4444] transition-colors"
                      onClick={() => setOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                  <Link 
                    href="/Wishlist" 
                    className="block hover:text-[#DB4444] transition-colors"
                    onClick={(e) => {
                      handleWishlistClick(e);
                      setOpen(false);
                    }}
                  >
                    Wishlist
                  </Link>
                </div>
                <div className="space-y-4">
                  {navigation.slice(2).map((item) => (
                    <Link 
                      key={item.name}
                      href={item.href} 
                      className="block hover:text-[#DB4444] transition-colors"
                      onClick={() => setOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                  <Link 
                    href="/orders" 
                    className="block hover:text-[#DB4444] transition-colors"
                    onClick={(e) => {
                      handleOrdersClick(e);
                      setOpen(false);
                    }}
                  >
                    Orders
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}