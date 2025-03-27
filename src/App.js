import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Header from "./components/Header/Header";
import Home from "./pages/Home";
import HouseDetail from "./pages/HouseDetail";
import "./App.css";
import Filter from "./Filter/Filter";
import Survey from "./Survey/Survey";

const Layout = () => {
  return (
    <>
      <div className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/house/:id" element={<HouseDetail />} />
          <Route path="/filter" element={<Filter />} />
          <Route path="/survey" element={<Survey />} />
        </Routes>
      </div>
    </>
  );
};

const App = () => {
  return (
    <Router>
      <Layout />
    </Router>
  );
};

export default App;





