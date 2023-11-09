const productList = document.getElementById('product-list');
const adminProductList = document.getElementById('admin-product-list');
const adminForm = document.getElementById('admin-form');

let products = JSON.parse(localStorage.getItem('products')) || [];



function deleteProduct(productId) {
    products = products.filter(p => p.id !== productId);
    updateProductList();
}

function cancelaredit(){
    const editModal = document.querySelector('.edit-product');
    editModal.style.display = 'none';
}
function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    const overlay = document.getElementById('overlay');
    const editForm = document.getElementById('edit-form');
    const editProductId = document.getElementById('edit-product-id');
    const editProductName = document.getElementById('edit-product-name');
    const editProductPrice = document.getElementById('edit-product-price');
    const editProductQuantity = document.getElementById('edit-product-quantity');

    editProductId.value = product.id;
    editProductName.value = product.name;
    editProductPrice.value = product.price;
    editProductQuantity.value = product.quantity;

    const editModal = document.querySelector('.edit-product');
    editModal.style.display = 'block';
    overlay.style.display = 'block';

    editForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const newName = editProductName.value;
        const newPrice = parseFloat(editProductPrice.value);
        const newQuantity = parseFloat(editProductQuantity.value);

        if (newName && !isNaN(newPrice)) {
            product.name = newName;
            product.price = newPrice;
            product.quantity = newQuantity;
            updateProductList();
            editModal.style.display = 'none';
            overlay.style.display = 'none';
        }
    });
}
function addToCart(productId) {
    const product = products.find(p => p.id === productId);

    if (product.quantity > 0) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];

        const existingItem = cart.find(item => item.id === productId);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1
            });
        }

        product.quantity -= 1; 

        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartView();
        updateProductList(); 
    } else {
        alert('No hay suficiente inventario para este producto.');
    }
}


function updateCartView() {
    const cartContainer = document.getElementById('cart');
    const  btncomprar= document.getElementById('btncompra');
    cartContainer.innerHTML = '';

    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (cart.length === 0) {
        btncomprar.style.display = 'none';
        cartContainer.innerHTML = '<p>El carrito está vacío.</p>';
    } else {
        btncomprar.style.display = 'block';
        let total = 0; 
        let cartContent = `
            <table>
                <tr>
                    <th>Descripción</th>
                    <th>Cantidad</th>
                    <th>Precio</th>
                    <th>Total</th>
                    <th>Accion</th>
                </tr>
        `;

        cart.forEach(item => {
            const itemTotal = item.quantity * item.price;
            total += itemTotal; 

            cartContent += `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>$${item.price}</td>
                    <td>$${itemTotal}</td>
                    <td><button onclick="removeFromCart(${item.id})">Eliminar</button></td>
                </tr>
            `;
        });

        cartContent += `
            <tr>
                <td colspan="3"><strong>Total:</strong>
                </td>
                <td>$${total}</td>
            </tr>
        `;

        cartContent += '</table>';
        cartContainer.innerHTML = cartContent;
    }
}



function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let removedProduct;
    cart = cart.filter(item => {
        if (item.id === productId) {
            removedProduct = item;
            return false; 
        }
        return true;
    });

    
    if (removedProduct) {
        const product = products.find(p => p.id === removedProduct.id);
        product.quantity += removedProduct.quantity;
    }

    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartView();
    updateProductList(); 
}




function updateProductList() {
    const productList = document.getElementById('product-list');
    productList.innerHTML = '';

    products.forEach(product => {
        const productElement = document.createElement('div');
        productElement.classList.add('product');
        productElement.innerHTML = `
            <h3>${product.name}</h3>
            <p>Precio: $${product.price}</p>
            <p>Cantidad: ${product.quantity}</p>
            <button onclick="addToCart(${product.id})">Agregar al Carrito</button>
            <button onclick="editProduct(${product.id})">Editar</button>
            <button onclick="removeFromProducts(${product.id})">Eliminar</button>
        `;
        productList.appendChild(productElement);
    });

    localStorage.setItem('products', JSON.stringify(products));
}

function removeFromProducts(productId) {
    products = products.filter(p => p.id !== productId);
    updateProductList();
}

function realizarCompra() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (cart.length > 0) {
        const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

        const currentDate = new Date();
        const formattedDate = currentDate.toLocaleDateString();

        const confirmationMessage = `¡Compra realizada el ${formattedDate}!\n\nProductos:\n`;
        
        const productsList = cart.map(item => `- ${item.name} x ${item.quantity} - $${item.price * item.quantity}`).join('\n');

        const totalMessage = `\nTotal: $${total.toFixed(2)}`;

        const message = confirmationMessage + productsList + totalMessage;

        alert(message);

        // Abre la ventana de impresión y agrega la factura
        const printWindow = window.open('', '_blank');
        printWindow.document.write('<html><head><title>Factura de Compra</title></head><body>');
        printWindow.document.write('<pre>' + message + '</pre>');
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
        printWindow.close();

        localStorage.removeItem('cart'); 

        updateCartView(); 
    } else {
        alert('El carrito está vacío. Agrega productos antes de realizar la compra.');
    }
}


adminForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const productName = document.getElementById('product-name').value;
    const productPrice = parseFloat(document.getElementById('product-price').value);
    const productQuantity = parseInt(document.getElementById('product-quantity').value);

    if (productName && !isNaN(productPrice)) {
        const newProduct = {
            id: products.length + 1,
            name: productName,
            price: productPrice,
            quantity:productQuantity
        };
        products.push(newProduct);
        updateProductList();
        adminForm.reset();
    }
});
updateCartView();
updateProductList();
