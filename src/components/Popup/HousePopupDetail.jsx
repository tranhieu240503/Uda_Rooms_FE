import "bootstrap/dist/css/bootstrap.min.css";
import { jwtDecode } from "jwt-decode";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

import React, { useEffect, useState, useContext, useRef } from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import Modal from "../Modal/Modal";
import {
  fetchDanhGia,
  fetchGuiDanhGia,
  fetchImage,
  fetchThongTinThem,
  fetchTienIchXungQuanh,
  fetchTienNghi,
  getHouseDetail,
} from "../../services/api"; // Import hàm fetchTienIch

import { faStar } from "@fortawesome/free-solid-svg-icons";
import "./HousePopupDetail.css";

const HousePopupDetail = ({ house, onCoordinatesr, onShowRouting }) => {
  const [activeTab, setActiveTab] = useState("info");
  const popupRef = useRef(null);
  const [houseState, sethouseState] = useState(null);
  const [images, setImages] = useState([]);
  const [danhGiaList, setDanhGiaList] = useState([]);
  const [trungBinhSao, settrungBinhSao] = useState([]);

  const [tienIch, setTienIch] = useState([]); // Lấy khoảng cách từ trọ tới tiện ích
  const [thongTinThemList, setThongTinThem] = useState([]); // State để lưu trữ thông tin thêm từ nhà trọ
  const [tienNghiList, setTienNghiList] = useState([]); // Lấy danh sách nội thất từ nhà trọ
  const [thongTinThemListAll, setThongTinThemAll] = useState([]); // State để lưu trữ thông tin thêm từ API
  const [tienNghiListAll, setTienNghiListAll] = useState([]); // Lấy danh sách nội thất từ API
  const [tokenstatus, settokenstatus] = useState(false);
  const [showDanhGia, setShowDanhGia] = useState(false); // State để kiểm soát hiển thị danh sách đánh giá
  const API_URL = process.env.REACT_APP_API_URL;

  const [isModalVisible, setIsModalVisible] = useState(false);
  const showModalOne = () => {
    setTimeout(() => {
      setIsModalVisible(true);
      setTimeout(() => {
        setIsModalVisible(false);
        console.log("Modal is now hidden");
      }, 4000);
    }, 50); // Đặt timeout ngắn để đảm bảo React nhận ra sự thay đổi
  };

  console.log("🏠 Dữ liệu nhà trọ:", house);
  const id = house.id;
  const [noiDung, setNoiDung] = useState("");
  const [soSao, setSoSao] = useState(5);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) settokenstatus(true);

  }, []); //

  const handleDanhGia = async () => {
    if (!noiDung.trim()) {
      setError("Vui lòng nhập nội dung đánh giá!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const decodedToken = jwtDecode(token);
      const danhGiaData = { noiDung, soSao, id: decodedToken.id };
      const response = await fetchGuiDanhGia(id, danhGiaData);

      if (response) {
        showModalOne();
        setError(null);

        // 🔄 Load lại danh sách đánh giá ngay sau khi gửi đánh giá thành công
        const updatedDanhGia = await fetchDanhGia(id);
        setDanhGiaList(updatedDanhGia.data.danhGiaList);
        settrungBinhSao(updatedDanhGia.data.trungBinhSao);

        setTimeout(() => {
          setNoiDung("");
          setSoSao(5);
        }, 500);
      } else {
        setError("Lỗi xảy ra!");
      }
    } catch (error) {
      console.error("Lỗi khi gửi đánh giá:", error);
      setError("Lỗi kết nối đến server!");
    }
  };

  // Lấy danh sách thông tin thêm từ api
  useEffect(() => {

    const fetchThongTinThemList = async () => {
      try {
        const response = await fetchThongTinThem();

        console.log("✅ Dữ liệu tất cả Thông tin thêm:", response);
        setThongTinThemAll(response);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách thông tin thêm:", error);
      }
    };

    fetchThongTinThemList();


  }, []);

  // Lấy ds tiện nghi từ API
  useEffect(() => {
    const fetchTienNghiList = async () => {
      try {
        const response = await fetchTienNghi();
        console.log("✅ Dữ liệu tất cả Tiện nghi:", response);
        setTienNghiListAll(response);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách nội thất:", error);
      }
    };

    fetchTienNghiList();
  }, []);

  // Lấy chức năng tính khoảng cách tiện ích xung quanh từ API
  useEffect(() => {
    const fetchTienIch = async () => {
      if (house?.lat && house?.lon) {
        const toado = {
          lat: house.lat,
          lon: house.lon,
        };
        const res = await fetchTienIchXungQuanh(toado);
        setTienIch(res || []);
      }
    };
    fetchTienIch();
  }, [house?.lat, house?.lon]);

  useEffect(() => {
    const loadImages = async () => {
      if (activeTab === "image" && id) {
        const imgs = await fetchImage(id);
        setImages(imgs);
        console.log("🖼️ Dữ liệu ảnh:", imgs);
      }
    };
    loadImages();
  }, [activeTab, id]);

  // Xử lý lấy dữ liệu nhà trọ
  useEffect(() => {
    const fetchHouse = async () => {
      try {
        const data1 = await getHouseDetail(id);
        console.log(id);
        const data2 = await fetchDanhGia(id);
        console.log(data2);
        setThongTinThem([...data1.data.ThongTinThems]);
        setTienNghiList([...data1.data.TienNghis]);
        setDanhGiaList([...data2.data.danhGiaList]);
        settrungBinhSao(data2.data.trungBinhSao); // Cập nhật state thông tin thêm của nhà trọ
        // Cập nhật state thông tin thêm của nhà trọ
        console.log("🏠 Dữ liệu thông tin thêm:", data1.data.ThongTinThems);

        console.log("🏠 Dữ liệu tiện nghi:", data1.data.TienNghis);
        sethouseState(data1.data);

        if (typeof onCoordinatesr === "function") {
          const coordinates = { lat: data1.data.lat, lng: data1.data.lon };
          onCoordinatesr(coordinates);
          console.log("🏠 Dữ liệu tọa độ của trọ:", coordinates); // <--- log đúng dữ liệu
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu nhà trọ:", error);
      }
    };

    fetchHouse();
  }, [id]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);

  }

  // Lọc ra danh sách nội thất
  const tienNghiArray = Array.isArray(tienNghiList) ? tienNghiList : [];
  console.log("Danh sách nội thất:", tienNghiList);

  // Lọc ra danh sách thông tin thêm
  const thongTinThemArray = Array.isArray(thongTinThemList)
    ? thongTinThemList
    : [];
  console.log("Danh sách thông tin thêm:", thongTinThemList);

  console.log("✅ Dữ liệu tất cả Ttt:", thongTinThemListAll);
  console.log("✅ Dữ liệu tất cả Tiện nghi:", tienNghiListAll);

  //hàm chia 2 cột
  const chunkArray = (arr, size) => {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  };

  return (
    <>
      {isModalVisible && (
        <Modal
          desc="Đánh giá thành công!"
          note="Cảm ơn bạn đã đóng góp ý kiến."
          onClose={() => setIsModalVisible(false)}
        />
      )}

      <div className="popup-container">
        <div className="popup-tabs">
          <button
            onClick={() => handleTabChange("info")}
            className={`tab-btn ${activeTab === "info" ? "active" : ""}`}
          >
            Giới thiệu
          </button>
          <button
            onClick={() => handleTabChange("amenities")}
            className={`tab-btn ${activeTab === "amenities" ? "active" : ""}`}
          >
            Chi tiết
          </button>
          <button
            onClick={() => handleTabChange("image")}
            className={`tab-btn ${activeTab === "image" ? "active" : ""}`}
          >
            Ảnh
          </button>
          <button
            onClick={() => handleTabChange("danhgia")}
            className={`tab-btn ${activeTab === "danhgia" ? "active" : ""}`}
          >
            <div className="box-danhgia">
              <p>Đánh giá</p>
              <div className="box-star">
                {[...Array(5)].map((_, index) => (
                  <span
                    key={index}
                    className={`star ${index < (trungBinhSao ? Math.round(trungBinhSao) : 5)
                      ? "yellow"
                      : "white"
                      }`}
                  >
                    <FontAwesomeIcon icon={faStar} />
                  </span>
                ))}
              </div>
            </div>
          </button>
        </div>

        {/* Tabs content */}
        {activeTab === "info" && (
          <div className="table-responsive house-info-table">
            <table className="table table-bordered table-hover table-sm mb-0">
              <tbody>
                <tr>
                  <th>Tên nhà trọ</th>
                  <td>{house.tenNhaTro}</td>
                </tr>
                <tr>
                  <th>Địa chỉ</th>
                  <td>{house.diaChi}</td>
                </tr>
                <tr>
                  <th>Chủ nhà</th>
                  <td>{house.tenChuNha}</td>
                </tr>
                <tr>
                  <th>SĐT</th>
                  <td>{house.sdt}</td>
                </tr>
                <tr>
                  <th>Kích thước</th>
                  <td>
                    {house.kichThuocMin} - {house.kichThuocMax} m²
                  </td>
                </tr>
                <tr>
                  <th>Số phòng</th>
                  <td>{house.soPhong}</td>
                </tr>
                <tr>
                  <th>Giá thuê</th>
                  <td>
                    {house.giaMin ? house.giaMin.toLocaleString() : "N/A"} -{" "}
                    {house.giaMax ? house.giaMax.toLocaleString() : "N/A"}{" "}
                    VND/tháng
                  </td>
                </tr>
                <tr>
                  <th>Giá điện</th>
                  <td>{house.tienDien ? house.tienDien.toLocaleString() : "0"} -{" "} VND/kWh</td>
                </tr>
                <tr>
                  <th>Giá nước</th>
                  <td>{house.tienNuoc ? house.tienNuoc.toLocaleString() : "0"} -{" "}VND/m³</td>
                </tr>
                <tr>
                  <th>Khoảng cách tới trường</th>
                  <td> {(house.khoangCachTruong / 1000).toFixed(2)} km</td>
                </tr>
                <tr>
                  <th>Tình trạng</th>
                  <td>
                    <b
                      style={{
                        color: house.conPhong ? "green" : "red",
                        fontWeight: "bold",
                      }}
                    >
                      {house.conPhong ? "Còn phòng" : "Hết phòng"}
                    </b>
                  </td>
                </tr>
                <tr>
                  <th>Cập nhật</th>
                  <td>{new Date(house.updatedAt).toLocaleDateString()}</td>
                </tr>
              </tbody>
            </table>

            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (typeof onShowRouting === "function") {
                  onShowRouting(); // gọi hàm từ cha và truyền house hiện tại
                }
              }}
              style={{ color: "blue", backgroundColor: "white" }}
            >
              Xem chỉ dẫn tới trọ
            </a>
          </div>
        )}

        {activeTab === "amenities" && (
          <div className="house-amenities-table">
            <div className="amenities-scroll-wrapper">
              <p>
                <b>Tiện nghi:</b>
              </p>
              <table>
                <tbody>
                  {Array.isArray(tienNghiListAll) &&
                    chunkArray(tienNghiListAll, 2).map((row, index) => (
                      <tr key={index}>
                        {row.map((item) => {
                          const isAvailable =
                            Array.isArray(tienNghiArray) &&
                            tienNghiArray.some((nt) => nt.id === item.id);
                          return (
                            <td key={item.id}>
                              <span className="icon" style={{ display: "inline-block", width: "20px" }}>
                                {isAvailable ? "✔️" : ""}
                              </span>
                              {item.tenTienNghi}
                            </td>
                          );
                        })}
                        {row.length < 2 && <td></td>}
                      </tr>
                    ))}
                </tbody>
              </table>


              <p>
                <b>Thông tin thêm:</b>
              </p>
              <table>
                <tbody>
                  {chunkArray(thongTinThemListAll, 2).map((row, index) => (
                    <tr key={index}>
                      {row.map((item) => {
                        const isAvailable = thongTinThemArray.some(
                          (nt) => nt.id === item.id
                        );
                        return (
                          <td key={item.id}>
                            <span
                              className="icon" style={{ display: "inline-block", width: "20px" }}
                            >
                              {isAvailable ? "✔️" : ""}
                            </span>{" "}
                            {item.thongTinThem}
                          </td>
                        );
                      })}
                      {row.length < 2 && <td></td>}
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* <div className="house-amenities-table"> */}
              <p>
                <b>Tiện ích xung quanh:</b>
              </p>
              <table className="custom-table">
                <thead>
                  <tr>
                    {/* <th className="stt">STT</th> */}
                    <th>Tên tiện ích</th>
                    <th>Khoảng cách</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(tienIch) &&
                    tienIch.map((item, index) => (
                      <tr key={index}>
                        {/* <td className="stt">{index + 1}</td> */}
                        <td style={{ textAlign: "left" }}>{item.tenTienIch}</td>
                        <td>{(item.distance / 1000).toFixed(2)} km</td>
                      </tr>
                    ))}
                </tbody>
              </table>

              {/* </div> */}

              <p style={{ color: "red" }}>

                <b>{house.ghiChu ? "Ghi chú" : ""}</b>
              </p>
              <p>{house.ghiChu ? house.ghiChu.toLocaleString() : ""}</p>
            </div>
          </div>
        )}

        {activeTab === "image" && (
          <div className="house-image">
            {images.length > 0 ? (
              <Carousel showThumbs={false} infiniteLoop   >
                {images.map((img, index) => (
                  <div key={index}>
                    <img src={img.url} alt={`Hình ảnh ${index + 1}`} />
                  </div>
                ))}
              </Carousel>
            ) : (
              <p style={{ color: "red" }}>Không có hình ảnh</p>
            )}
          </div>
        )}

        {activeTab === "danhgia" && (
          <div className="house-danhgia">
            {/* 📌 Tổng đánh giá & trung bình số sao */}
            <div className="mb-3">
              <h3 className="h5">
                📢 Đánh Giá:{" "}
                <span className="text-warning">
                  {"⭐".repeat(Math.round(trungBinhSao) || 5)}
                </span>
                <br />
                <small
                  className="text-muted"
                  style={{ cursor: "pointer", textDecoration: "underline",color: "#22c55e",}}
                  onClick={() => setShowDanhGia(!showDanhGia)} // Toggle hiển thị danh sách đánh giá
                >
                  ({danhGiaList.length} người đánh giá)
                </small>
              </h3>
            </div>

            {/* 📌 Danh sách đánh giá */}
            {showDanhGia && ( // Chỉ hiển thị khi showDanhGia là true
              <div className="danhgia">
                <div className="mb-4">
                  {danhGiaList.map((danhGia) => (
                    <div key={danhGia.id} className="border rounded p-3 mb-3">
                      {/* Avatar + Tên + Thời gian */}
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        {/* Avatar + Tên (Bên trái) */}
                        <div className="d-flex align-items-center">
                          <img
                            src={
                              danhGia.User?.avatar
                                ? `${API_URL}/upload_avataruser/${danhGia.User.avatar}`
                                : `${API_URL}/upload_avataruser/avater-mac-dinh.jpg`
                            }
                            alt="Avatar"
                            width={30}
                            height={30}
                            className="rounded-circle me-2"
                            style={{ objectFit: "cover" }}
                          />
                          <strong>{danhGia.User?.fullname || "Ẩn danh"}</strong>
                        </div>

                        {/* Thời gian (Bên phải) */}
                        <small className="text-muted">
                          {new Date(danhGia.updatedAt).toLocaleDateString()}
                        </small>
                      </div>

                      {/* Số sao */}
                      <p className="mb-1 text-warning">
                        👍 {"★".repeat(danhGia.soSao)}
                      </p>

                      {/* Nội dung đánh giá */}
                      <p className="mb-0">📢 {danhGia.noiDung}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 📌 Form đánh giá */}
            <div className="border rounded p-4">
              {/* Kiểm tra token */}
              {tokenstatus ? (
                <>
                  {/* Nhập nội dung đánh giá */}
                  <div className="mb-3">
                    <textarea
                      className="form-control"
                      placeholder="Nhập nội dung đánh giá..."
                      value={noiDung}
                      onChange={(e) => setNoiDung(e.target.value)}
                      rows={4}
                      maxLength={200}
                    />
                  </div>

                  {/* Chọn số sao */}
                  <div className="mb-3">
                    <label className="form-label me-2">Chọn số sao:</label>
                    {[1, 2, 3, 4, 5].map((sao) => (
                      <button
                        key={sao}
                        type="button"
                        className={`btn btn-sm ${soSao >= sao
                          ? "btn-warning"
                          : "btn-outline-secondary"
                          } me-1`}
                        onClick={() => setSoSao(sao)}
                        style={{
                          width: "30px",
                          height: "30px",
                          fontSize: "14px",
                          padding: "0",
                          color: "white",
                        }}
                      >
                        {soSao >= sao ? "★" : "★"}
                      </button>
                    ))}
                  </div>

                  {/* Nút gửi đánh giá */}
                  <button className="btn btn-primary" onClick={handleDanhGia}>
                    Gửi đánh giá
                  </button>
                </>
              ) : (
                <p className="text-danger">Bạn phải đăng nhập để đánh giá.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default HousePopupDetail;
// import "./HousePopupDetail.css";