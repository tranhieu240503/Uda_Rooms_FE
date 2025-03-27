import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import '../style/HouseDetail.css';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from "leaflet";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import { getHouseDetail, fetchImage, fetchTienIch, fetchTienNghi } from "../services/api"; // Import hàm fetchTienIch

// Tạo icon FontAwesome cho marker
const houseIcon = L.divIcon({
    className: "custom-house-icon",
    html: '<i class="fas fa-home" style="font-size: 24px; color: red;"></i>',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
});

const HouseDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [house, setHouse] = useState(null);
    const [Img, setImg] = useState(null);
    const [tienIch, setTienIch] = useState([]); // State để lưu trữ thông tin tiện ích
    const [tienNghiList, setTienNghiList] = useState([]);
    // Lấy danh sách nội thất từ API
    useEffect(() => {
        const fetchTienNghiList = async () => {
            try {
                const response = await fetchTienNghi();
                setTienNghiList(response.data.tenTienNghi);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách nội thất:", error);
            }
        };

        fetchTienNghiList();
    }, []);

    // // Hàm gọi API để lấy thông tin tiện ích và khoảng cách tới trọ
    // const fetchTienIchData = async () => {
    //     try {
    //         const data = await fetchTienIch(houseId);
    //         setTienIch(data);
    //     } catch (error) {
    //         console.error("Lỗi khi lấy thông tin tiện ích:", error);
    //     }
    // };

    // Xử lý lấy dữ liệu hình ảnh
    // useEffect(() => {
    //     const fetchHouseImg = async () => {
    //         try {
    //             const imgUrl = await fetchImage(id);
    //             console.log("Ảnh tải về:", imgUrl); // Kiểm tra dữ liệu ảnh
    //             setImg(imgUrl);
    //         } catch (error) {
    //             console.error("Lỗi khi lấy ảnh:", error);
    //         }
    //     };
    //     fetchHouseImg();
    // }, [id]);

    // Xử lý lấy dữ liệu nhà trọ
    useEffect(() => {
        const fetchHouse = async () => {
            try {
                const data1 = await getHouseDetail(id);
                setHouse(data1.data);
                console.log("🏠 Dữ liệu nhà trọ:", data1.data.TienNghis);

                setTienNghiList([...data1.data.TienNghis]); // Cập nhật state
                console.log("🏠 Dữ liệu nhà trọ:", data1.data);
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu nhà trọ:", error);
            }
        };

        fetchHouse();
    }, [id]);



    if (!house) return <h2>Đang tải dữ liệu...</h2>;

    // Chuyển tọa độ từ toaDoX và toaDoY thành mảng [lat, lng]
    const coordinates = [parseFloat(house.lat), parseFloat(house.lon)];

    // Lọc ra danh sách nội thất 
    const tienNghiArray = Array.isArray(tienNghiList) ? tienNghiList : [];
    console.log("Danh sách nội thất:", tienNghiArray);

    return (
        <div className="house-detail-container">
            <div className="header1">
                <h2>Thông tin nhà trọ</h2>
                <button onClick={() => navigate(-1)}>✖</button>
            </div>

            {/* Hiển thị hình ảnh */}
            {Img ? (
                <img src={Img} alt="Hình ảnh nhà trọ" className="image-gallery" />) : (<p style={{ color: "red" }}>Không có hình ảnh</p>)}

            <div className="content-container">
                <div className="house-info">
                    <p><b>Tên nhà trọ:</b> {house.tenNhaTro}</p>
                    <p><b>Địa chỉ:</b> {house.diaChi}</p>
                    <p><b>Chủ nhà:</b> {house.tenChuNha}</p>
                    <p><b>Số điện thoại:</b> {house.sdt}</p>
                    <p><b>Kích thước:</b> {house.kichThuocMin} - {house.kichThuocMax} m²</p>
                    <p><b>Số lượng phòng trọ:</b> {house.soPhong}</p>
                    <p><b>Giá thuê:</b> {house.giaMin ? house.giaMin.toLocaleString() : "N/A"} - {house.giaMax ? house.giaMax.toLocaleString() : "N/A"} VND/tháng</p>
                    <p><b>Giá điện:</b> {house.tienDien.toLocaleString()} VND/kWh</p>
                    <p><b>Giá nước:</b> {house.tienNuoc.toLocaleString()} VND/m³</p>

                    <p><b>Nội thất:</b></p>
                    <ul className="noi-that-list">
                        {tienNghiList.map((item) => (
                            <li key={item.id}>
                                {tienNghiArray.some(nt => nt.id === item.id) ? "✔️" : "❌"} {item.tenTienNghi}
                            </li>
                        ))}
                    </ul>
                    <p><b>Thông tin thêm:</b></p>
                    <p><b>Cho nuôi thú cưng:</b> {house.thuCung ? "✔️ Có" : "❌ Không"}</p>
                    <p><b>Chung chủ:</b> {house.chungChu ? "✔️ Có" : "❌ Không"}</p>
                    <p><b>Nhà vệ sinh riêng:</b> {house.chungChu ? "✔️ Có" : "❌ Không"}</p>
                    <p><b>Đánh giá:</b> ⭐ {house.danhGia} / 5 ({house.soNguoiDanhGia} đánh giá)</p>
                    {/* <p><b>Nội quy:</b> {house.noiQuy}</p> */}
                    <p><b>Ghi chú:</b> {house.ghiChu}</p>

                    {/* <p><b>Tiện ích:</b></p>
                    <ul className="tien-ich-list">
                        {tienIch.map((item, index) => (
                            <li key={index}>
                                {item.tenTienIch} - {item.khoangCach}m
                            </li>
                        ))}
                    </ul> */}
                </div>

                {/* Bản đồ */}
                <div className="map-container">
                    <MapContainer center={coordinates} zoom={16} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <Marker position={coordinates} icon={houseIcon} />
                    </MapContainer>
                </div>
            </div>
        </div>
    );
};

export default HouseDetail;