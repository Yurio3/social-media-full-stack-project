//The multivalued modification case has not been written（duozhixiugai)
document.getElementById('updateButton').addEventListener('click', function () {
    document.getElementById("email").onblur = checkEmail;
    document.getElementById("phone").onblur = checkPhone;
    document.getElementById("password").onblur = checkPassword;
    document.getElementById("password-confirm").onblur = checkPassword2;
    document.getElementById("zipcode").onblur = checkZipcode;

    // Retrieve new values from input fields
    const newDisplayName = document.getElementById('displayName').value.trim();
    const newEmail = document.getElementById('email').value.trim();
    const newPhone = document.getElementById('phone').value.trim();
    const newZipcode = document.getElementById('zipcode').value.trim();
    const newPassword = document.getElementById('password').value;
    const confirmPassword = document.getElementById('password-confirm').value;

    //error message
    var test_name = document.getElementById("test_name");
    var test_email = document.getElementById("test_email");
    var mobile_input = document.getElementById("mobile_input");
    var zipcode_input = document.getElementById("zipcode_input");
    var s_password = document.getElementById("s_password");


    // Create an object to store original values
    const originalValues = {
        displayName: document.getElementById('currentDisplayName').textContent,
        email: document.getElementById('currentEmail').textContent,
        phone: document.getElementById('currentPhone').textContent,
        zipcode: document.getElementById('currentZipcode').textContent,
        password: document.getElementById('currentPassword').textContent,
    };


    // Update values and display messages
    if (newDisplayName !== "") {
        // same value check
        if(originalValues.displayName !== newDisplayName){
            // Clear the same error message
            test_name.innerHTML = "";
            showMessage("Changed Display Name from "+document.getElementById('currentDisplayName').textContent+" to "+newDisplayName );
        }
        else{
            test_name.innerHTML = "Display name：The new value is the same as the old value";
        }
        document.getElementById('currentDisplayName').textContent = newDisplayName;
    }

    if (newEmail !== "" && checkEmail()) {
        if(originalValues.email !== newEmail){
            test_email.innerHTML = "";
            showMessage("Changed Email from "+document.getElementById('currentEmail').textContent+" to "+newEmail);
        }
        else{
            test_email.innerHTML = "Email：The new value is the same as the old value";
        }
        document.getElementById('currentEmail').textContent = newEmail;
    }


    if (newPhone !== "" && checkPhone()) {
        if(originalValues.phone !== newPhone){
            mobile_input.innerHTML = "";
            showMessage("Changed Phone Number from "+document.getElementById('currentPhone').textContent+" to "+newPhone);
        }
        else{
            mobile_input = "Phone number：The new value is the same as the old value";
        }

        document.getElementById('currentPhone').textContent = newPhone;
    }


    if (newZipcode !== "" && checkZipcode()) {
        if(originalValues.zipcode !== newZipcode){
            zipcode_input.innerHTML = "";
            showMessage("Changed Zipcode from "+document.getElementById('currentZipcode').textContent+" to "+newZipcode);
        }
        else{
            zipcode_input.innerHTML = "Zipcode：The new value is the same as the old value";
        }
        document.getElementById('currentZipcode').textContent = newZipcode;

    }

    if (newPassword !== "" && checkPassword() && confirmPassword !== "" && checkPassword2()) {
        if(originalValues.password !== newPassword){
            s_password.innerHTML = "";
            showMessage("Changed Password from "+document.getElementById('currentPassword').textContent + " to "+'*'.repeat(newPassword.length));
        }
        else{
            s_password.innerHTML = "Password：The new value is the same as the old value";
        }
        document.getElementById('currentPassword').textContent = '*'.repeat(newPassword.length);
        document.getElementById('password-confirm').textContent = '*'.repeat(newPassword.length);

    }


    // Clear input fields
    document.getElementById('displayName').value = "";
    document.getElementById('email').value = "";
    document.getElementById('phone').value = "";
    document.getElementById('zipcode').value = "";
    document.getElementById('password').value = "";
    document.getElementById('password-confirm').value = "";



});

function showMessage(message) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.classList.remove('hidden');
    setTimeout(function () {
        messageDiv.textContent = "";
        messageDiv.classList.add('hidden');
    }, 4000); // Hide the message after 4 seconds
}

//Validate inputs
function checkEmail(){
    var email =document.getElementById("email").value;
    var emailReg=/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
    var flag = emailReg.test(email);
    var test_email = document.getElementById("test_email");
    if(flag)
    {
        test_email.innerHTML = "correct";
        return true;
    }else{
        test_email.innerHTML = "Incorrect mailbox format";
        return false;
    }
}

function checkPhone() {
    var telphone = document.getElementById("phone").value;
    var phoneReg= /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/;
    var flag = phoneReg.test(telphone);
    var mobile_input = document.getElementById("mobile_input");
    if(flag)
    {
        mobile_input.innerHTML = "correct";
        return true;
    }else{
        mobile_input.innerHTML = "Please enter the 10-digit U.S. cell phone number";
        return false;
    }
}


function checkPassword(){
    var password = document.getElementById("password").value;
    var reg_password = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,10}$/;
    var flag = reg_password.test(password);
    var s_password = document.getElementById("s_password");
    if(flag){
        s_password.innerHTML = "correct";
        return true;
    }else{
        s_password.innerHTML = "Please enter a six to ten character password containing a combination of upper and lower case letters and numbers.";
        return false;
    }
}

function checkPassword2(){
    var password2 = document.getElementById("password-confirm").value;
    var reg_password2 = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,10}$/;
    var flag = reg_password2.test(password2);
    var s_password2 = document.getElementById("s_password2");


    if(flag && password2 == document.getElementById("password").value){
        s_password2.innerHTML = "correct";
        return true;
    }else{
        s_password2.innerHTML = "Two passwords don't match";
        return false;
    }
}




function checkZipcode() {
    var zipcode = document.getElementById("zipcode").value;
    var zipReg = /(^\d{5}$)|(^\d{5}-\d{4}$)/;
    var flag = zipReg.test(zipcode);
    var zipcode_input = document.getElementById("zipcode_input");

    if (flag) {
        zipcode_input.innerHTML = "correct";
        return true;
    } else {
        zipcode_input.innerHTML = "Please enter the 5-digit U.S. zipcode";
        return false;
    }
}

