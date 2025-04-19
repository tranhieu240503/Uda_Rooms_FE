import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import styles from "./App.module.scss"; // Import SCSS module
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // Import FontAwesomeIcon
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons"; // Import biểu tượng
import TinhNang1 from "./Tinhnang1/Tinhnang1"; // Đảm bảo tên thư mục và file chính xác
import TinhNang2 from "./Tinhnang2/Tinhnang2"; // Đảm bảo tên thư mục và file chính xác
import TinhNang3 from "./Tinhnang3/TinhNang3"; // Đảm bảo tên thư mục và file chính xác
import TinhNang4 from "./Tinhnang4/TinhNang4"; // Đảm bảo tên thư mục và file chính xác
import TinhNang5 from "./Tinhnang5/TinhNang5";

// Hàm xử lý sự kiện quay lại



const App = () => {
  const [activeFeature, setActiveFeature] = useState(1);
  const navigate = useNavigate();
  return (
    <div className={styles["uda-container"]}>
      {/* Header */}
      <header className={styles["uda-header"]}>
        <div   className={styles["uda-logo"]}    onClick={() => navigate("/")}>
          <img
            src="./images/UDA_Logo.png"
            alt="Logo"
            className={styles["uda-logo-image"]}
          />

        <h1 className={styles["uda-title"]}> UDA MAP</h1>
          </div>


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
        {/* Nút quay lại trang người dùng */}
        <button
          onClick={() => navigate("/")}
          className={styles["uda-back-button"]}
        >
          <FontAwesomeIcon icon={faArrowLeft} style={{ marginRight: "8px" }} />
          Quay lại
        </button>
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
