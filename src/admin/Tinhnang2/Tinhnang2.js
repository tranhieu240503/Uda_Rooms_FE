import React, { useEffect, useState } from 'react';
import { addThongTinThem, addTienNghi, deleteThongTinThem, deleteTienNghi, fetchThongTinThem, fetchTienNghi } from "../../services/api";
import styles from "./TinhNang2.module.scss"; // Import SCSS module

const TinhNang2 = () => {
    const [tienNghiList, setTienNghiList] = useState([]);
    const [thongTinThemList, setThongTinThemList] = useState([]);
    const [activeTab, setActiveTab] = useState("tiennghi");
    const [newData, setNewData] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const tienNghiData = await fetchTienNghi();
            const thongTinThemData = await fetchThongTinThem();
            setTienNghiList(tienNghiData);
            setThongTinThemList(thongTinThemData);
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu:", error);
        }
    };

    const handleTabSelect = (selectedTab) => {
        setActiveTab(selectedTab);
        setNewData("");
    };

    const handleSubmit = async () => {
        if (!newData.trim()) {
            alert("Vui lòng nhập thông tin!");
            return;
        }
        try {
            if (activeTab === "tiennghi") {
                const addedItem = await addTienNghi(newData);
                setTienNghiList([...tienNghiList, addedItem]);
            } else {
                const addedItem = await addThongTinThem(newData);
                setThongTinThemList([...thongTinThemList, addedItem]);
            }
            setNewData("");
        } catch (error) {
            alert("Lỗi khi thêm dữ liệu!");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa?")) {
            try {
                if (activeTab === "tiennghi") {
                    await deleteTienNghi(id);
                    setTienNghiList(tienNghiList.filter(item => item.id !== id));
                } else {
                    await deleteThongTinThem(id);
                    setThongTinThemList(thongTinThemList.filter(item => item.id !== id));
                }
            } catch (error) {
                alert("Lỗi khi xóa dữ liệu!");
            }
        }
    };

    return (
        <div className={styles["feature-container"]}>
            <div className={styles["feature-list"]}>
                <h2 className={styles["feature-title"]}>Chỉnh sửa chi tiết</h2>
                <div className={styles["feature-tabs"]}>
                    <button
                        className={`${styles["feature-tab"]} ${activeTab === "tiennghi" ? styles["active"] : ""}`}
                        onClick={() => handleTabSelect("tiennghi")}
                    >
                        Tiện nghi
                    </button>
                    <button
                        className={`${styles["feature-tab"]} ${activeTab === "thongtinthem" ? styles["active"] : ""}`}
                        onClick={() => handleTabSelect("thongtinthem")}
                    >
                        Thông tin thêm
                    </button>
                </div>

                <div className={styles["feature-table-container"]}>
                    <table className={styles["feature-table"]}>
                        <thead className={styles["feature-thead"]}>
                            <tr>
                                <th>#</th>
                                <th>{activeTab === "tiennghi" ? "Tên Tiện Nghi" : "Thông Tin Thêm"}</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(activeTab === "tiennghi" ? tienNghiList : thongTinThemList).length > 0 ? (
                                (activeTab === "tiennghi" ? tienNghiList : thongTinThemList).map((item, index) => (
                                    <tr key={item.id}>
                                        <td>{index + 1}</td>
                                        <td>{activeTab === "tiennghi" ? item.tenTienNghi : item.thongTinThem}</td>
                                        <td>
                                            <button
                                                className={styles["feature-delete-btn"]}
                                                onClick={() => handleDelete(item.id)}
                                            >
                                                Xóa
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className={styles["feature-no-data"]}>Không có dữ liệu</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className={styles["feature-form"]}>
                <h2 className={styles["feature-title"]}>Thêm {activeTab === "tiennghi" ? "Tiện Nghi" : "Thông Tin Thêm"}</h2>
                <label className={styles["feature-label"]}>Tên {activeTab === "tiennghi" ? "Tiện Nghi" : "Thông Tin"}</label>
                <input
                    type="text"
                    placeholder={`Nhập ${activeTab === "tiennghi" ? "tiện nghi" : "thông tin thêm"}...`}
                    value={newData}
                    onChange={(e) => setNewData(e.target.value)}
                    className={styles["feature-input"]}
                />
                <button className={styles["feature-add-btn"]} onClick={handleSubmit}>Thêm</button>
            </div>
        </div>
    );
};

export default TinhNang2;