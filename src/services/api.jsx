import axios from "axios";
const API_URL = process.env.REACT_APP_API_URL;
// const API_URL = "https://bbfc-2405-4802-9603-89b0-3187-b0e5-aa4a-cb59.ngrok-free.app";

// Hàm lấy dữ liệu nhà trọ từ API
export const fetchLocations = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/nha-tro`, {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    });
    console.log(response.data);
    // console.log("tiennghi: ", response.data)
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu:", error);
    return [];
  }
};

// Hàm lấy chi tiết nhà trọ theo ID
export const getHouseDetail = async (id) => {
  try {
    const room = await axios.get(`${API_URL}/api/getroom/${id}`, {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    });
    console.log(room);
    return room;
  } catch (error) {}
};

//call api lấy hình ảnh
export const fetchImage = async (Id) => {
  try {
    const response = await fetch(`${API_URL}/api/getimg/${Id}`, {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    });

    if (!response.ok) throw new Error("❌ Lỗi tải ảnh từ API");

    const data = await response.json();
    console.log("📌 Dữ liệu API trả về:", data);

    if (!Array.isArray(data) || data.length === 0) {
      console.warn("⚠️ Không có dữ liệu ảnh hợp lệ");
      return [];
    }

    // Fetch từng ảnh và tạo blob URLs
    const imageUrls = await Promise.all(
      data.map(async (item) => {
        if (!item.hinhAnh) return null;
    
        let filename = item.hinhAnh.trim(); // Tên file
        let path = `/uploads/${filename}`;
    
        // Trả về URL gốc của ảnh từ API backend
        return { filename, url: `${API_URL}${path}` };
      })
    );
    
    return imageUrls.filter((url) => url !== null);
    
  } catch (error) {
    console.error("🔥 Lỗi khi fetchImage:", error);
    return [];
  }
};

// Hàm tìm tọa độ từ địa chỉ
export const fetchFind = async (formData) => {
  try {
    // Ép kiểu dữ liệu của TienNghi thành số
    if (Array.isArray(formData.TienNghi)) {
      formData.TienNghi = formData.TienNghi.map((id) => parseInt(id)).filter(
        (id) => !isNaN(id)
      );
    }

    console.log("Dữ liệu gửi lên API:", JSON.stringify(formData, null, 2));

    const response = await axios.post(`${API_URL}/api/find-nha-tro`, formData, {
      headers: { "Content-Type": "application/json" },
    });

    return response;
  } catch (error) {
    console.log("Lỗi khi gọi API:", error);
  }
};

// // Hàm lấy thông tin tiện ích
// export const fetchTienIch = async (lon, lat) => {
//     try {
//         const response = await fetch(`http://localhost:8000/api/findtienich`);
//         return response.data;
//     } catch (error) {//         console.error("Lỗi khi lấy thông tin tiện ích:", error);
//         throw error;
//     }
// };

// Hàm tìm tiện nghi
export const fetchTienNghi = async () => {
  try {
    const response = await fetch(`${API_URL}/api/tien-nghi`, {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    });
    const data = await response.json();

    console.log(data);
    return data;
  } catch (error) {
    console.log(error);
  }
};

// Hàm gọi thông tin thêm
export const fetchThongTinThem = async (Id) => {
  try {
    const response = await fetch(`${API_URL}/api/thong-tin-them`, {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    });
    const data = await response.json();
    console.log("thông tin thêm:  ", data[0].thongTinThem);
    return data;
  } catch (error) {
    console.log(error);
  }
};

// Hàm gọi thông tin tiện ích
export const fetchTienIch = async () => {
  try {
    const response = await fetch(`${API_URL}/api/tien-ich`, {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    });
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.log(error);
  }
};
export const fetchTienIchAll = async () => {
  try {
    const response = await fetch(`${API_URL}/api/tien-ich-all`, {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    });
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.log(error);
  }
};

