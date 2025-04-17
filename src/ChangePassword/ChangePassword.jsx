import React, { useState, useContext } from "react";
import classNames from "classnames/bind";
import styles from "./ChangePassword.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { jwtDecode } from "jwt-decode";
import { ModalContext } from "../App";

import bcrypt from "bcryptjs"; 
import updateUserInfo  from "../services/api"

import { faChevronLeft, faTimes } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

const cx = classNames.bind(styles);

const ChangePassword = ({ onBack }) => {
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const { showModal } = useContext(ModalContext);

  

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const fetchUserPassword = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;
  
      const decodedToken = jwtDecode(token);
      console.log("Decoded token:", decodedToken);
  
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/user/${decodedToken.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (!response.data || !response.data.password) {
        console.error("API không trả về mật khẩu hợp lệ.");
        return null;
      }
  
      return response.data.password;
    } catch (error) {
      console.error("Lỗi khi lấy mật khẩu người dùng:", error);
      return null;
    }
  };



const handleSubmit = async (e) => {
  e.preventDefault();

  const newErrors = {};

  // Validate currentPassword
  if (!passwordData.currentPassword) {
    newErrors.currentPassword = "Vui lòng nhập mật khẩu hiện tại.";
  } else {
    const userPassword = await fetchUserPassword();
    if (userPassword) {
      const isMatch = bcrypt.compareSync(passwordData.currentPassword, userPassword);
      if (!isMatch) {
        newErrors.currentPassword = "Mật khẩu hiện tại không chính xác.";
      }
    } else {
      newErrors.currentPassword = "Không thể xác thực mật khẩu.";
    }
  }

  // Validate newPassword
  if (!passwordData.newPassword) {
    newErrors.newPassword = "Vui lòng nhập mật khẩu mới.";
  } else if (passwordData.newPassword.length < 6) {
    newErrors.newPassword = "Mật khẩu mới phải có ít nhất 6 ký tự.";
  } else if (passwordData.newPassword === passwordData.currentPassword) {
    newErrors.newPassword = "Mật khẩu mới không được trùng với mật khẩu hiện tại.";
  }

  // Validate confirmPassword
  if (!passwordData.confirmPassword) {
    newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu.";
  } else if (passwordData.confirmPassword !== passwordData.newPassword) {
    newErrors.confirmPassword = "Mật khẩu xác nhận không khớp.";
  }

  setErrors(newErrors);

  // Nếu không có lỗi, thực hiện gửi API
  if (Object.keys(newErrors).length === 0) {
    try {
      setIsSubmitting(true); // Bắt đầu gửi yêu cầu
      const token = localStorage.getItem("token"); // Lấy token từ localStorage

      // Hash mật khẩu mới trước khi gửi
      // const hashedPassword = bcrypt.hashSync(passwordData.newPassword, 10);

      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/user/update`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword, // Gửi mật khẩu đã mã hóa
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        const newToken = response.data.token; // Lấy token mới từ API
        localStorage.setItem("token", newToken); // Lưu token mới vào localStorage
        showModal("Mật khẩu được thay đổi thành công!" );
       

        onBack(); // Quay lại trang trước
      }
    } catch (error) {
      console.error("Lỗi khi đổi mật khẩu:", error);
      setErrors({
        submit: error.response?.data?.message || "Có lỗi xảy ra!",
      });
      showModal("Lỗi", "Có lỗi xảy ra khi đổi mật khẩu. Vui lòng thử lại.", "error");
    } finally {
      setIsSubmitting(false); // Kết thúc gửi yêu cầu
    }
  }
};

  return (
    <div className={cx("change-password")}>
      <header className={cx("header")}>
        <button className={cx("back-button")} onClick={onBack}>
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <h3 className={cx("heading_password")}>Đổi mật khẩu</h3>
      </header>
      <form className={cx("form")} onSubmit={handleSubmit}>
        <div className={cx("form-group")}>
        <input
  type="password"
  name="currentPassword"
  className={cx("login__container-input")}
  value={passwordData.currentPassword || ""} // Default to an empty string
  onChange={handleInputChange}
  placeholder=" "
  id="password"
  required
/>
          <label
            htmlFor="password"
            className={cx("login__container-label-one")}
          >
            Mật khẩu hiện tại..
          </label>
          {errors.currentPassword && (
            <span className={cx("error-message")}>
              {errors.currentPassword}
            </span>
          )}
        </div>
        <div className={cx("form-group")}>
        <input
  type="password"
  name="newPassword"
  className={cx("login__container-input")}
  value={passwordData.newPassword || ""} // Default to an empty string
  onChange={handleInputChange}
  placeholder=" "
  id="newPassword"
  required
/>
          <label
            htmlFor="newPassword"
            className={cx("login__container-label-two")}
          >
            Mật khẩu mới..
          </label>
          {errors.newPassword && (
            <span className={cx("error-message")}>{errors.newPassword}</span>
          )}
        </div>
        <div className={cx("form-group")}>
        <input
  type="password"
  name="confirmPassword"
  className={cx("login__container-input")}
  value={passwordData.confirmPassword || ""} // Default to an empty string
  onChange={handleInputChange}
  placeholder=" "
  id="confirmNewPassword"
  required
/>
          <label
            htmlFor="confirmNewPassword"
            className={cx("login__container-label-there")}
          >
            Xác nhận mật khẩu..
          </label>
          {errors.confirmPassword && (
            <span className={cx("error-message")}>
              {errors.confirmPassword}
            </span>
          )}
        </div>
        <button type="submit" className={cx("submit-button")} disabled={isSubmitting}>
  {isSubmitting ? "Đang xử lý..." : "Đổi mật khẩu"}
</button>
      </form>
    </div>
  );
};

export default ChangePassword;