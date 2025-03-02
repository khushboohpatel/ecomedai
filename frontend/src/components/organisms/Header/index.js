import Link from 'next/link'
import "./Header.css"

export const Header = () => {
  return (
    <header className='mainHeader'>
      <div className="headLogo">
        <Link href="/">
        <img src="/assets/images/logo.png" alt="logo" />
        </Link>
      </div>
      <ul className="headMenu">
        <li>
          <Link href="#">Procurement</Link>
        </li>
        <li>
          <Link href="/SustainableCoach">Sustainable Coach</Link>
        </li>
        </ul>
    </header>
  );
}

