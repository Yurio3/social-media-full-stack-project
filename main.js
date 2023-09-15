//Event listener to ensure that js code is executed after the HTML is fully loaded
document.addEventListener("DOMContentLoaded", function () {
    // Interval Controller
    // Find and select all HTML elements in the document that have the 'interval-control' class
    const intervalControls = document.querySelectorAll(".interval-control");

    // Loop over each set of elements in the intervalcontrol (like an array).
    intervalControls.forEach((control) => {
        let intervalId; // Declare a variable that will be used to store the ID of the interval timer associated with the particular post being iterated over
        let isRunning = true; //This variable will help keep track of whether the interval timer associated with a post is currently running true or stopped false
        let randomInterval = getRandomInterval();
        //This line randomInterval initializes the variable by calling the getRandomInterval function, which returns a random interval between 1 and 5 seconds.

        control.addEventListener("click", function () {
        //This line adds a click event listener to the current element within the loop (the Stop/Start button). When this button is clicked, the provided function is executed

            if (isRunning) {
                clearInterval(intervalId);
                //If the interval is running, this line uses clearInterval to clear the interval timer associated with the post, which stops the image loop for this post.
                control.textContent = "Start";
                //The button (control) is updated to "Start", indicating that clicking it will start the interval.
            } else {
                randomInterval = getRandomInterval();
                //The line uses this function to generate a new random interval getRandomInterval, ensuring that posts will have different intervals when the interval is restarted.
                intervalId = setInterval(changeImage, randomInterval * 1000, control);
                //setInterval is a built-in JavaScript function that repeats the execution of a function or code snippet at a specified interval.
                //changeImage: this is the name of the function that will be executed each time the interval timer is triggered. In this case, it refers to a function defined elsewhere in the changeImage code.
                //randomInterval * 1000: this part determines the interval between each execution of the function changeImage
                //control: this parameter is passed to the changeImage function. It is an extra piece of data that can be passed as a parameter to the function when the function is called at an interval.
                //In this case, it appears to be control that is passed to the changeImage function to help it recognize which button was clicked and which post image needs to be changed.
                control.textContent = "Stop";
            }
            isRunning = !isRunning; //Switch at the click of a button
            //This ensures that clicking the button will start or stop the interval, depending on its current state.
        });

        // Initial start
        intervalId = setInterval(changeImage, randomInterval * 1000, control);
        //After defining the click event listener, this code section starts the interval for the current post as soon as the page loads. intervalId assigns a value by calling for, and setInterval ensures that image changes start without user interaction.
    });

    function getRandomInterval() {
        return Math.floor(Math.random() * 5) + 1;
    }
    //Returns a random number of seconds from 1 to 5

    function changeImage(button) {
        const post = button.parentElement;
        //The line retrieves the element's parent element, button, and assigns it to the variable post. the parentElement attribute is used to access the HTML element containing the button that was clicked.
        //In your context, this is assumed to be the entire "post" or container associated with the button.

        const img = post.querySelector("img");
        //The code selects an element post within the element img. It uses the querySelector method to find the first element post that img is a descendant of.
        //This is usually the image associated with the post.


        img.src = getRandomImageSource();
    }
    //The changeImage function is designed to change the source (URL) of the image associated with a post. To do this, it first looks up the parent container ( ) of the button that the post was clicked on, and then img locates the element in that container.
    //After selecting the image element, it updates the attributes of the src image element with the new image source obtained from the function (which should return a random image URL).

    function getRandomImageSource() {

        const images = ["https://img.freepik.com/free-photo/top-view-table-full-delicious-food-composition_23-2149141353.jpg?w=1800&t=st=1693957191~exp=1693957791~hmac=077d42049dd561d9b36d055e9d7a5122c904dbbdb86728c3b7e4355a60c05866",
            "https://img.freepik.com/free-photo/chicken-wings-barbecue-sweetly-sour-sauce-picnic-summer-menu-tasty-food-top-view-flat-lay_2829-6471.jpg?size=626&ext=jpg&ga=GA1.1.1413811586.1693957154&semt=ais",
            "https://img.freepik.com/free-photo/side-view-potatoes-with-meat-tomato-sauce-with-arugula-greek-salad-soup-table_141793-2866.jpg?size=626&ext=jpg&ga=GA1.1.1413811586.1693957154&semt=ais",
            "https://cdn.pixabay.com/photo/2017/09/25/13/12/puppy-2785074_640.jpg",
            "https://side-out.org/wp-content/uploads/2021/07/5200.jpg",
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYFUy7E0CDruPtRlAh_BYERn46N6NpOD_zvg&usqp=CAU",
            "https://d2culxnxbccemt.cloudfront.net/pop/content/uploads/pop/2016/07/20183153/bad-weather-2-web.png",
            "https://d2culxnxbccemt.cloudfront.net/pop/content/uploads/pop/2016/07/20183219/bad-weather-5-web.png",
            "https://assets.bwbx.io/images/users/iqjWHBFdfxIU/i1O4WF7UCLlI/v0/-1x-1.jpg",
            "https://www.recordnet.com/gcdn/presto/2021/03/22/NRCD/9d9dd9e4-e84a-402e-ba8f-daa659e6e6c5-PhotoWord_003.JPG?crop=1999,1125,x0,y78&width=1600&height=800&format=pjpg&auto=webp",
            "https://mymodernmet.com/wp/wp-content/uploads/2021/12/kristina-makeeva-eoy-photo-1.jpeg",
            "https://thumbs.dreamstime.com/b/environment-earth-day-hands-trees-growing-seedlings-bokeh-green-background-female-hand-holding-tree-nature-field-gra-130247647.jpg",
            "https://c.vanceai.com/assets/images/photo_editor/carousel1_2-356c5dc22d.png",
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvFBa3G11OUBYADP7ouSBgwiiRzSYorF4dfg&usqp=CAU",
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8oABolami0if0Tqc5E7i2m2F-M6Fr7cBzvA&usqp=CAU"
        ];
        const randomIndex = Math.floor(Math.random() * images.length);
        return images[randomIndex];
    }




});

