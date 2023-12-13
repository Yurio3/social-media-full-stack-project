/*import React from "react";*/
import React, { useState, useEffect } from "react";
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import Person2Icon from '@mui/icons-material/Person2';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CircleNotificationsIcon from '@mui/icons-material/CircleNotifications';
import "./navbar.scss";
import {Link} from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {GoogleLogin} from 'react-google-login';
import { gapi } from 'gapi-script';


const Navbar = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);

    const handleChange = (event) => {
        setSearchTerm(event.target.value);
    };
    const articles = [
        // Your article data here
        { id: 1, title: "Article 1", content: "Content of Article 1" },
        { id: 2, title: "Article 2", content: "Content of Article 2" },
        // Add more articles as needed
    ];


    /*useEffect(() => {
        const results = articles.filter(
            (article) =>
                article.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                article.body.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setSearchResults(results);
    }, [searchTerm]);*/


    const navigate = useNavigate();

    const handleLogout = () => {
        // Confirm logout with user
        const confirmLogout = window.confirm("Are you sure you want to log out?");
        if (confirmLogout) {
            //handleGoogleLogout();
            localStorage.clear(); // 清除localStorage
            // 跳转到登录页面
            navigate("/login");
        }
    };
    /*const handleGoogleLogout = () => {
        const auth2 = gapi.auth2.getAuthInstance();
        if (auth2 != null) {
            auth2.signOut().then(auth2.disconnect().then(console.log('LOGOUT SUCCESSFUL')));
        }
    }*/



    return (
        <div className="navbarContainer">
            <div className="navbarLeft">
                <span className="logo">RiceBook</span>
            </div>

            <div className="navbarCenter">
                <div className="searchBar">
                    <ManageSearchIcon className="searchIcon"/>
                    <input
                        type="text"
                        placeholder="Search for friends post or video"
                        className="searchInput"
                        value = {searchTerm}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="navbarRight">
                <div className="navbarLinks">
                    <Link to="/editprofile" className="navbarLink">
                        Profile Page
                    </Link>

                    <span to="/login" className="navbarLink" onClick={handleLogout}>
                        Log Out
                    </span>

                    <Link to="/home" className="navbarLink">
                        Home Page
                    </Link>
                </div>

                <div className="navbarIcons">
                    <div className="navbarIconItem">
                        <Person2Icon />
                        <span className="navbarIconBadge">2</span>
                    </div>

                    <div className="navbarIconItem">
                        <ChatBubbleOutlineIcon />
                        <span className="navbarIconBadge">10</span>
                    </div>

                    <div className="navbarIconItem">
                        <CircleNotificationsIcon />
                        <span className="navbarIconBadge">8</span>
                    </div>
                </div>

                <img src="/assets/person/user.jpg" alt="" className="navbarImg" />
            </div>
        </div>
    );
};

export default Navbar;