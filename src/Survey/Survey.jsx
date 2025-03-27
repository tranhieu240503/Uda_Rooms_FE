import React, { useState, useEffect } from "react";
import classNames from "classnames/bind";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCamera,
  faChevronDown,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import L from "leaflet";
import styles from "./Survey.module.scss";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useNavigate } from "react-router-dom";
import { fetchTienNghi, fetchThongTinThem } from "../services/api"; // Import hàm fetchTienIch
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const cx = classNames.bind(styles);

const Survey = ({ onCloseSurvey, showModal }) => {
  const [showHide, setShowHide] = useState(false);
  const [showHideOne, setShowHideOne] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedArea, setSelectedArea] = useState("");
  const [position, setPosition] = useState(null); // State để lưu tọa độ
  const [tienNghiList, setTienNghiList] = useState([]); //lưu tiennghi
  const [thongtinthemList, setThongTinThemList] = useState([]); //lưu thongtin them
  const navigate = useNavigate();
  const [showMap, setShowMap] = useState(false);
  const [lengthdata, setlenghtdata] = useState(null);

  const [formData, setFormData] = useState({
    tenNhaTro: "",
    tenChuNha: "",
    diaChi: "",
    sdt: "",
    soPhong: "",
    giaMin: "",
    giaMax: "",
    kichThuocMin: "",
    kichThuocMax: "",
    tienNghi: [],
    tienDien: "",
    tienNuoc: "",
    trangThai: false,
    ghiChu: "",
    lat: "", // Thêm trường tọa độ X
    lon: "", // Thêm trường tọa độ Y
    thongTinThem: [],
  });

  // Thêm state để lưu lỗi
  const [errors, setErrors] = useState({
    sdt: "",
    diaChi: "",
    giaMin: "",
    giaMax: "",
    soPhong: "",
  });

  // Hàm validate số điện thoại
  const validatePhone = (phone) => {
    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    return phoneRegex.test(phone);
  };

  // Sửa lại hàm handleInputChange
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "soPhong") {
      // Chỉ cho phép nhập số và giới hạn 2 chữ số
      if (value.length <= 2 && /^\d*$/.test(value)) {
        setFormData({ ...formData, [name]: value });
        setErrors((prev) => ({
          ...prev,
          soPhong: value
            ? value > 0
              ? ""
              : "Số phòng phải lớn hơn 0"
            : "Vui lòng nhập số phòng",
        }));
      }
      return;
    }
    setFormData({ ...formData, [name]: value });

    // Validate từng trường khi người dùng nhập
    switch (name) {
      case "sdt":
        setErrors((prev) => ({
          ...prev,
          sdt: !value
            ? "Vui lòng nhập số điện thoại"
            : !validatePhone(value)
              ? "Số điện thoại không hợp lệ"
              : "",
        }));
        break;
      case "diaChi":
        setErrors((prev) => ({
          ...prev,
          diaChi: !value.trim() ? "Vui lòng nhập địa chỉ" : "",
        }));
        break;
      case "giaMin":
      case "giaMax":
        const min =
          name === "giaMin" ? parseInt(value) : parseInt(formData.giaMin);
        const max =
          name === "giaMax" ? parseInt(value) : parseInt(formData.giaMax);

        setErrors((prev) => ({
          ...prev,
          giaMin: !min ? "Vui lòng nhập giá tối thiểu" : "",
          giaMax: !max
            ? "Vui lòng nhập giá tối đa"
            : min > max && max
              ? "Giá tối thiểu không được lớn hơn giá tối đa"
              : "",
        }));
        break;
      default:
        break;
    }
  };

  const houseIcon = new L.DivIcon({
    html: '<i class="fas fa-map-marker-alt" style="font-size: 24px; color: red;"></i>',
    className: "custom-div-icon",
    iconSize: [50, 50],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });

  // Nhập input
  // const handleInputChange = (e) => {
  //   setFormData({ ...formData, [e.target.name]: e.target.value });
  // };

  // Chọn ảnh
  const handleImageChange = (event) => {
    const files = Array.from(event.target.files); // Lấy danh sách ảnh được chọn
    setSelectedImages((prevImages) => [...prevImages, ...files]); // Thêm vào state
  };


  // Box change
  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      tienNghi: checked
        ? [...prev.tienNghi, value] // Nếu được chọn → thêm vào mảng
        : prev.tienNghi.filter((item) => item !== value), // Nếu bỏ chọn → loại bỏ khỏi mảng
    }));
  };

  // Box change1
  const handleCheckboxChange1 = (e) => {
    const { value, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      thongTinThem: checked
        ? [...prev.thongTinThem, value] // Nếu được chọn → thêm vào mảng
        : prev.thongTinThem.filter((item) => item !== value), // Nếu bỏ chọn → loại bỏ khỏi mảng
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate tất cả các trường trước khi submit
    const newErrors = {
      sdt: !formData.sdt
        ? "Vui lòng nhập số điện thoại"
        : !validatePhone(formData.sdt)
          ? "Số điện thoại không hợp lệ"
          : "",
      diaChi: !formData.diaChi.trim() ? "Vui lòng nhập địa chỉ" : "",
      giaMin: !formData.giaMin ? "Vui lòng nhập giá tối thiểu" : "",
      giaMax: !formData.giaMax
        ? "Vui lòng nhập giá tối đa"
        : parseInt(formData.giaMin) > parseInt(formData.giaMax)
          ? "Giá tối thiểu không được lớn hơn giá tối đa"
          : "",

      // Thêm validation cho số phòng
      soPhong: !formData.soPhong
        ? "Vui lòng nhập số phòng"
        : formData.soPhong <= 0
          ? "Số phòng phải lớn hơn 0"
          : "",
    };

    setErrors(newErrors);

    // Kiểm tra nếu có lỗi thì không submit
    if (Object.values(newErrors).some((error) => error)) {
      return;
    }

    try {
      // Gửi thông tin trọ trước
      console.log("dữ liệu gửi đi:  ", formData);
      const infoResponse = await axios.post(
        "http://localhost:8000/api/nha-tro",
        formData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      console.log("Kiểu dữ liệu:", infoResponse.data);

      // Sau khi gửi thông tin trọ, lấy ID để gửi hình ảnh
      if (selectedImages.length > 0) {
        const formDataImage = new FormData();
        selectedImages.forEach((image) => {
          formDataImage.append("images", image); // Backend phải hỗ trợ upload nhiều ảnh
        });
        formDataImage.append("nhaTroId", infoResponse.data.nhaTro.id);

        const imageResponse = await axios.post(
          "http://localhost:8000/api/upload-multiple",
          formDataImage,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        console.log("Hình ảnh gửi thành công:", imageResponse.data);
      }

      toast.success("Nhà trọ đã được đăng ký thành công!");

      // Thông báo gửi thông tin thành công
      showModal();
      onCloseSurvey();
    } catch (error) {
      if (error.response) {
        console.error(
          "Lỗi từ server:",
          error.response.status,
          error.response.data
        );
      } else if (error.request) {
        console.error("Không nhận được phản hồi từ server:", error.request);
      } else {
        console.error("Lỗi khi thiết lập request:", error.message);
      }
    }
  };

  // Component để xử lý sự kiện bản đồ và lấy tọa độ
  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setPosition(e.latlng);
        console.log("Tọa độ được chọn:", e.latlng);
        setFormData((prev) => ({
          ...prev,
          lat: e.latlng.lat,
          lon: e.latlng.lng,
        }));
      },
    });

    return position === null ? null : (
      <Marker position={position} icon={houseIcon}></Marker>
    );
  };

  useEffect(() => {
    const fetchtiennghi1 = async () => {
      try {
        const response = await fetchTienNghi();
        const response1 = await fetchThongTinThem();
        console.log("Dữ liệu thêm:", response1);
        console.log("Dữ liệu tiện nghi:", response);
        setTienNghiList(response);
        setThongTinThemList(response1);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách nội thất:", error);
      }
    };

    fetchtiennghi1();
  }, []);

  return (
    <div className={cx("wrapper")}>
      <header className={cx("header")}>
        <p className={cx("heading_title")}>GIỚI THIỆU NHÀ TRỌ</p>
        <button className={cx("clear")} onClick={onCloseSurvey}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </header>
      <div className={cx("content")}>
        <div className={cx("form_group")}>
          <input
            type="text"
            name="tenNhaTro"
            className={cx("form_input")}
            placeholder=" " // Placeholder trống để trigger :not(:placeholder-shown)
            value={formData.tenNhaTro}
            onChange={handleInputChange}
          />
          <label className={cx("form-intern-label")}>Tên trọ</label>
        </div>

        <div className={cx("form_group")}>
          <input
            type="text"
            name="tenChuNha"
            value={formData.tenChuNha} // Ràng buộc với state
            onChange={handleInputChange} // Cập nhật state khi nhập
            className={cx("form_input")}
            placeholder=" "
          />
          <label className={cx("form-intern-label")}>Tên chủ trọ</label>
        </div>

        <div className={cx("form_group")}>
          <input
            type="text"
            name="sdt"
            value={formData.sdt} // Ràng buộc với state
            onChange={handleInputChange} // Cập nhật state khi nhập
            className={cx("form_input", errors.sdt && "error")}
            placeholder=" "
          />
          <label className={cx("form-intern-label")}>
            Số điện thoại chủ trọ
          </label>
          {errors.sdt && (
            <span className={cx("error-message")}>{errors.sdt}</span>
          )}
        </div>

        <div className={cx("form_group")}>
          <input
            type="text"
            name="diaChi"
            value={formData.diaChi} // Ràng buộc với state
            onChange={handleInputChange} // Cập nhật state khi nhập
            className={cx("form_input", errors.diaChi && "error")}
            placeholder=" "
          />
          <label className={cx("form-intern-label")}>Địa chỉ nhà trọ</label>
          {errors.diaChi && (
            <span className={cx("error-message")}>{errors.diaChi}</span>
          )}
        </div>

        <div className={cx("form_group")}>
          <input
            type="text"
            name="soPhong"
            value={formData.soPhong}
            onChange={handleInputChange}
            className={cx("form_input", errors.soPhong && "error")}
            placeholder=" "
            maxLength="2" // Thêm maxLength
          />
          <label className={cx("form-intern-label")}>Số phòng trọ</label>
          {errors.soPhong && (
            <span className={cx("error-message")}>{errors.soPhong}</span>
          )}
        </div>

        <div className={cx("dien-tich-container")}>
          <h2 className={cx("form_title")}>Mức giá (VND/tháng) </h2>
          <div className={cx("dien-tich-container1")}>
            <div className={cx("dien-tich-item")}>
              <span className={cx("dien-tich-label")}></span>
              <input
                type="number"
                name="giaMin"
                className={cx("dien-tich-input", errors.giaMin && "error")}
                placeholder="Nhập giá tối thiểu"
                value={formData.giaMin}
                onChange={handleInputChange}
              />
              {errors.giaMin && (
                <span className={cx("error-message-price")}>
                  {errors.giaMin}
                </span>
              )}
            </div>
            <p> -- </p>
            <div className={cx("dien-tich-item")}>
              <span className={cx("dien-tich-label")}></span>
              <input
                type="number"
                name="giaMax"
                className={cx("dien-tich-input", errors.giaMax && "error")}
                placeholder="Nhập giá tối đa"
                value={formData.giaMax}
                onChange={handleInputChange}
              />
              {errors.giaMax && (
                <span className={cx("error-message-price")}>
                  {errors.giaMax}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className={cx("dien-tich-container")}>
          <h2 className={cx("form_title")}>Diện tích (m2)</h2>
          <div className={cx("dien-tich-container1")}>
            <div className={cx("dien-tich-item")}>
              <span className={cx("dien-tich-label")}></span>
              <input
                type="number"
                name="kichThuocMin"
                className={cx("dien-tich-input")}
                placeholder="Ví dụ: 20"
                value={formData.kichThuocMin}
                onChange={handleInputChange}
              />
            </div>
            <p> -- </p>
            <div className={cx("dien-tich-item")}>
              <span className={cx("dien-tich-label")}></span>
              <input
                type="number"
                name="kichThuocMax"
                className={cx("dien-tich-input")}
                placeholder="Ví dụ: 30 "
                value={formData.kichThuocMax}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        <div className={cx("form_group")}>
          <input
            type="text"
            name="tienDien"
            value={formData.tienDien} // Ràng buộc với state
            onChange={handleInputChange} // Cập nhật state khi nhập
            className={cx("form_input")}
            placeholder=" "
          />
          <label className={cx("form-intern-label")}>
            {" "}
            Nhập giá điện (VNĐ/kWh)
          </label>
        </div>
        <div className={cx("form_group")}>
          <input
            type="text"
            name="tienNuoc"
            value={formData.tienNuoc} // Ràng buộc với state
            onChange={handleInputChange} // Cập nhật state khi nhập
            className={cx("form_input")}
            placeholder=" "
          />
          <label className={cx("form-intern-label")}>
            {" "}
            Nhập giá nước (VNĐ/m³)
          </label>
        </div>

        <div className={cx("form_group")}>
          <h3 className={cx("title_map")}>Tiện nghi phòng</h3>
          <div className={cx("option_item")}>
            {tienNghiList.map((item) => (
              <div key={item.id} className={cx("item")}>
                <input
                  type="checkbox"
                  className={cx("option_checkbox")}
                  value={item.id}
                  onChange={handleCheckboxChange}
                />
                <p className={cx("option_title")}>{item.tenTienNghi}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={cx("form_group")}>
          <h3 className={cx("title_map")}>Thông tin thêm</h3>
          <div className={cx("option_item")}>
            {thongtinthemList.map((item) => (
              <div key={item.id} className={cx("item")}>
                <input
                  type="checkbox"
                  className={cx("option_checkbox")}
                  value={item.id}
                  onChange={handleCheckboxChange1}
                />
                <p className={cx("option_title")}>{item.thongTinThem}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={cx("form_group")}>
      <label className={cx("file-input-label")}>
        <input
          type="file"
          accept="image/*"
          multiple
          className={cx("form_input", "file-input")}
          onChange={handleImageChange}
        />
        <span className={cx("file-input-text")}>
          Thêm ảnh trọ
          <FontAwesomeIcon icon={faCamera} />
        </span>
      </label>

      {/* Hiển thị ảnh đã chọn */}
      <div className={cx("preview-container")}>
        {selectedImages.length > 0 &&
          selectedImages.map((image, index) => {
            const imageUrl = URL.createObjectURL(image);
            return (
              <img
                key={index}
                src={imageUrl}
                alt={`preview-${index}`}
                className={cx("preview-image")}
                onLoad={() => URL.revokeObjectURL(imageUrl)} // Giải phóng bộ nhớ sau khi tải ảnh
              />
            );
          })}
      </div>
      </div>

        <div className={cx("form_group")}>
          <input
            type="text"
            name="ghiChu"
            value={formData.ghiChu} // Ràng buộc với state
            onChange={handleInputChange} // Cập nhật state khi nhập
            className={cx("form_input")}
            placeholder=" "
          />
          <label className={cx("form-intern-label")}>Nhập ghi chú</label>
        </div>

        <div className={cx("form_group")}>
          <input
            type="text"
            name="idsv"
            id="idsv"
            className={cx("form_input", "idsv_input")}
            placeholder=" "
          />
          <label className={cx("form-intern-label")}>
            Người giới thiệu (IDSV)
          </label>
          <p className={cx("form_input-id")}>
            *Nhập id để thêm điểm chuyên cần*
          </p>
        </div>

        <div className={cx("form_group")}>
          <h3 className={cx("title_map")}>Chọn vị trí trên bản đồ</h3>
          <MapContainer
            center={[16.032, 108.2212]}
            zoom={15}
            scrollWheelZoom={true}
            style={{ width: "100%", height: "300px" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <LocationMarker />
          </MapContainer>
        </div>

        <button className={cx("btn")} onClick={handleSubmit}>
          Gửi
        </button>
      </div>
    </div>
  );
};

export default Survey;
