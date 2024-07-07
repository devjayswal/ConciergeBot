
let currentPage = 1;
let currentType = 'users';

async function fetchData(type) {
    const response = await fetch(`/api/${type}?page=${currentPage}`);
    const data = await response.json();
    displayData(data, type);
}

function displayData(data, type) {
    const contentDiv = document.getElementById('content');
    contentDiv.innerHTML = '';

    data.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('item');

        if (type === 'users') {
            itemDiv.innerHTML = `
                <h3>${item.name}</h3>
                <p>Email: ${item.email}</p>
                <p>Phone Number: ${item.phone_number}</p>
                <p>Addresses: ${item.Addresses ? item.Addresses.map(a => `<br>${a.tag}: ${a.address}`).join('') : 'N/A'}</p>
                <p>Food Choices: ${item.food_choices}</p>
                <p>Food Preferences: ${item.food_preferences ? item.food_preferences.join(', ') : 'N/A'}</p>
                <p>Health Conditions: ${item.health_conditions ? item.health_conditions.join(', ') : 'N/A'}</p>
                <p>Allergies: ${item.allergies ? item.allergies.join(', ') : 'N/A'}</p>
                <p>Non-Veg Days: ${item.non_veg_days ? item.non_veg_days.join(', ') : 'N/A'}</p>
            `;
        } else if (type === 'restaurants') {  // Updated
            itemDiv.innerHTML = `
                <h3>${item['Resto Name']}</h3>
                <p>Address: ${item.Address}</p>
                <p>Google PIN: ${item['Google PIN location']}</p>
                <p>Menu:</p>
                <ul>
                    ${item.Menu && item.Menu.length > 0 ? item.Menu.map(dish => `
                        <li>
                            <img src="${dish.Pic}" alt="" width="50" height="50">
                            ${dish.Dish} - ${dish['Portion Size']} - ₹${dish.Price}
                        </li>`).join('') : '<li>No menu available</li>'}
                </ul>
                <p>Branches:</p>
                <ul>
                    ${item.Branches && item.Branches.length > 0 ? item.Branches.map(branch => `<li>${branch.Address} - ${branch['Google PIN location']}</li>`).join('') : '<li>No branches available</li>'}
                </ul>
            `;
        } else if (type === 'orders') {
            itemDiv.innerHTML = `
                <h3>Order ID: ${item.order_id}</h3>
                <p>Order Date: ${new Date(item.order_details.order_date).toLocaleString()}</p>
                <p>Status: ${item.order_details.status}</p>
                <p>Total Amount: ₹${item.order_details.total_amount}</p>
                <p>Dish Details:</p>
                <ul>
                    ${item.dish_details.map(dish => `
                        <li>
                            <img src="${dish.pic}" alt="${dish.dish_name}" width="50" height="50">
                            ${dish.dish_name} - Quantity: ${dish.quantity} - ₹${dish.price}
                        </li>`).join('')}
                </ul>
                <p>Customer Details: ${item.customer_details.name} - ${item.customer_details.email} - ${item.customer_details.phone}</p>
                <p>Delivery Address: ${item.delivery_address.address} - ${item.delivery_address.google_pin} - ${item.delivery_address.tag}</p>
                <p>Restaurant Details: ${item.restaurant_details.resto_name} - ${item.restaurant_details.address} - ${item.restaurant_details.google_pin}</p>
                <p>Distance: ${item.distance_kms} kms</p>
                <p>UPI Acknowledgement ID: ${item.upi_acknowledgement_id} - Status: ${item.upi_status}</p>
                <p>Timestamp: ${new Date(item.timestamp).toLocaleString()}</p>
            `;
        }

        contentDiv.appendChild(itemDiv);
    });
}


document.getElementById('nextPage').addEventListener('click', () => {
    currentPage++;
    fetchData(currentType);
});

document.getElementById('prevPage').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        fetchData(currentType);
    }
});

document.getElementById('showUsers').addEventListener('click', () => {
    currentType = 'users';
    currentPage = 1;
    fetchData(currentType);
});

document.getElementById('showRestaurants').addEventListener('click', () => {
    currentType = 'restaurants';
    currentPage = 1;
    fetchData(currentType);
});

document.getElementById('showOrders').addEventListener('click', () => {
    currentType = 'orders';
    currentPage = 1;
    fetchData(currentType);
});

document.getElementById('addUser').addEventListener('click', () => {
    document.getElementById('newUserForm').style.display = 'block';
    document.getElementById('newRestaurantForm').style.display = 'none';
    document.getElementById('newOrderForm').style.display = 'none';
});

document.getElementById('addRestaurant').addEventListener('click', () => {
    document.getElementById('newUserForm').style.display = 'none';
    document.getElementById('newRestaurantForm').style.display = 'block';
    document.getElementById('newOrderForm').style.display = 'none';
});

document.getElementById('addOrder').addEventListener('click', () => {
    document.getElementById('newUserForm').style.display = 'none';
    document.getElementById('newRestaurantForm').style.display = 'none';
    document.getElementById('newOrderForm').style.display = 'block';
});

// Form submissions
document.getElementById('newUserForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (response.ok) {
        alert('User added successfully');
        event.target.reset();
        fetchData('users');
    } else {
        alert('Failed to add user');
    }
});

document.getElementById('newRestaurantForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    const response = await fetch('/api/restaurants', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (response.ok) {
        alert('Restaurant added successfully');
        event.target.reset();
        fetchData('restaurants');
    } else {
        alert('Failed to add restaurant');
    }
});

document.getElementById('newOrderForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);
    const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (response.ok) {
        alert('Order added successfully');
        event.target.reset();
        fetchData('orders');
    } else {
        alert('Failed to add order');
    }
});

// Initially fetch user data
fetchData(currentType);
