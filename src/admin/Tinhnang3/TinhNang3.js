import React, { useEffect, useState } from "react";
import {
  addTienIch,
  addTienIchXungQuanh,
  deleteTienIch,
  deleteTienIchXungQuanh,
  fetchTienIch,
  fetchTienIchAll,
} from "../../services/api";
import styles from "./TinhNang3.module.scss"; // Import SCSS module

const InputField = ({ label, value, onChange, placeholder, type = "text" }) => (
  <div className={styles["form-group"]}>
    <label>{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={styles["form-input"]}
    />
  </div>
);

const TinhNang3 = () => {
  const [activeTab, setActiveTab] = useState("tiennghi");
  const [onFix, setOnFix] = useState(null);
  const [statusFix, setStatusFix] = useState(false);
  const [locations, setLocations] = useState([]);
  const [locationsALL, setLocationsALL] = useState([]);
  const [newLoaiTienIch, setNewLoaiTienIch] = useState("");
  const [editingTienIch, setEditingTienIch] = useState(null);
  const [selectedId, setSelectedId] = useState("");
  const [selectedtype, setSelectedType] = useState([]);
  const [newTienIch, setNewTienIch] = useState({
    tenTienIch: "",
    loai: "",
    diaChi: "",
    lat: "",
    lon: "",
  });

  const handleChange = (event) => {
    const findid = Number(event.target.value);
    setSelectedId(event.target.value);
    if (findid === 0) {
      setSelectedType(locations);
    } else {
      setSelectedType(locations.filter((loc) => loc.TienIch.id === findid));
    }
  };

  const handleAddTienIchXungQuanh = async () => {
    if (!newTienIch.tenTienIch.trim() || !newTienIch.loai.trim()) {
      return alert("Vui lòng nhập đầy đủ tên tiện ích và loại!");
    }

    try {
      const response = await addTienIchXungQuanh(newTienIch);
      if (response && response.data) {
        setNewTienIch({
          tenTienIch: "",
          loai: "",
          diaChi: "",
          lat: "",
          lon: "",
        });
        const updatedData = await fetchTienIch();
        setLocations(updatedData.data);
        setSelectedType(updatedData.data);
      }
    } catch (error) {
      alert(error.message || "Lỗi khi thêm tiện ích");
    }
  };

  const handleAddTienIch = async () => {
    if (!newLoaiTienIch.trim())
      return alert("Tên loại tiện ích không được để trống!");
    const response = await addTienIch({ tenTienIch: newLoaiTienIch });
    if (response.status === 201) {
      setLocationsALL((prev) => [...prev, response.data.data]);
      setNewLoaiTienIch("");
    }
  };

  const handleXoaTienIch = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa tiện ích này?")) return;
    try {
      await deleteTienIch(id);
      setLocationsALL((prev) => prev.filter((tienIch) => tienIch.id !== id));
    } catch (error) {
      alert("Lỗi khi xóa tiện ích");
    }
  };

  const handleXoaTienIchXungQuanh = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa tiện ích này?")) return;
    try {
      await deleteTienIchXungQuanh(id);
      const updatedData = await fetchTienIch();
      setLocations(updatedData.data);
      const findid = Number(selectedId);
      if (findid === 0) {
        setSelectedType(updatedData.data);
      } else {
        setSelectedType(
          updatedData.data.filter((loc) => loc.TienIch.id === findid)
        );
      }
    } catch (error) {
      alert("Lỗi khi xóa tiện ích");
    }
  };

  useEffect(() => {
    const getData = async () => {
      const dataTienIch = await fetchTienIch();
      const dataTienIchAll = await fetchTienIchAll();

      setLocations(dataTienIch.data);
      setLocationsALL(dataTienIchAll);
      setSelectedType(dataTienIch.data);
    };
    getData();
  }, []);

  return (
    <div className={styles["tinhnang3-full-screen"]}>
      <div className={styles["tinhnang3-tabs"]}>
        <button
          className={`${styles["tab-button"]} ${
            activeTab === "tiennghi" ? styles["active"] : ""
          }`}
          onClick={() => setActiveTab("tiennghi")}
        >
          Tiện Ích Xung Quanh
        </button>
        <button
          className={`${styles["tab-button"]} ${
            activeTab === "loaitiennghi" ? styles["active"] : ""
          }`}
          onClick={() => setActiveTab("loaitiennghi")}
        >
          Loại Tiện Ích
        </button>
      </div>

      {activeTab === "tiennghi" && (
        <div className={styles["tab-content"]}>
          <div className={styles["tinhnang3-box-1"]}>
            <h1 className={styles["tinhnang3-text-center"]}>
              Tiện ích xung quanh
            </h1>
            <table className={styles["custom-table"]}>
              <thead>
                <tr className={styles["tinhnang3-table"]}>
                  <th>ID</th>
                  <th>Tên Tiện Ích</th>
                  <th>Địa Chỉ</th>
                  <th>
                    <div className={styles["select-wrapper"]}>
                      <select value={selectedId} onChange={handleChange}>
                        <option value="">Tất cả</option>
                        {locationsALL.length > 0 ? (
                          locationsALL.map((tienIch) => (
                            <option key={tienIch.id} value={tienIch.id}>
                              {tienIch.tenTienIch}
                            </option>
                          ))
                        ) : (
                          <option>Không có dữ liệu</option>
                        )}
                      </select>
                    </div>
                  </th>
                  <th>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {selectedtype.length > 0 ? (
                  selectedtype.map((location) => (
                    <tr key={location.id}>
                      <td>{location.id}</td>
                      <td>{location.tenTienIch}</td>
                      <td>{location.diaChi}</td>
                      <td>{location.TienIch?.tenTienIch}</td>
                      <td>
                        <button
                          className={styles["btn-primary"]}
                          onClick={() => handleXoaTienIchXungQuanh(location.id)}
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className={styles["text-center"]}>
                      Không có dữ liệu
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className={styles["tinhnang3-box-2"]}>
            <h1 className={styles["tinhnang3-text-center"]}>
              Thêm tiện ích xung quanh
            </h1>
            <form className={styles["tinhnang3-form"]}>
              <InputField
                label="Tên Tiện Ích"
                value={newTienIch.tenTienIch}
                onChange={(e) =>
                  setNewTienIch({ ...newTienIch, tenTienIch: e.target.value })
                }
                placeholder="Nhập tên tiện ích"
              />

              <InputField
                label="Loại"
                value={newTienIch.loai}
                onChange={(e) =>
                  setNewTienIch({ ...newTienIch, loai: e.target.value })
                }
                placeholder="Nhập loại tiện ích"
              />

              <InputField
                label="Địa Chỉ"
                value={newTienIch.diaChi}
                onChange={(e) =>
                  setNewTienIch({ ...newTienIch, diaChi: e.target.value })
                }
                placeholder="Nhập địa chỉ"
              />

              <InputField
                label="Vĩ Độ"
                value={newTienIch.lat}
                onChange={(e) =>
                  setNewTienIch({ ...newTienIch, lat: e.target.value })
                }
                placeholder="Nhập vĩ độ"
              />

              <InputField
                label="Kinh Độ"
                value={newTienIch.lon}
                onChange={(e) =>
                  setNewTienIch({ ...newTienIch, lon: e.target.value })
                }
                placeholder="Nhập kinh độ"
              />

              <button
                type="button"
                onClick={handleAddTienIchXungQuanh}
                className={styles["submit-btn"]}
              >
                Thêm
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === "loaitiennghi" && (
        <div className={styles["tab-content"]}>
          <div className={styles["tinhnang3-box-3"]}>
            <h3>Danh Sách Loại Tiện Ích</h3>
            <table className={styles["custom-table"]}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên Loại Tiện Ích</th>
                  <th>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {locationsALL.length > 0 ? (
                  locationsALL.map((tienIch) => (
                    <tr key={tienIch.id}>
                      <td>{tienIch.id}</td>
                      <td>{tienIch.tenTienIch}</td>
                      <td>
                        <button
                          className={styles["btn-primary"]}
                          onClick={() => handleXoaTienIch(tienIch.id)}
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className={styles["text-center"]}>
                      Không có dữ liệu
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className={styles["tinhnang3-box-4"]}>
            <h3>Thêm Loại Tiện Ích</h3>
            <form>
              <label>Tên Loại Tiện Ích</label>
              <input
                type="text"
                value={newLoaiTienIch}
                onChange={(e) => setNewLoaiTienIch(e.target.value)}
                placeholder="Nhập tiện ích..."
              />
              <button type="button" onClick={handleAddTienIch}>
                Thêm
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TinhNang3;
