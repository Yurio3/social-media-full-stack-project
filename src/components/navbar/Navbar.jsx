import React from "react";
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import Person2Icon from '@mui/icons-material/Person2';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CircleNotificationsIcon from '@mui/icons-material/CircleNotifications';

import "./navbar.css";
import {Link} from "react-router-dom";



const  Navbar = () =>{
    return <div className = "navbarContainer">
        <div className="navbarLeft">
            <span className="logo">RiceBook</span>
        </div>

        <div className="navbarCenter">
            <div className="searchBar">
                <ManageSearchIcon className="searchIcon"/>
                <input type="text"
                       placeholder="Search for friends post or video"
                       className="searchINput"
                       />

            </div>
        </div>
        <div className="navbarRight">
            <div className="navbarLinks">
                <Link to="/editprofile" className="navbarLink">
                    Profile Page
                </Link>

                <Link to="/login" className="navbarLink">
                    Log Out
                </Link>

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
            <img src = "/assets/person/user.jpg" alt="" className="navbarImg"/>

        </div>

    </div>;

};

export  default  Navbar;