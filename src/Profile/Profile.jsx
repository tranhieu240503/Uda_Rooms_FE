import React, { useState, useEffect, useCallback } from "react"; // Thêm useCallback
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faCamera } from "@fortawesome/free-solid-svg-icons";
import classNames from "classnames/bind";
import styles from "./Profile.module.scss";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import Image from "../CustomImage/CustomImage";
import Avatar from "../images/avatar.jpg";

const cx = classNames.bind(styles);
const API_URL = "http://localhost:8000";

const Profile = ({ onCloseProfile, onAvatarUpdate }) => {
  const [userData, setUserData] = useState({
    fullname: "",
    email: "",
    avatar: null,
    phone: "",
    gender: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [imagePreview, setImagePreview] = useState(null);

  // Sử dụng useCallback để định nghĩa fetchUserData
  const fetchUserData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const decodedToken = jwtDecode(token);
      console.log("Decoded token:", decodedToken); // Kiểm tra token decode

      const response = await axios.get(
        `${API_URL}/api/user/${decodedToken.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("API Response:", response.data); // Kiểm tra response

      const user = response.data;
      setUserData({
        fullname: user.fullname || "Chưa cập nhật",
        email: user.email || "Chưa cập nhật",
        avatar: user.avatar || null, // Thêm fallback cho avatar
        phone: user.phone || "Chưa cập nhật",
        gender: user.gender || "Chưa cập nhật",
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }, []); // Dependency array rỗng vì không phụ thuộc vào state nào

  // Gọi fetchUserData trong useEffect
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]); // Thêm fetchUserData vào dependency array

  // Handle edit mode
  const handleEditClick = () => {
    setIsEditing(true);
    setEditedData(userData);
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  
  // Handle save changes
  const handleSaveChanges = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
  
      const response = await axios.put(`${API_URL}/api/user/update`, editedData, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (response.status === 200) {
        setUserData((prev) => ({ ...prev, ...editedData }));
  
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
          window.dispatchEvent(new Event("storage")); // Cập nhật UI toàn bộ app
        }
  
        setIsEditing(false);
        alert("Cập nhật thông tin thành công!");
      }
    } catch (error) {
      console.error("Lỗi cập nhật thông tin:", error);
      alert("Có lỗi xảy ra!");
    }
  };
  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedData(userData);
  };

  // Handle image change
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const imageURL = URL.createObjectURL(file);
    setImagePreview(imageURL); // Hiển thị ảnh xem trước ngay lập tức
  
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
  
      const formData = new FormData();
      formData.append("avatar", file);
  
      const response = await axios.put(
        `${API_URL}/api/user/upload-avatar`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      if (response.status === 200) {
        const newAvatarURL = `${API_URL}${response.data.avatar}?t=${Date.now()}`; // Thêm timestamp tránh cache
  
        // Cập nhật avatar ngay lập tức
        setUserData((prev) => ({
          ...prev,
          avatar: newAvatarURL, 
        }));
  
        setImagePreview(newAvatarURL); // Cập nhật ảnh xem trước để phản ánh thay đổi ngay
  
        // Gửi avatar mới cho component cha nếu cần
        if (onAvatarUpdate) {
          onAvatarUpdate(newAvatarURL);
        }
  
        alert("Cập nhật ảnh đại diện thành công!");
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      alert("Có lỗi xảy ra khi cập nhật ảnh đại diện!");
      setImagePreview(null);
    }
  };
  
  return (
    <div className={cx("profile")}>
      <header className={cx("header")}>
        <h3 className={cx("heading")}>Thông tin cá nhân</h3>
        <button className={cx("close")} onClick={onCloseProfile}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </header>

      <div className={cx("content")}>
        <div className={cx("avatar-section")}>
          <div className={cx("avatar-container")}>
          {imagePreview ? (
  <Image
    src={imagePreview}
    alt="Profile Preview"
    className={cx("avatar")}
  />
) : userData.avatar ? (
  <>
    {console.log(
      "URL ảnh trong frontend:",
      `${API_URL}${userData.avatar}`
    )}
    <Image
      src={`${API_URL}${userData.avatar}`}
      alt="Profile"
      className={cx("avatar")}
      onError={(e) => {
        console.log("Lỗi tải ảnh:", e);
        e.target.src = Avatar; // Hiển thị ảnh mặc định nếu không tải được
      }}
    />
  </>
) : (
  <img 
  src={`${userData.avatar}?t=${new Date().getTime()}`} 
  alt="Avatar" 
  className="avatar"
/>
)}
            {isEditing && (
              <label className={cx("avatar-upload")}>
                <FontAwesomeIcon icon={faCamera} />
                <input
                  type="file"
                  accept="image/*"
                  className={cx("file-input")}
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>
        </div>

        <div className={cx("info-section")}>
          <div className={cx("info-group")}>
            <label>Họ và tên</label>
            <input
              type="text"
              name="fullname"
              value={isEditing ? editedData.fullname : userData.fullname}
              onChange={handleInputChange}
              readOnly={!isEditing}
            />
          </div>

          <div className={cx("info-group")}>
            <label>Email</label>
            <input type="email" value={userData.email} readOnly />
          </div>

          <div className={cx("info-group")}>
            <label>Số điện thoại</label>
            <input
              type="tel"
              name="phone"
              value={isEditing ? editedData.phone : userData.phone}
              onChange={handleInputChange}
              readOnly={!isEditing}
            />
          </div>

          <div className={cx("info-group")}>
            <label>Giới tính</label>
            {isEditing ? (
              <select
                name="gender"
                value={editedData.gender}
                onChange={handleInputChange}
              >
                <option value="">Chọn giới tính</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            ) : (
              <input type="text" value={userData.gender} readOnly />
            )}
          </div>
        </div>

        {isEditing ? (
          <div className={cx("button-group")}>
            <button className={cx("save-button")} onClick={handleSaveChanges}>
              Lưu thay đổi
            </button>
            <button className={cx("cancel-button")} onClick={handleCancelEdit}>
              Hủy
            </button>
          </div>
        ) : (
          <button className={cx("edit-button")} onClick={handleEditClick}>
            Chỉnh sửa thông tin
          </button>
        )}
      </div>
    </div>
  );
};

export default Profile;