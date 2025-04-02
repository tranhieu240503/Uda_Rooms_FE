import React, { useEffect, useState } from "react";
import {
  deleteNhaTro,
  fetchLocations,
  handleDuyetAPI,
} from "../../services/api";
import Chinhsuachitiet from "../chinhsuachinh/chinhsuachitiet";
import styles from "./Tinhnang1.module.scss"; // Import SCSS module

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN").format(amount);
};

const TinhNang1 = () => {
  const [locations, setLocations] = useState([]);
  const [onfix, setOnFix] = useState(null);
  const [statusFix, setStatusFix] = useState(false);
  const selectedLocation = locations.find((location) => location.id === onfix);
  const [filteredLocations, setFilteredLocations] = useState([]);

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
        const updatedLocations = await fetchLocations();
        if (activeButton === "all") {
          setFilteredLocations(updatedLocations);
        } else {
          setFilteredLocations(
            updatedLocations.filter(
              (loc) => loc.trangThai === (activeButton === "approved" ? 1 : 0)
            )
          );
        }
        setLocations(updatedLocations);
      }
    } catch (error) {
      console.error("Lỗi khi duyệt hoặc hủy duyệt nhà trọ:", error);
    }
  };

  const xoaNhaTro = async (id) => {
    try {
      const response = await deleteNhaTro(id);
      if (response && response.status === 200) {
        const updatedLocations = await fetchLocations();
        setLocations(updatedLocations);

        if (activeButton !== "all") {
          setFilteredLocations(
            updatedLocations.filter(
              (location) =>
                location.id !== id &&
                location.trangThai === (activeButton === "approved" ? 1 : 0)
            )
          );
        }
      } else {
        alert("Lỗi: Xóa không thành công!");
      }
    } catch (error) {
      console.error("Lỗi khi xóa:", error);
    }
  };

  const handleHienChiTiet = (id) => {
    setStatusFix(true);
    setOnFix(id);
  };

  const handleAnChiTiet = () => {
    setStatusFix(false);
    setOnFix(null);
  };

  const handleButtonClick = (filter) => {
    setActiveButton(filter);

    if (filter === "all") {
      setFilteredLocations(locations);
    } else {
      setFilteredLocations(
        locations.filter(
          (loc) => loc.trangThai === (filter === "approved" ? 1 : 0)
        )
      );
    }
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
              <th>Giá min</th>
              <th>Giá max</th>
              <th>Thay đổi</th>
            </tr>
          </thead>
          <tbody>
            {statusFix && selectedLocation ? (
              <tr>
                <td>{selectedLocation.id}</td>
                <td>{selectedLocation.tenNhaTro}</td>
                <td>{selectedLocation.diaChi}</td>
                <td>{selectedLocation.tenChuNha}</td>
                <td>{selectedLocation.sdt}</td>
                <td>{formatCurrency(selectedLocation.giaMin)}</td>
                <td>{formatCurrency(selectedLocation.giaMax)}</td>
                <td>
                  <div className={styles["o-tuy-chinh"]}>
                    <button
                      className={`${styles["uda-tinhnang1-button"]} ${
                        selectedLocation.trangThai === 0
                          ? styles["uda-success"]
                          : styles["uda-danger"]
                      }`}
                      onClick={() => handleDuyet(selectedLocation.id)}
                    >
                      {selectedLocation.trangThai === 0 ? "Duyệt" : "Hủy duyệt"}
                    </button>
                    <button
                      className={`${styles["uda-tinhnang1-button"]} ${styles["uda-danger"]}`}
                      onClick={handleAnChiTiet}
                    >
                      Hủy sửa
                    </button>
                  </div>
                </td>
              </tr>
            ) : locations.length > 0 ? (
              filteredLocations.map((location) => (
                <tr key={location.id}>
                  <td>{location.id}</td>
                  <td>{location.tenNhaTro}</td>
                  <td>{location.diaChi}</td>
                  <td>{location.tenChuNha}</td>
                  <td>{location.sdt}</td>
                  <td>{formatCurrency(location.giaMin)}</td>
                  <td>{formatCurrency(location.giaMax)}</td>
                  <td>
                    <div className={styles["o-tuy-chinh-2"]}>
                      <button
                        className={`${styles["uda-tinhnang1-button"]} ${
                          location.trangThai === 0
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
                <td colSpan="9" className={styles["uda-tinhnang1-empty"]}>
                  Không có dữ liệu nhà trọ
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {statusFix && <Chinhsuachitiet onFix={onfix} />}
    </div>
  );
};

export default TinhNang1;
