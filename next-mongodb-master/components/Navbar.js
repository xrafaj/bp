import Link from 'next/link';

const Navbar = () => (
    <nav className="navbar">
        <Link href="/">
            <a className="navbar-brand">Game App</a>
        </Link>
        <Link href="/new">
            <a className="create">Create game  by clicking here</a>
        </Link>
    </nav>
)

export default Navbar;