import React, { useEffect, useState } from "react";
import Map from "../components/Map/Map";
import { getHouseDetail } from "../services/api"; // Import hàm gọi API
import Header from "../components/Header/Header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Directions from "./Directions";
import styles from "../style/home.css";
import {
  faCaretLeft,
  faCircleCheck,
  faCaretRight,
  faClose,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "../components/Modal/Modal";

const Home = () => {
  const [isInnerVisible, setIsInnerVisible] = useState(
    window.innerWidth > 768 // Mặc định true nếu màn hình lớn hơn 768px (desktop), false nếu nhỏ hơn (mobile)
  );
  const [filteredData, setFilteredData] = useState([]);
  const [houses, setHouses] = useState([]);
  const [coordinates, setCoordinates] = useState([]);
  const [showRouting, setShowRouting] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null); // Dữ liệu phòng trọ được chọn
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModalOne = () => {
    setIsModalVisible(false); // Đặt trạng thái về false
    setTimeout(() => {
      setIsModalVisible(true); // Đặt lại trạng thái về true
    }, 50); // Đặt timeout ngắn để đảm bảo React nhận ra sự thay đổi
  };

  const hideModal = () => {
    setIsModalVisible(false);
  };

  const handleShowRouting = () => {
    setShowRouting(true);
  };

  const handleBackToMap = () => {
    setShowRouting(false);
  };

  const handleFilter = (data) => {
    setFilteredData(data); // Cập nhật dữ liệu từ Filter
    console.log(data.length);
  };

  const handleCoordinates = (data) => {
    setCoordinates(data); // Cập nhật dữ liệu tọa độ nhà trọ
    console.log(data);
  };

  const toggleInner = () => {
    setIsInnerVisible(!isInnerVisible);
  };

  const resetInner = () => {
    setIsInnerVisible(false);
  };

  const onInner = () => {
    setIsInnerVisible(true);
  };

  // useEffect(() => {
  //   const handleResize = () => {
  //     setIsInnerVisible(window.innerWidth > 768); // Cập nhật khi thay đổi kích thước màn hình
  //   };

  //   window.addEventListener("resize", handleResize);
  //   return () => {
  //     window.removeEventListener("resize", handleResize);
  //   };
  // }, []);

  return (
    <div className="home_wrapper">
      {isModalVisible && (
        <Modal
          desc="Đã gửi thông tin thành công"
          note="Thông tin của bạn sẽ được up lên sau khi được admin kiểm duyệt."
          onClose={hideModal}
        />
      )}

      {!showRouting ? (
        <>
          <button
            onClick={toggleInner}
            className={`btn_pull ${isInnerVisible ? "visible" : "hidden"}`}
          >
            <FontAwesomeIcon
              className="icon_right"
              icon={isInnerVisible ? faCaretLeft : faCaretRight}
            />
          </button>
          <Header
            isInnerVisible={isInnerVisible}
            onReset={resetInner}
            onFilter={handleFilter}
            showModalOne={showModalOne}
          />
          <Map
            houses={houses}
            filteredData1={filteredData}
            onCoordinatesr={handleCoordinates}
            onShowRouting={handleShowRouting}
          />
        </>
      ) : (
        <Directions Coordinates={coordinates} onBack={handleBackToMap} />
      )}
    </div>
  );
};

export default Home;
