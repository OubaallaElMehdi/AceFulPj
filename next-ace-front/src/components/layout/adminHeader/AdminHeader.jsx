import Link from "next/link";
import styles from "./Header.module.css";

export default function AdminHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <Link href="/">
          <h1>My App</h1>
        </Link>
      </div>
      <nav className={styles.nav}>
        <Link href="/admin/contact">
          <button className={styles.navButton}>contact</button>
        </Link>
        <Link href="/admin/home">
          <button className={styles.navButton}>home</button>
        </Link>
        <Link href="/">
          <button className={styles.navButton}>logout</button>
        </Link>
      </nav>
    </header>
  );
}