// Hàm gọi thông tin tiện ích
export const fetchTienIchXungQuanh = async (toado) => {
  try {
    const res = await axios.post(
      `${API_URL}/api/tien-ich-xung-quanh`,
      toado, // Body JSON
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", res);
    return res.data;
  } catch (err) {
    console.error("Lỗi gọi API tiện ích xung quanh:", err);
    return [];
  }
};

export const fetchGuiDanhGia = async (id, danhGiaData) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/danh-gia/${id}`,
      danhGiaData,
      {
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      }
    );

    return response.data; // Trả về dữ liệu phản hồi từ server
  } catch (error) {
    console.error("Lỗi khi gửi đánh giá:", error);
    throw error; // Ném lỗi để xử lý phía component
  }
};

export const fetchDanhGia = async (id) => {
  try {
    const room = await axios.get(`${API_URL}/api/danh-gia/${id}`, {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    });
    console.log("danh giaaaaaaaaaaaaaaaaaaaaaaaaaaaa", room);
    return room;
  } catch (error) {}
};
export const handleDuyetAPI = async (id) => {
  try {
    // Gửi API để thay đổi trạng thái
    const response = await axios.post(`${API_URL}/api/duyet/${id}`);
    if (response.status === 200) {
      // Nếu thành công, bạn có thể làm mới lại dữ liệu hoặc cập nhật lại state
      console.log("Trạng thái đã được cập nhật!");
      // Giả sử bạn có một hàm để reload lại dữ liệu
      return response;
    }
  } catch (error) {
    console.error("Lỗi khi duyệt hoặc hủy duyệt:", error);
  }
};

export const customTienIchXungQuanh = async (id, formData) => {
  try {
    const response = await axios.put(
      `${API_URL}/api/chinh-sua-tien-ich-xung-quanh/${id}`,
      formData
    );

    if (response.status === 200) {
      console.log("Cập nhật thành công:", response.data);
      return response.data; // Trả về dữ liệu đã cập nhật
    } else {
      console.warn("Cập nhật thất bại:", response);
      return null; // Trả về null nếu thất bại
    }
  } catch (error) {
    console.error("Lỗi khi cập nhật nhà trọ:", error);
    throw error; // Ném lỗi để có thể bắt bên ngoài
  }
};
export const customroom = async (id, formData) => {
  try {
    const response = await axios.put(
      `${API_URL}/api/update-nha-tro/${id}`,
      formData
    );

    if (response.status === 200) {
      console.log("Cập nhật thành công:", response.data);
      return response.data; // Trả về dữ liệu đã cập nhật
    } else {
      console.warn("Cập nhật thất bại:", response);
      return null; // Trả về null nếu thất bại
    }
  } catch (error) {
    console.error("Lỗi khi cập nhật nhà trọ:", error);
    throw error; // Ném lỗi để có thể bắt bên ngoài
  }
};

export const postLogin = async (formData) => {
  try {
    const response = await axios.post(`${API_URL}/api/auth/login`, formData, {
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
    });

    // Only proceed if we get a valid response with token
    if (response.data && response.data.token) {
      localStorage.setItem("token", response.data.token);
      return response.data;
    }

    throw new Error(response.data?.error || "Đăng nhập thất bại");
  } catch (error) {
    // Forward the error from backend
    throw error.response?.data || error;
  }
};

export const postSignup = async (formData) => {
  try {
    console.log(formData);
    const response = await axios.post(
      `${API_URL}/api/auth/register`,
      formData,
      {
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      }
    );

    console.log("API Response:", response); // Debug log

    if (response.data) {
      return response.data;
    } else {
      throw new Error("No data received from server");
    }
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};
export const DeleteImage = async (nhaTroId, hinhAnh) => {
  try {
    const response = await fetch(`${API_URL}/api/delete-img`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nhaTroId, hinhAnh }),
    });

    const data = await response.json();
    if (response.ok) {
      
    } else {
      alert(data.error);
    }
  } catch (error) {
    console.error("Lỗi khi xóa ảnh:", error);
  }
};
export const addTienNghi = async (tenTienNghi) => {
  try {
    const response = await axios.post(`${API_URL}/api/them-tien-nghi`, {
      tenTienNghi,
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi thêm tiện nghi:", error);
    throw error;
  }
};

export const addTienIchXungQuanh = async (formData) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/tao-tien-ich-xung-quanh`,
      formData,
      {
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      }
    );

    // Kiểm tra xem API có trả về dữ liệu hay không
    if (response && response.data) {
      return response.data; // Trả về dữ liệu mới tạo
    }

    throw new Error("Không nhận được phản hồi hợp lệ từ API");
  } catch (error) {
    console.error("❌ Lỗi khi thêm tiện ích xung quanh:", error);
    throw error.response?.data || error;
  }
};

