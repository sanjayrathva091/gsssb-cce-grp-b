"use client";
import styles from "./page.module.css";

export default function Home() {
  const handleSubmit = (event) => {
    event.preventDefault();
    const fileInput = event.target.querySelector('input[type="file"]');
    const file = fileInput.files[0];
    console.log("File selected:", file);
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      console.log("File ready to upload:", file.name);
      // ✅ Add your fetch/axios logic here to upload to backend
    }
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to GSSSB CCE Group B!
        </h1>

        <form onSubmit={handleSubmit}>
          <input type="file" name="file" />
          <button type="submit">Upload</button>
        </form>
      </main>

      <footer className={styles.footer}></footer>
    </div>
  );
}
