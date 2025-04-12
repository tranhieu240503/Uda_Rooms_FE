import React, { useEffect, useState } from "react";
import { updateUserInfo,fetchAllUsers, handleDeleteUser } from "../../services/api";
import styles from "./TinhNang5.module.scss"; // Import SCSS module
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal"; // Import ConfirmModal

const TinhNang5 = () => {
  const [locations, setLocations] = useState([]); // Danh sách người dùng
  const [filteredLocations, setFilteredLocations] = useState([]); // Danh sách đã lọc
  const [activeButton, setActiveButton] = useState("all");
  const [selectedId, setSelectedId] = useState(""); // Lưu ID người dùng được chọn
  const [locationToDelete, setLocationToDelete] = useState(null); // Lưu ID cần xóa
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false); // Hiển thị ConfirmModal
  const [isEditing, setIsEditing] = useState(false); // Trạng thái chỉnh sửa
  const [userToEdit, setUserToEdit] = useState(null); // Lưu người dùng cần chỉnh sửa

  // Lấy danh sách người dùng
  useEffect(() => {
    const getData = async () => {
      const data = await fetchAllUsers();
      setLocations(data);
      setFilteredLocations(data);
    };
    getData();
  }, []);

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
      alert("Vui lòng điền đầy đủ thông tin (fullname, email, phone).");
      return;
    }
  
    // Validate password if provided
    if (updatedUser.password && updatedUser.password.length < 6) {
      alert("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
  
    try {
      const response = await updateUserInfo(updatedUser.id, updatedUser);
      console.log("Response từ API:", response);
  
      if (response?.message === "Cập nhật người dùng thành công!") {
        alert("Cập nhật thành công!");
        const updatedUsers = await fetchAllUsers();
        setLocations(updatedUsers);
        setFilteredLocations(updatedUsers);
        setIsEditing(false);
      } else {
        alert("Cập nhật thất bại: " + (response?.message || "Lỗi không xác định"));
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật người dùng:", error);
      alert("Cập nhật thất bại: " + (error.message || error.error || "Lỗi hệ thống"));
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

  return (
    <div className={styles["uda-tinhnang1"]}>
      <div className={styles["thanh-menu-ngang"]}>
        <h1 className={styles["uda-tinhnang1-title"]}>DANH SÁCH NGƯỜI DÙNG</h1>
      </div>
      <div className={styles["uda-tinhnang1-table-wrapper"]}>
        <table className={styles["uda-tinhnang1-table"]}>
          <thead>
            <tr>
              <th>Id</th>
              <th>Tên người dùng</th>
              <th>Email</th>
              <th>SĐT</th>
              <th>Thời gian</th>
              <th>Thay đổi</th>
            </tr>
          </thead>
          <tbody>
            {filteredLocations.length > 0 ? (
              filteredLocations.map((location, index) => (
                <tr key={location.id}>
                  <td>{index + 1}</td>
                  <td>{location.fullname}</td>
                  <td>{location.email}</td>
                  <td>{location.phone}</td>
                  <td>{location.updatedAt}</td>
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
    value={userToEdit.password || ""}
    onChange={(e) => setUserToEdit({ ...userToEdit, password: e.target.value })}
    placeholder="Mật khẩu mới (tùy chọn)"
  />
  <div>
    <button type="submit">Cập nhật</button>
    <button type="button" onClick={() => setIsEditing(false)}>
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
