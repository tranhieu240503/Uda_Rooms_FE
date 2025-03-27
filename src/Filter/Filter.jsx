import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames/bind";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useIsMobile from "../hook/useIsMobile";
import { fetchFind, fetchThongTinThem, fetchTienNghi } from "../services/api"; // Import hàm fetchTienIch
import styles from "./Filter.module.scss";

const cx = classNames.bind(styles);

const Filter = ({ onFilter, onReset }) => {
  const [showMore, setShowMore] = useState(false);
  const [selectedArea, setSelectedArea] = useState("");
  const navigate = useNavigate();
  const [lengthdata, setlenghtdata] = useState(null);
  const [tienNghiList, setTienNghiList] = useState([]); //lưu tiennghi
  const [thongtinthemList, setThongTinThemList] = useState([]); //lưu tiennghi
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

  const isMobile = useIsMobile();

  const handleShowMore = () => {
    setShowMore(!showMore);
  };

  // Nhập input
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Box change
  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    const id = parseInt(value); // Chuyển giá trị về số nguyên
  
    setFormData((prev) => {
      const newTienNghi = checked
        ? [...prev.TienNghi, id] // Nếu chọn → thêm vào mảng
        : prev.TienNghi.filter((item) => item !== id); // Nếu bỏ chọn → loại bỏ khỏi mảng
  
      console.log("Cập nhật TienNghi:", newTienNghi); // Kiểm tra giá trị sau khi cập nhật
  
      return { ...prev, TienNghi: newTienNghi };
    });
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

  // Checkbox boolean
  const handleCheckboxChangeBoolean = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked, // Chuyển đổi giá trị boolean
    }));
  };

  // Hành động khi chọn trường radio
  const handleRadiusChange = (e) => {
    const value = e.target.value;
    if (selectedArea === value) {
      // If clicking the same value, unselect it
      setSelectedArea("");
      setFormData((prev) => ({
        ...prev,
        radius: "",
      }));
    } else {
      // If clicking a new value, select it
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
      // Gửi thông tin trọ
      console.log(formData);

      // const infoResponse = await axios.post(
      //   "http://localhost:8000/api/find-nha-tro",
      //   formData,
      //   {
      //     headers: { "Content-Type": "application/json" },
      //   }
      // );
      const infoResponse = await fetchFind(formData);

      console.log("Phản hồi từ API:", infoResponse.data);
      setlenghtdata(infoResponse.data.length);

      onFilter(infoResponse.data); // Gọi hàm onFilter với dữ liệu đã lọc
      if (isMobile) {
        onReset();
      }
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
        <div className={cx("list")}>
          <h3 className={cx("list_title")}>
            {selectedArea
              ? `Khoảng cách: ${selectedArea}`
              : "Khoảng cách từ trọ tới trường"}
          </h3>
          <FontAwesomeIcon className={cx("down")} icon={faChevronDown} />
          <div className={cx("list_inner")}>
            {["Dưới 1km", "Dưới 2km", "Dưới 3km", "Không chọn"].map((item) => (
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
          <h2 className={cx("title_desc")}>Mức giá (triệu/tháng)</h2>
          <div className={cx("dien-tich-container1")}>
            <div className={cx("dien-tich-item")}>
              <input
                type="number"
                name="giaMin"
                className={cx("dien-tich-input")}
                placeholder="Giá tối thiểu"
                value={formData.giaMin}
                onChange={handleInputChange}
              />
            </div>

            <div className={cx("dien-tich-item")}>
              <input
                type="number"
                name="giaMax"
                className={cx("dien-tich-input")}
                placeholder="Giá tối đa"
                value={formData.giaMax}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        <div className={cx("dien-tich-container")}>
          <h2 className={cx("title_desc")}>Diện tích (m2)</h2>
          <div className={cx("dien-tich-container1")}>
            <div className={cx("dien-tich-item")}>
              <input
                type="number"
                name="kichThuocMin"
                className={cx("dien-tich-input")}
                placeholder="Diện tích tối thiểu"
                value={formData.kichThuocMin}
                onChange={handleInputChange}
              />
            </div>

            <div className={cx("dien-tich-item")}>
              <input
                type="number"
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

          <div className={cx("seperate")}></div>

          {lengthdata !== null && lengthdata !== undefined && (
            <div
              style={{ textAlign: "center", fontWeight: "bold", color: "red" }}
            >
              Có {lengthdata} phòng phù hợp với bạn
            </div>
          )}
        </div>
      </div>

      <button className={cx("search")} onClick={handleSubmit}>
        Tìm ngay
      </button>
    </div>
  );
};
//
export default Filter;
