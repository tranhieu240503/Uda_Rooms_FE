import React, { useEffect, useState, useContext } from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import axios from "axios";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";
import { ModalContext } from "../../App";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCamera,
  faChevronDown,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
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
    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
      const { showModal } = useContext(ModalContext);
      const [isConfirmDeleteImageVisible, setIsConfirmDeleteImageVisible] = useState(false); // Hiển thị ConfirmModal
      const [imageToDelete, setImageToDelete] = useState(null);
  const [formDataSend, setFormDataSend] = useState({});
  const [datatiennghifull, setdatatiennghifull] = useState([]);
  const [datatthongtinthem, setdatatthongtinthem] = useState([]);
  const [images, setImages] = useState([]);
  const [activeTab, setActiveTab] = useState("thongtintro");
  const [roomStatus, setRoomStatus] = useState(true); // true -> Còn phòng, false -> Hết phòng
  const [selectedImages, setSelectedImages] = useState([]);
  const API_URL = process.env.REACT_APP_API_URL;
  const toggleStatus = () => {
    setFormDataSend((prevState) => ({
      ...prevState,
      conPhong: !prevState.conPhong,  // Chuyển đổi trạng thái
    }));
  };
  useEffect(() => {
    if (!onFix) return;
    const getRoom = async () => {
      try {
        const response = await getHouseDetail(onFix);
        const datatiennghi = await fetchTienNghi();
        const datathongtinthem = await fetchThongTinThem();
        const hinhanh = await fetchImage(onFix);
        console.log(hinhanh)
        setImages(hinhanh);
        setFormDataSend({
          tenNhaTro: response.data.tenNhaTro || "",
          diaChi: response.data.diaChi || "",
          tenChuNha: response.data.tenChuNha || "",
          sdt: response.data.sdt || "",
          giaMax: response.data.giaMax || "",
          giaMin: response.data.giaMin || "",
          tienDien: response.data.tienDien || "",
          tienNuoc: response.data.tienNuoc || "",
          conPhong: response.data.conPhong || "",
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

//them anh
  const handleImageChange = (event) => {
    const files = Array.from(event.target.files); // Lấy danh sách ảnh được chọn
    // Kiểm tra nếu tổng số hình ảnh vượt quá 6
    if (selectedImages.length + files.length > 6) {
      showModal(
        "Cảnh báo!",
        "Bạn chỉ được tải lên tối đa 6 hình ảnh.",
        "warning"
      );
      return;
    }
    setSelectedImages((prevImages) => [...prevImages, ...files]); // Thêm vào state
  };
//xóa
  const handleDeleteImage1 = (index) => {
    setSelectedImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const formatCurrency = (value) => {
    if (!value) return ""; // Nếu giá trị rỗng, trả về chuỗi rỗng
    const numericValue = value.toString().replace(/[^0-9]/g, ""); // Loại bỏ ký tự không phải số
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, "."); // Thêm dấu chấm mỗi 3 chữ số
  };

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

  const handleDeleteImageClick = (imageId) => {
    setImageToDelete(imageId); // Lưu thông tin hình ảnh cần xóa
    setIsConfirmDeleteImageVisible(true); // Hiển thị ConfirmModal
  };

  const handleConfirmDeleteImage = async () => {
    try {
      if (imageToDelete) {
        await DeleteImage(onFix, imageToDelete); // Gọi API xóa hình ảnh
        const hinhanh = await fetchImage(onFix); // Lấy danh sách hình ảnh mới
        setImages(hinhanh);
      }
    } catch (error) {
      console.error("Lỗi xóa ảnh:", error);
    } finally {
      setIsConfirmDeleteImageVisible(false); // Đóng ConfirmModal
      setImageToDelete(null); // Xóa thông tin hình ảnh đã lưu
    }
  };

  const handleCancelDeleteImage = () => {
    setIsConfirmDeleteImageVisible(false); // Đóng ConfirmModal
    setImageToDelete(null); // Xóa thông tin hình ảnh đã lưu
  };

  const handleSubmitImage = async () => {
    try {
      // Tải hình ảnh lên server
      const formData = new FormData();
      selectedImages.forEach((image) => {
        if (!(image instanceof File)) {
          console.error("Dữ liệu không hợp lệ:", image);
          return;
        }
        formData.append("images", image);
      });
      formData.append("nhaTroId",onFix);
      // Gửi hình ảnh lên server
      console.log(formData)
      const uploadResponse = await axios.post(
        `${API_URL}/api/upload-multiple`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
  
      const hinhanh = await fetchImage(onFix);

      setImages(hinhanh );
      // Gửi dữ liệu khác lên server
      console.log("Dữ liệu gửi đi:", formDataSend);
      showModal("Thêm hình ảnh thành công")
      setSelectedImages([]);
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
      showModal("Thêm hình ảnh thất bại","Hãy chọn ảnh mà bạn muốn thêm", "error")
    }
  }

  const handleSubmit = async () => {
    try {
      // Gửi dữ liệu khác lên server
      console.log("Dữ liệu gửi đi:", formDataSend);
      await customroom(onFix, formDataSend);
      showModal("Cập nhật thông tin trọ thành công!")
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
      showModal("Cập nhật thông tin trọ thất bại","Lỗi", "error")

    }
  };

  return (
    <div className={styles["chinhsuachitiet-edit-container"]}>
      <div className={styles["chinhsuachitiet-edit-info"]}>
        <h2 className={styles["chinhsuachitiet-title"]}>Chỉnh sửa chi tiết</h2>
        <div className={styles["chinhsuachitiet-tabs"]}>
          <button
            className={`${styles.tab} ${activeTab === "thongtintro" ? styles.active : ""
              }`}
            onClick={() => setActiveTab("thongtintro")}
          >
            Thông tin trọ
          </button>
          <button
            className={`${styles.tab} ${activeTab === "chutro" ? styles.active : ""
              }`}
            onClick={() => setActiveTab("chutro")}
          >
            Chủ trọ
          </button>
          <button
            className={`${styles.tab} ${activeTab === "tiennghi" ? styles.active : ""
              }`}
            onClick={() => setActiveTab("tiennghi")}
          >
            Tiện nghi
          </button>
          <button
            className={`${styles.tab} ${activeTab === "thongtinthem" ? styles.active : ""
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
            <div className={styles["chinhsuachitiet-form-group"]}>
              <label className={styles["text_label"]}>Giá max:</label>
              <input
                type="text"
                name="giaMax"
                value={formatCurrency(formDataSend.giaMax || "")} // Áp dụng formatCurrency
                onChange={(e) =>
                  setFormDataSend((prev) => ({
                    ...prev,
                    giaMax: e.target.value.replace(/\./g, ""), // Loại bỏ dấu chấm trước khi lưu
                  }))
                }
              />
            </div>
            <div className={styles["chinhsuachitiet-form-group"]}>
              <label className={styles["text_label"]}>Giá min:</label>
              <input
                type="text"
                name="giaMin"
                value={formatCurrency(formDataSend.giaMin || "")} // Áp dụng formatCurrency
                onChange={(e) =>
                  setFormDataSend((prev) => ({
                    ...prev,
                    giaMin: e.target.value.replace(/\./g, ""), // Loại bỏ dấu chấm trước khi lưu
                  }))
                }
              />
            </div>
            <div className={styles["chinhsuachitiet-form-group"]}>
              <label className={styles["text_label"]}>Giá điện:</label>
              <input
                type="text"
                name="tienDien"
                value={formatCurrency(formDataSend.tienDien || "")} // Áp dụng formatCurrency
                onChange={(e) =>
                  setFormDataSend((prev) => ({
                    ...prev,
                    tienDien: e.target.value.replace(/\./g, ""), // Loại bỏ dấu chấm trước khi lưu
                  }))
                }
              />
            </div>
            <div className={styles["chinhsuachitiet-form-group"]}>
              <label className={styles["text_label"]}>Giá nước:</label>
              <input
                type="text"
                name="tienNuoc"
                value={formatCurrency(formDataSend.tienNuoc || "")} // Áp dụng formatCurrency
                onChange={(e) =>
                  setFormDataSend((prev) => ({
                    ...prev,
                    tienNuoc: e.target.value.replace(/\./g, ""), // Loại bỏ dấu chấm trước khi lưu
                  }))
                }
              />
            </div>
            <div className={styles["chinhsuachitiet-form-group"]}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <label className={styles["text_label"]}>Tình Trạng: </label>
                <span
                  className={styles[`${formDataSend.conPhong ? 'available' : 'unavailable'}`]}
                  
                  onClick={toggleStatus}
                >
                  {formDataSend.conPhong ? 'Còn phòng' : 'Hết phòng'}
                </span>
              </div>
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
                    onClick={() => handleDeleteImageClick(img.filename)}
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

        {isConfirmDeleteImageVisible && (
        <ConfirmModal
          title="Xác nhận xóa"
          message="Bạn có chắc chắn muốn xóa hình ảnh này?"
          onConfirm={handleConfirmDeleteImage}
          onCancel={handleCancelDeleteImage}
        />
      )}

         <div className={styles["form_group"]}>
                  <label className={styles["file-input-label"]}>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className={styles["form_input", "file-input"]}
                      onChange={handleImageChange}
                    />
                    <span className={styles["file-input-text"]}>
                      Thêm ảnh phòng trọ
                      <FontAwesomeIcon icon={faCamera} />
                    </span>
                  </label>
        
                  {/* Hiển thị ảnh đã chọn */}
                  <div className={styles["preview-container"]}>
                    {selectedImages.length > 0 &&
                      selectedImages.map((image, index) => {
                        const imageUrl = URL.createObjectURL(image);
                        return (
                          <div key={index} className={styles["preview-item"]}>
                            <img
                              src={imageUrl}
                              alt={`preview-${index}`}
                              className={styles["preview-image"]}
                              onLoad={() => URL.revokeObjectURL(imageUrl)} // Giải phóng bộ nhớ sau khi tải ảnh
                            />
                            <button
                              type="button"
                              className={styles["delete-button"]}
                              onClick={() => handleDeleteImage1(index)}
                            >
                              ✖
                            </button>
                          </div>
                        );
                      })}
                  </div>
          </div>
          <button className={styles["update-btn"]} onClick={handleSubmitImage}>
          Cập nhật
        </button>
      </div>
    </div>
  );
};

export default Chinhsuachitiet;
