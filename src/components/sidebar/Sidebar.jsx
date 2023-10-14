import React, {useEffect, useState} from "react";
import Friends from "../friends/Friends";


import "./sidebar.css";


const Sidebar = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        // Fetch users from JSON placeholder
        fetch("https://jsonplaceholder.typicode.com/users")
            .then((response) => response.json())
            /*.then((data) => setUsers(data.slice(0,3)));*/
            .then((data) => setUsers(data.slice(0, 3).map(user => ({
                    id: user.id,
                    name: user.name,
                    picture: user.url,
                    title: user.company.catchPhrase
                }))));

    }, []);

    return (
        <div className="sidebar">
            <div className="sidebarWrapper">
                <div className="main-head">
                    <h3>Profile:</h3>
                    <div className="row">
                        <img src="/assets/person/user.jpg" alt=" " className="profileImg" />
                        <div>User Name</div>
                        <div className="user-status">user-status</div>
                    </div>
                    <div className="row">
                        <input type="text" placeholder="new status" id="input-status" />
                        <button className="btn btn-primary" id="updateBtn">
                            Update
                        </button>
                    </div>
                </div>

                <div className="sidebarFriendBorder">
                    <ul className="sidebarFriendList">
                        {users.map((user) => (
                            <Friends key={user.id} user={user} />
                        ))}
                    </ul>
                    <div className="add">
                        <input type="text" placeholder="User" />
                        <button className="btn">
                            Add
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};





export default Sidebar;