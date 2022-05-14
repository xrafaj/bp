import Link from 'next/link';

const Navbar = () => (
    <nav className="navbar" style={{background: '#16191e'}}>
        <Link href="/">
            <a className="navbar-brand">BPRafaj</a>
        </Link>

        

    </nav>
)

export default Navbar;

/*

        <Link href="/new">
            <a className="create">Create game  by clicking here</a>
        </Link>

*/