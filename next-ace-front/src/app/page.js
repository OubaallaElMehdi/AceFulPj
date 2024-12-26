import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <h1>hello world</h1>
      <Link href="/auth/login">
        <button className={styles.startButton}>
          Let's Start
        </button>
      </Link>
    </div>
  );
}
