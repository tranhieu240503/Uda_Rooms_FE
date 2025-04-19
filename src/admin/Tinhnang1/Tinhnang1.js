import React, { useEffect, useState } from "react";
import {
  deleteNhaTro,
  fetchLocations,
  handleDuyetAPI,
} from "../../services/api";
import Chinhsuachitiet from "../chinhsuachitiet/chinhsuachitiet";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./Tinhnang1.module.scss"; // Import SCSS module
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN").format(amount);
};
const truncateText = (text, maxLength) => {
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
};
const TinhNang1 = () => {
  const [locations, setLocations] = useState([]);
  const [locationsFind, setLocationsFind] = useState([]);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState(null);
  const [onfix, setOnFix] = useState(null);
  const [statusFix, setStatusFix] = useState(false);
  const selectedLocation = locations.find((location) => location.id === onfix);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [selectedId, setSelectedId] = useState(""); // State lưu ID tiện ích

  const [activeButton, setActiveButton] = useState("all");

  useEffect(() => {
    const getData = async () => {
      const data = await fetchLocations();
      setLocations(data);
      setFilteredLocations(data);
    };
    getData();
  }, []);
  const handleDuyet = async (id) => {
    try {
      const response = await handleDuyetAPI(id);
      if (response && response.status === 200) {
        let updatedLocations = await fetchLocations();
        setLocations(updatedLocations);

        if (activeButton !== "all") {
          updatedLocations = updatedLocations.filter(
            (loc) => loc.trangThai === (activeButton === "approved" ? 1 : 0)
          );
        }
        if (selectedId !== "") {
          const booleanFindId = selectedId === "true" ? true : selectedId === "false" ? false : selectedId;

          updatedLocations = updatedLocations.filter((loc) => loc.conPhong === booleanFindId);

        }
        setFilteredLocations(updatedLocations);
      }
    } catch (error) {
      console.error("Lỗi khi duyệt hoặc hủy duyệt nhà trọ:", error);
    }
  };

  const handleSearch = (event) => {
    const term = event.target.value.toLowerCase();
    const filtered = locations.filter(loc =>
      loc.sdt.toLowerCase().includes(term) ||
      loc.diaChi.toLowerCase().includes(term)
    );

    console.log(filtered);
    setFilteredLocations(filtered);
  };

  const handleChange = (event) => {
    const findid = event.target.value;
    console.log(findid);
    setSelectedId(findid);

    let filtered = locations;

    if (activeButton !== "all") {
      filtered = filtered.filter(
        (loc) => loc.trangThai === (activeButton === "approved" ? 1 : 0)
      );
    }
    if (findid !== "") {
      // Kiểm tra xem findid có phải là "true" hoặc "false" không
      const booleanFindId = findid === "true" ? true : findid === "false" ? false : findid;

      // Lọc các locations theo giá trị boolean của loaiPost
      filtered = filtered.filter((loc) => loc.conPhong === booleanFindId);
    }

    setFilteredLocations(filtered);
  };

  //  const xoaNhaTro = async (id) => {
  //      if (!window.confirm("Bạn có chắc chắn muốn xóa trọ này này?")) return;

  //      try {
  //        const response = await deleteNhaTro(id);
  //        if (response && response.status === 200) {
  //          let updatedLocations = await fetchLocations();
  //          setLocations(updatedLocations);

  //          if (activeButton !== "all") {
  //            updatedLocations = updatedLocations.filter(
  //             (loc) => loc.trangThai === (activeButton === "approved" ? 1 : 0)
  //           );
  //          }
  //          if (selectedId !== "") {
  //           const booleanFindId = selectedId === "true" ? true : selectedId === "false" ? false : selectedId;

  //           updatedLocations = updatedLocations.filter((loc) => loc.conPhong === booleanFindId);
  //          }
  //          setFilteredLocations(updatedLocations);
  //        }
  //      } catch (error) {
  //        console.error("Lỗi khi xóa:", error);
  //      }
  //    };

  const xoaNhaTro = async (id) => {
    try {
      const response = await deleteNhaTro(id);
      if (response && response.status === 200) {
        let updatedLocations = await fetchLocations();
        setLocations(updatedLocations);
        setFilteredLocations(updatedLocations);
      }
    } catch (error) {
      console.error("Lỗi khi xóa:", error);
    }
  };

  const handleDeleteClick = (id) => {
    setLocationToDelete(id);
    setIsConfirmModalVisible(true); // Hiển thị ConfirmModal
  };

  const handleConfirmDelete = () => {
    if (locationToDelete) {
      xoaNhaTro(locationToDelete);
    }
    setIsConfirmModalVisible(false); // Đóng ConfirmModal
    setLocationToDelete(null); // Xóa ID đã lưu
  };

  const handleCancelDelete = () => {
    setIsConfirmModalVisible(false); // Đóng ConfirmModal
    setLocationToDelete(null); // Xóa ID đã lưu
  };


  const handleHienChiTiet = (id) => {
    setStatusFix(true);
    setOnFix(id);
  };


  const handleAnChiTiet = async (id) => {
    try {


      const updatedLocations = await fetchLocations();

      setFilteredLocations(updatedLocations);
      setLocations(updatedLocations);
      setStatusFix(false);
      setOnFix(null);
    }
    catch (error) {
      console.error("Lỗi khi duyệt hoặc hủy duyệt nhà trọ:", error);
    }
  };


  const handleButtonClick = (filter) => {
    setActiveButton(filter);

    if (filter === "all") {
      setFilteredLocations(locations);
      setSelectedId("");

    } else {
      setFilteredLocations(
        locations.filter(
          (loc) => loc.trangThai === (filter === "approved" ? 1 : 0)
        )
      );
    }
    setSelectedId("");

  };

  return (
    <div className={styles["uda-tinhnang1"]}>
      <div className={styles["thanh-menu-ngang"]}>
        <div className={styles["menu-buttons"]}>
          <button
            className={activeButton === "all" ? styles["active"] : ""}
            onClick={() => handleButtonClick("all")}
          >
            Tất cả ({locations.length})
          </button>
          <button
            className={activeButton === "approved" ? styles["active"] : ""}
            onClick={() => handleButtonClick("approved")}
          >
            Đã duyệt ({locations.filter((loc) => loc.trangThai === 1).length})
          </button>
          <button
            className={activeButton === "pending" ? styles["active"] : ""}
            onClick={() => handleButtonClick("pending")}
          >
            Chưa duyệt ({locations.filter((loc) => loc.trangThai === 0).length})
          </button>
        </div>
        <h1 className={styles["uda-tinhnang1-title"]}>DANH SÁCH NHÀ TRỌ</h1>
        <div className={styles["search-input"]}>
          <input
            type="text"
            placeholder="Nhập số điện thoại hoặc địa chỉ..."
            // value={searchTerm}
            onChange={handleSearch}  // Gọi hàm khi người dùng gõ
          />
          <FontAwesomeIcon className={styles["icon_search"]} icon={faSearch} />
        </div>
      </div>
      <div className={styles["uda-tinhnang1-table-wrapper"]}>
        <table className={styles["uda-tinhnang1-table"]}>
          <thead>
            <tr>
              <th>Id</th>
              <th>Tên nhà trọ</th>
              <th>Địa chỉ</th>
              <th>Chủ nhà</th>
              <th>Sdt</th>
              <th>

                <div className={styles["select-wrapper"]}>
                  <select value={selectedId} onChange={handleChange}>
                    <option value="">Tất cả</option>
                    <option value="true">Còn phòng</option>
                    <option value="false">Hết phòng</option>
                  </select>
                </div>

              </th>
              <th>mã sv</th>


              <th>Thay đổi</th>
            </tr>
          </thead>
          <tbody>
            {statusFix && selectedLocation ? (
              <tr className={statusFix ? styles["tr-selected"] : ""}> {/* Thêm lớp tùy thuộc vào statusFix */}
                <td>{selectedLocation.id}</td>
                <td>{selectedLocation.tenNhaTro}</td>
                <td>{selectedLocation.diaChi}</td>
                <td>{selectedLocation.tenChuNha}</td>
                <td>{selectedLocation.sdt}</td>
                <td>{selectedLocation.conPhong ? "Còn phòng" : "Hết phòng"}</td>
                <td>{selectedLocation.nguoiGioiThieu ? truncateText(selectedLocation.nguoiGioiThieu, 5) : "ẩn danh"}</td>

                <td>
                  <div className={styles["o-tuy-chinh"]}>
                    <button
                      className={`${styles["uda-tinhnang1-button-out"]} ${styles["uda-danger"]}`}
                      onClick={handleAnChiTiet}
                    >
                      Thoát chỉnh sửa
                    </button>
                  </div>
                </td>
              </tr>
            ) : locations.length > 0 ? (
              filteredLocations.map((location, index) => (
                <tr key={location.id}>
                  <td>{index + 1}</td>
                  <td>{location.tenNhaTro}</td>
                  <td>{location.diaChi}</td>
                  <td>{location.tenChuNha}</td>
                  <td>{location.sdt}</td>
                  <td>{location.conPhong ? "Còn phòng" : "Hết phòng"}</td>
                  <td>{location.nguoiGioiThieu ? truncateText(location.nguoiGioiThieu, 5) : "ẩn danh"}</td>


                  <td>
                    <div className={styles["o-tuy-chinh-2"]}>
                      <button
                        className={`${styles["uda-tinhnang1-button"]} ${location.trangThai === 0
                          ? styles["uda-success"]
                          : styles["uda-danger"]
                          }`}
                        onClick={() => handleDuyet(location.id)}
                      >
                        {location.trangThai === 0 ? "Duyệt" : "Hủy"}
                      </button>
                      <button
                        className={`${styles["uda-tinhnang1-button"]} ${styles["uda-edit"]}`}
                        onClick={() => handleHienChiTiet(location.id)}
                      >
                        Sửa
                      </button>
                      <button
                        className={`${styles["uda-tinhnang1-button"]} ${styles["uda-delete"]}`}
                        onClick={() => handleDeleteClick(location.id)}
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className={styles["uda-tinhnang1-empty"]}>
                  Không có dữ liệu nhà trọ
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {statusFix && <Chinhsuachitiet onFix={onfix} />}
      {isConfirmModalVisible && (
        <ConfirmModal
          title="Xác nhận xóa"
          message="Bạn có chắc chắn muốn xóa nhà trọ này?"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
};

export default TinhNang1;
