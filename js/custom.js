window.onload = function () {
    let div = document.createElement('div');
    let htmlTemplate = `
        <div id="add-to-cart">
            <span id="message"></span>
            <button class="ant-btn btn-primary" id="addToCart">Thêm vào giỏ hàng</button>
            <button class="ant-btn btn-default" id="backToCart">Về giỏ hàng</button>
            
            <iframe style="display:none;" src="https://quanlydonhanh.websitehay.info" id="ifr"></iframe>
        </div>
    `;
    div.innerHTML = htmlTemplate;

    const wrapperObject = document.querySelector('#recyclerview');
    var currentUser = JSON.parse(localStorage.getItem('user-quan-ly-don-hang'));
    if (wrapperObject !== null) {
        document.body.appendChild(div);
        setTimeout(() => {
            sendMessage();

            document.getElementById('addToCart').addEventListener('click', function () {
                if (!currentUser) {
                    checkLogin();
                } else {
                    var products = [];
                    var root = document.querySelectorAll('.sku-item-wrapper');
                    root.forEach(elem => {
                        var quantityProduct = elem.querySelector('input').value;
                        if (quantityProduct > 0) {
                            let nameProduct = elem.querySelector('.sku-item-name').textContent;
                            let priceProduct = elem.querySelector('.discountPrice-price').textContent;
                            let imageProduct = elem.querySelector('.sku-item-image').style.backgroundImage;
        
                            imageProduct = imageProduct.replace('url("', '');
                            imageProduct = imageProduct.replace('")', '');
        
                            products.push({
                                name: nameProduct,
                                price: priceProduct,
                                quantity: quantityProduct,
                                image: imageProduct,
                                link: window.location.href
                            });
                        }
                    });
                    
                    if (products.length == 0) {
                        alert('Vui lòng chọn số lượng sản phẩm!');
                    } else {
                        let shop = getShop();
                        let shop_name = shop.shop_name;
                        let shop_url = shop.shop_url;
        
                        var data = new FormData();
                        data.append('user_id', currentUser.id);
                        data.append('shop_name', shop_name);
                        data.append('shop_url', shop_url);
                        data.append('products', JSON.stringify(products));
        
                        var xhr = new XMLHttpRequest();
                        xhr.onreadystatechange = function() {
                            if (this.readyState == 4 && this.status == 200) {
                                var response = JSON.parse(this.responseText);
                                if (response.status == 200) {
                                    document.getElementById("message").innerHTML = "Thêm vào giỏ hàng thành công";
                                    document.getElementById("message").style.backgroundColor = "#268507";
                                } else {
                                    document.getElementById("message").innerHTML = "Thêm vào giỏ hàng thất bại, xin vui lòng thử lại!";
                                    document.getElementById("message").style.backgroundColor = "red";
                                }
        
                                setTimeout(() => {
                                    document.getElementById("message").innerHTML = "";
                                    document.getElementById("message").style.backgroundColor = "unset";
                                }, 5000);
                            }
                        };
                        xhr.open('POST', 'https://quanlydonhanh.websitehay.info/api/add-to-cart', true);
                        xhr.send(data);
                    }
                }
            });
        }, "2000");
    }

    function sendMessage() {
        var receiver = document.getElementById('ifr').contentWindow;

        var data = {
            key: 'myKey',
            value: 'myValue'
        };

        receiver.postMessage(JSON.stringify(data), 'https://quanlydonhanh.websitehay.info');
    }

    function getToken(event) {
        if (event.origin !== 'https://quanlydonhanh.websitehay.info') {
            return;
        }
        var data = JSON.parse(event.data);
        if (data.user) {
            localStorage.setItem('user-quan-ly-don-hang', JSON.stringify(data.user));
        }
    }

    window.addEventListener('message', getToken);
    // Hàm gọi đến trang quản lý để lấy thông tin đăng nhập của user

    // kiểm tra đã đăng nhập hay chưa
    function checkLogin() {
        sendMessage();
        setTimeout(() => {
            currentUser = JSON.parse(localStorage.getItem('user-quan-ly-don-hang'));
            if (!currentUser) {
                let text = "Vui lòng đăng nhập trang quản lý!";
                if (confirm(text) == true) {
                    window.open("https://quanlydonhanh.websitehay.info/admin/login");
                }
            }
        }, "500");
    }

    // Lấy thông tin của trang shop
    function getShop() {
        let data = {};
        var list = document.getElementsByTagName("script");
        for (let key in list) {
            let isString = typeof list[key].textContent;
            if (isString === 'string') {
                let checkExist = list[key].textContent.includes("window.__STORE_DATA");
                if (checkExist == true) {
                    let script = JSON.parse(list[key].textContent.replace("window.isOnline=true; window.__STORE_DATA=", ""));
                    data.shop_url = script.globalData.domain;
                    data.shop_name = script.globalData.sellerLoginId
                }
            }
        }
        return data;
    }
}