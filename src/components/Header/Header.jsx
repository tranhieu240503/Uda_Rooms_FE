import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSwipeable } from "react-swipeable";
import { jwtDecode } from "jwt-decode";
import {
  faMagnifyingGlass,
  faList,
  faComments,
  faSignInAlt,
  faHouseChimney,
  faUserPlus,
  faSignOutAlt,
  faArrowLeft,
  faUserShield,
} from "@fortawesome/free-solid-svg-icons";
import "../Header/Header.css";
import Filter from "../../Filter/Filter";
import Survey from "../../Survey/Survey";
import Login from "../../Login/Login";
import Signup from "../../Signup/Signup";
import useIsMobile from "../../hook/useIsMobile";
import Image from "../../CustomImage/CustomImage";
import Avatar from "../../images/avatar.jpg";
import { useNavigate } from "react-router-dom";
import Profile from "../../Profile/Profile";
import Map from "../Map/Map"; // Đường dẫn tới component Map

const API_URL = process.env.REACT_APP_API_URL;
// const API_URL = "https://bbfc-2405-4802-9603-89b0-3187-b0e5-aa4a-cb59.ngrok-free.app";

const Header = ({
  isInnerVisible,
  onSearchClick,
  onReset,
  onFilter,
  showModalOne,
  onInner,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeContent, setActiveContent] = useState("Filter");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [fullName, setFullName] = useState("");
  const [userAvatar, setUserAvatar] = useState(null);
  const [userRole, setUserRole] = useState(""); // Thêm state để lưu vai trò người dùng
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true); // true: Login, false: Signup

  // Add click handler for content area
  const handleContentClick = () => {
    setIsMenuOpen(false); // Close menu when clicking content
  };

  // Function to refresh user info from token
  const refreshUserInfo = () => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        setFullName(decodedUser.fullname);
        setUserAvatar(decodedUser.avatar);
        setUserRole(String(decodedUser.role)); // Chuyển role thành chuỗi // Lưu vai trò người dùng
        console.log("Decoded role:", decodedUser.role); // Kiểm tra giá trị role

        setIsLoggedIn(true);
        console.log("Decoded user:", decodedUser);
        console.log("userAvatar:", decodedUser.avatar);
        console.log("fullName:", decodedUser.fullname);
      } catch (error) {
        console.error("Token decoding error:", error);
        setIsLoggedIn(false);
        localStorage.removeItem("token");
      }
    } else {
      setIsLoggedIn(false);
    }
  };

  // Check login status when component mounts
  useEffect(() => {
    refreshUserInfo();
  }, []);

  // Refresh user info when activeContent changes
  useEffect(() => {
    if (activeContent === "Filter") {
      refreshUserInfo();
    }
  }, [activeContent]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    navigate("/");
    window.location.reload();
  };

 

  useEffect(() => {
    if (!isInnerVisible) {
      setIsMenuOpen(false);
    }
  }, [isInnerVisible]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
    }
  };

  const handleContentChange = (content) => {
    setActiveContent(content);
    setIsMenuOpen(false);
  };

  const handleCloseSurvey = () => {
    setActiveContent("Filter");
  };

  const handleCloseLogin = () => {
    setActiveContent("Filter");
  };

  const handleCloseSignup = () => {
    setActiveContent("Filter");
  };

  const handleOpenLogin = () => {
    setActiveContent("Login");
    setIsLogin(true); // Chuyển sang Login
  };

  const handleOpenSignup = () => {
    setActiveContent("Signup");
    setIsLogin(false); // Chuyển sang Signup
  };

  const handleCloseProfile = () => {
    setActiveContent("Filter");
    refreshUserInfo(); // Làm mới thông tin người dùng khi đóng Profile
  };

  const handleAvatarUpdate = (newAvatar) => {
    setUserAvatar(newAvatar);
  };

  const handleUserUpdate = (updatedUserData) => {
    setFullName(updatedUserData.fullname);
    setUserAvatar(updatedUserData.avatar);
  };

  // Loại bỏ dấu / thừa trong userAvatar
  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return "";
    // Loại bỏ dấu / ở đầu nếu có
    const cleanPath = avatarPath.startsWith("/")
      ? avatarPath.slice(1)
      : avatarPath;

    return `${API_URL}/upload_avataruser/${cleanPath}`;
  };

  return (
    <div
    
      className={`inner ${isInnerVisible ? "visible" : "hidden"}`}
    >
      <header className="header">
        <div className="logo-list" onClick={toggleMenu}>
          <FontAwesomeIcon icon={faList} />
        </div>
        <div className="logo">
          <img src="images/UDA_logo.png" alt="Logo" />
          <div className="text">
            <h3 className="text-1">UDA MAP</h3>
            <h4 className="tex-2">Bản đồ nhà trọ sinh viên UDA</h4>
          </div>
        </div>
        <div
          onClick={() => handleContentChange("Filter")}
          className="logo-find"
        >
          <FontAwesomeIcon icon={faMagnifyingGlass} />
        </div>

        <div className="logo-left" onClick={handleReset}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </div>

        <div className={`menu ${isMenuOpen ? "open" : ""}`}>
          <ul>
            {!isLoggedIn ? (
              <>
                <li onClick={() => handleContentChange("Login")}>
                  <FontAwesomeIcon icon={faSignInAlt} className="menu-icon" />
                  <span>Đăng nhập</span>
                </li>
                <li onClick={() => handleContentChange("Signup")}>
                  <FontAwesomeIcon icon={faUserPlus} className="menu-icon" />
                  <span>Đăng ký</span>
                </li>
              </>
            ) : (
              <>
                <li onClick={() => handleContentChange("Profile")}>
                  {userAvatar ? (
                    <Image
                      src={getAvatarUrl(userAvatar)}
                      alt="Profile"
                      className="user-avatar"
                      onError={(e) => {
                        console.log("Lỗi tải ảnh:", e);
                        e.target.src = Avatar;
                      }}
                    />
                  ) : (
                    <Image
                      src={Avatar}
                      alt="Default Avatar"
                      className="user-avatar"
                    />
                  )}
                  <span>{fullName || "Người dùng"}</span>
                </li>
                 {/* Hiển thị nút Trang Admin nếu vai trò là admin */}
                 {userRole === "1" && (
                  <li onClick={() => navigate("/admin")}>
                    <FontAwesomeIcon icon={faUserShield} className="menu-icon" />
                    <span>Quản lý</span>
                  </li>
                )}
                <li onClick={handleLogout}>
                  <FontAwesomeIcon icon={faSignOutAlt} className="menu-icon" />
                  <span>Đăng xuất</span>
                </li>
               
              </>
            )}
            <li onClick={() => handleContentChange("Survey")}>
              <FontAwesomeIcon icon={faHouseChimney} className="menu-icon" />
              <span>Giới thiệu nhà trọ</span>
            </li>
            <li onClick={() => navigate("/forum")}>
              <FontAwesomeIcon icon={faComments} className="menu-icon" />
              <span>Diễn đàn</span>
            </li>
          </ul>
        </div>
      </header>
      <div className="content_list" onClick={handleContentClick}>
        {activeContent === "Filter" && (
          <Filter onReset={onReset} onFilter={onFilter} />
        )}

        {activeContent === "Survey" && (
          <Survey
            onCloseSurvey={handleCloseSurvey}
            showModalOne={showModalOne}
            onReset={onReset}
          />
        )}

        {/* {activeContent === "Map" && (
          <Map /> // Hiển thị component Map
        )} */}

        {activeContent === "Login" && (
          <Login
            onSwitchToSignup={handleOpenSignup}
            onCloseLogin={handleCloseLogin}
          />
        )}
        {activeContent === "Signup" && (
          <Signup
            onSwitchToLogin={handleOpenLogin}
            onCloseSignup={handleCloseSignup}
          />
        )}

        {activeContent === "Profile" && (
          <Profile
            onCloseProfile={handleCloseProfile}
            onAvatarUpdate={handleAvatarUpdate}
            onUserUpdate={handleUserUpdate}
          />
        )}
      </div>
    </div>
  );
};

export default Header;
