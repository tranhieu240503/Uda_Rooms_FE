import React, { useEffect, useState } from "react";
import { Carousel } from "react-responsive-carousel";
import {
  deletePost,
  fetchPostAll,
  handleDuyetPostAPI,
} from "../../services/api";
import styles from "./TinhNang4.module.scss"; // Import SCSS module
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal"; // Import ConfirmModal

const truncateText = (text, maxLength) => {
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
};

const TinhNang4 = () => {
  const [locations, setLocations] = useState([]);
  const [onfix, setOnFix] = useState("");
  const [statusFix, setStatusFix] = useState("all");
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [selectedId, setSelectedId] = useState(""); // State lưu ID tiện ích
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [locationToDelete, setLocationToDelete] = useState(null); // Lưu ID cần xóa
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false); // Hiển thị ConfirmModal

  const [activeButton, setActiveButton] = useState("all");
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const getData = async () => {
      const data = await fetchPostAll();
      setLocations(data);
      setFilteredLocations(data);
    };
    getData();
  }, []);

  const handleDuyet = async (id) => {
    try {
      const response = await handleDuyetPostAPI(id);
      if (response && response.status === 200) {
        let updatedLocations = await fetchPostAll();
        setLocations(updatedLocations);

        if (activeButton !== "all") {
          updatedLocations = updatedLocations.filter(
            (loc) => loc.status === (activeButton === "approved")
          );
        }
        if (selectedId !== "") {
          updatedLocations = updatedLocations.filter(
            (loc) => loc.loaiPost === selectedId
          );
        }
        setFilteredLocations(updatedLocations);
      }
    } catch (error) {
      console.error("Lỗi khi duyệt hoặc hủy duyệt nhà trọ:", error);
    }
  };

  // const xoaNhaTro = async (id) => {
  //   if (!window.confirm("Bạn có chắc chắn muốn xóa trọ này này?")) return;

  //   try {
  //     const response = await deletePost(id);
  //     if (response && response.status === 200) {
  //       let updatedLocations = await fetchPostAll();
  //       setLocations(updatedLocations);

  //       if (activeButton !== "all") {
  //         updatedLocations = updatedLocations.filter(
  //           (loc) => loc.status === (activeButton === "approved")
  //         );
  //       }
  //       if (selectedId !== "") {
  //         updatedLocations = updatedLocations.filter(
  //           (loc) => loc.loaiPost === selectedId
  //         );
  //       }
  //       setFilteredLocations(updatedLocations);
  //     }
  //   } catch (error) {
  //     console.error("Lỗi khi xóa:", error);
  //   }
  // };


  const xoaNhaTro = (id) => {
    setLocationToDelete(id); // Lưu ID nhà trọ cần xóa
    setIsConfirmModalVisible(true); // Hiển thị ConfirmModal
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await deletePost(locationToDelete);
      if (response && response.status === 200) {
        let updatedLocations = await fetchPostAll();
        setLocations(updatedLocations);

        if (activeButton !== "all") {
          updatedLocations = updatedLocations.filter(
            (loc) => loc.status === (activeButton === "approved")
          );
        }
        if (selectedId !== "") {
          updatedLocations = updatedLocations.filter(
            (loc) => loc.loaiPost === selectedId
          );
        }
        setFilteredLocations(updatedLocations);
      }
    } catch (error) {
      console.error("Lỗi khi xóa:", error);
    } finally {
      setIsConfirmModalVisible(false); // Đóng ConfirmModal
      setLocationToDelete(null); // Xóa ID đã lưu
    }
  };

  const handleCancelDelete = () => {
    setIsConfirmModalVisible(false); // Đóng ConfirmModal
    setLocationToDelete(null); // Xóa ID đã lưu
  };
  const handleHienChiTiet = (id) => {
    const postchitiet = locations.filter((location) => location.id === id);
    setOnFix(postchitiet[0]);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false); // Ẩn modal
    setOnFix(null); // Xóa dữ liệu chi tiết
  };

  const handleButtonClick = (filter, event) => {
    setActiveButton(filter);
    if (filter === "all") {
      setFilteredLocations(locations);
      setSelectedId("");
    } else {
      setFilteredLocations(
        locations.filter(
          (loc) => loc.status === (filter === "approved" ? true : false)
        )
      );
      setSelectedId("");
    }
  };

  const handleChange = (event) => {
    const findid = event.target.value;
    console.log(findid);
    setSelectedId(findid);

    let filtered = locations;

    if (activeButton !== "all") {
      filtered = filtered.filter(
        (loc) => loc.status === (activeButton === "approved")
      );
    }
    if (findid !== "") {
      filtered = filtered.filter((loc) => loc.loaiPost === findid);
    }

    setFilteredLocations(filtered);
  };

  return (
    <div className={styles["uda-tinhnang1"]}>
      <div className={styles["thanh-menu-ngang"]}>
        <div className={styles["menu-buttons"]}>
          <button
            className={activeButton === "all" ? styles["active"] : ""}
            onClick={() => handleButtonClick("all")}
          >
            Tất cả({locations.length})
          </button>
          <button
            className={activeButton === "approved" ? styles["active"] : ""}
            onClick={() => handleButtonClick("approved")}
          >
            Đã duyệt({locations.filter((loc) => loc.status === true).length})
          </button>
          <button
            className={activeButton === "pending" ? styles["active"] : ""}
            onClick={() => handleButtonClick("pending")}
          >
            Chưa duyệt({locations.filter((loc) => loc.status === false).length})
          </button>
        </div>
        <h1 className={styles["uda-tinhnang1-title"]}>DANH SÁCH BÀI VIẾT</h1>
      </div>
      <div className={styles["uda-tinhnang1-table-wrapper"]}>
        <table className={styles["uda-tinhnang1-table"]}>
          <thead>
            <tr>
              <th>Id</th>
              <th>Người đăng</th>
              <th>Nội dung</th>
              <th>Số lượng</th>
              <th>
                <div className={styles["select-wrapper"]}>
                  <select value={selectedId} onChange={handleChange}>
                    <option value="">Tất cả</option>
                    <option value="Tìm kiếm phòng trọ">Tìm kiếm</option>
                    <option value="Chia sẻ phòng trọ">Chia sẻ</option>
                  </select>
                </div>
              </th>
              <th>Thời gian</th>
              <th>Thay đổi</th>
            </tr>
          </thead>
          <tbody>
            {locations.length > 0 ? (
              filteredLocations.map((location,index) => (
                <tr key={location.id}>
                  <td>{index+1}</td>
                  <td>{location.author.fullname}</td>
                  <td>{truncateText(location.content, 90)}</td>
                  <td>{location.images.length} hình</td>
                  <td>{location.loaiPost}</td>
                  <td>
                    ngày{" "}
                    {new Date(location.updatedAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td>
                    <div className={styles["o-tuy-chinh-2"]}>
                      <button
                        className={`${styles["uda-tinhnang1-button"]} ${
                          location.status === false
                            ? styles["uda-success"]
                            : styles["uda-danger"]
                        }`}
                        onClick={() => handleDuyet(location.id)}
                      >
                        {location.status === false ? "Duyệt" : "Hủy"}
                      </button>
                      <button
                        className={`${styles["uda-tinhnang1-button"]} ${styles["uda-edit"]}`}
                        onClick={() => handleHienChiTiet(location.id)}
                      >
                        Chi tiết
                      </button>
                      <button
                        className={`${styles["uda-tinhnang1-button"]} ${styles["uda-delete"]}`}
                        onClick={() => xoaNhaTro(location.id)}
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">Không có dữ liệu</td>
              </tr>
            )}
          </tbody>
          {isConfirmModalVisible && (
        <ConfirmModal
          title="Xác nhận xóa"
          message="Bạn có chắc chắn muốn xóa bài đăng này?"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
        </table>
      </div>
      {isModalVisible && (
        <div className={styles["modal-overlay"]} onClick={handleCloseModal}>
          <div
            className={styles["modal-content"]}
            onClick={(e) => e.stopPropagation()} // Ngăn chặn sự kiện click lan ra ngoài
          >
            <button
              className={styles["modal-close"]}
              onClick={handleCloseModal}
            >
              ✖
            </button>
            <div className={styles["chinhsuachitiet4-form-group"]}>
              <label className={styles["tieudetinhnang4"]}>Nội dung:</label>
              <p>{onfix?.content}</p>
            </div>
            <div className={styles["chinhsuachitiet-image-gallery"]}>
              {onfix?.images?.length > 0 ? (
                <Carousel
                  showThumbs={false}
                  infiniteLoop
                  autoPlay
                  showArrows={true}
                >
                  {onfix.images.map((img, index) => (
                    <div key={index} className={styles["image-container"]}>
                      <img
                        src={`${API_URL}${img.image_url}`}
                        alt={`Hình ảnh ${index + 1}`}
                      />
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
      )}
    </div>
  );
};

export default TinhNang4;
