import React, { useState, useEffect, useContext } from "react";
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
import { ModalContext } from "../App";

const cx = classNames.bind(styles);

const Survey = ({ onCloseSurvey, showModalOne, onReset }) => {
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
  const { showModal } = useContext(ModalContext);
  const API_URL = process.env.REACT_APP_API_URL;

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
    tienDien: "",
    tienNuoc: "",
  });

  // Hàm validate số điện thoại
  const validatePhone = (phone) => {
    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    return phoneRegex.test(phone);
  };

  const formatCurrency = (value) => {
    const numericValue = value.replace(/[\.,]/g, ""); // Loại bỏ dấu chấm hoặc phẩy
    if (!numericValue) return ""; // Nếu rỗng, trả về chuỗi rỗng
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, "."); // Thêm dấu chấm mỗi 3 số
  };

  const handleDeleteImage = (index) => {
    setSelectedImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "tienDien" || name === "tienNuoc") {
      // Loại bỏ các ký tự không phải số
      const numericValue = value.replace(/[^0-9]/g, "");

      // Giới hạn tối đa 6 chữ số
      if (numericValue.length > 7) {
        return; // Không cập nhật state nếu vượt quá 6 chữ số
      }

      // Cho phép giá trị rỗng (để xóa số đầu tiên)
      if (value === "") {
        setFormData((prev) => ({
          ...prev,
          [name]: "",
        }));
        setErrors((prev) => ({
          ...prev,
          [name]: "",
        }));
        return;
      }

      // Nếu giá trị là số âm hoặc không hợp lệ, không cập nhật state
      if (parseInt(numericValue, 10) < 0 || isNaN(parseInt(numericValue, 10))) {
        setErrors((prev) => ({
          ...prev,
          [name]: "Vui lòng nhập số dương hợp lệ",
        }));
        return;
      }

      // Xóa lỗi nếu giá trị hợp lệ
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));

      // Định dạng giá trị với dấu chấm
      const formattedValue = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

      // Cập nhật giá trị vào state
      setFormData((prev) => ({
        ...prev,
        [name]: formattedValue, // Lưu giá trị đã định dạng
      }));
      return;
    }

    if (name === "kichThuocMin" || name === "kichThuocMax") {
      // Loại bỏ các ký tự không phải số
      const numericValue = value.replace(/[^0-9]/g, "");

      if (numericValue.length > 4) {
        return; // Không cập nhật state nếu vượt quá 4 chữ số
      }

      // Cho phép giá trị rỗng (để xóa số đầu tiên)
      if (value === "") {
        setFormData((prev) => ({
          ...prev,
          [name]: "",
        }));
        setErrors((prev) => ({
          ...prev,
          [name]: "",
        }));
        return;
      }

      // Nếu giá trị là số âm hoặc không hợp lệ, không cập nhật state
      if (parseInt(numericValue, 10) < 0 || isNaN(parseInt(numericValue, 10))) {
        setErrors((prev) => ({
          ...prev,
          [name]: "Vui lòng nhập số dương hợp lệ",
        }));
        return;
      }

      // Xóa lỗi nếu giá trị hợp lệ
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));

      // Cập nhật giá trị vào state
      setFormData((prev) => ({
        ...prev,
        [name]: numericValue, // Lưu giá trị mới
      }));
      return;
    }

    // Xử lý số phòng (giới hạn 2 số)
    if (name === "soPhong") {
      if (value.length <= 2 && /^\d*$/.test(value)) {
        setFormData((prev) => ({ ...prev, [name]: value }));
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

    // Xử lý định dạng số tiền (giaMin, giaMax)
    if (name === "giaMin" || name === "giaMax") {
      const rawValue = value.replace(/[\.,]/g, ""); // Loại bỏ dấu phân cách cũ
      if (!/^\d*$/.test(rawValue)) return; // Chỉ cho phép số
      if (rawValue.length > 12) return; // Giới hạn tối đa 12 chữ số

      const formattedValue = formatCurrency(rawValue); // Format lại với dấu chấm

      setFormData((prev) => ({
        ...prev,
        [name]: formattedValue, // Hiển thị giá trị có dấu chấm
        [`${name}Raw`]: rawValue, // Lưu giá trị gốc để xử lý logic
      }));

      // Validation cho giá tiền
      const numericValue = parseInt(rawValue, 10) || 0;
      const min =
        name === "giaMin"
          ? numericValue
          : parseInt(formData.giaMinRaw || "0", 10);
      const max =
        name === "giaMax"
          ? numericValue
          : parseInt(formData.giaMaxRaw || "0", 10);

      setErrors((prev) => ({
        ...prev,
        giaMin: min === 0 ? "Vui lòng nhập giá tối thiểu" : "",
        giaMax:
          max === 0
            ? "Vui lòng nhập giá tối đa"
            : min > max
              ? "Giá tối thiểu không được lớn hơn giá tối đa"
              : "",
      }));
      return;
    }

    // Xử lý các input khác
    setFormData((prev) => ({ ...prev, [name]: value }));

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
        : parseInt(formData.giaMin.replace(/\./g, ""), 10) >
          parseInt(formData.giaMax.replace(/\./g, ""), 10)
          ? "Giá tối thiểu không được lớn hơn giá tối đa"
          : "",
      soPhong: !formData.soPhong
        ? "Vui lòng nhập số phòng"
        : formData.soPhong <= 0
          ? "Số phòng phải lớn hơn 0"
          : "",
      lat: !formData.lat ? "Vui lòng chọn tọa độ trên bản đồ" : "",
      lon: !formData.lon ? "Vui lòng chọn tọa độ trên bản đồ" : "",
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some((error) => error)) {
      showModal(
        "Lỗi khi gửi dữ liệu!",
        "Vui lòng nhập đầy đủ thông tin cần thiết.",
        "error"
      );
      return;
    }

    try {
      // Chuyển đổi giá trị giaMin và giaMax từ chuỗi sang số
      const dataToSend = {
        ...formData,
        giaMin: parseInt(formData.giaMin.replace(/\./g, ""), 10),
        giaMax: parseInt(formData.giaMax.replace(/\./g, ""), 10),
        tienDien: parseInt(formData.tienDien.replace(/\./g, ""), 10),
        tienNuoc: parseInt(formData.tienNuoc.replace(/\./g, ""), 10)
      };

      console.log("Dữ liệu gửi đi: ", dataToSend);

      // Gửi thông tin trọ trước
      const infoResponse = await axios.post(
        `${API_URL}/api/nha-tro`,
        dataToSend,
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
          `${API_URL}/api/upload-multiple`,
          formDataImage,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        console.log("Hình ảnh gửi thành công:", imageResponse.data);
      }

      toast.success("Nhà trọ đã được đăng ký thành công!");

      // Thông báo gửi thông tin thành công
      showModalOne();
      onCloseSurvey();
      // Gọi hàm onReset
      onReset();
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
      <div className={cx("seperate")}></div>
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
        </div>

        <div className={cx("dien-tich-container")}>
          <h2 className={cx("form_title")}>Mức giá (VND/tháng) </h2>
          <div className={cx("dien-tich-container1")}>
            <div className={cx("dien-tich-item")}>
              <span className={cx("dien-tich-label")}></span>
              <input
                type="text"
                name="giaMin"
                className={cx("dien-tich-input", errors.giaMin && "error")}
                placeholder="Nhập giá tối thiểu"
                value={formData.giaMin || ""}
                onChange={handleInputChange}
              />
            </div>
            <p> -- </p>
            <div className={cx("dien-tich-item")}>
              <span className={cx("dien-tich-label")}></span>
              <input
                type="text"
                name="giaMax"
                className={cx("dien-tich-input", errors.giaMax && "error")}
                placeholder="Nhập giá tối đa"
                value={formData.giaMax || ""}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        <div className={cx("dien-tich-container")}>
          <h2 className={cx("form_title")}>Diện tích m²</h2>
          <div className={cx("dien-tich-container1")}>
            <div className={cx("dien-tich-item")}>
              <span className={cx("dien-tich-label")}></span>
              <input
                type="text"
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
                type="text"
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
              Thêm ảnh phòng trọ
              <FontAwesomeIcon icon={faCamera} />
            </span>
          </label>

          {/* Hiển thị ảnh đã chọn */}
          <div className={cx("preview-container")}>
            {selectedImages.length > 0 &&
              selectedImages.map((image, index) => {
                const imageUrl = URL.createObjectURL(image);
                return (
                  <div key={index} className={cx("preview-item")}>
                    <img
                      src={imageUrl}
                      alt={`preview-${index}`}
                      className={cx("preview-image")}
                      onLoad={() => URL.revokeObjectURL(imageUrl)} // Giải phóng bộ nhớ sau khi tải ảnh
                    />
                    <button
                      type="button"
                      className={cx("delete-button")}
                      onClick={() => handleDeleteImage(index)}
                    >
                      ✖
                    </button>
                  </div>
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
          {errors.lat && (
            <span className={cx("error-message-map")}>{errors.lat}</span>
          )}
        </div>

        <button className={cx("btn")} onClick={handleSubmit}>
          Gửi
        </button>
      </div>
    </div>
  );
};

export default Survey;
