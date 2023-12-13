import React from "react";
import "./post.scss";
import { IconButton } from "@mui/material";
import {
    ChatBubbleOutline,
    MoreVert,
    Favorite,
    ThumbUp,
    ThumbUpAltOutlined,
    ShareOutlined,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import axios from "axios";
import { useState } from "react";
import { useEffect } from "react";

/*import {MoreVert} from "@mui/icons-material";*/

const API_BASE_URL = process.env.REACT_APP_API_URL;



const Post = ({ post }) => {
    //console.log("来看看能不能找到article id？",post._id);
    //console.log(post);
    const [users, setUsers] = useState([]);
    const [input, setInput] = useState("");
    const [comments, setComments] = useState([]);
    const [commentOpen, setCommentOpen] = useState(false);
    const [commentBoxVisible, setCommentBoxVisible] = useState(false);

    useEffect(() => {
        const storedUserData = JSON.parse(localStorage.getItem("user"));
        /*let users = []
        axios.get("/api/users").then((res) => {
            setUsers(res.data);
            users = users.concat(res.data);
            axios.get("/api/Usersonline").then((res) => {
                users = users.concat(res.data);
                setUsers(users)
            }
            )
        })*/
        axios.get(`${API_BASE_URL}/comments?articleId=${post._id}`).then(res => {
            setComments(res.data);
            //console.log("看看comment什么形式？",comments);
        })


    }, [post]);//这里修改了

    const handleComment = async (e) => {
        e.preventDefault();
        let params = {
            articleId: post._id,
            avatar: JSON.parse(localStorage.getItem('user')).profilePicture,
            //目前还不知道头像怎么用的
            username: JSON.parse(localStorage.getItem('user')).username,
            body: document.getElementById('commentInput').value,
            date: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
        }
        //原来这里两个post，get是为了获取当前列表最新评论，因为很可能其他人也在操作这个文章
        axios.post(`${API_BASE_URL}/comments`, params).then(res => {
            axios.get(`${API_BASE_URL}/comments?articleId=${post._id}`).then(res => {
                setComments(res.data);
            })
        })
        setCommentBoxVisible(false);
        setInput("");
    };

    return (
        <div className="post">
            <div className="postWrapper">
                <div className="postTop">
                    <div className="postTopLeft">
                        <img
                            src={users.find((u) => u.id === post.userId) ? users.find((u) => u.id === post.userId).profilePicture : ""}
                            alt=""
                            className="postProfileImg"
                        />
                        <span className="postUsername">
                            {/*{users.find((u) => u.id === post.userId) ? users.find((u) => u.id === post.userId).username : ""}*/}

                        </span>
                        <span className="postDate">{post.date}</span>
                    </div>

                    <div className="postTopRight">
                        <IconButton>
                            <MoreVert className="postVertButton" />
                        </IconButton>
                    </div>

                </div>

                <div className="postCenter">
                    <span className="postText">{post.body}</span>
                    <img src={post.photo} alt="" className="postImg" />
                </div>

                <div className="postBottom">
                    <div className="postBottomLeft">
                        <Favorite className="bottomLeftIcon" style={{ color: "red" }} />
                        <ThumbUp className="bottomLeftIcon" style={{ color: "#011631" }} />
                        <span className="postLikeCounter">{post.like}</span>
                    </div>

                    <div className="postBottomRight">
                        <span className="postCommentText">
                            {post.comment} · comments ·
                        </span>
                    </div>


                </div>

                <hr className="footerHr" />
                <div className="postBottomFooter">
                    <div className="postBottomFooterItem">
                        <ThumbUpAltOutlined className="footerIcon" />
                        <span className="footerText">Like</span>
                    </div>
                    <div
                        className="postBottomFooterItem"
                        onClick={() => setCommentBoxVisible(!commentBoxVisible)}
                    >

                        <ChatBubbleOutline className="footerIcon" />
                        <span className="footerText">Comment</span>
                    </div>
                    <div className="postBottomFooterItem">
                        <ShareOutlined className="footerIcon" />
                        <span className="footerText">Edit</span>
                    </div>
                </div>
                <div className="comment-list">
                    {comments.map((comment) => (
                        <div key={comment._id} className="comment-item">
                            <div className="comment-item-header">
                                {/* Optional: Avatar of the user who commented */}
                                <div className="comment-item-header-left">
                                    <img
                                        src={comment.avatar} // Assuming avatar is a direct URL
                                        alt="avatar"
                                        className="avatar"
                                    />
                                </div>
                                <div className="comment-item-header-right">
                                    <div className="comment-username">{comment.username}</div>
                                    <div className="comment-body">{comment.body}</div>
                                    <div className="comment-date">{new Date(comment.date).toLocaleString()}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/*<div className="comment-list">
                    {comments.map(
                        (comment) => (
                            <div className="comment-item">
                                <div className="comment-item-header">
                                    <div className="comment-item-header-left">
                                        <div className="comment-item-header-left-avatar">
                                            <img
                                                src={comment.avatar}
                                                alt="avatar"
                                                className="avatar"
                                            />
                                        </div>
                                    </div>
                                    <div className="comment-item-header-right">
                                        <div className="comment-body">
                                            {comment.body}
                                        </div>
                                        <div className="comment-date">
                                            {comment.date}
                                        </div>
                                    </div>

                                </div>
                            </div>
                        )
                    )
                    }
                </div>*/}

            </div>
            {commentBoxVisible && (
                <form onSubmit={handleComment} className="commentBox">
                    <textarea
                        type="text"
                        placeholder="write a comment in here"
                        className="commentInput"
                        rows={1}
                        id="commentInput"
                        style={{ resize: "none" }}
                    />
                    <button type="submit" className="commnetPost">
                        Comment
                    </button>
                </form>
            )}

        </div>
    )
}



export default Post;



