import { React } from 'react'
import { Link } from 'react-router-dom';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Gallery } from './Gallery'

import '../Css/Main.css';

export const Main = () => {
    const gifts = [];

    return (
        <Router>
            <div className="topnav">
                <Link to="/">Gallery</Link>
                <Link to="/my">My NFTs</Link>
                <div className="connect">connect wallet</div>
            </div>
            
            <Routes>
                <Route path="/" element={<Gallery />} />
                <Route path="/my" element={<Gallery />} />
            </Routes>
        </Router>
    )
}