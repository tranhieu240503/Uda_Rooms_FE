import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames/bind";
import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import useIsMobile from "../hook/useIsMobile";
import { fetchFind, fetchThongTinThem, fetchTienNghi } from "../services/api"; // Import hàm fetchTienIch
import styles from "./Filter.module.scss";
import { ModalContext } from "../App";

const cx = classNames.bind(styles);

const Filter = ({ onFilter, onReset }) => {
  const [showMore, setShowMore] = useState(false);
  const [selectedArea, setSelectedArea] = useState("");
  const [lengthdata, setlenghtdata] = useState(null);
  const [tienNghiList, setTienNghiList] = useState([]); // Lưu tiện nghi
  const [thongtinthemList, setThongTinThemList] = useState([]); // Lưu thông tin thêm
  const [showResult, setShowResult] = useState(false); // Hiển thị thông báo kết quả
  const [formData, setFormData] = useState({
    giaMin: "",
    giaMax: "",
    kichThuocMin: "",
    kichThuocMax: "",
    chungChu: false,
    thuCung: false,
    TienNghi: [],
    thongTinThem: [],
    radius: "",
  });
  const { showModal } = useContext(ModalContext);

  const isMobile = useIsMobile();

  const handleShowMore = () => {
    setShowMore(!showMore);
  };

  const handleInput = (e) => {
    const { name, value } = e.target;

    // Loại bỏ dấu chấm trước khi xử lý lại số
    const rawValue = value.replace(/\./g, "");

    // Nếu giá trị là số âm hoặc không hợp lệ, không cập nhật state
    if (parseInt(rawValue, 10) < 0 || isNaN(parseInt(rawValue, 10))) {
      setFormData((prev) => ({
        ...prev,
        [name]: "", // Xóa giá trị nếu không hợp lệ
      }));
      return;
    }

    // Nếu giá trị là số âm hoặc không hợp lệ, không cập nhật state

    // Nếu là số hợp lệ, format lại
    const formattedValue = rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    setFormData({ ...formData, [name]: formattedValue });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Loại bỏ các ký tự không phải số
    const numericValue = value.replace(/[^0-9]/g, "");

    // Cập nhật state với giá trị hợp lệ
    setFormData((prev) => ({
      ...prev,
      [name]: numericValue,
    }));
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    const id = parseInt(value); // Chuyển giá trị về số nguyên

    setFormData((prev) => {
      const newTienNghi = checked
        ? [...prev.TienNghi, id] // Nếu chọn → thêm vào mảng
        : prev.TienNghi.filter((item) => item !== id); // Nếu bỏ chọn → loại bỏ khỏi mảng

      return { ...prev, TienNghi: newTienNghi };
    });
  };

  const handleCheckboxChange1 = (e) => {
    const { value, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      thongTinThem: checked
        ? [...prev.thongTinThem, value] // Nếu được chọn → thêm vào mảng
        : prev.thongTinThem.filter((item) => item !== value), // Nếu bỏ chọn → loại bỏ khỏi mảng
    }));
  };

  useEffect(() => {
    const fetchtiennghi1 = async () => {
      try {
        const response = await fetchTienNghi();
        const response1 = await fetchThongTinThem();
        setTienNghiList(response);
        setThongTinThemList(response1);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách nội thất:", error);
      }
    };

    fetchtiennghi1();
  }, []);

  const handleCheckboxChangeBoolean = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked, // Chuyển đổi giá trị boolean
    }));
  };

  const handleRadiusChange = (e) => {
    const value = e.target.value;
    if (selectedArea === value) {
      setSelectedArea("");
      setFormData((prev) => ({
        ...prev,
        radius: "",
      }));
    } else {
      setSelectedArea(value);
      const radius = parseInt(value.replace(/\D/g, ""), 10) * 1000;
      setFormData((prev) => ({
        ...prev,
        radius: radius,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const dataToSend = {
        ...formData,
        giaMin: formData.giaMin
          ? parseInt(formData.giaMin.replace(/\./g, ""), 10)
          : null,
        giaMax: formData.giaMax
          ? parseInt(formData.giaMax.replace(/\./g, ""), 10)
          : null,
      };

      const infoResponse = await fetchFind(dataToSend);

      setlenghtdata(infoResponse.data.length);
      setShowResult(true); // Hiển thị thông báo kết quả
      onFilter(infoResponse.data); // Gọi hàm onFilter với dữ liệu đã lọc
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

  return (
    <div className={cx("wrapper")}>
      <div className={cx("header")}>
        <p className={cx("heading_title")}>Tìm Kiếm</p>
      </div>
      
      <div className={cx("content")}>
        <>
          {/* Nội dung tìm kiếm */}
          <div className={cx("list")}>
            <h3 className={cx("list_title")}>
              {selectedArea
                ? `Khoảng cách: ${selectedArea}`
                : "Khoảng cách từ trọ tới trường"}
            </h3>
            <FontAwesomeIcon className={cx("down")} icon={faChevronDown} />
            <div className={cx("list_inner")}>
              {["Dưới 1km", "Dưới 2km", "Dưới 3km", "Tất cả"].map((item) => (
                <label key={item} className={cx("inner_spacer")}>
                  <input
                    type="radio"
                    className={cx("inner_radio")}
                    name="banKinh"
                    value={item}
                    checked={selectedArea === item}
                    onChange={handleRadiusChange}
                  />
                  <p className={cx("inner_title")}>{item}</p>
                </label>
              ))}
            </div>
          </div>

          <div className={cx("dien-tich-container")}>
            <h2 className={cx("title_desc")}>Mức giá (VND/tháng)</h2>
            <div className={cx("dien-tich-container1")}>
              <div className={cx("dien-tich-item")}>
                <input
                  type="text"
                  name="giaMin"
                  className={cx("dien-tich-input")}
                  placeholder="Giá tối thiểu"
                  value={formData.giaMin}
                  onChange={handleInput}
                />
              </div>

              <div className={cx("dien-tich-item")}>
                <input
                  type="text"
                  name="giaMax"
                  className={cx("dien-tich-input")}
                  placeholder="Giá tối đa"
                  value={formData.giaMax}
                  onChange={handleInput}
                />
              </div>
            </div>
          </div>

          <div className={cx("dien-tich-container")}>
            <h2 className={cx("title_desc")}>Diện tích m²</h2>
            <div className={cx("dien-tich-container1")}>
              <div className={cx("dien-tich-item")}>
                <input
                  type="text"
                  name="kichThuocMin"
                  className={cx("dien-tich-input")}
                  placeholder="Diện tích tối thiểu"
                  value={formData.kichThuocMin}
                  onChange={handleInputChange}
                />
              </div>

              <div className={cx("dien-tich-item")}>
                <input
                  type="text"
                  name="kichThuocMax"
                  className={cx("dien-tich-input")}
                  placeholder="Diện tích tối đa"
                  value={formData.kichThuocMax}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <div className={cx("option")}>
            <div className={cx("form_group")}>
              <h3 className={cx("title_desc")}>Tiện nghi phòng</h3>
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
          </div>
          <div className={cx("seperate")}></div>
          <button className={cx("search")} onClick={handleSubmit}>
            Tìm ngay
          </button>
        </>
        {showResult && (
          <div className={cx("modal-overlay")}>
            <div className={cx("modal-content")}>
              <p
                style={{
                  textAlign: "center",
                  fontWeight: "bold",
                  color: "red",
                }}
              >
                Có {lengthdata} phòng trọ phù hợp với bạn
              </p>
              <button
                className={cx("search")}
                onClick={() => {
                  setShowResult(false); // Ẩn thông báo
                  if (isMobile) {
                    onReset(); // Reset giao diện
                  }
                }}
              >
                Tiếp tục
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Filter;
