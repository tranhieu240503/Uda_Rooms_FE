import React, { useState, useContext } from "react";
import PropTypes from "prop-types";
import classNames from "classnames/bind";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

import { ModalContext } from "../App";
import styles from "./Login.module.scss";
import facebookIcon from "../images/google.png";
import GoogleIcon from "../images/chorme.png";
import { postLogin } from "../services/api";
import Image from "../CustomImage/CustomImage";
import Modal from "../components/Modal/Modal";

const cx = classNames.bind(styles);

export default function Login({ onCloseLogin, onSwitchToSignup }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { showModal } = useContext(ModalContext);
  // const [isModalVisible, setIsModalVisible] = useState(true);
  // const showModal = () => {
  //   setIsModalVisible(false); // Đặt trạng thái về false
  //   setTimeout(() => {
  //     setIsModalVisible(true); // Đặt lại trạng thái về true
  //   }, 50); // Đặt timeout ngắn để đảm bảo React nhận ra sự thay đổi
  // };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email?.trim()) {
      newErrors.email = "Vui lòng nhập email";
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)
    ) {
      newErrors.email = "Email không hợp lệ";
    } else if (formData.email.length > 100) {
      newErrors.email = "Email không được quá 100 ký tự";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    } else if (formData.password.length > 50) {
      newErrors.password = "Mật khẩu không được quá 50 ký tự";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      const response = await postLogin(formData);

      if (response && response.token) {
        // Save token to localStorage
        localStorage.setItem("token", response.token);
        // Save user info if available
        if (response.user) {
          localStorage.setItem("user", JSON.stringify(response.user));
        }
        handleClose();
        showModal("Đăng nhập thành công!", "Chào mừng bạn trở lại.");
        navigate("/"); // Redirect to filter page after login
        // window.location.reload(); // Reload to update header menu
      } else {
        throw new Error("Đăng nhập không thành công");
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrors({
        submit:
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Email hoặc mật khẩu không chính xác",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleClose = () => {
    onCloseLogin();
    navigate("/");
  };

  return (
    <>
      <div className={cx("login")} id="login-one">
        <div className={cx("login__container")}>
          <button
            className={cx("login__container-close")}
            onClick={handleClose}
            aria-label="Close login"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>

          <div className={cx("login__container-form")}>
            <h3 className={cx("login__container-heading")}>Đăng nhập</h3>
            <h3 className={cx("login__container-desc")}>
              Chào mừng bạn trở lại
            </h3>
            <p className={cx("login__container-introduce")}>
              <br />
            </p>

            <form onSubmit={handleSubmit} noValidate>
              <div className={cx("form-group")}>
                <input
                  type="email"
                  onChange={handleInputChange}
                  value={formData.email}
                  className={cx("login__container-input", {
                    error: errors.email,
                  })}
                  placeholder=" "
                  id="email"
                  name="email"
                  disabled={isLoading}
                />
                <label
                  htmlFor="email"
                  className={cx("login__container-label-one")}
                >
                  Email
                </label>
                {errors.email && (
                  <span className={cx("error-message")}>{errors.email}</span>
                )}
              </div>

              <div className={cx("form-group")}>
                <input
                  type="password"
                  onChange={handleInputChange}
                  value={formData.password}
                  className={cx("login__container-input", {
                    error: errors.password,
                  })}
                  placeholder=" "
                  id="password"
                  name="password"
                  disabled={isLoading}
                />
                <label
                  htmlFor="password"
                  className={cx("login__container-label-two")}
                >
                  Mật khẩu
                </label>
                {errors.password && (
                  <span className={cx("error-message")}>{errors.password}</span>
                )}
              </div>

              {errors.submit && (
                <div className={cx("submit-error")}>{errors.submit}</div>
              )}

              <button
                type="submit"
                className={cx("login__container-btn")}
                disabled={isLoading}
              >
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                {isLoading ? "Đang xử lý..." : "Đăng Nhập"}
              </button>
            </form>

            <div className={cx("login__container-signup")}>
              <p className={cx("login_signup-title")}>Bạn chưa có tài khoản?</p>
              <a
                className={cx("login_signup-desc")}
                onClick={onSwitchToSignup}
                style={{ cursor: "pointer" }}
              >
                Đăng ký
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

Login.propTypes = {
  onCloseLogin: PropTypes.func.isRequired,
};
