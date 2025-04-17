import React, { useEffect, useState , useContext} from "react";
import { updateUserInfo, fetchAllUsers, handleDeleteUser } from "../../services/api";
import styles from "./TinhNang5.module.scss"; // Import SCSS module
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal"; // Import ConfirmModal
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ModalContext } from "../../App";



const TinhNang5 = () => {
  const [locations, setLocations] = useState([]); // Danh sách người dùng
  const [filteredLocations, setFilteredLocations] = useState([]); // Danh sách đã lọc
  const [activeButton, setActiveButton] = useState("all");
  const [selectedId, setSelectedId] = useState(""); // mặc định giữ là ""
  const [locationToDelete, setLocationToDelete] = useState(null); // Lưu ID cần xóa
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false); // Hiển thị ConfirmModal
  const [isEditing, setIsEditing] = useState(false); // Trạng thái chỉnh sửa
  const [userToEdit, setUserToEdit] = useState(null); // Lưu người dùng cần chỉnh sửa
      const { showModal } = useContext(ModalContext);

  // bộ đếm ngày
  function getTimeAgo(dateString) {
    const now = new Date();
    const updated = new Date(dateString);

    const diffTime = now - updated;

    const diffYears = now.getFullYear() - updated.getFullYear();
    const diffMonths = (now.getFullYear() - updated.getFullYear()) * 12 + (now.getMonth() - updated.getMonth());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Đang online";
    } else if (diffYears >= 1) {
      return `${diffYears} năm trước`;
    } else if (diffMonths >= 1) {
      return `${diffMonths} tháng trước`;
    } else {
      return `${diffDays} ngày trước`;
    }
  }


  // Lấy danh sách người dùng
  useEffect(() => {
    const getData = async () => {
      const data = await fetchAllUsers();
      setLocations(data);
      setFilteredLocations(data);
    };
    getData();
  }, []);

  const handleSearch = (event) => {
    const term = event.target.value.toLowerCase();
    const filtered = locations.filter(loc =>
      (loc.email || "").toLowerCase().includes(term) ||
      (loc.phone || "").toLowerCase().includes(term)
    );

    setFilteredLocations(filtered);
  };



  // Xóa người dùng
  const xoaNguoiDung = (id) => {
    setLocationToDelete(id); // Lưu ID người dùng cần xóa
    setIsConfirmModalVisible(true); // Hiển thị ConfirmModal
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await handleDeleteUser(locationToDelete);
      if (response && response.status === 200) {
        let updatedLocations = await fetchAllUsers();
        setLocations(updatedLocations);
        setFilteredLocations(updatedLocations);
      }
    } catch (error) {
      console.error("Lỗi khi xóa người dùng:", error);
    } finally {
      setIsConfirmModalVisible(false); // Đóng ConfirmModal
      setLocationToDelete(null); // Xóa ID đã lưu
    }
  };

  const handleCancelDelete = () => {
    setIsConfirmModalVisible(false); // Đóng ConfirmModal
    setLocationToDelete(null); // Xóa ID đã lưu
  };

  // Chỉnh sửa người dùng
  const handleEdit = (user) => {
    setUserToEdit(user); // Lưu thông tin người dùng cần chỉnh sửa
    setIsEditing(true); // Chuyển sang chế độ chỉnh sửa
  };

  // Cập nhật người dùng
  const handleUpdate = async (e) => {
    e.preventDefault();

    const updatedUser = { ...userToEdit };

    // Validate required fields
    if (!updatedUser.fullname?.trim() || !updatedUser.email?.trim() || !updatedUser.phone?.trim()) {
      showModal("Lỗi khi cập nhật!", "Vui lòng nhập đầy đủ thông tin.", "warning");
      return;
    }

    // Validate password if provided
    if (updatedUser.password && updatedUser.password.length < 6) {
      showModal("Lỗi khi cập nhật!", "Mật khẩu phải có ít nhất 6 ký tự.", "warning");
      return;
    }

    try {
      const response = await updateUserInfo(updatedUser.id, updatedUser);
      console.log("Response từ API:", response);

      if (response?.message === "Cập nhật người dùng thành công!") {
        showModal("Cập nhật thành công!", "Thông tin người dùng đã được cập nhật.");
        const updatedUsers = await fetchAllUsers();
        setLocations(updatedUsers);
        setFilteredLocations(updatedUsers);
        setIsEditing(false);
      } else {
        showModal("Cập nhật thất bại!", response?.message || "Lỗi hệ thống","error");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật người dùng:", error);
      showModal("Cập nhật thất bại!", response?.message || "Lỗi hệ thống","error");

    }
  };

  // Cập nhật dữ liệu khi người dùng thay đổi thông tin
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserToEdit((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleChange = (event) => {
    const findid = event.target.value;
    console.log(findid);
    setSelectedId(findid);

    let filtered = [...locations]; // copy mảng gốc

    if (findid === "old") {
      filtered.sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt)); // Cũ → Mới
    } else if (findid === "new") {
      filtered.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)); // Mới → Cũ
    }

    setFilteredLocations(filtered);
  };


  return (
    <div className={styles["uda-tinhnang1"]}>
      <div className={styles["thanh-menu-ngang"]}>
        <h1 className={styles["uda-tinhnang1-title"]}>DANH SÁCH NGƯỜI DÙNG</h1>
        <div className={styles["search-input"]}>
        <input
          type="text"
          placeholder="Nhập số điện thoại hoặc địa chỉ..."
          // value={searchTerm}
          onChange={handleSearch}  // Gọi hàm khi người dùng gõ
        />
        <FontAwesomeIcon className={styles["icon_search"]} icon={faSearch} />
      </div>
      </div>
      
      <div className={styles["uda-tinhnang1-table-wrapper"]}>
        <table className={styles["uda-tinhnang1-table"]}>
          <thead>
            <tr>
              <th>Id</th>
              <th>Tên người dùng</th>
              <th>Email</th>
              <th>SĐT</th>
              <th>
                <div className={styles["select-wrapper"]}>
                  <select value={selectedId} onChange={handleChange}>
                    <option value="" disabled hidden>Sắp xếp</option>
                    <option value="new">Mới nhất</option>
                    <option value="old">Cũ nhất</option>
                  </select>
                </div>

              </th>
              <th>Thay đổi</th>
            </tr>
          </thead>
          <tbody>
            {isEditing && userToEdit ? (
              // Hiển thị thông tin của người dùng đang được chỉnh sửa
              <tr>
                <td>1</td>
                <td>{userToEdit.fullname}</td>
                <td>{userToEdit.email}</td>
                <td>{userToEdit.phone}</td>
                <td>{userToEdit.updatedAt}</td>
                <td>
                  <button
                    className={`${styles["uda-tinhnang1-button"]} ${styles["uda-edit"]}`}
                    onClick={() => handleEdit(userToEdit)}
                  >
                    Sửa
                  </button>
                  <button
                    className={`${styles["uda-tinhnang1-button"]} ${styles["uda-delete"]}`}
                    onClick={() => xoaNguoiDung(userToEdit.id)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ) : (
              // Hiển thị danh sách người dùng khi không ở chế độ chỉnh sửa
              filteredLocations.length > 0 ? (
                filteredLocations.map((location, index) => (
                  <tr key={location.id}>
                    <td>{index + 1}</td>
                    <td>{location.fullname}</td>
                    <td>{location.email}</td>
                    <td>{location.phone ? location.phone : "Không có"}</td>
                    <td>{getTimeAgo(location.updatedAt)}</td>
                    <td>
                      <button
                        className={`${styles["uda-tinhnang1-button"]} ${styles["uda-edit"]}`}
                        onClick={() => handleEdit(location)}
                      >
                        Sửa
                      </button>
                      <button
                        className={`${styles["uda-tinhnang1-button"]} ${styles["uda-delete"]}`}
                        onClick={() => xoaNguoiDung(location.id)}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">Không có dữ liệu</td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      {isEditing && userToEdit && (
        <div className={styles["uda-edit-form"]}>
          <h2>Chỉnh sửa thông tin người dùng</h2>
          <form onSubmit={handleUpdate}>
            <input
              type="text"
              value={userToEdit.fullname}
              onChange={(e) => setUserToEdit({ ...userToEdit, fullname: e.target.value })}
              placeholder="Họ và tên"
            />
            <input
              type="email"
              value={userToEdit.email}
              onChange={(e) => setUserToEdit({ ...userToEdit, email: e.target.value })}
              placeholder="Email"
            />
            <input
              type="text"
              value={userToEdit.phone}
              onChange={(e) => setUserToEdit({ ...userToEdit, phone: e.target.value })}
              placeholder="Số điện thoại"
            />
            <input
              type="password"
              onChange={(e) => setUserToEdit({ ...userToEdit, password: e.target.value })}
              placeholder="Mật khẩu mới (tùy chọn)"
            />
            <div className={styles["uda-edit-form-buttons"]}>
              <button
                type="submit"
              >
                Cập nhật
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {isConfirmModalVisible && (
        <ConfirmModal
          title="Xác nhận xóa"
          message="Bạn có chắc chắn muốn xóa người dùng này?"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
};

export default TinhNang5;
