import Link from 'next/link'
import "./Header.css"

export const Header = () => {
  return (
    <header className='mainHeader'>
      <div className="headLogo">
        <img src="/assets/images/logo.png" alt="logo" />
      </div>
      <ul className="headMenu">
        <li>
          <Link href="#">Procurement</Link>
        </li>
        <li>
          <Link href="#">Sustainable Coach</Link>
        </li>
        </ul>
    </header>
  );
}

