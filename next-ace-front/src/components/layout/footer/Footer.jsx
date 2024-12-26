
const Footer = () => {
    const currentYear = new Date().getFullYear();
  
    return (
      <footer style={styles.footer}>
        <p style={styles.text}>
          &copy; {currentYear} My Website. All rights reserved.
        </p>
      </footer>
    );
  };
  
  const styles = {
    footer: {
      background: "#333",
      color: "#fff",
      textAlign: "center",
      padding: "10px 20px",
      position: "fixed",
      bottom: 0,
      width: "100%",
    },
    text: {
      margin: 0,
      fontSize: "14px",
    },
  };
  
  export default Footer;
  