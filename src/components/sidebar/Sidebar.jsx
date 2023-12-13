import React, { useEffect, useState } from "react";
import Friends from "../friends/Friends";
import "./sidebar.scss";
import axios from "axios";
const API_BASE_URL = process.env.REACT_APP_API_URL;

const Sidebar = () => {
    const [users, setUsers] = useState([]);
    const [userInfo, setUserInfo] = useState({});
    //console.log("User Info:",userInfo);
    //console.log("Users:",users);


    const fetchUsers = async (userIds) => {
        // 之前更新了邮箱之后这块会抱错
        //console.log("看看更新是咋回事？",userIds);
        const userDetails = await Promise.all(userIds.map(userId =>
            axios.get(`${API_BASE_URL}/users/${userId}`).then(res => res.data)
        ));
        setUsers(userDetails);
    };

    useEffect(() => {
        const storedUserData = JSON.parse(localStorage.getItem("user"));
        //console.log("Stored User Data:", storedUserData);
        // 这里隔一段时间会自动清楚？？
        //debugger
        if (storedUserData && storedUserData.userId) {
            // Fetch the latest user data from the backend
            //console.log("sotred User Data hint 111", storedUserData.userId)
            axios.get(`${API_BASE_URL}/users/${storedUserData.userId}`)
                .then(response => {
                    // Update local state with the latest user data
                    //(response.data);
                    //debugger
                    setUserInfo({
                        name: response.data.username,
                        profilePicture: response.data.profilePicture,
                        userId: response.data._id,
                        headline: response.data.headline,
                    });
                    //console.log(userInfo)
                    let user = response.data;
                    user.userId = user._id;

                    localStorage.setItem("user", JSON.stringify(user));
                    // Then fetch the followers list
                    fetchUsers(response.data.following || []);
                })
                .catch(error => {
                    console.error("Error fetching user data:", error);
                });


        }else {
            //debugger
            console.error("User data not found in local storage or userId is missing.");
        }
    }, []);




    const handleUnfollow = (unfollowUserId) => {
        const storedUserData = JSON.parse(localStorage.getItem("user"));

        console.log("hint hundle unfollow");

        if (!storedUserData._id || !storedUserData) {
            console.error("Current user ID is not available.");
            return;
        }

        //console.log(storedUserData.id)
        //console.log(storedUserData.userId)
        axios
            .delete(`${API_BASE_URL}/following/${storedUserData._id}`, { data: { unfollowUserId } })
            .then(() => {
                // Remove the unfollowed user from the state
                const updatedUsers = users.filter(user => user._id !== unfollowUserId);
                setUsers(updatedUsers);

                window.location.reload();
                window.location.reload();
                //这里要刷新两次才能彻底清楚文章？？ why？

               //新修改
                const updatedFollowing = storedUserData.following.filter(id => id !== unfollowUserId);
                //const updatedUserInfo = { ...storedUserData, following: updatedFollowing };


                setUsers(users => users.filter(user => user._id !== unfollowUserId));


                const updatedUserInfo = {
                    ...userInfo,
                    following: userInfo.following.filter(id => id !== unfollowUserId)
                };

                localStorage.setItem("user", JSON.stringify(updatedUserInfo));
                setUserInfo(updatedUserInfo);

                //可能没走到这里
                console.log("unfollow走到这里了吗？");
                window.location.reload();
                alert("User successfully unfollowed");
            })
            .catch(error => {
                console.error("Error removing follow:", error);
            });
    };



    const handleUpdate = () => {
        const newHeadline = document.getElementById("input-status").value;

        console.log("headline Update",newHeadline);
        console.log("headline Update user Info",userInfo);

        userInfo.headline = newHeadline;

        const username = userInfo.name;

        // Setup the request payload
        const data = {
            username: username,
            headline: userInfo.headline
        };

        console.log("data:",data)

        axios
            .put(`${API_BASE_URL}/headline`, data)
            .then((res) => {
                /*setUserInfo(res.data);
                localStorage.setItem("user", JSON.stringify(res.data));
                document.getElementById("input-status").value = "";*/
                // Handle the response here
                if (res.data.code === "success") {

                    // Update the userInfo state with the new headline
                    setUserInfo(prevState => ({
                        ...prevState,
                        headline: newHeadline
                    }));
                    localStorage.setItem("user", JSON.stringify(res.data));
                    document.getElementById("input-status").value = "";
                    alert("Headline updated successfully!");

                } else {
                    // Handle errors or unsuccessful updates
                    alert("Failed to update headline!");
                }

            })
            .catch((error) => {
                console.error("Error updating headline:", error);
            });
    };

    const handleAdd = () => {
        const newFollowEmail = document.getElementById("input-follow").value;

        // Fetch user ID by email
        axios.get(`${API_BASE_URL}/users?email=${newFollowEmail}`).then(res => {
            if (!res.data || !res.data._id) {
                alert("User not found");
                return;
            }

            console.log(localStorage)

            //console.log(res.data);
            const newFollowUser = res.data;
            const storedUserData = JSON.parse(localStorage.getItem("user"));
            //console.log(localStorage.getItem("user"))

            //console.log(storedUserData)

            const currentUserId = storedUserData._id;
            const newFollowUserId = res.data._id;
            //const currentUserId = userInfo.id; // Assuming userInfo is the current logged-in user

            console.log(currentUserId)
            console.log(newFollowUserId)
            if (!storedUserData || !storedUserData._id) {
                alert("User is not logged in or session expired.");
                return;
            }

            // Add new user to the current user's following list
            axios
                .put(`${API_BASE_URL}/following/${currentUserId}`, { followUserId: newFollowUserId })
                .then(() => {
                    // Update the local state and storage
                    const updatedUserInfo = {
                        ...userInfo,
                        following: userInfo.following ? [...userInfo.following, newFollowUserId] : [newFollowUserId]
                    };
                    setUserInfo(updatedUserInfo);
                    localStorage.setItem("user", JSON.stringify(updatedUserInfo));

                    // Add the new followed user to the users state to update the list
                    //setUsers(prevUsers => [...prevUsers, newFollowUser]);
                    // Add the new followed user to the users state to update the list
                    setUsers(prevUsers => [...prevUsers, {...newFollowUser, profilePicture: newFollowUser.profilePicture}]);

                    // Re-fetch the followers list to update the UI
                    //const updatedFollowingIds = updatedUserInfo.following.map(user => user._id);
                    //fetchUsers(updatedFollowingIds); // Call fetchUsers to update the followers list

                    window.location.reload();
                    alert("User successfully followed");


                })
                .catch(error => {
                    console.error("Error adding follow:", error);
                });
        })
            .catch(error => {
                alert("cannot find this user by email");
                console.error("Error finding user by email:", error);
            });
    };


    return (
        <div className="sidebar">
            <div className="sidebarWrapper">
                <div className="main-head">
                    <h3>Profile:</h3>
                    <div className="row">
                        <img src={userInfo.profilePicture} alt=" " className="profileImg" />
                        <div>{userInfo.name}</div>
                        {/*确保一下这个headline是在的*/}
                        <div className="user-status">
                            <h5>headline: </h5>
                            {userInfo.headline}
                        </div>
                    </div>
                    <div className="row">
                        <input type="text" placeholder="new status" id="input-status" />
                        <button className="btn btn-primary" id="updateBtn" onClick={handleUpdate}>
                            Update
                        </button>

                    </div>
                </div>

                <div className="sidebarFriendBorder">
                    <ul className="sidebarFriendList">
                        {users.map((user) => (
                            <Friends key={user.id} user={user} onUnfollow={handleUnfollow} />
                        ))}
                    </ul>
                    <div className="add">
                        <input type="text" placeholder="enter user's email" id="input-follow" />
                        <button className="btn" onClick={handleAdd}>Add</button>
                    </div>
                </div>


            </div>
        </div>
    );
};

export default Sidebar;