export const addTienIch = async (tenTienIch) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/tao-tien-ich`,
      tenTienIch
    );
    return response; // ⚡ Trả về toàn bộ response thay vì chỉ data
  } catch (error) {
    console.error("Lỗi khi thêm tiện ích:", error);
    throw error;
  }
};

// 🔴 Xóa tiện nghi theo ID
export const deleteTienNghi = async (id) => {
  try {
    await axios.delete(`${API_URL}/api/xoa-tien-nghi/${id}`);
    return true;
  } catch (error) {
    console.error("Lỗi khi xóa tiện nghi:", error);
    return false;
  }
};
export const addThongTinThem = async (thongTin) => {
  try {
    console.log(thongTin);
    const response = await axios.post(`${API_URL}/api/them-thong-tin`, {
      thongTinThem: thongTin,
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi thêm Thông Tin Thêm:", error);
    return null;
  }
};

// 🔴 Xóa Thông Tin Thêm theo ID
export const deleteThongTinThem = async (id) => {
  try {
    await axios.delete(`${API_URL}/api/xoa-thong-tin/${id}`);
    return true;
  } catch (error) {
    console.error("Lỗi khi xóa Thông Tin Thêm:", error);
    return false;
  }
};
export const deleteNhaTro = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/api/xoa-nha-tro/${id}`);
    return response; // Trả về response đầy đủ
  } catch (error) {
    console.error("Lỗi khi xóa Nhà Trọ:", error);
    return null; // Trả về null nếu có lỗi
  }
};
export const deleteTienIch = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/api/xoa-tien-ich/${id}`);
    console.log(response);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi xóa tiện ích:", error);
    throw error;
  }
};
export const deleteTienIchXungQuanh = async (id) => {
  try {
    const response = await axios.delete(
      `${API_URL}/api/xoa-tien-ich-xung-quanh/${id}`
    );
    console.log(response);

    return response.data;
  } catch (error) {
    console.error("Lỗi khi xóa tiện ích:", error);
    throw error;
  }
};
// tao-tien-ich-xung-quanh xoa-tien-ich-xung-quanh

export const fetchPostAll = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/all`, {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    });
    console.log(response.data);
    // console.log("tiennghi: ", response.data)
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu:", error);
    return [];
  }
};

export const handleDuyetPostAPI = async (id) => {
  try {
    // Gửi API để thay đổi trạng thái
    const response = await axios.put(`${API_URL}/api/post/duyet/${id}`);
    if (response.status === 200) {
      // Nếu thành công, bạn có thể làm mới lại dữ liệu hoặc cập nhật lại state
      console.log("Trạng thái đã được cập nhật!");
      // Giả sử bạn có một hàm để reload lại dữ liệu
      return response;
    }
  } catch (error) {
    console.error("Lỗi khi duyệt hoặc hủy duyệt:", error);
  }
};
export const deletePost = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/api/delete/${id}`);
    return response; // Trả về response đầy đủ
  } catch (error) {
    console.error("Lỗi khi xóa Nhà Trọ:", error);
    return null; // Trả về null nếu có lỗi
  }
};

// Lấy người dùng theo ID
export const fetchUserById = async (id) => {
  try {
    const data = await axios.get(`${API_URL}/api/user/${id}`);
    console.log("Người dùng:", data);
  } catch (error) {
    console.error(error.message);
  }
};
export const updateUserInfo = async (id, userData) => {
  try {
    const response = await axios.put(`${API_URL}/api/user/admin/${id}`, userData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("Dữ liệu trả về từ API:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Lỗi khi cập nhật người dùng:",
      error.response ? error.response.data : error.message
    );
    throw error.response?.data || { message: error.message };
  }
};
// Lấy danh sách người dùng (admin)
export const fetchAllUsers = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/user/list/all`);
    console.log("Người dùng:", response.data);
    return response.data; 
  } catch (error) {
    console.error(error.message);
  }
};

// Xóa người dùng (admin)
export const handleDeleteUser = async (userId) => {
  try {
    const response = await axios.delete(`${API_URL}/api/user/${userId}`);
    return response;
  } catch (error) {
    console.error(error.message);
  }
};
