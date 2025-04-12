import React, { useState } from "react";
import styles from "./App.module.scss"; // Import SCSS module
import TinhNang1 from "./Tinhnang1/Tinhnang1"; // Đảm bảo tên thư mục và file chính xác
import TinhNang2 from "./Tinhnang2/Tinhnang2"; // Đảm bảo tên thư mục và file chính xác
import TinhNang3 from "./Tinhnang3/TinhNang3"; // Đảm bảo tên thư mục và file chính xác
import TinhNang4 from "./Tinhnang4/TinhNang4"; // Đảm bảo tên thư mục và file chính xác
import TinhNang5 from "./Tinhnang5/TinhNang5";

const App = () => {
  const [activeFeature, setActiveFeature] = useState(1);

  return (
    <div className={styles["uda-container"]}>
      {/* Header */}
      <header className={styles["uda-header"]}>
        <h1 className={styles["uda-title"]}> UDA MAP</h1>

        <nav className={styles["uda-sidebar"]}>
          <button
            onClick={() => setActiveFeature(1)}
            className={`${styles["uda-nav-item"]} ${
              activeFeature === 1 ? styles["active"] : ""
            }`}
          >
            Quản lý nhà trọ
          </button>
          <button
            onClick={() => setActiveFeature(2)}
            className={`${styles["uda-nav-item"]} ${
              activeFeature === 2 ? styles["active"] : ""
            }`}
          >
            Quản lý tiện nghi
          </button>
          <button
            onClick={() => setActiveFeature(3)}
            className={`${styles["uda-nav-item"]} ${
              activeFeature === 3 ? styles["active"] : ""
            }`}
          >
            Quản lý tiện ích
          </button>
          <button
            onClick={() => setActiveFeature(4)}
            className={`${styles["uda-nav-item"]} ${
              activeFeature === 4 ? styles["active"] : ""
            }`}
          >
            Quản lý diễn đàn
          </button>
          <button
            onClick={() => setActiveFeature(5)}
            className={`${styles["uda-nav-item"]} ${
              activeFeature === 5 ? styles["active"] : ""
            }`}
          >
            Quản lý người dùng
          </button>
        </nav>
      </header>

      {/* Layout chính */}
      <div className={styles["uda-main"]}>
        {/* Sidebar */}

        {/* Nội dung chính */}
        <main className={styles["uda-content"]}>
          {activeFeature === 1 && <TinhNang1 />}
          {activeFeature === 2 && <TinhNang2 />}
          {activeFeature === 3 && <TinhNang3 />}
          {activeFeature === 4 && <TinhNang4 />}
          {activeFeature === 5 && <TinhNang5 />}
        </main>
      </div>
    </div>
  );
};

export default App;
