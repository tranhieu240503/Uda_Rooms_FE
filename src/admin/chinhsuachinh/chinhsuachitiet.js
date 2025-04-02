import React, { useEffect, useState } from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import {
  customroom,
  DeleteImage,
  fetchImage,
  fetchThongTinThem,
  fetchTienNghi,
  getHouseDetail,
} from "../../services/api";
import styles from "./chinhsuachitiet.module.scss"; // Import SCSS module

const Chinhsuachitiet = ({ onFix }) => {
  const [formDataSend, setFormDataSend] = useState({});
  const [datatiennghifull, setdatatiennghifull] = useState([]);
  const [datatthongtinthem, setdatatthongtinthem] = useState([]);
  const [images, setImages] = useState([]);
  const [activeTab, setActiveTab] = useState("thongtintro");

  useEffect(() => {
    if (!onFix) return;
    const getRoom = async () => {
      try {
        const response = await getHouseDetail(onFix);
        const datatiennghi = await fetchTienNghi();
        const datathongtinthem = await fetchThongTinThem();
        const hinhanh = await fetchImage(onFix);
        setImages(hinhanh);
        setFormDataSend({
          tenNhaTro: response.data.tenNhaTro || "",
          diaChi: response.data.diaChi || "",
          tenChuNha: response.data.tenChuNha || "",
          sdt: response.data.sdt || "",
          thongTinThem: response.data.thongTinThem || [],
          TienNghis: response.data.TienNghis?.map((tn) => tn.id) || [],
        });
        setdatatiennghifull(datatiennghi);
        setdatatthongtinthem(datathongtinthem);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      }
    };
    getRoom();
  }, [onFix]);

  const handleChange = (e) => {
    setFormDataSend((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleTienNghiChange = (id, isChecked) => {
    setFormDataSend((prev) => ({
      ...prev,
      TienNghis: isChecked
        ? [...(prev.TienNghis || []), id]
        : prev.TienNghis?.filter((tid) => tid !== id),
    }));
  };

  const handleThongTinThemChange = (id, isChecked) => {
    setFormDataSend((prev) => ({
      ...prev,
      thongTinThem: isChecked
        ? [...(prev.thongTinThem || []), id]
        : prev.thongTinThem?.filter((tid) => tid !== id),
    }));
  };

  const handleDeleteImage = async (imageId) => {
    try {
      await DeleteImage(imageId);
      setImages(images.filter((img) => img.id !== imageId));
    } catch (error) {
      console.error("Lỗi xóa ảnh:", error);
    }
  };

  const handleSubmit = async () => {
    try {
      console.log("Dữ liệu gửi đi:", formDataSend);
      await customroom(onFix, formDataSend);
      alert("Cập nhật thành công!");
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
      alert("Cập nhật thất bại!");
    }
  };

  return (
    <div className={styles["chinhsuachitiet-edit-container"]}>
      <div className={styles["chinhsuachitiet-edit-info"]}>
        <h2 className={styles["chinhsuachitiet-title"]}>Chỉnh sửa chi tiết</h2>
        <div className={styles["chinhsuachitiet-tabs"]}>
          <button
            className={`${styles.tab} ${
              activeTab === "thongtintro" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("thongtintro")}
          >
            Thông tin trọ
          </button>
          <button
            className={`${styles.tab} ${
              activeTab === "chutro" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("chutro")}
          >
            Chủ trọ
          </button>
          <button
            className={`${styles.tab} ${
              activeTab === "tiennghi" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("tiennghi")}
          >
            Tiện nghi
          </button>
          <button
            className={`${styles.tab} ${
              activeTab === "thongtinthem" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("thongtinthem")}
          >
            Thông tin thêm
          </button>
        </div>
        <div className={styles.separator}></div>
        {activeTab === "thongtintro" && (
          <>
            <div className={styles["chinhsuachitiet-form-group"]}>
              <label className={styles["text_label"]}>Tên nhà trọ:</label>
              <input
                type="text"
                name="tenNhaTro"
                value={formDataSend.tenNhaTro || ""}
                onChange={handleChange}
              />
            </div>
            <div className={styles["chinhsuachitiet-form-group"]}>
              <label className={styles["text_label"]}>Địa chỉ:</label>
              <input
                type="text"
                name="diaChi"
                value={formDataSend.diaChi || ""}
                onChange={handleChange}
              />
            </div>
          </>
        )}
        {activeTab === "chutro" && (
          <>
            <div className={styles["chinhsuachitiet-form-group"]}>
              <label className={styles["text_label"]}>Chủ trọ:</label>
              <input
                type="text"
                name="tenChuNha"
                value={formDataSend.tenChuNha || ""}
                onChange={handleChange}
              />
            </div>
            <div className={styles["chinhsuachitiet-form-group"]}>
              <label className={styles["text_label"]}>Số điện thoại:</label>
              <input
                type="text"
                name="sdt"
                value={formDataSend.sdt || ""}
                onChange={handleChange}
              />
            </div>
          </>
        )}
        {activeTab === "tiennghi" && (
          <>
            <div className={styles["tiennghi-container"]}>
              {datatiennghifull.map((item) => (
                <div key={item.id} className={styles["tiennghi-item"]}>
                  <input
                    type="checkbox"
                    checked={formDataSend.TienNghis?.includes(item.id)}
                    onChange={(e) =>
                      handleTienNghiChange(item.id, e.target.checked)
                    }
                  />
                  <label className={styles["chinhsuachitiet-text"]}>
                    {item.tenTienNghi}
                  </label>
                </div>
              ))}
            </div>
          </>
        )}
        {activeTab === "thongtinthem" && (
          <>
            <div className={styles["thongtinthem-container"]}>
              {datatthongtinthem.map((item) => (
                <div key={item.id} className={styles["thongtinthem-item"]}>
                  <input
                    type="checkbox"
                    checked={formDataSend.thongTinThem?.includes(item.id)}
                    onChange={(e) =>
                      handleThongTinThemChange(item.id, e.target.checked)
                    }
                  />
                  <label className={styles["chinhsuachitiet-form-group"]}>
                    {item.thongTinThem}
                  </label>
                </div>
              ))}
            </div>
          </>
        )}
        <button className={styles["update-btn"]} onClick={handleSubmit}>
          Cập nhật
        </button>
      </div>
      <div className={styles["chinhsuachitiet-edit-images"]}>
        <h2 className={styles["chinhsuachitiet-title"]}>Chỉnh sửa hình ảnh</h2>
        <div className={styles["chinhsuachitiet-image-gallery"]}>
          {images.length > 0 ? (
            <Carousel
              showThumbs={false}
              infiniteLoop
              autoPlay
              showArrows={true}
            >
              {images.map((img, index) => (
                <div key={index} className={styles["image-container"]}>
                  <img src={img.url} alt={`Hình ảnh ${index + 1}`} />
                  <button
                    className={styles["delete-btn"]}
                    onClick={() => handleDeleteImage(img.id)}
                  >
                    Xóa
                  </button>
                </div>
              ))}
            </Carousel>
          ) : (
            <p className={styles["chinhsuachitiet-no-images"]}>
              Không có hình ảnh
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chinhsuachitiet;
