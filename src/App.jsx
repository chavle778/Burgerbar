import React from "react"
import Home from "./components/home"
import AboutUs from "./components/aboutUs";
import Menu from "./components/menu";
import Contact from "./components/contact";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ScrollToTop from "./components/scrollToTop";
import './App.css'

function App() {
  return (
    <>
    <BrowserRouter>
    <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </BrowserRouter>
      </>
  )
}

export default App
