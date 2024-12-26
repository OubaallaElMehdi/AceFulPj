import Link from 'next/link';

const AuthHeader = () => {
  return (
    <header style={styles.header}>
      <div style={styles.logo}>
        <h1>My Website</h1>
      </div>
      <nav style={styles.nav}>
        <Link href="/" style={styles.link}>
          Home
        </Link>
        <Link href="/auth/login" style={styles.link}>
          Login
        </Link>
        <Link href="/auth/register" style={styles.link}>
          Register
        </Link>
      </nav>
    </header>
  );
};

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 20px',
    backgroundColor: '#333',
    color: '#fff',
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  nav: {
    display: 'flex',
    gap: '15px',
  },
  link: {
    color: '#fff',
    textDecoration: 'none',
    fontSize: '1rem',
  },
};

export default AuthHeader;
