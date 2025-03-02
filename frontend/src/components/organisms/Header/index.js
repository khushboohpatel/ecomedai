"use client";
import Link from 'next/link';
import "./Header.css";
import { usePathname } from 'next/navigation';

export const Header = () => {
  const pathname = usePathname();

  return (
    <header className='mainHeader'>
      <div className="headLogo">
        <Link href="/">
          <img src="/assets/images/logo.png" alt="logo" />
        </Link>
      </div>
      <ul className="headMenu">
        <li>
          <Link 
            href="/Procurement" 
            className={pathname === "/Procurement" ? "active" : ""}
          >
            Procurement
          </Link>
        </li>
        <li>
          <Link 
            href="/SustainableCoach" 
            className={pathname === "/SustainableCoach" ? "active" : ""}
          >
            Sustainable Coach
          </Link>
        </li>
      </ul>
    </header>
  );
};

