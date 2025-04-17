import React, { useState, useContext } from "react";
import PropTypes from "prop-types";
import classNames from "classnames/bind";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
// import Login from "../../Login/Login";
import styles from "./Signup.module.scss";
import facebookIcon from "../images/google.png";
import GoogleIcon from "../images/chorme.png";
import { postSignup, postLogin } from "../services/api"; // Change this import
import Image from "../CustomImage/CustomImage";
import { ModalContext } from "../App";

const cx = classNames.bind(styles);

export default function Signup({ onCloseSignup, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "", // Add fullName field
    role: "2", // Add default role as user
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(false);
  const { showModal } = useContext(ModalContext);
  const handleClose = () => {
    if (onCloseSignup) {
      onCloseSignup();
    }
    navigate("/");
  };

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

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Update handleSubmit function
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra validate form nhưng không return sớm
    const isValid = validateForm();

    // Only proceed if validation passes
    if (!isValid) {
      return; // Stop here if validation fails
    }
    try {
      setIsLoading(true);
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...signupData } = formData;

      console.log("Sending signup data:", signupData); // Debug log

      const signupResponse = await postSignup(signupData);
      console.log("Signup response:", signupResponse);

      if (signupResponse) {
        // Gọi API đăng nhập sau khi đăng ký thành công
        const loginData = {
          email: formData.email,
          password: formData.password,
        };

        console.log("Logging in with:", loginData);

        const loginResponse = await postLogin(loginData);
        console.log("Login response:", loginResponse);

        if (loginResponse && loginResponse.token) {
          localStorage.setItem("token", loginResponse.token);
          if (loginResponse.user) {
            localStorage.setItem("user", JSON.stringify(loginResponse.user));
          }

          // Hiển thị thông báo thành công
          showModal(
            "Đăng ký và đăng nhập thành công!",
            "Chào mừng bạn đến với UDA MAP."
          );

          // Chuyển hướng về trang chính
          handleClose();
          navigate("/");
        }
      }
    } catch (error) {
      console.error("Signup error:", error);
      setErrors({
        submit:
          error.response?.data?.message ||
          "Đăng ký không thành công. Vui lòng thử lại.",
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

  return (
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
          <h3 className={cx("login__container-heading")}>Đăng ký</h3>
          <h3 className={cx("login__container-desc")}>
            Chào mừng đến với UDA MAP
          </h3>
          <p className={cx("login__container-introduce")}>
            Tạo tài khoản của bạn
          </p>

          <form onSubmit={handleSubmit} noValidate>
            {/* Email field */}
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

            {/* Password field */}
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

            {/* Confirm Password field */}
            <div className={cx("form-group")}>
              <input
                type="password"
                onChange={handleInputChange}
                value={formData.confirmPassword}
                className={cx("login__container-input", {
                  error: errors.confirmPassword,
                })}
                placeholder=" "
                id="confirmPassword"
                name="confirmPassword"
                disabled={isLoading}
              />
              <label
                htmlFor="confirmPassword"
                className={cx("login__container-label-there")}
              >
                Xác nhận mật khẩu
              </label>
              {errors.confirmPassword && (
                <span className={cx("error-message")}>
                  {errors.confirmPassword}
                </span>
              )}
            </div>

            {/* Submit error message */}
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
              {isLoading ? "Đang xử lý..." : "Đăng Ký"}
            </button>
          </form>

          <div className={cx("login__container-signup")}>
            <p className={cx("login_signup-title")}>Bạn đã có tài khoản?</p>
            <a
              className={cx("signup_login-desc")}
              onClick={onSwitchToLogin}
              style={{ cursor: "pointer" }}
            >
              Đăng nhập
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

Signup.propTypes = {
  onCloseSignup: PropTypes.func.isRequired, // Sửa từ onCloseLogin thành onCloseSignup
};
