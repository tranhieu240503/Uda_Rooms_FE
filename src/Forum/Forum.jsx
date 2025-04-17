import React, { useState, useEffect, useRef, useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import {
  faThumbsUp,
  faComment,
  faPaperPlane,
  faXmark,
  faChevronLeft,
  faChevronDown,
  faSearch,
  faChevronUp,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import classNames from "classnames/bind";
import styles from "./Forum.module.scss";
import Image from "../CustomImage/CustomImage";
import BackgroundImage from "../images/UDA_Background.jpg";
import Avatar from "../images/avatar.jpg";
import { useNavigate } from "react-router-dom";
import { Carousel } from "react-responsive-carousel";

import { ModalContext } from "../App";

import Login from "../Login/Login";
import Modal from "../components/Modal/Modal";
import ConfirmModal from "../components/ConfirmModal/ConfirmModal";
const API_URL = process.env.REACT_APP_API_URL; // Đường dẫn API của bạn

const cx = classNames.bind(styles);

// Thêm interceptor để tự động thêm header ngrok
axios.interceptors.request.use((config) => {
  config.headers["ngrok-skip-browser-warning"] = "true";
  return config;
});

const Forum = ({ onCloseForum }) => {
  const [showPostForm, setShowPostForm] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]); // Mảng chứa các hình ảnh
  const [selectedImage, setSelectedImage] = useState(null); // Lưu URL ảnh được chọn
  const [postImages, setPostImages] = useState([]); // Mảng chứa các file hình ảnh
  const [postContent, setPostContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [postType, setPostType] = useState("Tìm kiếm phòng trọ");
  const [filterType, setFilterType] = useState("Tất cả");
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [likedPosts, setLikedPosts] = useState(() => {
    const saved = localStorage.getItem("likedPosts");
    return saved ? JSON.parse(saved) : {};
  });
  const [showFilter, setShowFilter] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentCounts, setCommentCounts] = useState({});
  const { showModal } = useContext(ModalContext);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [fullscreenImages, setFullscreenImages] = useState([]); // Hình ảnh cho chế độ toàn màn hình
  const [isConfirmCommentModalVisible, setIsConfirmCommentModalVisible] =
    useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  // Comment
  const [commentContent, setCommentContent] = useState("");
  const [currentPostId, setCurrentPostId] = useState(null);
  const navigate = useNavigate();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const showModalOne = () => {
    setIsModalVisible(false); // Đặt trạng thái về false
    setTimeout(() => {
      setIsModalVisible(true); // Đặt lại trạng thái về true
    }, 50); // Đặt timeout ngắn để đảm bảo React nhận ra sự thay đổi
  };

  const [userInfo, setUserInfo] = useState({
    fullname: "Người dùng ẩn danh",
    avatar: Avatar,
  });

  useEffect(() => {
    let intervalId;

    if (currentPostId) {
      // Định kỳ gọi API mỗi 5 giây
      intervalId = setInterval(() => {
        fetchComments(currentPostId);
      }, 2000);
    }

    return () => {
      // Xóa interval khi component unmount hoặc khi currentPostId thay đổi
      clearInterval(intervalId);
    };
  }, [currentPostId]);

  const handleImageClick = (imageUrl, id) => {
    console.log("Image Clicked:", imageUrl);
    const post = posts.find((post) => post.id === id);
    if (post && post.images) {
      console.log("Post Found:", post.images);
      setFullscreenImages(post.images.map((img) => `${API_URL}${img.image_url}`));  // Lưu danh sách URL hình ảnh
      setSelectedImage(imageUrl); // Lưu URL ảnh hiện tại
    }
  };

  // Thêm useEffect để lấy thông tin user từ token khi component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUserInfo({
          fullname: decodedToken.fullname || "Người dùng ẩn danh",
          avatar: decodedToken.avatar
            ? `${API_URL}/upload_avataruser/${decodedToken.avatar}`
            : Avatar,
          id: decodedToken.id,
        });
        console.log(setUserInfo);
      } catch (error) {
        console.error("Lỗi khi decode token:", error);
      }
    }
  }, []);

  // Scrooll to top
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollToTop(true);
      } else {
        setShowScrollToTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // Cuộn mượt
    });
  };
  // Thêm useEffect để lưu vào localStorage khi state thay đổi
  useEffect(() => {
    localStorage.setItem("likedPosts", JSON.stringify(likedPosts));
  }, [likedPosts]);

  const [posts, setPosts] = useState([]);
  const [allPosts, setAllPosts] = useState([]);

  // Thêm state để kiểm soát việc hiển thị forum
  const [showForum, setShowForum] = useState(true);

  // Sửa lại hàm search
  const handleSearch = () => {
    if (filterType === "Tất cả") {
      setPosts(allPosts);
    } else {
      const filteredPosts = allPosts.filter(
        (post) => post.loaiPost === filterType
      );
      setPosts(filteredPosts);
    }
  };

  // Get all post
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/all`, {
          headers: {
            "ngrok-skip-browser-warning": "true", // Bỏ qua cảnh báo ngrok
          },
        });
        console.log("Dữ liệu API:", response.data);
        const findData = response.data.filter((loc) => loc.status === true);
        // Đảm bảo dữ liệu là một mảng trước khi cập nhật state
        if (Array.isArray(findData)) {
          setAllPosts(findData);
          setPosts(findData);
        } else {
          console.error("API không trả về mảng:", response.data);
          setAllPosts([]);
          setPosts([]);
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu bài viết:", error);
      }
    };

    fetchPosts();
  }, []);

  const handlePostTypeChange = (e) => {
    const value = e.target.value;
    setPostType(value);
  };

  // Thêm hàm xử lý cho phần lọc
  const handleFilterTypeChange = (e) => {
    const value = e.target.value;
    if (value === "Tất cả") {
      setPosts(allPosts);
    } else {
      const filteredPosts = allPosts.filter(
        (post) => post.loaiPost === value
      );
      setPosts(filteredPosts);
    }
    setFilterType(value);
  };
  const handleCloseLogin = () => {
    setShowLogin(false);
    setShowForum(true); // Hiển thị lại forum khi đóng login
  };

  const handleRemoveImage = (index) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index)); // Xóa hình ảnh khỏi `selectedImages`
    setPostImages((prev) => prev.filter((_, i) => i !== index)); // Xóa hình ảnh khỏi `postImages`
  };
  const handleImageChange = (event) => {
    const files = Array.from(event.target.files);

    // Kiểm tra nếu tổng số hình ảnh vượt quá 5
    if (postImages.length + files.length > 5) {
      showModal("Cảnh báo!", "Bạn chỉ được đăng tối đa 5 hình ảnh.", "warning");
      return;
    }

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        alert("Vui lòng chọn file hình ảnh");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("Kích thước file không được vượt quá 5MB");
        return;
      }
    });

    // Lưu file gốc vào postImages
    setPostImages((prev) => [...prev, ...files]);

    // Tạo URL để preview
    const newImageUrls = files.map((file) => URL.createObjectURL(file));
    setSelectedImages((prev) => [...prev, ...newImageUrls]);
  };

  const handleSubmitPost = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      showModal("Cảnh báo!", "Bạn cần phải đăng nhập để đăng bài", "warning");
      // setShowLogin(true);
      setShowForum(false);
      navigate("/");
      return;
    }

    try {
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.id;

      if (!postContent.trim()) {
        showModal("Cảnh báo!", "Vui lòng nhập nội dung bài viết!", "warning");
        return;
      }

      setIsSubmitting(true);

      // 1. Tạo bài viết trước
      const postResponse = await axios.post(
        `${API_URL}/api/create`,
        {
          user_id: userId,
          content: postContent,
          status: 0,
          loaiPost: postType,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      // 2. Nếu có ảnh, upload ảnh với post_id
      if (postImages.length > 0) {
        const postId = postResponse.data.post.id;
        const formData = new FormData();

        postImages.forEach((file) => {
          formData.append("images", file);
        });

        // Sử dụng API endpoint mới với post_id
        await axios.post(
          `${API_URL}/api/upload/${postId}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "true",
            },
          }
        );
      }

      // Reset form và hiển thị thông báo thành công
      setPostContent("");
      setPostImages([]);
      setSelectedImages([]);
      setPostType("Tìm kiếm phòng trọ");
      setFilterType("Tất Cả")
      setShowPostForm(false);

      // Hiển thị Modal
      showModalOne();
    } catch (error) {
      console.error("❌ Error details:", error);
      console.error("📌 Response data:", error.response?.data);
      console.error("📌 Status:", error.response?.status);

      showModal("Cảnh báo!", "Có lỗi xảy ra khi đăng bài!", "error");

    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async (postId) => {
    setPostToDelete(postId);
    setIsConfirmModalVisible(true); // Hiển thị modal xác nhận
  };

  const confirmDeletePost = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Bạn cần đăng nhập để xóa bài viết");
      setIsConfirmModalVisible(false);
      return;
    }

    try {
      setIsConfirmModalVisible(false);
      const response = await axios.delete(
        `${API_URL}/api/delete/${postToDelete}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      showModal(
        "Xóa bài viết thành công!",
        "Bài viết của bạn đã được xóa khỏi hệ thống."
      );

      // Cập nhật danh sách bài viết sau khi xóa
      setPosts((prevPosts) =>
        prevPosts.filter((post) => post.id !== postToDelete)
      );
    } catch (error) {
      console.error("Lỗi khi xóa bài viết:", error);
      alert(error.response?.data?.error || "Có lỗi xảy ra khi xóa bài viết");
    } finally {
      setIsConfirmModalVisible(false); // Đóng modal
    }
  };

  // Add new state for comment section

  // Add handler to close comment section
  const handleCloseComment = () => {
    setShowCommentForm(false);
  };

  // Add this function to handle input focus
  const handleInputFocus = () => {
    setShowPostForm(true);
  };

  // Add this function to handle close
  const handleCloseForm = () => {
    setShowPostForm(false);
  };

  const handleLikeClick = (postId) => {
    setLikedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  // Thêm hàm xử lý submit comment
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      showModal("Cảnh báo!", "Bạn cần đăng nhập để bình luận", "warning");
      // setShowLogin(true);
      setShowForum(false); // Ẩn forum
      setShowCommentForm(false);
      navigate("/");
      return;
    }

    try {
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.id;

      // Log các giá trị trước khi gửi request
      console.log("Comment Data:", {
        content: commentContent,
        user_id: userId,
        post_id: currentPostId,
      });

      const response = await axios.post(
        `${API_URL}/api/comments`,
        {
          content: commentContent,
          user_id: userId,
          post_id: currentPostId,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      // Log response từ server
      console.log("Server Response:", response.data);

      setCommentContent("");
      await fetchComments(currentPostId);
      await fetchCommentCounts(currentPostId);
    } catch (error) {
      console.error("Lỗi khi đăng bình luận:", error);
      // Log chi tiết lỗi
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      alert(
        error.response?.data?.message || "Có lỗi xảy ra khi đăng bình luận!"
      );
    }
  };

  // Thêm hàm để fetch comments
  const fetchComments = async (postId) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/comments/${postId}`,
        {
          headers: {
            "ngrok-skip-browser-warning": "true", // Bỏ qua cảnh báo ngrok
          },
        }
      );
      setComments(response.data.comments);
    } catch (error) {
      console.error("Lỗi khi lấy comments:", error);
    }
  };

  // Sửa lại hàm handleCommentClick để lưu post_id hiện tại
  const handleCommentClick = (postId) => {
    setCurrentPostId(postId);
    setShowCommentForm(true);
    fetchComments(postId);
  };

  const fetchCommentCounts = async (postId) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/comments/${postId}`,
        {
          headers: {
            "ngrok-skip-browser-warning": "true", // Bỏ qua cảnh báo ngrok
          },
        }
      );
      setCommentCounts((prev) => ({
        ...prev,
        [postId]: response.data.comments.length,
      }));
    } catch (error) {
      console.error("Lỗi khi lấy số lượng comments:", error);
    }
  };

  useEffect(() => {
    const fetchAllCommentCounts = async () => {
      try {
        const promises = posts.map((post) => fetchCommentCounts(post.id));
        await Promise.all(promises);
      } catch (error) {
        console.error("Lỗi khi lấy số lượng comments:", error);
      }
    };

    if (posts.length > 0) {
      fetchAllCommentCounts();
    }
  }, [posts]);

  const handleBackClick = () => {
    navigate("/"); // Chuyển hướng về trang Home
  };

  const handleDeleteComment = (commentId) => {
    setCommentToDelete(commentId);
    setIsConfirmCommentModalVisible(true); // Hiển thị modal xác nhận
  };

  const confirmDeleteComment = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      showModal("Cảnh báo!", "Bạn cần đăng nhập để xóa bình luận", "warning");
      setIsConfirmCommentModalVisible(false); // Đóng modal
      return;
    }

    try {
      setIsConfirmCommentModalVisible(false); // Đóng modal trước khi xóa
      const response = await axios.delete(
        `${API_URL}/api/comments/${commentToDelete}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      // Cập nhật danh sách bình luận sau khi xóa
      setComments((prevComments) =>
        prevComments.filter((comment) => comment.id !== commentToDelete)
      );

      // Hiển thị thông báo xóa thành công
      showModal("Xóa bình luận thành công!", "Bình luận của bạn đã được xóa.");
    } catch (error) {
      showModal("Cảnh báo!", "Có lỗi xảy ra khi xóa bình luận!", "error");
    }
  };

  return (
    <>
      {isConfirmCommentModalVisible && (
        <ConfirmModal
          title="Xác nhận xóa"
          message="Bạn có chắc chắn muốn xóa bình luận này?"
          onConfirm={confirmDeleteComment}
          onCancel={() => setIsConfirmCommentModalVisible(false)}
        />
      )}
      {isConfirmModalVisible && (
        <ConfirmModal
          title="Xác nhận xóa"
          message="Bạn có chắc chắn muốn xóa bài viết này?"
          onConfirm={confirmDeletePost}
          onCancel={() => setIsConfirmModalVisible(false)}
        />
      )}
      {isModalVisible && (
        <Modal
          desc="Đăng bài thành công!"
          note="Bài viết của bạn đang chờ duyệt."
          onClose={() => setIsModalVisible(false)}
        />
      )}
      {showForum && (
        <div className={cx("forum_background")}>
          {showScrollToTop && (
            <button className={cx("forum_push-up")} onClick={handleScrollToTop}>
              <FontAwesomeIcon
                className={cx("icon_push-up")}
                icon={faChevronUp}
                style={{ cursor: "pointer" }}
              />
            </button>
          )}
          <div className={cx("forum")}>
            <div className={cx("header_forum-main")}>
              <FontAwesomeIcon
                onClick={handleBackClick}
                className={cx("icon_left-one")}
                icon={faChevronLeft}
                style={{ cursor: "pointer" }}
              />
              <img
                onClick={handleBackClick}
                className={cx("header_forum-logo")}
                src="images/UDA_logo.png"
                alt="Logo"
              />
              <div className={cx("header_forum-direc")}>
                <h1 className={cx("header_forum-title")}>UDA MAP</h1>
                <p className={cx("header_forum-desc")}>
                  Diễn đàn nhà trọ sinh viên UDA
                </p>
              </div>

              <FontAwesomeIcon
                onClick={handleBackClick}
                className={cx("icon_left")}
                icon={faChevronLeft}
                style={{ cursor: "pointer" }}
              />
            </div>
            <header className={cx("forum_header")}>
              <div
                style={{
                  backgroundImage: `url(${BackgroundImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  marginTop: "60px",
                }}
                className={cx("header_background")}
              ></div>
            </header>
            <div className={cx("forum_content")}>
              <h1 className={cx("header_title")}>MAP sinh viên UDA </h1>
              <p className={cx("header_subtitle")}>
                Diễn đàn chia sẻ thông tin nhà trọ
              </p>
              <div className={cx("seperate")}> </div>
              <div className={cx("post_content")}>
                <Image
                  className={cx("img_content")}
                  src={userInfo.avatar}
                  onError={(e) => {
                    e.target.src = Avatar; // Fallback nếu load ảnh lỗi
                  }}
                />
                <input
                  className={cx("input_content")}
                  onFocus={handleInputFocus}
                  readOnly
                  placeholder="Đăng bài viết của bạn..."
                />
              </div>

              {/* Add the sliding post form */}
              <div
                className={cx("post-form-overlay", { active: showPostForm })}
                onClick={handleCloseForm}
              >
                <div
                  className={cx("post-form", { active: showPostForm })}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className={cx("post-form-header")}>
                    <h3>Tạo bài viết</h3>
                    <button
                      className={cx("close-btn")}
                      onClick={handleCloseForm}
                    >
                      ✕
                    </button>
                  </div>

                  {/* POST CONTENT */}
                  <div className={cx("post-form-content")}>
                    <div className={cx("user-info")}>
                      <Image
                        className={cx("avatar")}
                        src={userInfo.avatar}
                        onError={(e) => {
                          e.target.src = Avatar; // Fallback nếu load ảnh lỗi
                        }}
                      />
                      <span className={cx("user-name")}>
                        {userInfo.fullname}
                      </span>

                      <div className={cx("list")}>
                        <h3 className={cx("list_title")}>
                          {postType === "Tìm kiếm phòng trọ"
                            ? "Tìm kiếm phòng trọ"
                            : postType}
                        </h3>
                        <FontAwesomeIcon
                          className={cx("down")}
                          icon={faChevronDown}
                        />
                        <div className={cx("list_inner")}>
                          {["Tìm kiếm phòng trọ", "Chia sẻ phòng trọ"].map(
                            (item) => (
                              <label key={item} className={cx("inner_spacer")}>
                                <input
                                  type="radio"
                                  className={cx("inner_radio")}
                                  name="postType"
                                  value={item}
                                  checked={postType === item}
                                  onChange={handlePostTypeChange}
                                />
                                <p className={cx("inner_title")}>{item}</p>
                              </label>
                            )
                          )}
                        </div>
                      </div>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmitPost();
                      }}
                    >
                      {selectedImages.length > 0 && (
                        <div className={cx("images-container")}>
                          {selectedImages.map((image, index) => (
                            <div key={index} className={cx("image-container")}>
                              <Image className={cx("img_post")} src={image} />
                              <button
  type="button"
  className={cx("remove-image-btn")}
  onClick={() => handleRemoveImage(index)} 
>
  <FontAwesomeIcon icon={faXmark} />
</button>
                            </div>
                          ))}
                        </div>
                      )}

                      <textarea
                        className={cx("post-input")}
                        placeholder="Bạn đang nghĩ gì?"
                        rows="4"
                        value={postContent}
                        onChange={(e) => {
                          if (e.target.value.length <= 500) {
                            setPostContent(e.target.value); // Cập nhật nội dung nếu <= 500 ký tự
                          }
                        }}
                        maxLength={500} // Giới hạn tối đa 500 ký tự
                        required
                      />

                      <div className={cx("post-actions")}>
                        <label className={cx("add-photo")}>
                          <FontAwesomeIcon icon={faPaperPlane} />
                          <span>Thêm ảnh</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageChange}
                            className={cx("file-input")}
                          />
                        </label>
                        <button
                          className={cx("submit-post")}
                          type="submit"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? "Đang đăng..." : "Đăng"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              <div className={cx("post_heading")}>
                <p className={cx("post_title")}>Tin mới nhất</p>

                <div className={cx("list")}>
                  <h3 className={cx("list_title")}>
                    {filterType === "Tất cả" ? "Loại bài đăng" : filterType}
                  </h3>
                  <FontAwesomeIcon
                    className={cx("down")}
                    icon={faChevronDown}
                  />
                  <div className={cx("list_inner")}>
                    {["Tất cả","Tìm kiếm phòng trọ", "Chia sẻ phòng trọ"].map(
                      (item) => (
                        <label key={item} className={cx("inner_spacer")}>
                          <input
                            type="radio"
                            className={cx("inner_radio")}
                            name="filterType"
                            value={item}
                            checked={filterType === item}
                            onChange={handleFilterTypeChange}
                          />
                          <p className={cx("inner_title")}>{item}</p>
                        </label>
                      )
                    )}
                  </div>
                </div>
                
              </div>
              {/* Hiển thị thông báo nếu không có bài viết */}
              {Array.isArray(posts) && posts.length === 0 ? (
                <div className={cx("no-posts")}>
                  <p className={cx("no-posts_desc")}>
                    Hiện tại chưa có bài viết nào. Hãy là người đầu tiên đăng
                    bài!
                  </p>
                </div>
              ) : (
                posts.map((post) => (
                  <div key={post.id} className={cx("forum_group-content")}>
                    <div className={cx("forum_inner-content")}>
                      <Image
                        className={cx("img_content")}
                        src={
                          post.author?.avatar
                            ? `${API_URL}/upload_avataruser/${post.author.avatar}`
                            : Avatar
                        }
                      />
                      <div className={cx("forum_inner-sub")}>
                        <div className={cx("forum_type-post")}>

                        <h3 className={cx("forum-sub-heading")}>
                          {post.author?.fullname || "Người dùng ẩn danh"}
                        </h3>
                        <p className={cx("forum-sub-type")}>
                          {post.loaiPost || "Không xác định"}
                        </p>
                        </div>
                        <p className={cx("forum-sub-time")}>
                          {new Date(post.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {post.user_id === userInfo.id && (
                        <button
                          className={cx("delete-post-btn")}
                          onClick={() => handleDeletePost(post.id)}
                        >
                          Xóa bài viết
                        </button>
                      )}
                    </div>

                    <p className={cx("title_form")}>
                      {post.content.length > 500
                        ? `${post.content.slice(0, 300)}...` // Hiển thị 300 ký tự đầu tiên và thêm dấu "..."
                        : post.content}
                    </p>

                    {post.images && post.images.length >= 1 && (
                      <div className={cx("post-images-slider")}>
                        <div className={cx("slider-container")}>
                          <div className={cx("slider-wrapper")}>
                            {post.images.map((image, index) => (
                              <Image
                                key={index}
                                className={cx("content_img-form")}
                                src={`${API_URL}${image.image_url}`}
                                alt={`Post Image ${index + 1}`}
                                onClick={() =>
                                  handleImageClick(
                                    `${API_URL}${image.image_url}`,
                                    post.id
                                  )
                                }
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className={cx("btn-all_sign")}>
                      <button
                        className={cx("btn", {
                          "btn-liked": likedPosts[post.id],
                        })}
                        onClick={() => handleLikeClick(post.id)}
                      >
                        <FontAwesomeIcon
                          className={cx("icon_btn", {
                            "icon-liked": likedPosts[post.id],
                          })}
                          icon={faThumbsUp}
                        />
                        {likedPosts[post.id] ? "Đã thích" : "Thích"}
                      </button>
                      <button
                        className={cx("btn")}
                        onClick={() => handleCommentClick(post.id)}
                      >
                        <FontAwesomeIcon
                          className={cx("icon_btn")}
                          icon={faComment}
                        />
                        Bình luận{" "}
                        {commentCounts[post.id]
                          ? `(${commentCounts[post.id]})`
                          : ""}
                      </button>
                    </div>
                    <div className={cx("seperate")}></div>
                  </div>
                ))
              )}
            </div>

            {/* Comment Section Overlay */}
            <div
              className={cx("comment-overlay", { active: showCommentForm })}
              onClick={handleCloseComment}
            >
              <div
                className={cx("comment-section", { active: showCommentForm })}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={cx("comment-header")}>
                  <h3>Bình luận</h3>
                  <button
                    className={cx("close-btn")}
                    onClick={handleCloseComment}
                  >
                    ✕
                  </button>
                </div>
                <div className={cx("comments-list")}>
                  {Array.isArray(comments) && comments.length === 0 ? (
                    <p className={cx("no-comments")}>
                      Chưa có bình luận, bạn hãy là người đầu tiên nhập bình
                      luận.
                    </p>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className={cx("comment-item")}>
                        <Image
                          className={cx("comment-avatar")}
                          src={
                            comment.User?.avatar
                              ? `${API_URL}/upload_avataruser/${comment.User.avatar}`
                              : Avatar
                          }
                          onError={(e) => {
                            e.target.src = Avatar;
                          }}
                        />
                        <div className={cx("comment-content")}>
                          <span className={cx("comment-author")}>
                            {comment.User?.fullname || "Người dùng ẩn danh"}
                          </span>
                          <p className={cx("comment-text")}>
                            {comment.content.length > 200
                              ? `${comment.content.slice(0, 200)}...` // Hiển thị 200 ký tự đầu tiên và thêm dấu "..."
                              : comment.content}
                          </p>
                          <span className={cx("comment-time")}>
                            {new Date(comment.createdAt).toLocaleString()}
                          </span>
                          {comment.user_id === userInfo.id && (
                            <button
                              className={cx("delete-comment-btn")}
                              onClick={() => handleDeleteComment(comment.id)}
                            >
                              Xóa
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className={cx("comment-input-section")}>
                  <Image
                    className={cx("comment-avatar")}
                    src={userInfo.avatar}
                    onError={(e) => {
                      e.target.src = Avatar;
                    }}
                  />
                  <form
                    className={cx("comment-input-wrapper")}
                    onSubmit={handleSubmitComment}
                  >
                    <input
                      type="text"
                      className={cx("comment-input")}
                      placeholder="Viết bình luận..."
                      value={commentContent}
                      onChange={(e) => {
                        if (e.target.value.length <= 200) {
                          setCommentContent(e.target.value); // Cập nhật nội dung nếu <= 200 ký tự
                        }
                      }}
                      maxLength={200} // Giới hạn tối đa 200 ký tự
                      required
                    />
                    <button type="submit" className={cx("send-comment")}>
                      <FontAwesomeIcon icon={faPaperPlane} />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {showLogin && (
        <Login
          onCloseLogin={handleCloseLogin}
          onLoginSuccess={() => {
            setShowLogin(false);
            setShowForum(true);
            setShowPostForm(true); // Mở form đăng bài sau khi đăng nhập
            setShowCommentForm(true);
          }}
        />
      )}

      {/* {selectedImage && (
        <div
          className={cx("image-fullscreen-overlay")}
          onClick={() => setSelectedImage(null)} // Đóng modal khi bấm vào overlay
        >
          <img
            src={selectedImage}
            alt="Full Image"
            className={cx("image-fullscreen")}
          />
        </div>
      )} */}
   {selectedImage && (
  <div
    className={cx("image-fullscreen-overlay")}
    onClick={() => setSelectedImage(null)} // Đóng modal khi bấm vào overlay
  >
    {/* Nút Prev chỉ hiển thị nếu không phải ảnh đầu tiên */}
    {fullscreenImages.indexOf(selectedImage) > 0 && (
      <button
        className={cx("prev-btn")}
        onClick={(e) => {
          e.stopPropagation(); // Ngăn chặn sự kiện click lan ra ngoài
          const currentIndex = fullscreenImages.indexOf(selectedImage);
          const prevIndex = currentIndex - 1;
          setSelectedImage(fullscreenImages[prevIndex]);
        }}
      >
        <FontAwesomeIcon icon={faChevronLeft} />
      </button>
    )}
    <img
      src={selectedImage}
      alt="Full Image"
      className={cx("image-fullscreen")}
    />
    {/* Nút Next chỉ hiển thị nếu không phải ảnh cuối cùng */}
    {fullscreenImages.indexOf(selectedImage) < fullscreenImages.length - 1 && (
      <button
        className={cx("next-btn")}
        onClick={(e) => {
          e.stopPropagation(); // Ngăn chặn sự kiện click lan ra ngoài
          const currentIndex = fullscreenImages.indexOf(selectedImage);
          const nextIndex = currentIndex + 1;
          setSelectedImage(fullscreenImages[nextIndex]);
        }}
      >
        <FontAwesomeIcon icon={faChevronRight} />
      </button>
    )}
  </div>
)}

    </>
  );
};

export default Forum;
